import React, { useState } from 'react';
import {
  BedDouble,
  ArrowLeftRight,
  Thermometer,
  HeartPulse,
  Droplets,
  UserCheck,
  AlertTriangle,
  Stethoscope,
  FileText,
  QrCode,
  Pill,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import type { Bed, ActiveTab, User } from '../types';
import { calculateAgeDisplay } from '../types';

interface WardMapViewProps {
  beds: Bed[];
  currentUser: User;
  selectedPatientId: string;
  onSelectPatient: (patientId: string, navigateTo?: ActiveTab) => void;
  onSwapBeds: (patientId: string, targetBedNo: number) => Promise<void>;
  onChangeBedStatus: (bedNo: number, status: string) => Promise<void>;
}

const STATUS_CONFIG: Record<
  string,
  {
    badgeBg: string;
    border: string;
    glow: string;
    dot: string;
    label: string;
    desc: string;
  }
> = {
  在床中: {
    badgeBg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    border: 'border-sky-500/40 hover:border-sky-500',
    glow: 'from-sky-500/10 via-transparent to-transparent',
    dot: 'bg-sky-500',
    label: '在床中',
    desc: '病患於病床休養監護中',
  },
  看診中: {
    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-500/40 hover:border-emerald-500',
    glow: 'from-emerald-500/10 via-transparent to-transparent',
    dot: 'bg-emerald-500',
    label: '看診中',
    desc: '門診檢查或醫師會診中',
  },
  休息中: {
    badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    border: 'border-amber-500/40 hover:border-amber-500',
    glow: 'from-amber-500/10 via-transparent to-transparent',
    dot: 'bg-amber-500',
    label: '休息中',
    desc: '治療後睡眠或靜養休息',
  },
  手術中: {
    badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    border: 'border-rose-500/40 hover:border-rose-500',
    glow: 'from-rose-500/10 via-transparent to-transparent',
    dot: 'bg-rose-500',
    label: '手術中',
    desc: '手術室或侵入性處置中',
  },
  空床: {
    badgeBg: 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700',
    border: 'border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500/60',
    glow: 'from-slate-500/5 via-transparent to-transparent',
    dot: 'bg-slate-400',
    label: '空床待命',
    desc: '已完成終期消毒可隨時入住',
  },
};

export const WardMapView: React.FC<WardMapViewProps> = ({
  beds,
  currentUser,
  selectedPatientId,
  onSelectPatient,
  onSwapBeds,
  onChangeBedStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [swapSourceBed, setSwapSourceBed] = useState<Bed | null>(null);
  const [busyBedNo, setBusyBedNo] = useState<number | null>(null);

  const isNurse = currentUser.role === 'nurse';

  const counts = {
    ALL: beds.length,
    在床中: beds.filter((b) => b.status === '在床中').length,
    看診中: beds.filter((b) => b.status === '看診中').length,
    休息中: beds.filter((b) => b.status === '休息中').length,
    空床: beds.filter((b) => !b.patient_id || b.status === '空床').length,
  };

  const filteredBeds = beds.filter((b) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === '空床') return !b.patient_id || b.status === '空床';
    return b.status === statusFilter;
  });

  const handleBedActionClick = async (targetBed: Bed) => {
    if (!swapSourceBed || !swapSourceBed.patient_id) return;
    if (swapSourceBed.bed_no === targetBed.bed_no) {
      setSwapSourceBed(null);
      return;
    }
    setBusyBedNo(targetBed.bed_no);
    try {
      await onSwapBeds(swapSourceBed.patient_id, targetBed.bed_no);
      setSwapSourceBed(null);
    } finally {
      setBusyBedNo(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Control & Legend Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <BedDouble className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  712 智慧病房平面圖與動態床位調度
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    共 8 床・佔床率 {Math.round(((8 - counts.空床) / 8) * 100)}%
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  即時整合病床狀態、生理感測數據與過敏防跌警示；護理師可直接在卡片切換狀態或啟動「視覺化一鍵換床/交換」。
                </p>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', '在床中', '看診中', '休息中', '空床'] as const).map((st) => {
              const active = statusFilter === st;
              const cfg = st !== 'ALL' ? STATUS_CONFIG[st] : null;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-teal-500 dark:text-slate-950 dark:border-teal-400 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cfg && <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
                  <span>{st === 'ALL' ? '全部床位' : st}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 text-[11px]">
                    {counts[st]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Bed Swap Mode Banner */}
        {swapSourceBed && (
          <div className="mt-4 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
              <ArrowLeftRight className="w-5 h-5 shrink-0" />
              <span>
                正在為 <strong>{swapSourceBed.bed_no} 號床（{swapSourceBed.patient?.name}）</strong> 進行床位調度：
                請直接點擊下方任一目標病床（空床將直接移入，有人床位將自動雙向互換並記錄異動）！
              </span>
            </div>
            <button
              onClick={() => setSwapSourceBed(null)}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
            >
              取消換床模式
            </button>
          </div>
        )}
      </div>

      {/* 8-Bed Interactive Grid (4 per row on desktop, matching legacy 2x4 layout but ultra-refined) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {filteredBeds.map((bed) => {
          const patient = bed.patient;
          const vital = bed.latestVital;
          const statusKey = patient ? bed.status : '空床';
          const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.在床中;
          const isSelected = patient && patient.id_number === selectedPatientId;
          const isSwapSource = swapSourceBed?.bed_no === bed.bed_no;
          const isSwapTargetCandidate = swapSourceBed && swapSourceBed.bed_no !== bed.bed_no;
          const isFever = vital && vital.temperature >= 37.5;
          const isMyPatient = patient && patient.primary_nurse_id === currentUser.id_number;
          const ageInfo = calculateAgeDisplay(patient?.birth_date);

          return (
            <div
              key={bed.bed_no}
              onClick={() => {
                if (isSwapTargetCandidate) {
                  handleBedActionClick(bed);
                } else if (patient) {
                  onSelectPatient(patient.id_number);
                }
              }}
              className={`group relative rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isSwapSource
                  ? 'border-indigo-500 ring-4 ring-indigo-500/20'
                  : isSwapTargetCandidate
                  ? 'border-indigo-400 hover:border-indigo-600 cursor-pointer ring-2 ring-indigo-400/30 hover:scale-[1.01]'
                  : isSelected
                  ? 'border-teal-500 ring-4 ring-teal-500/15 shadow-md'
                  : cfg.border
              } ${patient ? 'cursor-pointer shadow-sm hover:shadow-md' : ''}`}
            >
              {/* Subtle Top Gradient Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cfg.glow} pointer-events-none`} />

              <div className="relative p-5 space-y-4">
                {/* Bed Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-sm border ${
                        patient
                          ? 'bg-slate-900 text-white border-slate-800 dark:bg-slate-800 dark:border-slate-700'
                          : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                      }`}
                    >
                      <span className="text-[9px] leading-none opacity-70">712</span>
                      <span className="text-base leading-tight">0{bed.bed_no}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                          第 {bed.bed_no} 號病床
                        </span>
                        {isMyPatient && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-300">
                            <UserCheck className="w-3 h-3" /> 主護負責
                          </span>
                        )}
                      </div>
                      {patient ? (
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                          {patient.name}
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            ({patient.gender} · {ageInfo.shortLabel})
                          </span>
                        </h3>
                      ) : (
                        <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500">
                          空床待命
                        </h3>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.badgeBg}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot} ${patient ? 'animate-pulse' : ''}`} />
                    {statusKey}
                  </span>
                </div>

                {patient ? (
                  <>
                    {/* Patient Clinical Tags (Blood, Allergy, Fall Risk) */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        病歷 #{patient.chart_no}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        {patient.blood_type} 型 ({patient.rh_type})
                      </span>
                      {patient.allergies && patient.allergies !== '無' && patient.allergies !== '無已知藥物過敏' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" /> 過敏: {patient.allergies.slice(0, 10)}
                        </span>
                      )}
                      {patient.fall_risk === '高度風險' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                          <ShieldAlert className="w-3 h-3" /> 防跌高風險
                        </span>
                      )}
                    </div>

                    {/* Live Telemetry Mini-Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div
                        className={`p-2.5 rounded-xl border ${
                          isFever
                            ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>體溫</span>
                          <Thermometer className={`w-3.5 h-3.5 ${isFever ? 'text-red-500 animate-bounce' : 'text-teal-500'}`} />
                        </div>
                        <div className="font-mono font-bold text-sm mt-0.5">
                          {vital ? `${vital.temperature.toFixed(1)}°C` : '--'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>心率</span>
                          <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <div className="font-mono font-bold text-sm mt-0.5 text-slate-800 dark:text-slate-200">
                          {vital?.heart_rate ? `${vital.heart_rate} bpm` : '--'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>血氧</span>
                          <Droplets className="w-3.5 h-3.5 text-sky-500" />
                        </div>
                        <div className="font-mono font-bold text-sm mt-0.5 text-slate-800 dark:text-slate-200">
                          {vital?.spo2 ? `${vital.spo2}%` : '--'}
                        </div>
                      </div>
                    </div>

                    {/* Physician & Nurse Info */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span>主治醫師：<strong className="text-slate-700 dark:text-slate-200">{patient.attending_physician}</strong></span>
                        <span>主護：<strong className="text-teal-600 dark:text-teal-400">{patient.primary_nurse_name}</strong></span>
                      </div>
                      <p className="line-clamp-1 text-[11px] text-slate-400 dark:text-slate-500">
                        病況：{patient.current_condition || '穩定觀察中'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 text-slate-400 dark:text-slate-500">
                    <Sparkles className="w-8 h-8 stroke-[1.5] text-slate-300 dark:text-slate-600" />
                    <p className="text-xs">此床位目前為空床且已完成清潔消毒</p>
                    {isSwapTargetCandidate && (
                      <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white shadow">
                        點擊將 {swapSourceBed?.patient?.name} 移至此空床
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              {patient && !isSwapTargetCandidate && (
                <div
                  className="relative px-4 py-3 bg-slate-50/90 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Quick Navigation Icons */}
                  <div className="flex items-center gap-1">
                    <button
                      title="基本與入院資料"
                      onClick={() => onSelectPatient(patient.id_number, 'patient_profile')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-teal-600 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      title="生命徵象與 IoT 體溫"
                      onClick={() => onSelectPatient(patient.id_number, 'vitals_iot')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-teal-600 transition-colors"
                    >
                      <Thermometer className="w-4 h-4" />
                    </button>
                    <button
                      title="用藥與查房紀錄"
                      onClick={() => onSelectPatient(patient.id_number, 'care_workflow')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-teal-600 transition-colors"
                    >
                      <Pill className="w-4 h-4" />
                    </button>
                    <button
                      title="數位資訊病床卡"
                      onClick={() => onSelectPatient(patient.id_number, 'bed_card')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-teal-600 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Nurse Controls: Status Selector & Swap Trigger */}
                  {isNurse && (
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label={`床號 ${bed.bed_no} 狀態`}
                        value={bed.status}
                        onChange={(e) => onChangeBedStatus(bed.bed_no, e.target.value)}
                        className="text-[11px] font-semibold rounded-lg px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="在床中">在床中</option>
                        <option value="看診中">看診中</option>
                        <option value="休息中">休息中</option>
                        <option value="手術中">手術中</option>
                      </select>

                      <button
                        onClick={() =>
                          setSwapSourceBed(isSwapSource ? null : bed)
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isSwapSource
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
                        }`}
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        {isSwapSource ? '選擇目標中' : '換床'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Swap Target Overlay Prompt */}
              {isSwapTargetCandidate && (
                <div className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  {busyBedNo === bed.bed_no
                    ? '正在執行換床調度...'
                    : patient
                    ? `點擊與 ${bed.bed_no} 床 (${patient.name}) 交換床位`
                    : `點擊移入 ${bed.bed_no} 號空床`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
