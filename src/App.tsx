import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  BedDouble,
  FileText,
  Thermometer,
  Pill,
  QrCode,
  Calendar,
  BookOpen,
  Sun,
  Moon,
  LogOut,
  Users,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import type { BootstrapData, User, ActiveTab, Patient } from './types';
import { OverviewDashboard } from './components/OverviewDashboard';
import { WardMapView } from './components/WardMapView';
import { PatientProfileView } from './components/PatientProfileView';
import { VitalsAndIotView } from './components/VitalsAndIotView';
import { CareWorkflowView } from './components/CareWorkflowView';
import { DigitalBedCardView } from './components/DigitalBedCardView';
import { ScheduleCalendarView, HealthEducationView } from './components/ScheduleAndEducationView';
import { LoginScreen } from './components/LoginModal';

export function App() {
  const [data, setData] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('W490382914');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'alert' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'alert' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      const json: BootstrapData = await res.json();
      setData(json);
      if (!currentUser && json.users.length > 0) {
        const defaultNurse = json.users.find((u) => u.id_number === 'F485739200') || json.users[0];
        setCurrentUser(defaultNurse);
      }
    } catch (err) {
      console.error('Failed to load bootstrap data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  if (loading || !data || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
        <HeartPulse className="w-10 h-10 text-teal-400 animate-pulse" />
        <div className="text-sm font-bold tracking-wider text-slate-300">
          正在載入 MediCare Pro 智慧病床管理系統...
        </div>
      </div>
    );
  }

  if (showLoginScreen) {
    return (
      <LoginScreen
        users={data.users}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          if (u.role === 'patient') {
            setSelectedPatientId(u.id_number);
          }
          setShowLoginScreen(false);
          setActiveTab('overview');
          showToast(`歡迎回來，${u.name} (${u.identity_title})`);
        }}
        onClose={() => setShowLoginScreen(false)}
      />
    );
  }

  const isNurse = currentUser.role === 'nurse';
  const effectivePatientId = isNurse ? selectedPatientId : currentUser.id_number;
  const selectedPatient =
    data.patients.find((p) => p.id_number === effectivePatientId) || data.patients[0];
  const selectedBed = data.beds.find((b) => b.patient_id === selectedPatient.id_number);

  const handleSelectPatient = (patientId: string, navigateTo?: ActiveTab) => {
    setSelectedPatientId(patientId);
    if (navigateTo) {
      setActiveTab(navigateTo);
    }
  };

  const handleQuickRoleSwitch = (userIdNumber: string) => {
    const target = data.users.find((u) => u.id_number === userIdNumber);
    if (!target) return;
    setCurrentUser(target);
    if (target.role === 'patient') {
      setSelectedPatientId(target.id_number);
      if (activeTab === 'ward_map' || activeTab === 'schedule') {
        setActiveTab('overview');
      }
    }
    showToast(`已切換視角為：${target.name}（${target.identity_title}）`);
  };

  // API Handlers
  const handleSwapBeds = async (patientId: string, targetBedNo: number) => {
    const res = await fetch('/api/beds/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        targetBedNo,
        operatorName: currentUser.name,
      }),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setData(json.data);
      showToast(json.message || '床位調度成功');
    } else {
      showToast(json.error || '換床失敗', 'alert');
    }
  };

  const handleChangeBedStatus = async (bedNo: number, status: string) => {
    const res = await fetch('/api/beds/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bedNo,
        status,
        operatorName: currentUser.name,
      }),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setData(json.data);
      showToast(json.message);
    }
  };

  const handleSavePatient = async (patientId: string, updated: Partial<Patient>) => {
    const res = await fetch(`/api/patients/${encodeURIComponent(patientId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...updated,
        operatorName: currentUser.name,
      }),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setData(json.data);
      showToast(json.message);
    } else {
      showToast(json.error || '儲存失敗', 'alert');
    }
  };

  const handleAddVitalSign = async (payload: {
    patientId: string;
    temperature: number;
    heartRate: number;
    spo2: number;
    systolicBp: number;
    diastolicBp: number;
    remark: string;
  }) => {
    const res = await fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        recordedBy: currentUser.name,
      }),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setData(json.data);
      showToast(json.message, json.isFever ? 'alert' : 'success');
    } else {
      showToast(json.error || '記錄失敗', 'alert');
    }
  };

  const handleTriggerIotMeasure = async (patientId: string, simulatedTemp?: number) => {
    const res = await fetch('/api/iot/esp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        temperature: simulatedTemp,
      }),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setData(json.data);
      showToast(json.message, json.reading?.isFever ? 'alert' : 'success');
    } else {
      showToast(json.error || 'IoT 量測失敗', 'alert');
    }
  };

  const handleAddMedication = async (payload: {
    patientId: string;
    medications: string[];
    remark: string;
  }) => {
    const res = await fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        nurseName: currentUser.name,
      }),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setData(json.data);
      showToast(json.message);
    }
  };

  const handleAddWardRound = async (payload: {
    patientId: string;
    activities: string[];
    remark: string;
  }) => {
    const res = await fetch('/api/rounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        nurseName: currentUser.name,
      }),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setData(json.data);
      showToast(json.message);
    }
  };

  const handleAddSchedule = async (payload: {
    date: string;
    time: string;
    title: string;
    category: string;
    patientId: string;
  }) => {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        nurseName: currentUser.name,
      }),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setData(json.data);
      showToast(json.message);
    }
  };

  const handleToggleSchedule = async (id: number) => {
    const res = await fetch(`/api/schedules/${id}/toggle`, {
      method: 'PATCH',
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setData(json.data);
    }
  };

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    nurseOnly?: boolean;
  }> = [
    { id: 'overview', label: isNurse ? '照護總覽首頁' : '病患端首頁', icon: LayoutDashboard },
    { id: 'ward_map', label: '視覺化床位管理', icon: BedDouble },
    { id: 'patient_profile', label: '基本與入院病歷', icon: FileText },
    { id: 'vitals_iot', label: '身體數據與 IoT', icon: Thermometer },
    { id: 'care_workflow', label: '用藥與查房紀錄', icon: Pill },
    { id: 'bed_card', label: '電子資訊病床卡', icon: QrCode },
    { id: 'schedule', label: '病房排程行事曆', icon: Calendar },
    { id: 'health_edu', label: '多語系衛教資訊', icon: BookOpen },
  ];

  const nurses = data.users.filter((u) => u.role === 'nurse');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce no-print">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
              toast.type === 'alert'
                ? 'bg-red-600 text-white border-red-400'
                : 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 border-slate-700'
            }`}
          >
            {toast.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400 dark:text-slate-950" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Top Clinical Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 no-print">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('overview')}
            className="cursor-pointer flex items-center gap-3 shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-md">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                  MediCare <span className="text-teal-600 dark:text-teal-400">Pro</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  WARD 712
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                智慧病床管理與臨床照護資訊系統
              </p>
            </div>
          </div>

          {/* Center: Active Patient Quick Switcher (for Nurses) */}
          {isNurse && (
            <div className="hidden md:flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                當前檢視病患：
              </span>
              <select
                aria-label="切換當前檢視病患"
                value={selectedPatient.id_number}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {data.patients.map((p) => (
                  <option
                    key={p.id_number}
                    value={p.id_number}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    712-0{p.bed_no}床｜{p.name} ({p.gender} · 主護:{p.primary_nurse_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Right: Quick Role Switcher, Theme Toggle & Login/Logout */}
          <div className="flex items-center gap-2.5">
            {/* Quick Role Switcher (Nurse vs Patient Demo Switcher) */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-slate-400 font-medium">快速切換身分:</span>
              <select
                aria-label="快速切換登入身分"
                value={currentUser.id_number}
                onChange={(e) => handleQuickRoleSwitch(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <optgroup label="醫護管理端 (護理師)" className="bg-white dark:bg-slate-900">
                  {data.users
                    .filter((u) => u.role === 'nurse')
                    .map((u) => (
                      <option key={u.id_number} value={u.id_number}>
                        👩‍⚕️ {u.name} ({u.identity_title})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="住院病患端 (病人/家屬)" className="bg-white dark:bg-slate-900">
                  {data.users
                    .filter((u) => u.role === 'patient')
                    .map((u) => (
                      <option key={u.id_number} value={u.id_number}>
                        🛌 {u.name} ({u.department})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? '切換淺色模式' : '切換深色模式'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Login / Logout Trigger */}
            <button
              type="button"
              onClick={() => setShowLoginScreen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>切換帳號 / 登入頁</span>
            </button>
          </div>
        </div>

        {/* Sub-Header Horizontal Module Navigation Tabs */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto">
          <nav className="flex items-center gap-1 py-2 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-600 dark:text-teal-400' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <OverviewDashboard
            data={data}
            currentUser={currentUser}
            selectedPatient={selectedPatient}
            onSelectPatient={handleSelectPatient}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'ward_map' && (
          <WardMapView
            beds={data.beds}
            currentUser={currentUser}
            selectedPatientId={selectedPatient.id_number}
            onSelectPatient={handleSelectPatient}
            onSwapBeds={handleSwapBeds}
            onChangeBedStatus={handleChangeBedStatus}
          />
        )}

        {activeTab === 'patient_profile' && (
          <PatientProfileView
            patient={selectedPatient}
            beds={data.beds}
            nurses={nurses}
            currentUser={currentUser}
            auditLogs={data.auditLogs}
            onSavePatient={handleSavePatient}
          />
        )}

        {activeTab === 'vitals_iot' && (
          <VitalsAndIotView
            patient={selectedPatient}
            vitalSigns={data.vitalSigns}
            currentUser={currentUser}
            onAddVitalSign={handleAddVitalSign}
            onTriggerIotMeasure={handleTriggerIotMeasure}
          />
        )}

        {activeTab === 'care_workflow' && (
          <CareWorkflowView
            patient={selectedPatient}
            medicationLogs={data.medicationLogs}
            wardRounds={data.wardRounds}
            currentUser={currentUser}
            onAddMedication={handleAddMedication}
            onAddWardRound={handleAddWardRound}
          />
        )}

        {activeTab === 'bed_card' && (
          <DigitalBedCardView
            patient={selectedPatient}
            latestVital={selectedBed?.latestVital || null}
            bedStatus={selectedBed?.status || '在床中'}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleCalendarView
            schedules={data.schedules}
            patients={data.patients}
            currentUser={currentUser}
            onAddSchedule={handleAddSchedule}
            onToggleSchedule={handleToggleSchedule}
          />
        )}

        {activeTab === 'health_edu' && <HealthEducationView />}
      </main>

      {/* Footer with Real-time Performance Telemetry */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-xs text-slate-400 no-print">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-300">
              MediCare Pro v2.0
            </span>
            <span>·</span>
            <span>次世代智慧病床管理與照護資訊系統 (Full-Stack TypeScript + React + Native SQLite)</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold">
              <Zap className="w-3.5 h-3.5" />
              SQLite WAL Query: {data.serverMetrics.queryTimeMs} ms
            </span>
            <span>|</span>
            <span>712 智慧病房連線正常</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
