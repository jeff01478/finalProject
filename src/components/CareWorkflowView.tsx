import React, { useState } from 'react';
import {
  Pill,
  ClipboardCheck,
  Check,
  Plus,
  Clock,
  UserCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import type { Patient, MedicationLog, WardRound, User } from '../types';

interface CareWorkflowViewProps {
  patient: Patient;
  medicationLogs: MedicationLog[];
  wardRounds: WardRound[];
  currentUser: User;
  onAddMedication: (payload: {
    patientId: string;
    medications: string[];
    remark: string;
  }) => Promise<void>;
  onAddWardRound: (payload: {
    patientId: string;
    activities: string[];
    remark: string;
  }) => Promise<void>;
}

const PRESET_MEDICATIONS = [
  'FUROSELY TABLETS "M.S." (高血壓)',
  'FURSEDE TABLETS (高血壓)',
  'SHIN TAN TABLETS "SHOU CHAN" (糖尿病)',
  'METFORMIN HCL 500MG (口服降血糖)',
  'AMLODIPINE 5MG (長效降血壓)',
  'ACETAMINOPHEN 500MG (解熱鎮痛)',
];

const PRESET_ROUND_ACTIVITIES = [
  '量血壓',
  '量體溫',
  '醫生診問',
  '換藥',
  '傷口護理',
  '輸液點滴檢查',
  '指尖血糖檢測',
  '防跌床欄查核',
];

export const CareWorkflowView: React.FC<CareWorkflowViewProps> = ({
  patient,
  medicationLogs,
  wardRounds,
  currentUser,
  onAddMedication,
  onAddWardRound,
}) => {
  const isNurse = currentUser.role === 'nurse';

  const [selectedMeds, setSelectedMeds] = useState<string[]>([
    'FUROSELY TABLETS "M.S." (高血壓)',
  ]);
  const [customMed, setCustomMed] = useState('');
  const [medRemark, setMedRemark] = useState('');
  const [submittingMed, setSubmittingMed] = useState(false);

  const [selectedActs, setSelectedActs] = useState<string[]>(['量血壓', '量體溫']);
  const [roundRemark, setRoundRemark] = useState('');
  const [submittingRound, setSubmittingRound] = useState(false);

  const patientMeds = medicationLogs.filter((m) => m.patient_id === patient.id_number);
  const patientRounds = wardRounds.filter((r) => r.patient_id === patient.id_number);

  const toggleMed = (med: string) => {
    setSelectedMeds((prev) =>
      prev.includes(med) ? prev.filter((m) => m !== med) : [...prev, med]
    );
  };

  const handleAddCustomMed = () => {
    const trimmed = customMed.trim();
    if (!trimmed) return;
    if (!selectedMeds.includes(trimmed)) {
      setSelectedMeds((prev) => [...prev, trimmed]);
    }
    setCustomMed('');
  };

  const toggleAct = (act: string) => {
    setSelectedActs((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const handleMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeds.length === 0) return;
    setSubmittingMed(true);
    try {
      await onAddMedication({
        patientId: patient.id_number,
        medications: selectedMeds,
        remark: medRemark,
      });
      setMedRemark('');
    } finally {
      setSubmittingMed(false);
    }
  };

  const handleRoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedActs.length === 0) return;
    setSubmittingRound(true);
    try {
      await onAddWardRound({
        patientId: patient.id_number,
        activities: selectedActs,
        remark: roundRemark,
      });
      setRoundRemark('');
    } finally {
      setSubmittingRound(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Medication Administration Record (MAR) */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  臨床用藥時間與給藥紀錄 (Medication Record)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  對象：{patient.name}（712-{patient.bed_no}床）· 過敏史：{patient.allergies || '無'}
                </p>
              </div>
            </div>
          </div>

          {isNurse && (
            <form onSubmit={handleMedSubmit} className="space-y-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">
                  勾選處方藥物（可複選）
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_MEDICATIONS.map((med) => {
                    const checked = selectedMeds.includes(med);
                    return (
                      <button
                        key={med}
                        type="button"
                        onClick={() => toggleMed(med)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                          checked
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-mono">{med}</span>
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            checked
                              ? 'bg-emerald-500 text-white'
                              : 'border border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {checked && <Check className="w-3.5 h-3.5" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Medication Input + Remark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="自訂其他藥品名稱..."
                    value={customMed}
                    onChange={(e) => setCustomMed(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomMed}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="給藥備註（例：飯後口服、病患稍有不適）"
                  value={medRemark}
                  onChange={(e) => setMedRemark(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">
                  已選 {selectedMeds.length} 項藥品 · 給藥護理師：{currentUser.name}
                </span>
                <button
                  type="submit"
                  disabled={submittingMed || selectedMeds.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {submittingMed ? '登錄中...' : '確認登錄給藥紀錄'}
                </button>
              </div>
            </form>
          )}

          {/* Medication Timeline List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              歷次給藥時間軸 ({patientMeds.length} 筆)
            </h4>
            {patientMeds.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">尚無用藥紀錄</p>
            ) : (
              patientMeds.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {log.display_time}
                    </span>
                    <span>給藥護理師：{log.nurse_name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {log.medications.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-mono text-xs font-bold"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  {log.remark && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      備註：{log.remark}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Ward Round & Care Log */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  臨床查房時間與巡房紀錄 (Ward Round Log)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  記錄每日查房處置、量測血壓體溫、換藥與醫師會診紀錄
                </p>
              </div>
            </div>
          </div>

          {isNurse && (
            <form onSubmit={handleRoundSubmit} className="space-y-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">
                  勾選本次查房執行項目（可複選）
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_ROUND_ACTIVITIES.map((act) => {
                    const checked = selectedActs.includes(act);
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => toggleAct(act)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          checked
                            ? 'bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <span>{act}</span>
                        {checked && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="查房臨床觀察備註（例：傷口乾燥無滲液、江修黼醫師查房調整醫囑）"
                  value={roundRemark}
                  onChange={(e) => setRoundRemark(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">
                  已選 {selectedActs.length} 項處置 · 查房護理師：{currentUser.name}
                </span>
                <button
                  type="submit"
                  disabled={submittingRound || selectedActs.length === 0}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {submittingRound ? '登錄中...' : '確認登錄查房紀錄'}
                </button>
              </div>
            </form>
          )}

          {/* Ward Rounds Timeline List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              歷次查房巡視時間軸 ({patientRounds.length} 筆)
            </h4>
            {patientRounds.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">尚無查房紀錄</p>
            ) : (
              patientRounds.map((round) => (
                <div
                  key={round.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      {round.display_time}
                    </span>
                    <span>查房護理師：{round.nurse_name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {round.activities.map((a, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-xs font-bold"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  {round.remark && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      備註：{round.remark}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
