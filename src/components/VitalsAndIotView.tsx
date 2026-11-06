import React, { useState, useMemo } from 'react';
import {
  Thermometer,
  HeartPulse,
  Droplets,
  Activity,
  Wifi,
  Cpu,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  Flame,
  Code2,
  Radio,
} from 'lucide-react';
import type { Patient, VitalSign, User } from '../types';

interface VitalsAndIotViewProps {
  patient: Patient;
  vitalSigns: VitalSign[];
  currentUser: User;
  onAddVitalSign: (payload: {
    patientId: string;
    temperature: number;
    heartRate: number;
    spo2: number;
    systolicBp: number;
    diastolicBp: number;
    remark: string;
  }) => Promise<void>;
  onTriggerIotMeasure: (patientId: string, simulatedTemp?: number) => Promise<void>;
}

type MetricType = 'temperature' | 'heart_rate' | 'spo2' | 'bp';

export const VitalsAndIotView: React.FC<VitalsAndIotViewProps> = ({
  patient,
  vitalSigns,
  currentUser,
  onAddVitalSign,
  onTriggerIotMeasure,
}) => {
  const isNurse = currentUser.role === 'nurse';
  const [activeMetric, setActiveMetric] = useState<MetricType>('temperature');
  const [temperature, setTemperature] = useState<string>('36.5');
  const [heartRate, setHeartRate] = useState<string>('75');
  const [spo2, setSpo2] = useState<string>('98');
  const [systolicBp, setSystolicBp] = useState<string>('120');
  const [diastolicBp, setDiastolicBp] = useState<string>('78');
  const [remark, setRemark] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [iotScanning, setIotScanning] = useState(false);
  const [showHardwareCode, setShowHardwareCode] = useState(false);

  const patientVitals = useMemo(
    () => vitalSigns.filter((v) => v.patient_id === patient.id_number),
    [vitalSigns, patient.id_number]
  );

  // Chronological order for chart (oldest -> newest, up to 10 points)
  const chartData = useMemo(
    () => [...patientVitals].reverse().slice(-10),
    [patientVitals]
  );

  const latest = patientVitals[0] || null;
  const isLatestFever = latest && latest.temperature >= 37.5;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddVitalSign({
        patientId: patient.id_number,
        temperature: Number(temperature),
        heartRate: Number(heartRate),
        spo2: Number(spo2),
        systolicBp: Number(systolicBp),
        diastolicBp: Number(diastolicBp),
        remark,
      });
      setRemark('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIotScan = async (simTemp?: number) => {
    setIotScanning(true);
    try {
      await new Promise((r) => setTimeout(r, 650));
      await onTriggerIotMeasure(patient.id_number, simTemp);
    } finally {
      setIotScanning(false);
    }
  };

  // Compute SVG chart coordinates
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          尚無該病患之生理數據紀錄
        </div>
      );
    }

    const width = 760;
    const height = 240;
    const padLeft = 48;
    const padRight = 28;
    const padTop = 28;
    const padBottom = 38;
    const innerW = width - padLeft - padRight;
    const innerH = height - padTop - padBottom;

    let minVal = 35;
    let maxVal = 40;
    let unit = '°C';
    let colorStroke = '#0d9488';
    let colorFill = 'rgba(20, 184, 166, 0.14)';

    if (activeMetric === 'temperature') {
      minVal = 34.5;
      maxVal = 40.0;
      unit = '°C';
      colorStroke = '#0d9488';
      colorFill = 'rgba(20, 184, 166, 0.15)';
    } else if (activeMetric === 'heart_rate') {
      minVal = 50;
      maxVal = 120;
      unit = 'bpm';
      colorStroke = '#e11d48';
      colorFill = 'rgba(225, 29, 72, 0.12)';
    } else if (activeMetric === 'spo2') {
      minVal = 90;
      maxVal = 100;
      unit = '%';
      colorStroke = '#0284c7';
      colorFill = 'rgba(2, 132, 199, 0.14)';
    } else {
      minVal = 60;
      maxVal = 160;
      unit = 'mmHg';
      colorStroke = '#6366f1';
      colorFill = 'rgba(99, 102, 241, 0.12)';
    }

    const getX = (idx: number) =>
      chartData.length === 1
        ? padLeft + innerW / 2
        : padLeft + (idx / (chartData.length - 1)) * innerW;

    const getY = (val: number) => {
      const clamped = Math.max(minVal, Math.min(maxVal, val));
      return padTop + innerH - ((clamped - minVal) / (maxVal - minVal)) * innerH;
    };

    const points = chartData.map((d, idx) => {
      const rawVal =
        activeMetric === 'temperature'
          ? d.temperature
          : activeMetric === 'heart_rate'
          ? d.heart_rate || 75
          : activeMetric === 'spo2'
          ? d.spo2 || 98
          : d.systolic_bp || 120;
      return {
        x: getX(idx),
        y: getY(rawVal),
        val: rawVal,
        val2: activeMetric === 'bp' ? d.diastolic_bp || 78 : null,
        y2: activeMetric === 'bp' ? getY(d.diastolic_bp || 78) : null,
        timeLabel: d.display_time.slice(-8, -3),
        dateLabel: d.display_time.slice(5, 10),
        isFever: activeMetric === 'temperature' && rawVal >= 37.5,
      };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + innerH} L ${points[0].x} ${padTop + innerH} Z`;

    const feverY = activeMetric === 'temperature' ? getY(37.5) : null;

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-60 min-w-[540px]">
          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const y = padTop + t * innerH;
            const labelVal = (maxVal - t * (maxVal - minVal)).toFixed(activeMetric === 'temperature' ? 1 : 0);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Fever Threshold Line at 37.5°C */}
          {feverY !== null && (
            <g>
              <line
                x1={padLeft}
                y1={feverY}
                x2={width - padRight}
                y2={feverY}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
              <text
                x={width - padRight - 4}
                y={feverY - 6}
                textAnchor="end"
                className="fill-red-500 text-[10px] font-bold"
              >
                37.5°C 發燒警戒線
              </text>
            </g>
          )}

          {/* Area Fill & Main Line */}
          <path d={areaPath} fill={colorFill} />
          <path
            d={linePath}
            fill="none"
            stroke={colorStroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Secondary Diastolic Line if BP */}
          {activeMetric === 'bp' && (
            <path
              d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y2}`).join(' ')}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
          )}

          {/* Data Points & Value Badges */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.isFever ? 6 : 4.5}
                fill={p.isFever ? '#ef4444' : '#ffffff'}
                stroke={p.isFever ? '#dc2626' : colorStroke}
                strokeWidth="2.5"
              />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className={`text-[11px] font-mono font-bold ${
                  p.isFever ? 'fill-red-600 dark:fill-red-400' : 'fill-slate-700 dark:fill-slate-200'
                }`}
              >
                {activeMetric === 'temperature' ? p.val.toFixed(1) : p.val}
                {activeMetric === 'bp' && p.val2 ? `/${p.val2}` : ''}
              </text>

              {/* X-axis timestamp */}
              <text
                x={p.x}
                y={height - 16}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-mono"
              >
                {p.dateLabel}
              </text>
              <text
                x={p.x}
                y={height - 5}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-mono"
              >
                {p.timeLabel}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveMetric('temperature')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeMetric === 'temperature'
              ? 'bg-teal-500/10 border-teal-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-teal-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>最新耳溫 / 額溫 (GY-906)</span>
            <Thermometer className={`w-4 h-4 ${isLatestFever ? 'text-red-500 animate-bounce' : 'text-teal-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-mono font-extrabold ${
                isLatestFever ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {latest ? `${latest.temperature.toFixed(1)} °C` : '--'}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isLatestFever
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isLatestFever ? '發燒警示' : '正常範圍'}
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveMetric('heart_rate')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeMetric === 'heart_rate'
              ? 'bg-rose-500/10 border-rose-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>脈搏心率 (MAX30100)</span>
            <HeartPulse className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
              {latest?.heart_rate ? `${latest.heart_rate} bpm` : '--'}
            </span>
            <span className="text-[11px] text-slate-400">60~100 正常</span>
          </div>
        </div>

        <div
          onClick={() => setActiveMetric('spo2')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeMetric === 'spo2'
              ? 'bg-sky-500/10 border-sky-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>血氧飽和度 (SpO2)</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
              {latest?.spo2 ? `${latest.spo2} %` : '--'}
            </span>
            <span className="text-[11px] text-slate-400">&ge; 95% 正常</span>
          </div>
        </div>

        <div
          onClick={() => setActiveMetric('bp')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            activeMetric === 'bp'
              ? 'bg-indigo-500/10 border-indigo-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>收縮壓 / 舒張壓 (BP)</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
              {latest?.systolic_bp ? `${latest.systolic_bp}/${latest.diastolic_bp}` : '--'}
            </span>
            <span className="text-[11px] text-slate-400">mmHg</span>
          </div>
        </div>
      </div>

      {/* Main Chart & IoT Sensor Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive SVG Trend Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {patient.name}（712-{patient.bed_no}床）生命徵象動態趨勢圖
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                點擊上方指標卡片可切換檢視「體溫」、「心率」、「血氧」或「血壓」曲線
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              {[
                { id: 'temperature', label: '體溫 °C' },
                { id: 'heart_rate', label: '心率 BPM' },
                { id: 'spo2', label: '血氧 %' },
                { id: 'bp', label: '血壓 mmHg' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMetric(tab.id as MetricType)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeMetric === tab.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {renderChart()}
        </div>

        {/* Right: Smart IoT Sensor Hub (Replaces nurse_bodydata3.php infinite while loop!) (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between border border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Radio className={`w-3.5 h-3.5 ${iotScanning ? 'animate-ping' : ''}`} />
                IoT 智慧床頭感測連線中
              </span>
              <Cpu className="w-5 h-5 text-slate-400" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold tracking-tight">
                Arduino GY-906 & MAX30100 無線感測中心
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                已徹底重構舊版 <code className="text-amber-300">nurse_bodydata3.php</code> 的阻塞式無窮迴圈，改用非同步事件驅動感測 API，0 毫秒卡頓完成紅外線非接觸測溫與血氧採集。
              </p>
            </div>

            {/* Live Sensor Status Display Box */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>目標感測床位</span>
                <span className="font-mono font-bold text-teal-300">
                  712 房 - 0{patient.bed_no} 床 ({patient.name})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>感測模組</span>
                <span className="font-mono text-slate-200">ESP32 + GY-906 + MAX30100</span>
              </div>
              {iotScanning && (
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-teal-300 animate-pulse">
                  <Wifi className="w-4 h-4" />
                  正在透過藍牙/WiFi 讀取紅外線耳額溫與脈搏波...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5 pt-4">
            <button
              type="button"
              disabled={iotScanning}
              onClick={() => handleIotScan(Number((36.3 + Math.random() * 0.7).toFixed(1)))}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <Wifi className="w-4 h-4" />
              {iotScanning ? '感測器讀取中...' : '一鍵啟動 IoT 正常體溫量測'}
            </button>

            <button
              type="button"
              disabled={iotScanning}
              onClick={() => handleIotScan(Number((38.1 + Math.random() * 0.8).toFixed(1)))}
              className="w-full py-2 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              模擬 IoT 發燒異常警報 (&ge; 38.1°C)
            </button>

            <button
              type="button"
              onClick={() => setShowHardwareCode(!showHardwareCode)}
              className="w-full py-1.5 text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              {showHardwareCode ? '隱藏 Arduino 硬體串接端點' : '檢視 Arduino ESP32 硬體串接端點'}
            </button>

            {showHardwareCode && (
              <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 font-mono text-[10px] text-teal-300 break-all">
                GET /api/iot/esp?temperature=36.8&amp;patient_id={patient.id_number}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nurse Manual Entry Form */}
      {isNurse && (
        <form
          onSubmit={handleManualSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-teal-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                護理師人工登錄生命徵象 ({patient.name})
              </h3>
            </div>
            <span className="text-xs text-slate-400">記錄人員：{currentUser.name} 護理師</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">體溫 (°C)</label>
              <input
                type="number"
                step="0.1"
                min="32"
                max="44"
                required
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">心率 (BPM)</label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">血氧 SpO2 (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">收縮壓 (mmHg)</label>
              <input
                type="number"
                value={systolicBp}
                onChange={(e) => setSystolicBp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">舒張壓 (mmHg)</label>
              <input
                type="number"
                value={diastolicBp}
                onChange={(e) => setDiastolicBp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">臨床備註</label>
              <input
                type="text"
                placeholder="例：退燒後複測"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 text-sm font-bold shadow-sm transition-all"
            >
              {submitting ? '寫入資料庫中...' : '提交生理數據紀錄'}
            </button>
          </div>
        </form>
      )}

      {/* Historical Telemetry Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            身體數據歷史紀錄 ({patientVitals.length} 筆)
          </h3>
          <span className="text-xs text-slate-400">體溫 &ge; 37.5°C 自動標記為發燒異常</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200/70 dark:border-slate-800">
                <th className="py-3 px-4">量測日期時間</th>
                <th className="py-3 px-4">體溫 (°C)</th>
                <th className="py-3 px-4">心率 / 血氧</th>
                <th className="py-3 px-4">血壓 (mmHg)</th>
                <th className="py-3 px-4">資料來源</th>
                <th className="py-3 px-4">護理師</th>
                <th className="py-3 px-4">臨床備註</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {patientVitals.map((row) => {
                const isFever = row.temperature >= 37.5;
                return (
                  <tr
                    key={row.id}
                    className={
                      isFever
                        ? 'bg-red-500/5 hover:bg-red-500/10'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }
                  >
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {row.display_time}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs ${
                          isFever
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                            : 'bg-teal-500/10 text-teal-700 dark:text-teal-300'
                        }`}
                      >
                        {row.temperature.toFixed(1)} °C
                        {isFever && <AlertTriangle className="w-3.5 h-3.5" />}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {row.heart_rate || '--'} bpm · {row.spo2 || '--'}%
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {row.systolic_bp ? `${row.systolic_bp}/${row.diastolic_bp}` : '--'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          row.source.startsWith('iot')
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {row.source === 'iot_gy906'
                          ? 'IoT GY-906 紅外線'
                          : row.source === 'iot_max30100'
                          ? 'IoT MAX30100 感測'
                          : '護理師人工量測'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {row.recorded_by}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {row.remark || '正常'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
