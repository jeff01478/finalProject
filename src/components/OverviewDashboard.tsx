import React from 'react';
import {
  BedDouble,
  Users,
  Thermometer,
  CalendarCheck,
  ArrowRight,
  Stethoscope,
  UserCheck,
  History,
  QrCode,
  Pill,
  FileText,
  BookOpen,
  AlertTriangle,
  Activity,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import type { BootstrapData, User, Patient, ActiveTab } from '../types';
import { calculateAgeDisplay } from '../types';

interface OverviewDashboardProps {
  data: BootstrapData;
  currentUser: User;
  selectedPatient: Patient;
  onSelectPatient: (patientId: string, navigateTo?: ActiveTab) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  data,
  currentUser,
  selectedPatient,
  onSelectPatient,
  onNavigateTab,
}) => {
  const isNurse = currentUser.role === 'nurse';
  const occupiedBeds = data.beds.filter((b) => b.patient_id && b.status !== '空床');
  const myPatients = data.patients.filter((p) => p.primary_nurse_id === currentUser.id_number);
  const feverBeds = data.beds.filter((b) => b.latestVital && b.latestVital.temperature >= 37.5);
  const pendingSchedules = data.schedules.filter((s) => !s.completed);

  const activePatient = isNurse
    ? selectedPatient
    : data.patients.find((p) => p.id_number === currentUser.id_number) || selectedPatient;

  const activeBed = data.beds.find((b) => b.patient_id === activePatient.id_number);
  const activeVital = activeBed?.latestVital;
  const ageInfo = calculateAgeDisplay(activePatient.birth_date);

  return (
    <div className="space-y-6">
      {/* Welcome & Performance Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-lg overflow-hidden border border-slate-800">
        <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isNurse ? '醫護臨床管理視角 (Nurse Portal)' : '住院病患與家屬專屬視角 (Patient Portal)'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              早安，{currentUser.name}{' '}
              <span className="text-teal-400 font-semibold text-lg">
                ({currentUser.identity_title})
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isNurse
                ? `您目前負責 712 病房共 ${myPatients.length} 位住院病患。可點擊下方負責病患快速切換檢視，或進入「視覺化床位管理」執行一鍵換床調度。`
                : `歡迎使用智慧病房個人健康入口。您目前入住於 ${activePatient.ward_no} 病房 0${activePatient.bed_no} 號床，主治醫師為 ${activePatient.attending_physician}，主護護理師為 ${activePatient.primary_nurse_name}。`}
            </p>
          </div>

          {/* Ultra-fast Engine Telemetry Pill */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[11px] text-teal-300 font-bold">
                <Zap className="w-3.5 h-3.5" />
                極速 SQLite WAL 引擎
              </div>
              <div className="text-lg font-mono font-extrabold text-white mt-0.5">
                {data.serverMetrics.queryTimeMs} ms{' '}
                <span className="text-[11px] font-normal text-slate-400">全表聚合耗時</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab(isNurse ? 'ward_map' : 'bed_card')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm shadow-lg transition-all"
            >
              {isNurse ? (
                <>
                  <BedDouble className="w-4 h-4" />
                  進入視覺化床位調度
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  開啟我的電子病床卡
                </>
              )}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clinical KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('ward_map')}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-teal-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>712 病房佔床率</span>
            <BedDouble className="w-4 h-4 text-teal-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
              {occupiedBeds.length} / {data.beds.length} 床
            </span>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
              {Math.round((occupiedBeds.length / data.beds.length) * 100)}% 佔床
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('patient_profile')}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{isNurse ? '我負責的主護病患' : '目前入住床位'}</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
              {isNurse ? `${myPatients.length} 位` : `712-0${activePatient.bed_no}`}
            </span>
            <span className="text-xs text-slate-400">
              {isNurse ? `全房共 ${data.patients.length} 位病患` : activeBed?.status || '在床中'}
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('vitals_iot')}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-rose-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{isNurse ? '發燒異常預警人數' : '個人最新體溫'}</span>
            <Thermometer className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
              {isNurse
                ? `${feverBeds.length} 床`
                : activeVital
                ? `${activeVital.temperature.toFixed(1)} °C`
                : '--'}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {feverBeds.length === 0 ? '全房體溫正常' : '需優先追蹤'}
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('schedule')}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>今日待辦查房與檢查</span>
            <CalendarCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
              {pendingSchedules.length} 項
            </span>
            <span className="text-xs text-slate-400">
              共 {data.schedules.length} 項排程
            </span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Bento Grid (Replaces the 3 black-bordered boxes in nurse_index.php / nurse_main.php / patient_main.php) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Responsible Patients (Nurse) or Personal Care Card (Patient) (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          {isNurse ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    負責病患名單 (Responsible Patients)
                  </h3>
                </div>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  主護：{currentUser.name}
                </span>
              </div>

              <div className="space-y-2.5">
                {data.patients.map((p) => {
                  const isMine = p.primary_nurse_id === currentUser.id_number;
                  const isCurrent = p.id_number === selectedPatient.id_number;
                  const bed = data.beds.find((b) => b.patient_id === p.id_number);
                  return (
                    <div
                      key={p.id_number}
                      onClick={() => onSelectPatient(p.id_number)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-teal-500/10 border-teal-500 text-slate-900 dark:text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:border-teal-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-slate-800 font-mono font-bold text-xs flex items-center justify-center">
                          0{p.bed_no}
                        </span>
                        <div>
                          <div className="font-bold text-sm flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isMine && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300">
                                負責對象
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {bed?.status || '在床中'} · 體溫 {bed?.latestVital?.temperature.toFixed(1) || '--'}°C
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPatient(p.id_number, 'patient_profile');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:text-teal-600"
                      >
                        病歷
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    個人住院照護基本資料
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                  <span className="text-slate-500">病患姓名</span>
                  <strong className="text-slate-900 dark:text-white">{activePatient.name} ({ageInfo.label})</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                  <span className="text-slate-500">入住病房與床號</span>
                  <strong className="font-mono text-teal-600 dark:text-teal-400">
                    {activePatient.ward_no} 病房 - 0{activePatient.bed_no} 床
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                  <span className="text-slate-500">主治醫師</span>
                  <strong className="text-slate-900 dark:text-white">{activePatient.attending_physician}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                  <span className="text-slate-500">主護護理師</span>
                  <strong className="text-slate-900 dark:text-white">{activePatient.primary_nurse_name} 護理師</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                  <span className="text-slate-500">飲食與防跌醫囑</span>
                  <strong className="text-slate-900 dark:text-white">
                    {activePatient.diet_type} · {activePatient.fall_risk}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Focused Patient Quick Console (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  當前選取對象：{activePatient.name} (0{activePatient.bed_no}床)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">#{activePatient.chart_no}</span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 mb-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>主治：{activePatient.attending_physician}</span>
                <span>主護：{activePatient.primary_nurse_name}</span>
              </div>
              <div className="text-xs text-slate-200 leading-relaxed">
                目前病況：{activePatient.current_condition || '穩定觀察中'}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">體溫</div>
                  <div className="text-sm font-bold text-teal-300">
                    {activeVital ? `${activeVital.temperature.toFixed(1)}°C` : '--'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">心率</div>
                  <div className="text-sm font-bold text-rose-300">
                    {activeVital?.heart_rate ? `${activeVital.heart_rate} bpm` : '--'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">血氧</div>
                  <div className="text-sm font-bold text-sky-300">
                    {activeVital?.spo2 ? `${activeVital.spo2}%` : '--'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Tiles (Replaces About對象 & About床位 links) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigateTab('patient_profile')}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-500/10 hover:border-teal-500/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-2.5 text-left transition-all"
              >
                <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">病人基本資料</div>
                  <div className="text-[10px] text-slate-400">基本與入院病歷</div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('vitals_iot')}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-500/10 hover:border-teal-500/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-2.5 text-left transition-all"
              >
                <Thermometer className="w-5 h-5 text-teal-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">身體數據與 IoT</div>
                  <div className="text-[10px] text-slate-400">趨勢圖與無線測溫</div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('care_workflow')}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-500/10 hover:border-teal-500/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-2.5 text-left transition-all"
              >
                <Pill className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">用藥與查房日程</div>
                  <div className="text-[10px] text-slate-400">處方給藥與巡房</div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('bed_card')}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-500/10 hover:border-teal-500/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-2.5 text-left transition-all"
              >
                <QrCode className="w-5 h-5 text-sky-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">電子資訊病床卡</div>
                  <div className="text-[10px] text-slate-400">床頭看板與 QR 碼</div>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('health_edu')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <BookOpen className="w-4 h-4 text-teal-500" />
            前往多語系衛教資訊中心 (防跌須知 / 胸腔內科 / 神經內科)
          </button>
        </div>

        {/* Column 3: Live Audit & Change Feed (Replaces 異動資訊 box) (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  病房異動資訊與即時預警 (Live Feed)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">audit_logs</span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {data.auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        log.event_type === 'IOT_ALERT'
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                          : log.event_type === 'BED_SWAP'
                          ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                          : 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                      }`}
                    >
                      {log.event_type === 'IOT_ALERT'
                        ? 'IoT 發燒預警'
                        : log.event_type === 'BED_SWAP'
                        ? '床位調度異動'
                        : '臨床資料更新'}
                    </span>
                    <span className="font-mono text-slate-400">{log.created_at.slice(-8)}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {log.summary}
                  </p>
                  <div className="text-[11px] text-slate-400">
                    執行人：{log.operator_name} · {log.created_at.slice(0, 16)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
