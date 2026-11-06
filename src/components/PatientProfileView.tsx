import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  FileText,
  Edit3,
  Save,
  X,
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Stethoscope,
  ShieldAlert,
  Utensils,
  History,
  CheckCircle2,
  Droplet,
} from 'lucide-react';
import type { Patient, User, AuditLog, Bed } from '../types';
import { calculateAgeDisplay } from '../types';

interface PatientProfileViewProps {
  patient: Patient;
  beds: Bed[];
  nurses: User[];
  currentUser: User;
  auditLogs: AuditLog[];
  onSavePatient: (patientId: string, updated: Partial<Patient>) => Promise<void>;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient,
  beds,
  nurses,
  currentUser,
  auditLogs,
  onSavePatient,
}) => {
  const isNurse = currentUser.role === 'nurse';
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Patient>(patient);

  useEffect(() => {
    setForm(patient);
    setIsEditing(false);
  }, [patient]);

  const ageInfo = calculateAgeDisplay(form.birth_date);

  const handleFieldChange = (key: keyof Patient, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNoteChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      field_notes: {
        ...(prev.field_notes || {}),
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSavePatient(patient.id_number, form);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const patientAudits = auditLogs.filter(
    (a) => !a.patient_id || a.patient_id === patient.id_number || a.summary.includes(patient.name)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Hero Summary Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex flex-col items-center justify-center font-bold shadow-md shrink-0">
              <span className="text-[11px] opacity-80 font-mono">712 房</span>
              <span className="text-xl leading-none font-mono">{patient.bed_no ? `0${patient.bed_no}` : '--'}</span>
              <span className="text-[10px] opacity-90 mt-0.5">號床</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {patient.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {patient.gender} · {ageInfo.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  血型 {patient.blood_type} ({patient.rh_type})
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300">
                  病歷號 #{patient.chart_no}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>身分證字號：<strong className="font-mono text-slate-700 dark:text-slate-300">{patient.id_number}</strong></span>
                <span>主治醫師：<strong className="text-slate-700 dark:text-slate-300">{patient.attending_physician}</strong></span>
                <span>主護護理師：<strong className="text-teal-600 dark:text-teal-400">{patient.primary_nurse_name}</strong></span>
              </p>
            </div>
          </div>

          {isNurse && (
            <div className="flex items-center gap-2.5 self-end md:self-center">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 text-sm font-bold shadow-sm transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  更動病歷與床位資料
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(patient);
                      setIsEditing(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? '儲存同步中...' : '儲存更動資料'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* High-Visibility Allergy & Major Illness Alert Bar */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300">藥物與食物過敏史 (Allergies)</div>
              {isEditing ? (
                <input
                  type="text"
                  value={form.allergies}
                  onChange={(e) => handleFieldChange('allergies', e.target.value)}
                  className="mt-1 w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-400 text-sm font-semibold"
                />
              ) : (
                <div className="text-sm font-bold text-amber-900 dark:text-amber-200 mt-0.5">{patient.allergies || '無'}</div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-300">重大傷病與慢性病史 (Major Illness)</div>
              {isEditing ? (
                <input
                  type="text"
                  value={form.major_illness}
                  onChange={(e) => handleFieldChange('major_illness', e.target.value)}
                  className="mt-1 w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-rose-400 text-sm font-semibold"
                />
              ) : (
                <div className="text-sm font-bold text-rose-900 dark:text-rose-200 mt-0.5">{patient.major_illness || '無'}</div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-3">
            <Utensils className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-teal-800 dark:text-teal-300">飲食醫囑與防跌等級 (Diet & Fall Risk)</div>
              {isEditing ? (
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={form.diet_type}
                    onChange={(e) => handleFieldChange('diet_type', e.target.value)}
                    className="w-2/3 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-teal-400 text-xs font-semibold"
                    placeholder="飲食醫囑"
                  />
                  <select
                    value={form.fall_risk}
                    onChange={(e) => handleFieldChange('fall_risk', e.target.value)}
                    className="w-1/3 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-teal-400 text-xs font-semibold"
                  >
                    <option value="低度風險">低度風險</option>
                    <option value="中度風險">中度風險</option>
                    <option value="高度風險">高度風險</option>
                  </select>
                </div>
              ) : (
                <div className="text-sm font-bold text-teal-900 dark:text-teal-200 mt-0.5">
                  {patient.diet_type} · 防跌{patient.fall_risk}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dual Column Dossier: Basic Info vs. Admission Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Basic Personal Info (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                病人基本資料 (Basic Info)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">patient_basic_info</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
            {[
              { key: 'id_number', label: '身分證字號 (ID Number)', editable: false },
              { key: 'chart_no', label: '病歷號碼 (Chart No.)', editable: true },
              { key: 'name', label: '病患姓名 (Name)', editable: true },
              { key: 'gender', label: '生理性別 (Gender)', editable: true, options: ['男性', '女性'] },
              { key: 'birth_date', label: '出生日期 (Birth Date)', editable: true, type: 'date' },
              { key: 'blood_type', label: 'ABO 血型 (Blood Type)', editable: true, options: ['A', 'B', 'O', 'AB'] },
              { key: 'rh_type', label: 'D 抗原性 (Rh Type)', editable: true, options: ['RH+', 'RH-'] },
            ].map((item) => {
              const val = (form as any)[item.key] || '';
              const note = form.field_notes?.[item.key] || '';
              return (
                <div key={item.key} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 sm:w-44 shrink-0">
                    {item.label}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    {isEditing && item.editable ? (
                      item.options ? (
                        <select
                          value={val}
                          onChange={(e) => handleFieldChange(item.key as keyof Patient, e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold"
                        >
                          {item.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={item.type || 'text'}
                          value={val}
                          onChange={(e) => handleFieldChange(item.key as keyof Patient, e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold"
                        />
                      )
                    ) : (
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {val}
                        {item.key === 'birth_date' && (
                          <span className="ml-2 text-xs text-teal-600 dark:text-teal-400 font-normal">
                            (實歲：{ageInfo.label})
                          </span>
                        )}
                      </div>
                    )}
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="欄位備註 (選填)"
                        value={note}
                        onChange={(e) => handleNoteChange(item.key, e.target.value)}
                        className="px-2.5 py-1 rounded bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500"
                      />
                    ) : (
                      note && <span className="text-[11px] text-slate-400">備註：{note}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Admission & Ward Care Info (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                入院與臨床照護資料 (Admission & Care Info)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">patient_admission_info</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* Ward No */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                病房號 (Ward No.)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.ward_no}
                  onChange={(e) => handleFieldChange('ward_no', e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                />
              ) : (
                <div className="mt-1 font-mono font-bold text-base text-slate-900 dark:text-white">
                  {form.ward_no} 病房
                </div>
              )}
            </div>

            {/* Bed No (with automatic swap support!) */}
            <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20">
              <label className="text-xs font-semibold text-teal-700 dark:text-teal-300 block">
                病床號 (Bed No. · 更動將自動換床/交換)
              </label>
              {isEditing ? (
                <select
                  value={form.bed_no || ''}
                  onChange={(e) => handleFieldChange('bed_no', Number(e.target.value))}
                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-teal-500 font-bold text-teal-700 dark:text-teal-300"
                >
                  {beds.map((b) => (
                    <option key={b.bed_no} value={b.bed_no}>
                      第 {b.bed_no} 號床{' '}
                      {b.patient_id === patient.id_number
                        ? '(目前床位)'
                        : b.patient
                        ? `(與 ${b.patient.name} 交換)`
                        : '(空床可移入)'}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-1 font-mono font-bold text-base text-teal-700 dark:text-teal-300">
                  第 0{form.bed_no} 號病床
                </div>
              )}
            </div>

            {/* Attending Physician */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                主治醫師 (Attending Physician)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.attending_physician}
                  onChange={(e) => handleFieldChange('attending_physician', e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              ) : (
                <div className="mt-1 font-bold text-slate-900 dark:text-white">{form.attending_physician}</div>
              )}
            </div>

            {/* Primary Nurse */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                主護護理師 (Primary Nurse)
              </label>
              {isEditing ? (
                <select
                  value={form.primary_nurse_name}
                  onChange={(e) => handleFieldChange('primary_nurse_name', e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  {nurses.map((n) => (
                    <option key={n.id_number} value={n.name}>
                      {n.name} ({n.identity_title})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-1 font-bold text-slate-900 dark:text-white">{form.primary_nurse_name} 護理師</div>
              )}
            </div>

            {/* Hospitalization Date */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                住院日期 (Hospitalization Date)
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={form.hospitalization_date.replace(/\//g, '-')}
                  onChange={(e) => handleFieldChange('hospitalization_date', e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              ) : (
                <div className="mt-1 font-semibold text-slate-900 dark:text-white">{form.hospitalization_date}</div>
              )}
            </div>

            {/* Observation Time */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                留觀時間 (Observation Time)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.observation_time}
                  onChange={(e) => handleFieldChange('observation_time', e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              ) : (
                <div className="mt-1 font-semibold text-slate-900 dark:text-white">{form.observation_time}</div>
              )}
            </div>

            {/* Phone No */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                聯絡電話 (Phone No.)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.phone_no}
                  onChange={(e) => handleFieldChange('phone_no', e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              ) : (
                <div className="mt-1 font-mono font-semibold text-slate-900 dark:text-white">{form.phone_no}</div>
              )}
            </div>

            {/* Emergency Contact & Phone */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                緊急聯絡人與電話 (Emergency Contact)
              </label>
              {isEditing ? (
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={form.emergency_contact}
                    onChange={(e) => handleFieldChange('emergency_contact', e.target.value)}
                    placeholder="關係人"
                    className="w-1/2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-xs"
                  />
                  <input
                    type="text"
                    value={form.emergency_contact_no}
                    onChange={(e) => handleFieldChange('emergency_contact_no', e.target.value)}
                    placeholder="聯絡電話"
                    className="w-1/2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-semibold text-xs"
                  />
                </div>
              ) : (
                <div className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {form.emergency_contact} · <span className="font-mono">{form.emergency_contact_no}</span>
                </div>
              )}
            </div>

            {/* Address (Full width) */}
            <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                通訊地址 (Address)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              ) : (
                <div className="mt-1 font-semibold text-slate-900 dark:text-white">{form.address}</div>
              )}
            </div>

            {/* Current Condition (Full width) */}
            <div className="sm:col-span-2 p-3.5 rounded-xl bg-sky-500/5 border border-sky-500/20">
              <label className="text-xs font-bold text-sky-700 dark:text-sky-300 block">
                目前病況與臨床交班摘要 (Current Condition)
              </label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={form.current_condition}
                  onChange={(e) => handleFieldChange('current_condition', e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-sky-400 font-semibold text-sm"
                />
              ) : (
                <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                  {form.current_condition || '生命徵象穩定觀察中'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs / Data Change History Section (Replaces legacy data_change_text) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              床位與病歷異動追蹤紀錄 (Audit Trail)
            </h3>
          </div>
          <span className="text-xs text-slate-400">自動記錄每一次換床、狀態變更與醫囑調整</span>
        </div>

        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {patientAudits.map((log) => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    log.event_type === 'IOT_ALERT'
                      ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                      : log.event_type === 'BED_SWAP'
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                      : 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                  }`}
                >
                  {log.event_type === 'IOT_ALERT'
                    ? '感測預警'
                    : log.event_type === 'BED_SWAP'
                    ? '床位調度'
                    : '病歷更新'}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{log.summary}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 shrink-0 font-mono">
                <span>操作人：{log.operator_name}</span>
                <span>{log.created_at}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
