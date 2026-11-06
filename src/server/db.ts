import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_PATH = path.join(DB_DIR, 'smart_ward.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Enable high-performance SQLite pragmas (WAL + in-memory cache + foreign keys)
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA cache_size = -64000;
  PRAGMA temp_store = MEMORY;
  PRAGMA foreign_keys = ON;
`);

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`smart_ward_salt_${password}`).digest('hex');
}

export function formatDisplayTime(date: Date = new Date()): string {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const w = days[date.getDay()];
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} (星期${w}) ${hh}:${mm}:${ss}`;
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id_number TEXT PRIMARY KEY,
      userid TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      demo_password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('nurse', 'patient')),
      identity_title TEXT NOT NULL,
      department TEXT NOT NULL DEFAULT '712 綜合內科病房'
    );

    CREATE TABLE IF NOT EXISTS beds (
      bed_no INTEGER PRIMARY KEY,
      ward_no TEXT NOT NULL DEFAULT '712',
      patient_id TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT '空床',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES users(id_number) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS patients (
      id_number TEXT PRIMARY KEY,
      chart_no TEXT NOT NULL,
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      blood_type TEXT NOT NULL,
      rh_type TEXT NOT NULL,
      major_illness TEXT NOT NULL,
      allergies TEXT NOT NULL,
      ward_no TEXT NOT NULL DEFAULT '712',
      bed_no INTEGER,
      phone_no TEXT NOT NULL,
      address TEXT NOT NULL,
      emergency_contact TEXT NOT NULL,
      emergency_contact_no TEXT NOT NULL,
      hospitalization_date TEXT NOT NULL,
      observation_time TEXT NOT NULL,
      attending_physician TEXT NOT NULL,
      primary_nurse_id TEXT,
      primary_nurse_name TEXT NOT NULL,
      current_condition TEXT NOT NULL,
      transaction_info TEXT NOT NULL,
      fall_risk TEXT NOT NULL DEFAULT '低度風險',
      diet_type TEXT NOT NULL DEFAULT '一般飲食',
      field_notes TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (id_number) REFERENCES users(id_number) ON DELETE CASCADE,
      FOREIGN KEY (primary_nurse_id) REFERENCES users(id_number) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS vital_signs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      recorded_at TEXT NOT NULL,
      display_time TEXT NOT NULL,
      temperature REAL NOT NULL,
      heart_rate INTEGER,
      spo2 INTEGER,
      systolic_bp INTEGER,
      diastolic_bp INTEGER,
      source TEXT NOT NULL DEFAULT 'manual',
      recorded_by TEXT NOT NULL,
      remark TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (patient_id) REFERENCES users(id_number) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medication_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      medications TEXT NOT NULL,
      recorded_at TEXT NOT NULL,
      display_time TEXT NOT NULL,
      nurse_name TEXT NOT NULL,
      remark TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (patient_id) REFERENCES users(id_number) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ward_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      activities TEXT NOT NULL,
      recorded_at TEXT NOT NULL,
      display_time TEXT NOT NULL,
      nurse_name TEXT NOT NULL,
      remark TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (patient_id) REFERENCES users(id_number) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      summary TEXT NOT NULL,
      operator_name TEXT NOT NULL,
      patient_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      patient_id TEXT,
      patient_name TEXT,
      nurse_name TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vital_signs(patient_id, recorded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_meds_patient ON medication_logs(patient_id, recorded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_rounds_patient ON ward_rounds(patient_id, recorded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(id DESC);
    CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date, time);
  `);

  const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase();
  }
}

export function seedDatabase() {
  db.exec('BEGIN TRANSACTION');
  try {
    // 1. Seed Users (from legacy member table in access_test.sql)
    const insertUser = db.prepare(`
      INSERT INTO users (id_number, userid, password_hash, demo_password, name, role, identity_title, department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const usersData: Array<[string, string, string, string, 'nurse' | 'patient', string, string]> = [
      ['F485739200', 'jeff01478', '123456', '江明諺', 'nurse', '資深主護護理師', '712 綜合內科病房'],
      ['F483901223', 'ghi456', 'ghi654', '徐溫詠', 'nurse', '專科主護護理師', '712 綜合內科病房'],
      ['Q120987324', 'abc456', 'abc654', '陳柏緊', 'patient', '住院病患', '712 病房 1 床'],
      ['S123456789', 'abc789_s', 'abc987', '周松諭', 'patient', '住院病患', '712 病房 2 床'],
      ['W490382914', 'abc123', 'abc321', '李政浩', 'patient', '住院病患', '712 病房 3 床'],
      ['D473890112', 'def456', 'def654', '鍾秀楊', 'patient', '住院病患', '712 病房 4 床'],
      ['H382014573', 'def123', 'def321', '黃勃融', 'patient', '住院病患', '712 病房 5 床'],
      ['K341256782', 'abc789', 'abc987', '蔡昀吅', 'patient', '住院病患', '712 病房 7 床'],
      ['R483909821', 'ghi789', 'ghi987', '何輸瑋', 'patient', '住院病患', '712 病房 8 床'],
    ];

    for (const [id_number, userid, pwd, name, role, title, dept] of usersData) {
      insertUser.run(id_number, userid, hashPassword(pwd), pwd, name, role, title, dept);
    }

    // 2. Seed Beds (1 to 8 in Ward 712, matching access_test.sql)
    const insertBed = db.prepare(`
      INSERT INTO beds (bed_no, ward_no, patient_id, status, updated_at)
      VALUES (?, '712', ?, ?, ?)
    `);

    const nowIso = new Date().toISOString();
    const bedsData: Array<[number, string | null, string]> = [
      [1, 'Q120987324', '在床中'],
      [2, 'S123456789', '看診中'],
      [3, 'W490382914', '看診中'],
      [4, 'D473890112', '休息中'],
      [5, 'H382014573', '休息中'],
      [6, null, '空床'],
      [7, 'K341256782', '在床中'],
      [8, 'R483909821', '在床中'],
    ];

    for (const [bedNo, patientId, status] of bedsData) {
      insertBed.run(bedNo, patientId, status, nowIso);
    }

    // 3. Seed Patients (combining patient_basic_info & patient_admission_info from access_test.sql)
    const insertPatient = db.prepare(`
      INSERT INTO patients (
        id_number, chart_no, name, gender, birth_date, blood_type, rh_type,
        major_illness, allergies, ward_no, bed_no, phone_no, address,
        emergency_contact, emergency_contact_no, hospitalization_date,
        observation_time, attending_physician, primary_nurse_id, primary_nurse_name,
        current_condition, transaction_info, fall_risk, diet_type, field_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const patientsData = [
      {
        id_number: 'Q120987324',
        chart_no: '345625673',
        name: '陳柏緊',
        gender: '女性',
        birth_date: '1983-05-21',
        blood_type: 'AB',
        rh_type: 'RH+',
        major_illness: '第二型糖尿病、高血壓性心臟病',
        allergies: '盤尼西林 (Penicillin) 輕微皮疹',
        ward_no: '712',
        bed_no: 1,
        phone_no: '0937-482-653',
        address: '台北市信義區中正路145號4樓之3',
        emergency_contact: '陳先生 (配偶)',
        emergency_contact_no: '0987-346-632',
        hospitalization_date: '2026-10-28',
        observation_time: '500 小時 (血糖與血壓密集監控)',
        attending_physician: '江修黼 醫師',
        primary_nurse_id: 'F485739200',
        primary_nurse_name: '江明諺',
        current_condition: '血糖偏高需定時施打胰島素與口服降血糖藥，夜間偶有低燒反應',
        transaction_info: '原4床調至1床靠護理站就近觀察',
        fall_risk: '高度風險',
        diet_type: '糖尿病低GI飲食',
        field_notes: JSON.stringify({
          major_illness: '需每日監測空腹與飯後2小時血糖',
          current_condition: '家屬已簽署住院照護同意書'
        })
      },
      {
        id_number: 'S123456789',
        chart_no: '049582738',
        name: '周松諭',
        gender: '男性',
        birth_date: '1999-12-03',
        blood_type: 'AB',
        rh_type: 'RH+',
        major_illness: '無重大傷病紀錄',
        allergies: '無已知藥物過敏',
        ward_no: '712',
        bed_no: 2,
        phone_no: '0912-733-941',
        address: '新北市新店區安康路二段70號',
        emergency_contact: '周女士 (母親)',
        emergency_contact_no: '0937-284-923',
        hospitalization_date: '2026-11-01',
        observation_time: '400 小時',
        attending_physician: '江修黼 醫師',
        primary_nurse_id: 'F483901223',
        primary_nurse_name: '徐溫詠',
        current_condition: '術後傷口恢復良好，目前由主治醫師進行門診超音波複查中',
        transaction_info: '無',
        fall_risk: '低度風險',
        diet_type: '高蛋白修復飲食',
        field_notes: JSON.stringify({})
      },
      {
        id_number: 'W490382914',
        chart_no: '123456345',
        name: '李政浩',
        gender: '男性',
        birth_date: '2001-08-13',
        blood_type: 'A',
        rh_type: 'RH+',
        major_illness: '原發性高血壓觀察',
        allergies: 'NSAIDs 非類固醇消炎止痛藥',
        ward_no: '712',
        bed_no: 3,
        phone_no: '0912-567-889',
        address: '新北市新店區安康路二段67號',
        emergency_contact: '李先生 (父親)',
        emergency_contact_no: '0912-345-124',
        hospitalization_date: '2026-10-30',
        observation_time: '150 小時',
        attending_physician: '江修黼 醫師',
        primary_nurse_id: 'F485739200',
        primary_nurse_name: '江明諺',
        current_condition: '生命徵象穩定 (Good)，前日曾出現間歇性發燒已緩解，今日安排心電圖檢查',
        transaction_info: '已連接 GY-906 智慧床頭體溫感測器',
        fall_risk: '低度風險',
        diet_type: '低鈉得舒飲食 (DASH)',
        field_notes: JSON.stringify({
          id_number: '身分證號、護照號碼或居留證號',
          birth_date: '格式為西元 YYYY-MM-DD',
          current_condition: '體溫與血壓重點追蹤對象'
        })
      },
      {
        id_number: 'D473890112',
        chart_no: '325324233',
        name: '鍾秀楊',
        gender: '男性',
        birth_date: '2001-03-05',
        blood_type: 'A',
        rh_type: 'RH+',
        major_illness: '急性支氣管炎併發氣喘',
        allergies: '海鮮甲殼類過敏',
        ward_no: '712',
        bed_no: 4,
        phone_no: '0912-384-920',
        address: '新北市新店區安康路二段66號',
        emergency_contact: '鍾太太 (家屬)',
        emergency_contact_no: '0921-837-491',
        hospitalization_date: '2026-10-29',
        observation_time: '300 小時',
        attending_physician: '江修黼 醫師',
        primary_nurse_id: 'F483901223',
        primary_nurse_name: '徐溫詠',
        current_condition: '支氣管擴張劑霧化治療後休息中，血氧飽和度維持 98%',
        transaction_info: '無',
        fall_risk: '中度風險',
        diet_type: '溫熱流質與軟質飲食',
        field_notes: JSON.stringify({})
      },
      {
        id_number: 'H382014573',
        chart_no: '362456142',
        name: '黃勃融',
        gender: '男性',
        birth_date: '2000-04-24',
        blood_type: 'A',
        rh_type: 'RH+',
        major_illness: '無',
        allergies: '無',
        ward_no: '712',
        bed_no: 5,
        phone_no: '0921-374-820',
        address: '新北市新店區安康路二段67號',
        emergency_contact: '黃先生 (兄長)',
        emergency_contact_no: '0934-827-319',
        hospitalization_date: '2026-11-02',
        observation_time: '300 小時',
        attending_physician: '江修黼 醫師',
        primary_nurse_id: 'F485739200',
        primary_nurse_name: '江明諺',
        current_condition: '急性腸胃炎點滴輸液補充水分，目前睡眠休息中',
        transaction_info: '無',
        fall_risk: '低度風險',
        diet_type: '清流質飲食',
        field_notes: JSON.stringify({})
      },
      {
        id_number: 'K341256782',
        chart_no: '098346273',
        name: '蔡昀吅',
        gender: '女性',
        birth_date: '2001-08-30',
        blood_type: 'O',
        rh_type: 'RH+',
        major_illness: '代謝症候群追蹤',
        allergies: '無',
        ward_no: '712',
        bed_no: 7,
        phone_no: '0987-234-612',
        address: '新北市新店區安康路二段67號',
        emergency_contact: '蔡媽媽 (母親)',
        emergency_contact_no: '0923-748-129',
        hospitalization_date: '2026-11-03',
        observation_time: '300 小時',
        attending_physician: '江修黼 醫師',
        primary_nurse_id: 'F485739200',
        primary_nurse_name: '江明諺',
        current_condition: '意識清楚在床休養，按時服用降壓與控制血糖處方',
        transaction_info: '無',
        fall_risk: '低度風險',
        diet_type: '一般均衡飲食',
        field_notes: JSON.stringify({})
      },
      {
        id_number: 'R483909821',
        chart_no: '038572483',
        name: '何輸瑋',
        gender: '男性',
        birth_date: '2002-04-05',
        blood_type: 'B',
        rh_type: 'RH+',
        major_illness: '無',
        allergies: '無',
        ward_no: '712',
        bed_no: 8,
        phone_no: '0923-714-829',
        address: '新北市新店區安康路二段69號',
        emergency_contact: '何先生 (父親)',
        emergency_contact_no: '0923-871-293',
        hospitalization_date: '2026-11-04',
        observation_time: '300 小時',
        attending_physician: '江修黼 醫師',
        primary_nurse_id: 'F483901223',
        primary_nurse_name: '徐溫詠',
        current_condition: '偏頭痛與自律神經失調住院檢查，目前在床休息穩定',
        transaction_info: '無',
        fall_risk: '中度風險',
        diet_type: '低咖啡因一般飲食',
        field_notes: JSON.stringify({})
      },
    ];

    for (const p of patientsData) {
      insertPatient.run(
        p.id_number, p.chart_no, p.name, p.gender, p.birth_date, p.blood_type, p.rh_type,
        p.major_illness, p.allergies, p.ward_no, p.bed_no, p.phone_no, p.address,
        p.emergency_contact, p.emergency_contact_no, p.hospitalization_date,
        p.observation_time, p.attending_physician, p.primary_nurse_id, p.primary_nurse_name,
        p.current_condition, p.transaction_info, p.fall_risk, p.diet_type, p.field_notes
      );
    }

    // 4. Seed Vital Signs (migrated from legacy body_data & esp_test + enriched multi-vital points)
    const insertVital = db.prepare(`
      INSERT INTO vital_signs (
        patient_id, patient_name, recorded_at, display_time,
        temperature, heart_rate, spo2, systolic_bp, diastolic_bp,
        source, recorded_by, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const vitalsSeed: Array<[string, string, string, string, number, number, number, number, number, string, string, string]> = [
      ['W490382914', '李政浩', '2026-11-04T09:00:00.000Z', '2026-11-04 (星期三) 17:00:00', 36.4, 74, 98, 124, 78, 'manual', '江明諺', '入院常規量測'],
      ['W490382914', '李政浩', '2026-11-04T13:30:00.000Z', '2026-11-04 (星期三) 21:30:00', 38.6, 96, 96, 138, 88, 'iot_gy906', '江明諺', '發燒警示 (IoT GY-906 感測異常，已給予退燒處置)'],
      ['W490382914', '李政浩', '2026-11-05T01:05:00.000Z', '2026-11-05 (星期四) 09:05:00', 37.6, 84, 97, 132, 84, 'iot_gy906', '江明諺', '微燒逐漸退熱中'],
      ['W490382914', '李政浩', '2026-11-05T06:00:00.000Z', '2026-11-05 (星期四) 14:00:00', 36.7, 76, 98, 126, 80, 'manual', '江明諺', '退燒後體溫恢復穩定'],
      ['W490382914', '李政浩', '2026-11-05T12:00:00.000Z', '2026-11-05 (星期四) 20:00:00', 36.5, 72, 99, 122, 76, 'iot_max30100', '江明諺', '夜間生命徵象良好'],
      ['W490382914', '李政浩', '2026-11-06T01:30:00.000Z', '2026-11-06 (星期五) 09:30:00', 36.6, 75, 99, 120, 78, 'iot_gy906', '江明諺', '晨間例行量測，狀況不錯'],

      ['Q120987324', '陳柏緊', '2026-11-04T10:00:00.000Z', '2026-11-04 (星期三) 18:00:00', 36.8, 78, 97, 136, 85, 'manual', '江明諺', '飯後血糖與體溫追蹤'],
      ['Q120987324', '陳柏緊', '2026-11-05T02:15:00.000Z', '2026-11-05 (星期四) 10:15:00', 37.8, 88, 96, 142, 89, 'iot_gy906', '江明諺', '輕微發燒，已通知江修黼醫師'],
      ['Q120987324', '陳柏緊', '2026-11-05T10:30:00.000Z', '2026-11-05 (星期四) 18:30:00', 36.5, 76, 98, 130, 82, 'manual', '江明諺', '體溫已回穩'],
      ['Q120987324', '陳柏緊', '2026-11-06T02:00:00.000Z', '2026-11-06 (星期五) 10:00:00', 36.4, 74, 98, 128, 80, 'iot_gy906', '江明諺', '今日狀況不錯'],

      ['S123456789', '周松諭', '2026-11-05T03:00:00.000Z', '2026-11-05 (星期四) 11:00:00', 36.5, 70, 99, 118, 74, 'manual', '徐溫詠', '術後恢復正常'],
      ['S123456789', '周松諭', '2026-11-06T01:45:00.000Z', '2026-11-06 (星期五) 09:45:00', 36.6, 72, 99, 116, 72, 'manual', '徐溫詠', '準備前往超音波室檢查'],

      ['D473890112', '鍾秀楊', '2026-11-05T04:00:00.000Z', '2026-11-05 (星期四) 12:00:00', 37.1, 82, 96, 124, 78, 'iot_max30100', '徐溫詠', '霧化吸入治療前量測'],
      ['D473890112', '鍾秀楊', '2026-11-06T02:10:00.000Z', '2026-11-06 (星期五) 10:10:00', 36.7, 76, 98, 122, 76, 'iot_max30100', '徐溫詠', '呼吸順暢，血氧提升至 98%'],

      ['H382014573', '黃勃融', '2026-11-06T01:20:00.000Z', '2026-11-06 (星期五) 09:20:00', 36.8, 75, 99, 120, 76, 'manual', '江明諺', '點滴輸液順暢'],
      ['K341256782', '蔡昀吅', '2026-11-06T01:50:00.000Z', '2026-11-06 (星期五) 09:50:00', 36.5, 73, 99, 122, 78, 'manual', '江明諺', '晨間量測正常'],
      ['R483909821', '何輸瑋', '2026-11-05T15:20:00.000Z', '2026-11-05 (星期四) 23:20:07', 36.3, 68, 99, 118, 75, 'manual', '徐溫詠', '睡前巡房量測'],
    ];

    for (const v of vitalsSeed) {
      insertVital.run(...v);
    }

    // 5. Seed Medication Logs (from legacy med_time table)
    const insertMed = db.prepare(`
      INSERT INTO medication_logs (patient_id, patient_name, medications, recorded_at, display_time, nurse_name, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const medsSeed: Array<[string, string, string[], string, string, string, string]> = [
      [
        'W490382914',
        '李政浩',
        ['FUROSELY TABLETS "M.S." (高血壓)', 'SHIN TAN TABLETS "SHOU CHAN" (糖尿病)'],
        '2026-11-04T10:54:39.000Z',
        '2026-11-04 (星期三) 18:54:39',
        '江明諺',
        '飯後口服給藥，病患吞嚥正常'
      ],
      [
        'W490382914',
        '李政浩',
        ['FURSEDE TABLETS (高血壓)', 'SHIN TAN TABLETS "SHOU CHAN" (糖尿病)'],
        '2026-11-05T02:55:39.000Z',
        '2026-11-05 (星期四) 10:55:39',
        '江明諺',
        '晨間常規給藥，血壓穩定'
      ],
      [
        'Q120987324',
        '陳柏緊',
        ['SHIN TAN TABLETS "SHOU CHAN" (糖尿病)', 'METFORMIN HCL 500MG (降血糖)'],
        '2026-11-05T01:15:00.000Z',
        '2026-11-05 (星期四) 09:15:00',
        '江明諺',
        '餐後30分鐘服用，持續監測血糖值'
      ],
      [
        'Q120987324',
        '陳柏緊',
        ['FUROSELY TABLETS "M.S." (高血壓)', 'FURSEDE TABLETS (高血壓)'],
        '2026-11-06T01:12:54.000Z',
        '2026-11-06 (星期五) 09:12:54',
        '江明諺',
        '今日晨間給藥完成'
      ],
      [
        'K341256782',
        '蔡昀吅',
        ['FUROSELY TABLETS "M.S." (高血壓)', 'SHIN TAN TABLETS "SHOU CHAN" (糖尿病)'],
        '2026-11-05T03:02:50.000Z',
        '2026-11-05 (星期四) 11:02:50',
        '江明諺',
        '按醫囑準時給藥'
      ],
      [
        'R483909821',
        '何輸瑋',
        ['FUROSELY TABLETS "M.S." (高血壓)', 'ACETAMINOPHEN 500MG (止痛退燒)'],
        '2026-11-05T15:19:56.000Z',
        '2026-11-05 (星期四) 23:19:56',
        '徐溫詠',
        '緩解夜間偏頭痛症狀'
      ],
    ];

    for (const [pid, pname, meds, recAt, disp, nurse, remark] of medsSeed) {
      insertMed.run(pid, pname, JSON.stringify(meds), recAt, disp, nurse, remark);
    }

    // 6. Seed Ward Rounds (from legacy room_round_record table)
    const insertRound = db.prepare(`
      INSERT INTO ward_rounds (patient_id, patient_name, activities, recorded_at, display_time, nurse_name, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const roundsSeed: Array<[string, string, string[], string, string, string, string]> = [
      [
        'W490382914',
        '李政浩',
        ['量血壓', '換藥'],
        '2026-11-04T10:54:51.000Z',
        '2026-11-04 (星期三) 18:54:51',
        '江明諺',
        '周邊靜脈留置針敷料更換完成'
      ],
      [
        'Q120987324',
        '陳柏緊',
        ['量血壓', '量體溫', '醫生診問'],
        '2026-11-05T02:55:47.000Z',
        '2026-11-05 (星期四) 10:55:47',
        '江明諺',
        '江修黼醫師查房調整胰島素劑量'
      ],
      [
        'H382014573',
        '黃勃融',
        ['量血壓', '量體溫', '輸液檢查'],
        '2026-11-05T03:02:59.000Z',
        '2026-11-05 (星期四) 11:02:59',
        '江明諺',
        '確認點滴流速正常無回血'
      ],
      [
        'W490382914',
        '李政浩',
        ['量血壓', '量體溫', '醫生診問'],
        '2026-11-05T05:37:41.000Z',
        '2026-11-05 (星期四) 13:37:41',
        '江明諺',
        '午間血壓稍偏高，囑咐多休息並限制鈉攝取'
      ],
      [
        'S123456789',
        '周松諭',
        ['換藥', '傷口護理'],
        '2026-11-05T15:20:17.000Z',
        '2026-11-05 (星期四) 23:20:17',
        '徐溫詠',
        '傷口乾燥無滲液，癒合情形良好'
      ],
    ];

    for (const [pid, pname, acts, recAt, disp, nurse, remark] of roundsSeed) {
      insertRound.run(pid, pname, JSON.stringify(acts), recAt, disp, nurse, remark);
    }

    // 7. Seed Audit Logs (migrated from legacy data_change_text)
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (event_type, summary, operator_name, patient_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const auditsSeed: Array<[string, string, string, string | null, string]> = [
      ['BED_SWAP', '床號 4 (原病患陳柏緊) 更換至床號 1，與原床位調整完成', '江明諺', 'Q120987324', '2026-11-04 (星期三) 14:20:10'],
      ['BED_SWAP', '床號 2 (原病患周松諭) 狀態更新為「看診中」（前往門診超音波室）', '徐溫詠', 'S123456789', '2026-11-05 (星期四) 09:15:32'],
      ['IOT_ALERT', '床號 3 (病患李政浩) GY-906 智慧感測器回傳體溫 38.6°C 觸發發燒預警', '系統自動監測', 'W490382914', '2026-11-04 (星期三) 21:30:02'],
      ['ADMISSION_UPDATE', '床號 1 (病患陳柏緊) 更新入院觀察醫囑與糖尿病飲食設定', '江明諺', 'Q120987324', '2026-11-06 (星期五) 08:40:00'],
    ];

    for (const a of auditsSeed) {
      insertAudit.run(...a);
    }

    // 8. Seed Schedules (for Calendar / Daily Ward Tasks)
    const insertSchedule = db.prepare(`
      INSERT INTO schedules (date, time, title, category, patient_id, patient_name, nurse_name, completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const todayStr = new Date().toISOString().slice(0, 10);
    const schedulesSeed: Array<[string, string, string, string, string, string, string, number]> = [
      [todayStr, '08:30', '晨間交班與全房生命徵象總檢 (712 病房)', 'handover', 'W490382914', '全體病患', '江明諺', 1],
      [todayStr, '09:30', '1床 陳柏緊：餐後血糖檢測與口服降血糖給藥', 'medication', 'Q120987324', '陳柏緊', '江明諺', 1],
      [todayStr, '10:30', '3床 李政浩：12導程心電圖 (ECG) 追蹤檢查', 'examination', 'W490382914', '李政浩', '江明諺', 0],
      [todayStr, '11:30', '2床 周松諭：腹部超音波複查與傷口換藥', 'ward_round', 'S123456789', '周松諭', '徐溫詠', 0],
      [todayStr, '14:00', '江修黼醫師午間主治巡房 (1床、3床、5床、7床)', 'ward_round', 'W490382914', '李政浩 等4人', '江明諺', 0],
      [todayStr, '16:00', '4床 鍾秀楊：支氣管擴張劑霧化吸入治療與血氧監測', 'medication', 'D473890112', '鍾秀楊', '徐溫詠', 0],
      [todayStr, '20:00', '晚間常規給藥與防跌床欄安全查核', 'ward_round', 'Q120987324', '全體病患', '江明諺', 0],
    ];

    for (const s of schedulesSeed) {
      insertSchedule.run(...s);
    }

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
