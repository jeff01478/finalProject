import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Search,
  ExternalLink,
  ShieldAlert,
  Stethoscope,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
} from 'lucide-react';
import type { ScheduleItem, Patient, User } from '../types';

interface ScheduleViewProps {
  schedules: ScheduleItem[];
  patients: Patient[];
  currentUser: User;
  onAddSchedule: (payload: {
    date: string;
    time: string;
    title: string;
    category: string;
    patientId: string;
  }) => Promise<void>;
  onToggleSchedule: (id: number) => Promise<void>;
}

export const ScheduleCalendarView: React.FC<ScheduleViewProps> = ({
  schedules,
  patients,
  currentUser,
  onAddSchedule,
  onToggleSchedule,
}) => {
  const isNurse = currentUser.role === 'nurse';
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));

  const [newTime, setNewTime] = useState('15:00');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('ward_round');
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id_number || '');
  const [submitting, setSubmitting] = useState(false);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      await onAddSchedule({
        date: selectedDate,
        time: newTime,
        title: newTitle.trim(),
        category: newCategory,
        patientId: newPatientId,
      });
      setNewTitle('');
    } finally {
      setSubmitting(false);
    }
  };

  const daySchedules = schedules.filter((s) => s.date === selectedDate);

  const categoryBadge = (cat: string) => {
    switch (cat) {
      case 'medication':
        return { label: '給藥排程', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
      case 'examination':
        return { label: '專科檢查', cls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' };
      case 'handover':
        return { label: '護理交班', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
      default:
        return { label: '例行查房', cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Interactive Monthly Calendar Grid (5 cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-500" />
              {viewYear} 年 {viewMonth + 1} 月
            </h3>
            <p className="text-xs text-slate-400">712 病房臨床查房與檢查行事曆</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekdays Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
            <div key={d} className="py-1.5">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-11" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateIso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;
            const isSelected = dateIso === selectedDate;
            const hasEvents = schedules.some((s) => s.date === dateIso);
            const isToday = dateIso === today.toISOString().slice(0, 10);

            return (
              <button
                key={dateIso}
                type="button"
                onClick={() => setSelectedDate(dateIso)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center relative font-mono text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-md scale-105'
                    : isToday
                    ? 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/40'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{dayNum}</span>
                {hasEvents && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      isSelected ? 'bg-white' : 'bg-teal-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Daily Ward Tasks & Schedule Management (7 cols) */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedDate} 病房排程與待辦事項 ({daySchedules.length} 項)
            </h3>
            <p className="text-xs text-slate-400">
              點擊項目左側圓圈可標記完成狀態
            </p>
          </div>
        </div>

        {isNurse && (
          <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
              新增 {selectedDate} 臨床排程
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="ward_round">例行查房</option>
                <option value="medication">給藥排程</option>
                <option value="examination">專科檢查</option>
                <option value="handover">護理交班</option>
              </select>
              <select
                value={newPatientId}
                onChange={(e) => setNewPatientId(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="">全房通用排程 (712 病房)</option>
                {patients.map((p) => (
                  <option key={p.id_number} value={p.id_number}>
                    0{p.bed_no}床 - {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="輸入排程內容（例：下午 15:00 安排胸部 X 光檢查）..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shrink-0"
              >
                <Plus className="w-4 h-4" />
                新增排程
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2.5">
          {daySchedules.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              該日期尚無排定臨床行程
            </div>
          ) : (
            daySchedules.map((item) => {
              const badge = categoryBadge(item.category);
              const done = Boolean(item.completed);
              return (
                <div
                  key={item.id}
                  onClick={() => onToggleSchedule(item.id)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    done
                      ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800/50 opacity-65'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className="font-mono font-bold text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.time}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <span
                      className={`text-sm font-semibold truncate ${
                        done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 shrink-0 hidden sm:block">
                    負責：{item.nurse_name}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Health Education Resource Library (Replaces patient_health_education.php)
interface EduResource {
  id: string;
  category: '防跌須知' | '胸腔內科' | '神經內科';
  title: string;
  subtitle: string;
  language: string;
  source: string;
  url: string;
  highlights: string[];
}

const HEALTH_EDU_RESOURCES: EduResource[] = [
  {
    id: 'fall-vn',
    category: '防跌須知',
    title: '住院防跌照護須知（中文與越南文對照版）',
    subtitle: '預防跌倒 10 大安全守則與下床呼救流程',
    language: '中 / 越雙語',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/26e92e37276e86374a0f0f2811fc81df.pdf',
    highlights: ['下床前請先坐於床緣 3 分鐘避免姿勢性低血壓', '臥床休息時請務必拉起雙側床欄'],
  },
  {
    id: 'fall-id',
    category: '防跌須知',
    title: '住院防跌照護須知（中文與印尼文對照版）',
    subtitle: '外籍看護與家屬必讀之病室防滑與輔具使用指南',
    language: '中 / 印雙語',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/0988befd588cae8526d6a9ee2ff9996b.pdf',
    highlights: ['浴室地面濕滑時請立即通知護理站處理', '服用鎮靜安眠或降血壓藥物後請避免單獨如廁'],
  },
  {
    id: 'fall-en',
    category: '防跌須知',
    title: '住院防跌照護須知（中文與英文對照版）',
    subtitle: 'Fall Prevention Guidelines for Inpatients & Caregivers',
    language: '中 / 英雙語',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/d06336b38430f7c2a80eadd77e852549.pdf',
    highlights: ['請穿著合腳防滑鞋具，切勿赤腳或穿過大拖鞋行走', '夜間保持病室走道夜燈開啟'],
  },
  {
    id: 'chest-1',
    category: '胸腔內科',
    title: '膿胸之臨床治療與胸管引流照護',
    subtitle: '認識肋膜腔感染成因、抗生素療程與引流瓶注意事項',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/66faa778cb0efcc6a80d16053344d9ec.pdf',
    highlights: ['胸腔引流瓶需始終保持低於胸腔位置且不可傾倒', '深呼吸與有效咳嗽訓練有助肺部擴張'],
  },
  {
    id: 'chest-2',
    category: '胸腔內科',
    title: '氣切造口居家與住院日常照護指南',
    subtitle: '氣切內管清潔消毒、抽痰技巧與造口周圍皮膚護理',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/80444866521d7949ba9b248ab404af5a.pdf',
    highlights: ['每日至少清潔氣切內管並更換Y型紗布', '若出現呼吸費力或血氧下降請立即按壓床頭呼叫鈴'],
  },
  {
    id: 'chest-3',
    category: '胸腔內科',
    title: '懷孕婦女氣喘發作之安全用藥與控制',
    subtitle: '孕期吸入型類固醇安全性評估與缺氧風險預防',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/910961300b1b75834699cb4c81aa0d49.pdf',
    highlights: ['切勿自行停用氣喘控制型吸入劑以免母體缺氧影響胎兒', '遠離塵蟎、菸害與冷空氣刺激'],
  },
  {
    id: 'chest-4',
    category: '胸腔內科',
    title: '高濃度氧氣治療與血氧監測須知',
    subtitle: '氧氣鼻導管、面罩配戴方式與用氧安全規範',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/fb19328e34963c8653b5a6ea62db0361.pdf',
    highlights: ['切勿自行調高氧氣流量表刻度（特別是慢性肺病患者）', '供氧設備周圍嚴禁煙火'],
  },
  {
    id: 'chest-5',
    category: '胸腔內科',
    title: '固定劑量組合 (FDC) 處方與分開藥物處方比較',
    subtitle: '提升慢性病與呼吸道用藥順從性之現代臨床指引',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/69a0a2ceef253a5ec58582163ed85e8f.pdf',
    highlights: ['複方錠劑可減少每日吞服顆數並降低漏藥率', '若有副作用反應請回報主治醫師評估調整'],
  },
  {
    id: 'chest-6',
    category: '胸腔內科',
    title: '低劑量電腦斷層 (LDCT) 肺癌早期篩檢指南',
    subtitle: '高風險族群篩檢建議、肺結節追蹤頻率與戒菸資源',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/c03f6d5695b22120f936f1139d83a516.pdf',
    highlights: ['LDCT 輻射劑量低且不需注射顯影劑', '具肺癌家族史或重度吸菸史者建議定期篩檢'],
  },
  {
    id: 'neuro-1',
    category: '神經內科',
    title: '腦中風危險因子控制與日常預防手冊',
    subtitle: '三高控制（高血壓、糖尿病、高血脂）與 FAST 中風辨識口訣',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/57d6596dce6918d614dbeedab3b3767e.pdf',
    highlights: ['謹記微笑、舉手、說你好（FAST）黃金 3 小時搶救時間', '每日定時量測血壓並維持低鈉飲食'],
  },
  {
    id: 'neuro-2',
    category: '神經內科',
    title: '頸動脈剝離導致年輕型腦中風之警訊',
    subtitle: '避免不當頸部推拿、劇烈甩頭與單側頸部疼痛警覺',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/70198c8383a410a11fd94b85aa73a5a9.pdf',
    highlights: ['突發單側頭痛、頸痛合併視力模糊或肢體無力應立即就醫', '避免針對頸部前側進行強力按壓推拿'],
  },
  {
    id: 'neuro-3',
    category: '神經內科',
    title: '突發性眩暈、噁心嘔吐與小腦中風鑑別',
    subtitle: '如何區分內耳眩暈與中樞神經血管病變',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/b47d07ae4be0a4a57aed8767efa33d70.pdf',
    highlights: ['若眩暈合併步態不穩、複視、吞嚥困難或口齒不清，高度懷疑腦幹/小腦中風'],
  },
  {
    id: 'neuro-4',
    category: '神經內科',
    title: '顏面神經麻痺之黃金期臉部復健運動',
    subtitle: '眼部保護、溫敷按摩與表情肌群自主訓練步驟',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/30ce8cfbb3f1f69bf81707a9be30d1ab.pdf',
    highlights: ['睡前使用人工淚液與眼罩保護角膜避免乾澀受損', '對鏡練習抬眉、閉眼、鼓腮與吹口哨動作'],
  },
  {
    id: 'neuro-5',
    category: '神經內科',
    title: '認識貝爾氏麻痺 (Bell’s Palsy) 急性周邊顏面神經炎',
    subtitle: '病因解析、類固醇與抗病毒藥物療程及預後恢復時間',
    language: '繁體中文',
    source: '衛生福利部臺中醫院',
    url: 'https://www.taic.mohw.gov.tw/public/hygiene/3a53bdace67dcced1c72db8d0ee85196.pdf',
    highlights: ['約 80% 患者於發病後 4~8 週內可顯著恢復', '急性期把握前 72 小時黃金藥物治療'],
  },
];

export const HealthEducationView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = HEALTH_EDU_RESOURCES.filter((item) => {
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.highlights.some((h) => h.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Search & Category Filter Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                多語系臨床衛教資訊中心 (Clinical Health Education Hub)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                完整收錄防跌須知（中/英/越/印多語系）、胸腔內科與神經內科官方衛教手冊與重點臨床指引
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋衛教主題、關鍵字..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: '全部衛教專區 (14)', icon: FileText },
            { id: '防跌須知', label: '防跌安全須知 (多語系)', icon: ShieldAlert },
            { id: '胸腔內科', label: '胸腔內科照護', icon: Stethoscope },
            { id: '神經內科', label: '神經內科與中風預防', icon: Brain },
          ].map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-teal-500 dark:text-slate-950 dark:border-teal-400 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const badgeStyle =
            item.category === '防跌須知'
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
              : item.category === '胸腔內科'
              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30'
              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeStyle}`}>
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {item.language}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.subtitle}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">臨床照護重點摘要</div>
                  {item.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-teal-500 font-bold">•</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">來源：{item.source}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500 hover:text-white text-teal-600 dark:text-teal-400 text-xs font-bold transition-all"
                >
                  <span>開啟衛教 PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
