export interface User {
  id_number: string;
  userid: string;
  demo_password?: string;
  name: string;
  role: 'nurse' | 'patient';
  identity_title: string;
  department: string;
}

export interface Patient {
  id_number: string;
  chart_no: string;
  name: string;
  gender: string;
  birth_date: string;
  blood_type: string;
  rh_type: string;
  major_illness: string;
  allergies: string;
  ward_no: string;
  bed_no: number | null;
  phone_no: string;
  address: string;
  emergency_contact: string;
  emergency_contact_no: string;
  hospitalization_date: string;
  observation_time: string;
  attending_physician: string;
  primary_nurse_id: string | null;
  primary_nurse_name: string;
  current_condition: string;
  transaction_info: string;
  fall_risk: string;
  diet_type: string;
  field_notes: Record<string, string>;
}

export interface VitalSign {
  id: number;
  patient_id: string;
  patient_name: string;
  recorded_at: string;
  display_time: string;
  temperature: number;
  heart_rate: number;
  spo2: number;
  systolic_bp: number;
  diastolic_bp: number;
  source: 'manual' | 'iot_gy906' | 'iot_max30100' | string;
  recorded_by: string;
  remark: string;
}

export interface Bed {
  bed_no: number;
  ward_no: string;
  patient_id: string | null;
  status: '在床中' | '看診中' | '休息中' | '手術中' | '活動中' | '空床' | string;
  updated_at: string;
  patient: Patient | null;
  latestVital: VitalSign | null;
}

export interface MedicationLog {
  id: number;
  patient_id: string;
  patient_name: string;
  medications: string[];
  recorded_at: string;
  display_time: string;
  nurse_name: string;
  remark: string;
}

export interface WardRound {
  id: number;
  patient_id: string;
  patient_name: string;
  activities: string[];
  recorded_at: string;
  display_time: string;
  nurse_name: string;
  remark: string;
}

export interface AuditLog {
  id: number;
  event_type: 'BED_SWAP' | 'STATUS_CHANGE' | 'ADMISSION_UPDATE' | 'IOT_ALERT' | string;
  summary: string;
  operator_name: string;
  patient_id: string | null;
  created_at: string;
}

export interface ScheduleItem {
  id: number;
  date: string;
  time: string;
  title: string;
  category: 'ward_round' | 'medication' | 'examination' | 'handover' | string;
  patient_id: string | null;
  patient_name: string;
  nurse_name: string;
  completed: number;
}

export interface BootstrapData {
  users: User[];
  beds: Bed[];
  patients: Patient[];
  vitalSigns: VitalSign[];
  medicationLogs: MedicationLog[];
  wardRounds: WardRound[];
  auditLogs: AuditLog[];
  schedules: ScheduleItem[];
  serverMetrics: {
    queryTimeMs: number;
    engine: string;
    timestamp: string;
  };
}

export type ActiveTab =
  | 'overview'
  | 'ward_map'
  | 'patient_profile'
  | 'vitals_iot'
  | 'care_workflow'
  | 'bed_card'
  | 'schedule'
  | 'health_edu';

export function calculateAgeDisplay(birthDateStr?: string): { years: number; months: number; label: string; shortLabel: string } {
  if (!birthDateStr) {
    return { years: 0, months: 0, label: '未提供', shortLabel: '--' };
  }
  const normalized = birthDateStr.replace(/\//g, '-');
  const birth = new Date(normalized);
  if (Number.isNaN(birth.getTime())) {
    return { years: 0, months: 0, label: birthDateStr, shortLabel: '--' };
  }
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return {
    years,
    months,
    label: `${years} 歲 ${months} 個月`,
    shortLabel: `${years}y ${months}m`,
  };
}
