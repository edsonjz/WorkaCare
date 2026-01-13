
export type UserRole = 'operator' | 'supervisor';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
}

// Participant data for surveys
export interface ParticipantData {
  name: string;
  age: string;
  gender: string;
  department: string;
  tenure: string;
  isAnonymous: boolean;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  surveyCategory: string;
  participant: ParticipantData;
  answers: Record<string, any>;
  timestamp: string;
  score?: number;
  userId?: string;
}

export interface KPIMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  color: string;
  inverse?: boolean;
}

export interface ChartDataPoint {
  name: string;
  mental: number;
  fisico: number;
  social: number;
  material: number;
  participacao?: number;
}

export interface CategoryScore {
  name: string;
  score: number;
  color: string;
}

export interface DepartmentData {
  name: string;
  mental: number;
  fisico: number;
  social: number;
  material: number;
  stress: number;
}

export type QuestionType = 'scale' | 'text' | 'choice' | 'boolean' | 'multi-choice' | 'date' | 'info';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  scaleLabels?: { start: string, end: string };
  category: string;
  placeholder?: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  category: 'mental' | 'physical' | 'social' | 'org' | 'preferences' | 'initiatives';
  questions: Question[];
  estimatedTime: string;
}

export interface SwotItem {
  id: string;
  text: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
}

export interface StrategicGoal {
  id: string;
  text: string;
  status: 'planned' | 'in-progress' | 'completed';
  deadline: string;
  kpiTarget: string;
}

export interface StrategicResource {
  id: string;
  item: string;
  cost: number;
  allocated: boolean;
}

export interface AnalysisReport {
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Observation {
  id: string;
  date: string;
  author: string;
  category: 'ambiente_fisico' | 'psicossocial' | 'carga_trabalho' | 'feedback' | 'emocional';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ActionPlanItem {
  id: string;
  goal: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'done';
}

export interface Session {
  id: string;
  user_id?: string;
  type: 'individual' | 'focus_group';
  date: string;
  participantOrGroup: string;
  status: 'scheduled' | 'completed';
  privateNotes?: string;
  guideAnswers?: Record<string, string>;
  actionPlan?: ActionPlanItem[];
}

export interface Resource {
  id: string;
  user_id?: string;
  title: string;
  type: 'article' | 'video' | 'guide';
  category: 'mental' | 'physical' | 'nutrition' | 'ergonomics';
  duration: string;
  thumbnail: string;
  content?: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  date: string;
}

export interface AppSettings {
  departments: string[];
  reportCategories: string[];
  customGuideQuestions: string[];
}
