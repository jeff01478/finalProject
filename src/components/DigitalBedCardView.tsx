import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Printer,
  Maximize2,
  Minimize2,
  HeartPulse,
  Thermometer,
  Droplets,
  AlertTriangle,
  ShieldAlert,
  Utensils,
  Stethoscope,
  UserCheck,
  Calendar,
  Activity,
} from 'lucide-react';
import type { Patient, VitalSign } from '../types';
import { calculateAgeDisplay } from '../types';

interface DigitalBedCardViewProps {
  patient: Patient;
  latestVital: VitalSign | null;
  bedStatus: string;
}

export const DigitalBedCardView: React.FC<DigitalBedCardViewProps> = ({
  patient,
  latestVital,
  bedStatus,
}) => {
  const [now, setNow] = useState(new Date());
  const [kioskMode, setKioskMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ageInfo = calculateAgeDisplay(patient.birth_date);
  const isFever = latestVital && latestVital.temperature >= 37.5;

  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${now.getFullYear()} 年 ${String(now.getMonth() + 1).padStart(2, '0')} 月 ${String(
    now.getDate()
  ).padStart(2, '0')} 日 (星期${days[now.getDay()]})`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
    2,
    '0'
  )}:${String(now.getSeconds()).padStart(2, '0')}`;

  const qrContent = JSON.stringify({
    system: 'MediCare Pro Smart Bed Card',
    ward: patient.ward_no,
    bed: patient.bed_no,
    chartNo: patient.chart_no,
    name: patient.name,
    physician: patient.attending_physician,
    nurse: patient.primary_nurse_name,
    blood: `${patient.blood_type} (${patient.rh_type})`,
    allergies: patient.allergies,
  });

  return (
    <div
      className={
        kioskMode
          ? 'fixed inset-0 z-50 bg-slate-950 p-6 md:p-10 flex flex-col justify-center overflow-y-auto'
          : 'space-y-5'
      }
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h2
            className={`text-lg font-bold flex items-center gap-2 ${
              kioskMode ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}
          >
            <QrCode className="w-5 h-5 text-teal-500" />
            智慧電子床頭卡終端 (Smart Bedside Terminal E-Card)
          </h2>
          <p className="text-xs text-slate-400">
            自動根據出生日期精算實歲（修正舊版寫死 80y2m 問題），內建本地高精度時鐘與動態醫療 QR Code
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            列印實體病床卡
          </button>
          <button
            type="button"
            onClick={() => setKioskMode(!kioskMode)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            {kioskMode ? (
              <>
                <Minimize2 className="w-4 h-4" />
                退出床頭平板全螢幕
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                全螢幕床頭看板模式 (Kiosk)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Smart Bedside Terminal Card */}
      <div className="print-only-card relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border-2 border-teal-500/40 shadow-2xl overflow-hidden">
        {/* Decorative Subtle Medical Grid & Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        {/* Terminal Top Bar: Ward/Bed Badge + Hospital Title + Live Digital Clock */}
        <div className="relative px-6 sm:px-10 py-6 bg-white/[0.03] border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 text-slate-950 font-mono font-black shadow-lg flex items-baseline gap-2">
              <span className="text-xs uppercase tracking-wider opacity-80">ROOM</span>
              <span className="text-3xl leading-none">{patient.ward_no}</span>
              <span className="text-xl opacity-75">-</span>
              <span className="text-3xl leading-none">0{patient.bed_no}</span>
              <span className="text-xs font-sans font-bold">床</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
                  SMART INPATIENT CARE TERMINAL
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {bedStatus}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5">
                護理長照與智慧臨床病房中心
              </h3>
            </div>
          </div>

          {/* Local Precision Clock (Replaces external iframe!) */}
          <div className="flex items-center gap-4 self-start lg:self-center bg-black/40 px-5 py-2.5 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">{dateStr}</div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-teal-300 tracking-wider">
                {timeStr}
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Center Body */}
        <div className="relative p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left & Center: Patient Identity, Demographics & Care Team (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-slate-300 font-mono text-xs font-semibold mb-3">
                  <span>病歷號碼 Chart No.</span>
                  <strong className="text-white text-sm">#{patient.chart_no}</strong>
                </div>
                <div className="flex flex-wrap items-baseline gap-4">
                  <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                    {patient.name}
                  </h1>
                  <span className="text-xl sm:text-2xl font-bold text-slate-300">
                    {patient.gender} · {ageInfo.label}
                  </span>
                </div>
              </div>

              {/* Blood Type & Rh Giant Pill */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                    BLOOD TYPE
                  </div>
                  <div className="text-2xl font-mono font-black text-rose-200">
                    {patient.blood_type} <span className="text-sm font-semibold">{patient.rh_type}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Care Team & Admission Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Stethoscope className="w-4 h-4 text-sky-400" />
                  主治醫師 Attending
                </div>
                <div className="text-xl font-extrabold text-white mt-1">
                  {patient.attending_physician}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  主護護理師 Primary Nurse
                </div>
                <div className="text-xl font-extrabold text-teal-300 mt-1">
                  {patient.primary_nurse_name} 護理師
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  入住日期 Admission Date
                </div>
                <div className="text-xl font-mono font-extrabold text-white mt-1">
                  {patient.hospitalization_date}
                </div>
              </div>
            </div>

            {/* Clinical Safety Banners: Allergies, Fall Risk, Diet */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-bold text-amber-300 uppercase">過敏史警示 Allergy</div>
                  <div className="text-sm font-extrabold text-white">{patient.allergies || '無已知過敏'}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-bold text-rose-300 uppercase">防跌等級 Fall Risk</div>
                  <div className="text-sm font-extrabold text-white">防跌：{patient.fall_risk}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-3">
                <Utensils className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-bold text-emerald-300 uppercase">飲食醫囑 Diet Order</div>
                  <div className="text-sm font-extrabold text-white">{patient.diet_type}</div>
                </div>
              </div>
            </div>

            {/* Live Bedside Telemetry Strip */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Activity className="w-4 h-4 text-teal-400" />
                即時生理監測摘要
              </div>
              <div className="flex flex-wrap items-center gap-6 font-mono">
                <div className="flex items-center gap-2">
                  <Thermometer className={`w-4 h-4 ${isFever ? 'text-red-400 animate-bounce' : 'text-teal-400'}`} />
                  <span className="text-xs text-slate-400">體溫</span>
                  <strong className={`text-base ${isFever ? 'text-red-400' : 'text-white'}`}>
                    {latestVital ? `${latestVital.temperature.toFixed(1)}°C` : '--'}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  <span className="text-xs text-slate-400">心率</span>
                  <strong className="text-base text-white">
                    {latestVital?.heart_rate ? `${latestVital.heart_rate} bpm` : '--'}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span className="text-xs text-slate-400">血氧</span>
                  <strong className="text-base text-white">
                    {latestVital?.spo2 ? `${latestVital.spo2}%` : '--'}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">血壓</span>
                  <strong className="text-base text-white">
                    {latestVital?.systolic_bp ? `${latestVital.systolic_bp}/${latestVital.diastolic_bp} mmHg` : '--'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Smart QR Code Identification Box (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="p-6 rounded-3xl bg-white text-slate-900 shadow-xl flex flex-col items-center text-center max-w-xs w-full">
              <div className="text-xs font-black tracking-widest uppercase text-teal-600 mb-1">
                SCAN FOR CLINICAL RECORD
              </div>
              <div className="text-base font-extrabold text-slate-900 mb-4">
                行動查房與家屬衛教條碼
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <QRCodeSVG
                  value={qrContent}
                  size={176}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="mt-4 text-xs font-mono font-bold text-slate-600">
                ID: {patient.id_number} · 712-0{patient.bed_no}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                醫護人員可使用巡房平板掃描核對給藥身分
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
