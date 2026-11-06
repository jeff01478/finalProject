import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Stethoscope,
  HeartPulse,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { User } from '../types';

interface LoginScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onClose?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLoginSuccess,
  onClose,
}) => {
  const [account, setAccount] = useState('jeff01478');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || '登入失敗');
      } else {
        onLoginSuccess(json.user);
      }
    } catch {
      setError('網路連線異常');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u: User) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quickIdNumber: u.id_number }),
      });
      const json = await res.json();
      if (res.ok && json.user) {
        onLoginSuccess(json.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const nurses = users.filter((u) => u.role === 'nurse');
  const patients = users.filter((u) => u.role === 'patient');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl">
        {/* Left: Brand & System Architecture Showcase (6 cols) */}
        <div className="lg:col-span-6 p-8 sm:p-10 bg-gradient-to-br from-teal-950/80 via-slate-900 to-slate-950 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold">
              <HeartPulse className="w-4 h-4" />
              MediCare Pro v2.0 · 智慧臨床病床管理系統
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                次世代智慧病房與<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-400">
                  臨床照護資訊平台
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                全面重構自大學時期專題，告別舊版 PHP 與阻塞式查詢。採用 Node.js v22 原生 SQLite WAL 極速引擎與 React 醫療級玻璃擬態介面。
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                '視覺化 712 病房平面圖與一鍵雙向換床調度',
                'Arduino GY-906 紅外線耳溫 & MAX30100 血氧無阻塞串流',
                '智慧床頭平板電子病床卡（自動精算實歲 + 動態 QR Code）',
                '多語系臨床衛教資源中心（中 / 英 / 越 / 印防跌與專科指引）',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick One-Click Demo Role Cards */}
          <div className="pt-8 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              一鍵快速體驗登入（免輸入密碼）
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 font-semibold">醫護管理端 (Nurse Portal)</div>
              <div className="grid grid-cols-2 gap-2">
                {nurses.map((n) => (
                  <button
                    key={n.id_number}
                    type="button"
                    onClick={() => handleQuickLogin(n)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-teal-500/20 border border-white/10 hover:border-teal-400/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white group-hover:text-teal-300">
                        {n.name} 護理師
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{n.userid}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{n.identity_title}</div>
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 font-semibold pt-1">住院病患端 (Patient Portal)</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {patients.slice(0, 6).map((p) => (
                  <button
                    key={p.id_number}
                    type="button"
                    onClick={() => handleQuickLogin(p)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-400/50 text-left transition-all group"
                  >
                    <div className="font-bold text-xs text-white group-hover:text-sky-300">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{p.department}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Standard Account & Password Form (6 cols) */}
        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">照護系統帳號登入</h2>
              <p className="text-xs text-slate-400 mt-1">
                相容原有專題資料庫帳密（例如護理師 <code className="text-teal-300">jeff01478</code> / <code className="text-teal-300">123456</code> 或病患 <code className="text-sky-300">abc123</code> / <code className="text-sky-300">abc321</code>）
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs font-semibold text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  登入帳號 / 身分證字號 (Account)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="請輸入帳號 (如 jeff01478)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  登入密碼 (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <span>{loading ? '驗證身分中...' : '登入智慧病床管理系統'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-400 hover:text-white text-center"
              >
                返回目前工作階段
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
