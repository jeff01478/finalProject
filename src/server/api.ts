import type { IncomingMessage, ServerResponse } from 'node:http';
import { db, initDatabase, hashPassword, formatDisplayTime } from './db';

// Initialize schema & seed data on load
initDatabase();

function sendJson(res: ServerResponse, status: number, data: unknown) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function readJsonBody(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export function performBedTransfer(
  targetPatientId: string,
  newBedNo: number,
  operatorName: string
): string | null {
  const currentBed = db
    .prepare('SELECT bed_no, patient_id, status FROM beds WHERE patient_id = ?')
    .get(targetPatientId) as { bed_no: number; patient_id: string; status: string } | undefined;

  const destBed = db
    .prepare('SELECT bed_no, patient_id, status FROM beds WHERE bed_no = ?')
    .get(newBedNo) as { bed_no: number; patient_id: string | null; status: string } | undefined;

  if (!destBed) {
    throw new Error(`找不到目標床號 ${newBedNo}`);
  }

  if (currentBed && currentBed.bed_no === newBedNo) {
    return null; // No bed change
  }

  const patientRow = db
    .prepare('SELECT name FROM patients WHERE id_number = ?')
    .get(targetPatientId) as { name: string } | undefined;
  const patientName = patientRow?.name || targetPatientId;
  const nowIso = new Date().toISOString();
  const displayNow = formatDisplayTime();

  let summary = '';

  // Temporarily clear patient_id to avoid UNIQUE constraint collision during swap
  if (currentBed) {
    db.prepare('UPDATE beds SET patient_id = NULL WHERE bed_no = ?').run(currentBed.bed_no);
  }
  if (destBed.patient_id) {
    db.prepare('UPDATE beds SET patient_id = NULL WHERE bed_no = ?').run(destBed.bed_no);
  }

  if (!destBed.patient_id) {
    // Moving to an empty bed
    const oldBedNo = currentBed ? currentBed.bed_no : 0;
    const newStatus = currentBed && currentBed.status !== '空床' ? currentBed.status : '在床中';
    if (currentBed) {
      db.prepare('UPDATE beds SET patient_id = NULL, status = ?, updated_at = ? WHERE bed_no = ?')
        .run('空床', nowIso, currentBed.bed_no);
    }
    db.prepare('UPDATE beds SET patient_id = ?, status = ?, updated_at = ? WHERE bed_no = ?')
      .run(targetPatientId, newStatus, nowIso, newBedNo);
    db.prepare('UPDATE patients SET bed_no = ? WHERE id_number = ?')
      .run(newBedNo, targetPatientId);
    db.prepare('UPDATE users SET department = ? WHERE id_number = ?')
      .run(`712 病房 ${newBedNo} 床`, targetPatientId);

    summary = `床號 ${oldBedNo} (原病患 ${patientName}) 更換至空床號 ${newBedNo}`;
  } else {
    // Swapping with another patient
    const otherPatientId = destBed.patient_id;
    const otherPatientRow = db
      .prepare('SELECT name FROM patients WHERE id_number = ?')
      .get(otherPatientId) as { name: string } | undefined;
    const otherPatientName = otherPatientRow?.name || otherPatientId;
    const oldBedNo = currentBed ? currentBed.bed_no : 0;

    const statusA = currentBed?.status || '在床中';
    const statusB = destBed.status || '在床中';

    db.prepare('UPDATE beds SET patient_id = ?, status = ?, updated_at = ? WHERE bed_no = ?')
      .run(targetPatientId, statusA, nowIso, newBedNo);
    db.prepare('UPDATE patients SET bed_no = ? WHERE id_number = ?')
      .run(newBedNo, targetPatientId);
    db.prepare('UPDATE users SET department = ? WHERE id_number = ?')
      .run(`712 病房 ${newBedNo} 床`, targetPatientId);

    if (currentBed) {
      db.prepare('UPDATE beds SET patient_id = ?, status = ?, updated_at = ? WHERE bed_no = ?')
        .run(otherPatientId, statusB, nowIso, currentBed.bed_no);
      db.prepare('UPDATE patients SET bed_no = ? WHERE id_number = ?')
        .run(currentBed.bed_no, otherPatientId);
      db.prepare('UPDATE users SET department = ? WHERE id_number = ?')
        .run(`712 病房 ${currentBed.bed_no} 床`, otherPatientId);
    }

    summary = `床號 ${oldBedNo} (原病患 ${patientName}) 更換至床號 ${newBedNo}，與病患 ${otherPatientName} 交換床位`;
  }

  db.prepare(`
    INSERT INTO audit_logs (event_type, summary, operator_name, patient_id, created_at)
    VALUES ('BED_SWAP', ?, ?, ?, ?)
  `).run(summary, operatorName, targetPatientId, displayNow);

  return summary;
}

export function getBootstrapData() {
  const t0 = performance.now();

  const users = db.prepare(`
    SELECT id_number, userid, demo_password, name, role, identity_title, department
    FROM users
    ORDER BY role ASC, id_number ASC
  `).all();

  const rawPatients = db.prepare(`
    SELECT * FROM patients ORDER BY bed_no ASC
  `).all() as Array<Record<string, any>>;

  const patients: Array<Record<string, any>> = rawPatients.map((p) => ({
    ...p,
    field_notes: (() => {
      try {
        return JSON.parse(p.field_notes || '{}');
      } catch {
        return {};
      }
    })(),
  }));

  const rawVitals = db.prepare(`
    SELECT * FROM vital_signs ORDER BY recorded_at DESC, id DESC
  `).all() as Array<Record<string, any>>;

  const latestVitalByPatient = new Map<string, Record<string, any>>();
  for (const v of rawVitals) {
    if (!latestVitalByPatient.has(v.patient_id)) {
      latestVitalByPatient.set(v.patient_id, v);
    }
  }

  const patientById = new Map<string, Record<string, any>>();
  for (const p of patients) {
    patientById.set(p.id_number, p);
  }

  const rawBeds = db.prepare(`
    SELECT * FROM beds ORDER BY bed_no ASC
  `).all() as Array<Record<string, any>>;

  const beds = rawBeds.map((b) => {
    const patient = b.patient_id ? patientById.get(b.patient_id) || null : null;
    const latestVital = b.patient_id ? latestVitalByPatient.get(b.patient_id) || null : null;
    return {
      ...b,
      patient,
      latestVital,
    };
  });

  const rawMeds = db.prepare(`
    SELECT * FROM medication_logs ORDER BY recorded_at DESC, id DESC
  `).all() as Array<Record<string, any>>;

  const medicationLogs = rawMeds.map((m) => ({
    ...m,
    medications: (() => {
      try {
        return JSON.parse(m.medications || '[]');
      } catch {
        return [m.medications];
      }
    })(),
  }));

  const rawRounds = db.prepare(`
    SELECT * FROM ward_rounds ORDER BY recorded_at DESC, id DESC
  `).all() as Array<Record<string, any>>;

  const wardRounds = rawRounds.map((r) => ({
    ...r,
    activities: (() => {
      try {
        return JSON.parse(r.activities || '[]');
      } catch {
        return [r.activities];
      }
    })(),
  }));

  const auditLogs = db.prepare(`
    SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50
  `).all();

  const schedules = db.prepare(`
    SELECT * FROM schedules ORDER BY date ASC, time ASC
  `).all();

  const queryTimeMs = Number((performance.now() - t0).toFixed(3));

  return {
    users,
    beds,
    patients,
    vitalSigns: rawVitals,
    medicationLogs,
    wardRounds,
    auditLogs,
    schedules,
    serverMetrics: {
      queryTimeMs,
      engine: 'Node.js v22 Native SQLite (WAL Mode)',
      timestamp: new Date().toISOString(),
    },
  };
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const pathname = urlObj.pathname;
  const method = req.method || 'GET';

  if (!pathname.startsWith('/api')) {
    return false;
  }

  try {
    // 1. GET /api/bootstrap
    if (method === 'GET' && pathname === '/api/bootstrap') {
      sendJson(res, 200, getBootstrapData());
      return true;
    }

    // 2. POST /api/auth/login
    if (method === 'POST' && pathname === '/api/auth/login') {
      const body = await readJsonBody(req);
      const { account, password, quickIdNumber } = body;

      if (quickIdNumber) {
        const user = db
          .prepare('SELECT id_number, userid, name, role, identity_title, department FROM users WHERE id_number = ?')
          .get(quickIdNumber);
        if (!user) {
          sendJson(res, 404, { error: '找不到指定的展示帳號' });
          return true;
        }
        sendJson(res, 200, { user });
        return true;
      }

      if (!account || !password) {
        sendJson(res, 400, { error: '請輸入帳號與密碼' });
        return true;
      }

      const hashed = hashPassword(String(password));
      const user = db
        .prepare(`
          SELECT id_number, userid, name, role, identity_title, department
          FROM users
          WHERE (userid = ? OR id_number = ? OR name = ?)
            AND (password_hash = ? OR demo_password = ?)
        `)
        .get(String(account).trim(), String(account).trim(), String(account).trim(), hashed, String(password));

      if (!user) {
        sendJson(res, 401, { error: '帳號或密碼錯誤，請重新確認（或點擊下方快速體驗帳號）' });
        return true;
      }

      sendJson(res, 200, { user });
      return true;
    }

    // 3. POST /api/beds/swap
    if (method === 'POST' && pathname === '/api/beds/swap') {
      const body = await readJsonBody(req);
      const { patientId, targetBedNo, operatorName = '護理師' } = body;
      if (!patientId || !targetBedNo) {
        sendJson(res, 400, { error: '缺少病患 ID 或目標床號' });
        return true;
      }

      db.exec('BEGIN TRANSACTION');
      try {
        const summary = performBedTransfer(String(patientId), Number(targetBedNo), String(operatorName));
        db.exec('COMMIT');
        sendJson(res, 200, {
          message: summary || '床位未變動',
          data: getBootstrapData(),
        });
      } catch (err: any) {
        db.exec('ROLLBACK');
        sendJson(res, 400, { error: err?.message || '換床失敗' });
      }
      return true;
    }

    // 4. POST /api/beds/status
    if (method === 'POST' && pathname === '/api/beds/status') {
      const body = await readJsonBody(req);
      const { bedNo, status, operatorName = '護理師' } = body;
      if (!bedNo || !status) {
        sendJson(res, 400, { error: '缺少床號或狀態' });
        return true;
      }

      const bed = db
        .prepare('SELECT bed_no, patient_id, status FROM beds WHERE bed_no = ?')
        .get(Number(bedNo)) as { bed_no: number; patient_id: string | null; status: string } | undefined;

      if (!bed) {
        sendJson(res, 404, { error: '找不到指定病床' });
        return true;
      }

      const nowIso = new Date().toISOString();
      const displayNow = formatDisplayTime();
      db.prepare('UPDATE beds SET status = ?, updated_at = ? WHERE bed_no = ?')
        .run(String(status), nowIso, Number(bedNo));

      if (bed.patient_id) {
        const p = db
          .prepare('SELECT name FROM patients WHERE id_number = ?')
          .get(bed.patient_id) as { name: string } | undefined;
        const summary = `床號 ${bedNo} (病患 ${p?.name || bed.patient_id}) 狀態由「${bed.status}」更新為「${status}」`;
        db.prepare(`
          INSERT INTO audit_logs (event_type, summary, operator_name, patient_id, created_at)
          VALUES ('STATUS_CHANGE', ?, ?, ?, ?)
        `).run(summary, String(operatorName), bed.patient_id, displayNow);
      }

      sendJson(res, 200, {
        message: `床號 ${bedNo} 狀態已更新為 ${status}`,
        data: getBootstrapData(),
      });
      return true;
    }

    // 5. PUT /api/patients/:id
    if (method === 'PUT' && pathname.startsWith('/api/patients/')) {
      const patientId = decodeURIComponent(pathname.replace('/api/patients/', ''));
      const body = await readJsonBody(req);
      const operatorName = String(body.operatorName || '護理師');

      const existing = db
        .prepare('SELECT * FROM patients WHERE id_number = ?')
        .get(patientId) as Record<string, any> | undefined;

      if (!existing) {
        sendJson(res, 404, { error: '找不到該病患資料' });
        return true;
      }

      db.exec('BEGIN TRANSACTION');
      try {
        let swapSummary: string | null = null;
        const newBedNo = body.bed_no ? Number(body.bed_no) : existing.bed_no;
        if (newBedNo && newBedNo !== existing.bed_no) {
          swapSummary = performBedTransfer(patientId, newBedNo, operatorName);
        }

        // Lookup nurse ID if primary_nurse_name changed
        let primaryNurseId = existing.primary_nurse_id;
        const nurseName = body.primary_nurse_name ?? existing.primary_nurse_name;
        if (nurseName) {
          const nurseRow = db
            .prepare("SELECT id_number FROM users WHERE role = 'nurse' AND name = ?")
            .get(String(nurseName)) as { id_number: string } | undefined;
          if (nurseRow) {
            primaryNurseId = nurseRow.id_number;
          }
        }

        const updatedNotes =
          typeof body.field_notes === 'object' && body.field_notes !== null
            ? JSON.stringify(body.field_notes)
            : existing.field_notes;

        db.prepare(`
          UPDATE patients SET
            chart_no = ?,
            name = ?,
            gender = ?,
            birth_date = ?,
            blood_type = ?,
            rh_type = ?,
            major_illness = ?,
            allergies = ?,
            ward_no = ?,
            phone_no = ?,
            address = ?,
            emergency_contact = ?,
            emergency_contact_no = ?,
            hospitalization_date = ?,
            observation_time = ?,
            attending_physician = ?,
            primary_nurse_id = ?,
            primary_nurse_name = ?,
            current_condition = ?,
            transaction_info = ?,
            fall_risk = ?,
            diet_type = ?,
            field_notes = ?
          WHERE id_number = ?
        `).run(
          String(body.chart_no ?? existing.chart_no),
          String(body.name ?? existing.name),
          String(body.gender ?? existing.gender),
          String(body.birth_date ?? existing.birth_date),
          String(body.blood_type ?? existing.blood_type),
          String(body.rh_type ?? existing.rh_type),
          String(body.major_illness ?? existing.major_illness),
          String(body.allergies ?? existing.allergies),
          String(body.ward_no ?? existing.ward_no),
          String(body.phone_no ?? existing.phone_no),
          String(body.address ?? existing.address),
          String(body.emergency_contact ?? existing.emergency_contact),
          String(body.emergency_contact_no ?? existing.emergency_contact_no),
          String(body.hospitalization_date ?? existing.hospitalization_date),
          String(body.observation_time ?? existing.observation_time),
          String(body.attending_physician ?? existing.attending_physician),
          primaryNurseId,
          String(nurseName),
          String(body.current_condition ?? existing.current_condition),
          String(body.transaction_info ?? existing.transaction_info),
          String(body.fall_risk ?? existing.fall_risk),
          String(body.diet_type ?? existing.diet_type),
          updatedNotes,
          patientId
        );

        if (body.name && body.name !== existing.name) {
          db.prepare('UPDATE users SET name = ? WHERE id_number = ?').run(String(body.name), patientId);
        }

        const displayNow = formatDisplayTime();
        const auditText = swapSummary
          ? `${swapSummary}；並同步更新病患 ${existing.name} 入院照護資料`
          : `更新病患 ${existing.name} (床號 ${newBedNo}) 之基本與入院臨床資料`;

        db.prepare(`
          INSERT INTO audit_logs (event_type, summary, operator_name, patient_id, created_at)
          VALUES ('ADMISSION_UPDATE', ?, ?, ?, ?)
        `).run(auditText, operatorName, patientId, displayNow);

        db.exec('COMMIT');
        sendJson(res, 200, {
          message: '病患資料已成功儲存並同步更新床位狀態',
          data: getBootstrapData(),
        });
      } catch (err: any) {
        db.exec('ROLLBACK');
        sendJson(res, 400, { error: err?.message || '儲存病患資料失敗' });
      }
      return true;
    }

    // 6. POST /api/vitals (Manual or IoT vital signs recording)
    if (method === 'POST' && pathname === '/api/vitals') {
      const body = await readJsonBody(req);
      const {
        patientId,
        temperature,
        heartRate,
        spo2,
        systolicBp,
        diastolicBp,
        source = 'manual',
        recordedBy = '江明諺',
        remark = '',
      } = body;

      if (!patientId || temperature === undefined || temperature === '') {
        sendJson(res, 400, { error: '請選擇病患並輸入體溫數據' });
        return true;
      }

      const tempNum = Number(temperature);
      if (Number.isNaN(tempNum) || tempNum < 30 || tempNum > 45) {
        sendJson(res, 400, { error: '體溫數值超出合理臨床範圍 (30.0°C ~ 45.0°C)' });
        return true;
      }

      const patient = db
        .prepare('SELECT name, bed_no FROM patients WHERE id_number = ?')
        .get(String(patientId)) as { name: string; bed_no: number } | undefined;

      if (!patient) {
        sendJson(res, 404, { error: '找不到指定病患' });
        return true;
      }

      const now = new Date();
      const recordedAt = now.toISOString();
      const displayTime = formatDisplayTime(now);

      const isFever = tempNum >= 37.5;
      let finalRemark = String(remark).trim();
      if (isFever && !finalRemark.includes('發燒')) {
        finalRemark = finalRemark ? `發燒警示｜${finalRemark}` : '發燒警示 (體溫 >= 37.5°C)';
      }

      db.prepare(`
        INSERT INTO vital_signs (
          patient_id, patient_name, recorded_at, display_time,
          temperature, heart_rate, spo2, systolic_bp, diastolic_bp,
          source, recorded_by, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        String(patientId),
        patient.name,
        recordedAt,
        displayTime,
        Number(tempNum.toFixed(1)),
        heartRate ? Number(heartRate) : 76,
        spo2 ? Number(spo2) : 98,
        systolicBp ? Number(systolicBp) : 122,
        diastolicBp ? Number(diastolicBp) : 78,
        String(source),
        String(recordedBy),
        finalRemark
      );

      if (isFever) {
        db.prepare(`
          INSERT INTO audit_logs (event_type, summary, operator_name, patient_id, created_at)
          VALUES ('IOT_ALERT', ?, ?, ?, ?)
        `).run(
          `床號 ${patient.bed_no} (病患 ${patient.name}) 量測體溫達 ${tempNum.toFixed(1)}°C，系統自動觸發發燒臨床預警`,
          String(recordedBy),
          String(patientId),
          displayTime
        );
      }

      sendJson(res, 200, {
        message: isFever
          ? `已記錄生命徵象！偵測到高溫 (${tempNum.toFixed(1)}°C)，已觸發發燒預警`
          : '生命徵象數據已成功寫入病歷',
        isFever,
        data: getBootstrapData(),
      });
      return true;
    }

    // 7. GET/POST /api/iot/esp (Legacy Arduino ESP32 HTTP endpoint compatibility)
    if (pathname === '/api/iot/esp') {
      const tempParam = urlObj.searchParams.get('temperature');
      const patientIdParam = urlObj.searchParams.get('patient_id') || 'W490382914';
      const body = method === 'POST' ? await readJsonBody(req) : {};
      const tempVal = Number(tempParam ?? body.temperature ?? (36.3 + Math.random() * 1.6).toFixed(1));
      const pid = String(body.patientId ?? patientIdParam);

      const patient = db
        .prepare('SELECT name, bed_no, primary_nurse_name FROM patients WHERE id_number = ?')
        .get(pid) as { name: string; bed_no: number; primary_nurse_name: string } | undefined;

      if (!patient) {
        sendJson(res, 404, { error: '找不到綁定感測器之病患' });
        return true;
      }

      const now = new Date();
      const isFever = tempVal >= 37.5;
      const heartRate = isFever ? Math.round(88 + Math.random() * 14) : Math.round(70 + Math.random() * 12);
      const spo2 = isFever ? Math.round(95 + Math.random() * 3) : Math.round(97 + Math.random() * 2);
      const systolicBp = isFever ? Math.round(132 + Math.random() * 12) : Math.round(116 + Math.random() * 14);
      const diastolicBp = isFever ? Math.round(84 + Math.random() * 8) : Math.round(72 + Math.random() * 10);
      const displayTime = formatDisplayTime(now);
      const remark = isFever
        ? '發燒警示 (Arduino GY-906 + MAX30100 無線感測異常)'
        : 'Arduino GY-906 + MAX30100 藍牙/WiFi 自動感測正常';

      db.prepare(`
        INSERT INTO vital_signs (
          patient_id, patient_name, recorded_at, display_time,
          temperature, heart_rate, spo2, systolic_bp, diastolic_bp,
          source, recorded_by, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'iot_gy906', ?, ?)
      `).run(
        pid,
        patient.name,
        now.toISOString(),
        displayTime,
        Number(tempVal.toFixed(1)),
        heartRate,
        spo2,
        systolicBp,
        diastolicBp,
        patient.primary_nurse_name || 'IoT 智慧感測',
        remark
      );

      if (isFever) {
        db.prepare(`
          INSERT INTO audit_logs (event_type, summary, operator_name, patient_id, created_at)
          VALUES ('IOT_ALERT', ?, 'Arduino ESP32 感測器', ?, ?)
        `).run(
          `床號 ${patient.bed_no} (${patient.name}) IoT 紅外線體溫感測達 ${tempVal.toFixed(1)}°C (心率 ${heartRate} bpm)，請立即查房確認`,
          pid,
          displayTime
        );
      }

      sendJson(res, 200, {
        message: `IoT 感測完成：${patient.name} 體溫 ${tempVal.toFixed(1)}°C / 心率 ${heartRate} bpm / 血氧 ${spo2}%`,
        reading: {
          temperature: Number(tempVal.toFixed(1)),
          heartRate,
          spo2,
          systolicBp,
          diastolicBp,
          isFever,
        },
        data: getBootstrapData(),
      });
      return true;
    }

    // 8. POST /api/medications
    if (method === 'POST' && pathname === '/api/medications') {
      const body = await readJsonBody(req);
      const { patientId, medications, nurseName = '江明諺', remark = '' } = body;

      if (!patientId || !Array.isArray(medications) || medications.length === 0) {
        sendJson(res, 400, { error: '請至少勾選或輸入一項給藥處方' });
        return true;
      }

      const patient = db
        .prepare('SELECT name FROM patients WHERE id_number = ?')
        .get(String(patientId)) as { name: string } | undefined;

      if (!patient) {
        sendJson(res, 404, { error: '找不到指定病患' });
        return true;
      }

      const now = new Date();
      db.prepare(`
        INSERT INTO medication_logs (patient_id, patient_name, medications, recorded_at, display_time, nurse_name, remark)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        String(patientId),
        patient.name,
        JSON.stringify(medications),
        now.toISOString(),
        formatDisplayTime(now),
        String(nurseName),
        String(remark).trim()
      );

      sendJson(res, 200, {
        message: '用藥紀錄已成功登錄',
        data: getBootstrapData(),
      });
      return true;
    }

    // 9. POST /api/rounds
    if (method === 'POST' && pathname === '/api/rounds') {
      const body = await readJsonBody(req);
      const { patientId, activities, nurseName = '江明諺', remark = '' } = body;

      if (!patientId || !Array.isArray(activities) || activities.length === 0) {
        sendJson(res, 400, { error: '請至少勾選一項查房處置內容' });
        return true;
      }

      const patient = db
        .prepare('SELECT name FROM patients WHERE id_number = ?')
        .get(String(patientId)) as { name: string } | undefined;

      if (!patient) {
        sendJson(res, 404, { error: '找不到指定病患' });
        return true;
      }

      const now = new Date();
      db.prepare(`
        INSERT INTO ward_rounds (patient_id, patient_name, activities, recorded_at, display_time, nurse_name, remark)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        String(patientId),
        patient.name,
        JSON.stringify(activities),
        now.toISOString(),
        formatDisplayTime(now),
        String(nurseName),
        String(remark).trim()
      );

      sendJson(res, 200, {
        message: '查房巡視紀錄已成功登錄',
        data: getBootstrapData(),
      });
      return true;
    }

    // 10. POST /api/schedules & PATCH /api/schedules/:id/toggle
    if (method === 'POST' && pathname === '/api/schedules') {
      const body = await readJsonBody(req);
      const { date, time, title, category = 'ward_round', patientId = '', nurseName = '江明諺' } = body;
      if (!date || !time || !title) {
        sendJson(res, 400, { error: '請填寫完整的排程日期、時間與事項標題' });
        return true;
      }

      let patientName = '全體病患';
      if (patientId) {
        const p = db
          .prepare('SELECT name FROM patients WHERE id_number = ?')
          .get(String(patientId)) as { name: string } | undefined;
        if (p) patientName = p.name;
      }

      db.prepare(`
        INSERT INTO schedules (date, time, title, category, patient_id, patient_name, nurse_name, completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).run(String(date), String(time), String(title), String(category), String(patientId), patientName, String(nurseName));

      sendJson(res, 200, {
        message: '已新增臨床排程事項',
        data: getBootstrapData(),
      });
      return true;
    }

    if (method === 'PATCH' && pathname.startsWith('/api/schedules/')) {
      const idStr = pathname.replace('/api/schedules/', '').replace('/toggle', '');
      const row = db
        .prepare('SELECT completed FROM schedules WHERE id = ?')
        .get(Number(idStr)) as { completed: number } | undefined;
      if (!row) {
        sendJson(res, 404, { error: '找不到該排程項目' });
        return true;
      }
      const nextVal = row.completed ? 0 : 1;
      db.prepare('UPDATE schedules SET completed = ? WHERE id = ?').run(nextVal, Number(idStr));
      sendJson(res, 200, {
        message: '排程狀態已更新',
        data: getBootstrapData(),
      });
      return true;
    }

    sendJson(res, 404, { error: `未知的 API 路徑: ${method} ${pathname}` });
    return true;
  } catch (err: any) {
    console.error('[API Error]', err);
    sendJson(res, 500, { error: err?.message || '伺服器內部錯誤' });
    return true;
  }
}
