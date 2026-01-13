
import { SurveyResponse, ParticipantData, KPIMetric, ChartDataPoint, DepartmentData, CategoryScore, Resource, Session, AppSettings, Observation, SwotItem, StrategicGoal, StrategicResource } from '../types';
import { MOCK_SURVEYS, MOCK_RESOURCES_LIB, MOCK_SESSIONS, MOCK_OBSERVATIONS, MOCK_SWOT, MOCK_GOALS, MOCK_RESOURCES_STRATEGY } from './mockData';
import { supabase } from './supabaseClient';

const SETTINGS_KEY = 'workacare_settings';

const DEFAULT_SETTINGS: AppSettings = {
  departments: ['TI', 'RH', 'Vendas', 'Marketing', 'Financeiro', 'Operacoes'],
  reportCategories: ['Mental', 'Físico', 'Social', 'Organizacional', 'Financeiro'],
  customGuideQuestions: []
};

export const storageService = {

  // --- RESPONSES (SUPABASE) ---
  saveResponse: async (surveyId: string, participant: ParticipantData, answers: Record<string, any>, userId?: string): Promise<SurveyResponse> => {
    let totalScore = 0;
    let count = 0;
    Object.values(answers).forEach(val => {
      if (typeof val === 'number' && val >= 1 && val <= 5) {
        totalScore += val;
        count++;
      }
    });
    const normalizedScore = count > 0 ? Math.round((totalScore / count) * 20) : 0;

    const { data, error } = await supabase
      .from('survey_responses')
      .insert({
        user_id: userId,
        survey_id: surveyId,
        participant,
        answers,
        score: normalizedScore,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving response to Supabase:', error);
      throw error;
    }

    const survey = MOCK_SURVEYS.find(s => s.id === surveyId);
    return {
      ...data,
      surveyId: data.survey_id,
      surveyTitle: survey?.title || 'Desconhecido',
      surveyCategory: survey?.category || 'geral',
      userId: data.user_id
    } as SurveyResponse;
  },

  getAllResponses: async (userId?: string): Promise<SurveyResponse[]> => {
    let query = supabase
      .from('survey_responses')
      .select('*')
      .order('timestamp', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching responses from Supabase:', error);
      return [];
    }

    return (data || []).map(row => {
      const survey = MOCK_SURVEYS.find(s => s.id === row.survey_id);
      return {
        id: row.id,
        surveyId: row.survey_id,
        surveyTitle: survey?.title || 'Desconhecido',
        surveyCategory: survey?.category || 'geral',
        participant: row.participant,
        answers: row.answers,
        score: row.score,
        timestamp: row.timestamp,
        userId: row.user_id
      };
    });
  },

  deleteResponse: async (id: string) => {
    const { error } = await supabase
      .from('survey_responses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting response from Supabase:', error);
      throw error;
    }
  },

  // --- SETTINGS (SUPABASE) ---
  getSettings: async (userId?: string): Promise<AppSettings> => {
    if (!userId) {
      return {
        ...DEFAULT_SETTINGS,
        departments: [...DEFAULT_SETTINGS.departments].sort()
      };
    }

    const { data, error } = await supabase
      .from('app_settings')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return {
        ...DEFAULT_SETTINGS,
        departments: [...DEFAULT_SETTINGS.departments].sort()
      };
    }

    const settings = data.data as AppSettings;
    return {
      ...settings,
      departments: (settings.departments || []).sort()
    };
  },

  saveSettings: async (settings: AppSettings, userId?: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        user_id: userId,
        data: settings,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving settings to Supabase:', error);
      throw error;
    }
  },

  // --- RESOURCES (SUPABASE) ---
  getCustomResources: async (userId?: string): Promise<Resource[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('custom_resources')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom resources:', error);
      return [];
    }

    return data || [];
  },

  saveCustomResource: async (resource: Resource, userId: string) => {
    const { error } = await supabase
      .from('custom_resources')
      .insert({
        ...resource,
        user_id: userId
      });

    if (error) {
      console.error('Error saving custom resource:', error);
      throw error;
    }
  },

  deleteCustomResource: async (id: string) => {
    const { error } = await supabase
      .from('custom_resources')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getAllResources: async (userId?: string): Promise<Resource[]> => {
    const custom = await storageService.getCustomResources(userId);
    return [...custom, ...MOCK_RESOURCES_LIB];
  },

  // --- SESSIONS (SUPABASE) ---
  getAllSessions: async (userId?: string): Promise<Session[]> => {
    if (!userId) return MOCK_SESSIONS.sort((a, b) => a.participantOrGroup.localeCompare(b.participantOrGroup));

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return MOCK_SESSIONS;
    }

    return (data || []).map(row => ({
      id: row.id,
      user_id: row.user_id,
      type: row.type,
      date: row.date,
      participantOrGroup: row.participant_or_group,
      status: row.status,
      privateNotes: row.private_notes,
      guideAnswers: row.guide_answers,
      actionPlan: row.action_plan
    })) as Session[];
  },

  saveSession: async (session: Session, userId: string) => {
    const { id, ...sessionData } = session;
    const dbData = {
      user_id: userId,
      type: session.type,
      date: session.date,
      participant_or_group: session.participantOrGroup,
      status: session.status,
      private_notes: session.privateNotes,
      guide_answers: session.guideAnswers,
      action_plan: session.actionPlan
    };

    if (id && !id.startsWith('temp_') && !isNaN(Number(id)) === false) {
      // It's a real UUID or at least not a temp timestamp id
      const { error } = await supabase
        .from('sessions')
        .update(dbData)
        .eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('sessions')
        .insert(dbData);
      if (error) throw error;
    }
  },

  deleteSession: async (id: string) => {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // --- Metrics ---

  getDashboardMetrics: async (userId?: string) => {
    const responses = await storageService.getAllResponses(userId);
    const totalResponses = responses.length;

    const getAvgScore = (filterFn: (r: SurveyResponse) => boolean) => {
      const filtered = responses.filter(filterFn);
      if (filtered.length === 0) return 0;
      return Math.round(filtered.reduce((acc, r) => acc + (r.score || 0), 0) / filtered.length);
    };

    const mentalScore = getAvgScore(r => r.surveyCategory === 'mental' || r.surveyId === 'A-mental-wellbeing');
    const physicalScore = getAvgScore(r => r.surveyCategory === 'physical' || r.surveyId === 'B-physical-wellbeing');
    const financialScore = getAvgScore(r => r.surveyId === 'H-financial');
    const pulseScore = getAvgScore(r => r.surveyId === 'G-checkin');
    const socialScore = getAvgScore(r => r.surveyCategory === 'social');

    const metrics: KPIMetric[] = [
      { id: '1', label: 'Saúde Mental', value: mentalScore, unit: '/100', change: 0, trend: mentalScore > 60 ? 'up' : 'down', color: 'text-purple-600' },
      { id: '2', label: 'Saúde Física', value: physicalScore, unit: '/100', change: 0, trend: 'neutral', color: 'text-green-600' },
      { id: '3', label: 'Bem-Estar Material', value: financialScore, unit: '/100', change: 0, trend: 'neutral', color: 'text-blue-600' },
      { id: '4', label: 'Clima Social', value: socialScore, unit: '/100', change: 0, trend: 'neutral', color: 'text-orange-600' },
      { id: '5', label: 'Engajamento', value: pulseScore, unit: '/100', change: 0, trend: pulseScore > 60 ? 'up' : 'down', color: 'text-teal-600', inverse: false },
      { id: '6', label: 'Total Respostas', value: totalResponses, unit: '', change: 0, trend: 'neutral', color: 'text-slate-600' },
    ];

    if (userId) {
      return metrics.filter(m => m.value > 0 || m.id === '6');
    }

    return metrics;
  },

  getCategoryScores: async (userId?: string): Promise<CategoryScore[]> => {
    const responses = await storageService.getAllResponses(userId);
    if (responses.length === 0) return [];

    const categories = [
      { id: 'F-leadership', label: 'Liderança', color: '#8884d8' },
      { id: 'D-org-practices', label: 'Práticas Org.', color: '#82ca9d' },
      { id: 'B-physical-wellbeing', label: 'Físico', color: '#ffc658' },
      { id: 'C-social-wellbeing', label: 'Social', color: '#ff8042' },
      { id: 'A-mental-wellbeing', label: 'Mental', color: '#a4de6c' },
      { id: 'I-dei', label: 'DEI', color: '#d0ed57' },
      { id: 'H-financial', label: 'Material/Fin.', color: '#83a6ed' },
      { id: 'G-checkin', label: 'Pulse/Humor', color: '#14b8a6' },
    ];

    return categories.map(cat => {
      const surveyResponses = responses.filter(r => r.surveyId === cat.id);
      const avg = surveyResponses.length > 0
        ? Math.round(surveyResponses.reduce((acc, r) => acc + (r.score || 0), 0) / surveyResponses.length)
        : 0;

      return {
        name: cat.label,
        score: avg,
        color: cat.color
      };
    }).filter(c => userId ? c.score > 0 : true);
  },

  getChartData: async (userId?: string): Promise<ChartDataPoint[]> => {
    const responses = await storageService.getAllResponses(userId);
    if (responses.length === 0) return [];

    const groupedByMonth: Record<string, { mental: number[], fisico: number[], social: number[], material: number[], count: number }> = {};

    responses.forEach(r => {
      const date = new Date(r.timestamp);
      const month = date.toLocaleString('pt-BR', { month: 'short' });

      if (!groupedByMonth[month]) {
        groupedByMonth[month] = { mental: [], fisico: [], social: [], material: [], count: 0 };
      }

      const score = r.score || 0;

      if (r.surveyCategory === 'mental') groupedByMonth[month].mental.push(score);
      if (r.surveyCategory === 'physical') groupedByMonth[month].fisico.push(score);
      if (r.surveyCategory === 'social') groupedByMonth[month].social.push(score);
      if (r.surveyId === 'H-financial') groupedByMonth[month].material.push(score);

      groupedByMonth[month].count++;
    });

    return Object.keys(groupedByMonth).map(month => {
      const data = groupedByMonth[month];
      const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

      return {
        name: month.charAt(0).toUpperCase() + month.slice(1),
        mental: avg(data.mental),
        fisico: avg(data.fisico),
        social: avg(data.social),
        material: avg(data.material),
        participacao: data.count
      };
    });
  },

  getDepartmentData: async (userId?: string): Promise<DepartmentData[]> => {
    const responses = await storageService.getAllResponses(userId);
    if (responses.length === 0) return [];

    const grouped: Record<string, { mental: number[], fisico: number[], social: number[], material: number[], pulse: number[] }> = {};

    responses.forEach(r => {
      const dept = r.participant.department || 'Geral';
      if (!grouped[dept]) grouped[dept] = { mental: [], fisico: [], social: [], material: [], pulse: [] };

      const score = r.score || 0;
      if (r.surveyCategory === 'mental') grouped[dept].mental.push(score);
      if (r.surveyCategory === 'physical') grouped[dept].fisico.push(score);
      if (r.surveyCategory === 'social') grouped[dept].social.push(score);
      if (r.surveyId === 'H-financial') grouped[dept].material.push(score);
      if (r.surveyId === 'G-checkin') grouped[dept].pulse.push(score);
    });

    return Object.keys(grouped).map(dept => {
      const d = grouped[dept];
      const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

      return {
        name: dept,
        mental: avg(d.mental),
        fisico: avg(d.fisico),
        social: avg(d.social),
        material: avg(d.material),
        stress: avg(d.pulse)
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  },

  getMoodDistribution: async (userId?: string) => {
    const responses = (await storageService.getAllResponses(userId)).filter(r => r.surveyId === 'G-checkin');

    let high = 0;
    let medium = 0;
    let low = 0;

    responses.forEach(r => {
      const score = r.score || 0;
      if (score >= 70) high++;
      else if (score >= 40) medium++;
      else low++;
    });

    return [
      { name: 'Energizado/Feliz', value: high, color: '#10b981' },
      { name: 'Estável/Neutro', value: medium, color: '#f59e0b' },
      { name: 'Baixo Ânimo', value: low, color: '#ef4444' }
    ].filter(d => d.value > 0);
  },

  // --- OBSERVATIONS ---
  getAllObservations: async (userId?: string): Promise<Observation[]> => {
    if (!userId) return MOCK_OBSERVATIONS;
    const { data, error } = await supabase
      .from('observations')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching observations:', error);
      return MOCK_OBSERVATIONS;
    }
    return data as Observation[];
  },

  saveObservation: async (obs: Omit<Observation, 'id'>, userId?: string): Promise<Observation> => {
    if (!userId) throw new Error("Auth required");
    const { data, error } = await supabase
      .from('observations')
      .insert({ ...obs, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data as Observation;
  },

  // --- STRATEGY: SWOT ---
  getSwot: async (userId?: string): Promise<SwotItem[]> => {
    if (!userId) return MOCK_SWOT;
    const { data, error } = await supabase
      .from('swot')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) return MOCK_SWOT;
    return data as SwotItem[];
  },

  saveSwotItem: async (item: Omit<SwotItem, 'id'>, userId?: string): Promise<SwotItem> => {
    if (!userId) throw new Error("Auth required");
    const { data, error } = await supabase
      .from('swot')
      .insert({ ...item, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data as SwotItem;
  },

  deleteSwotItem: async (id: string): Promise<void> => {
    const { error } = await supabase.from('swot').delete().eq('id', id);
    if (error) throw error;
  },

  // --- STRATEGY: GOALS ---
  getGoals: async (userId?: string): Promise<StrategicGoal[]> => {
    if (!userId) return MOCK_GOALS;
    const { data, error } = await supabase
      .from('strategic_goals')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) return MOCK_GOALS;
    return data.map(g => ({
      id: g.id,
      text: g.text,
      status: g.status,
      deadline: g.deadline,
      kpiTarget: g.kpi_target
    })) as StrategicGoal[];
  },

  saveGoal: async (goal: Omit<StrategicGoal, 'id'>, userId?: string): Promise<StrategicGoal> => {
    if (!userId) throw new Error("Auth required");
    const { data, error } = await supabase
      .from('strategic_goals')
      .insert({
        text: goal.text,
        status: goal.status,
        deadline: goal.deadline,
        kpi_target: goal.kpiTarget,
        user_id: userId
      })
      .select()
      .single();
    if (error) throw error;
    return { ...data, kpiTarget: data.kpi_target } as StrategicGoal;
  },

  // --- STRATEGY: RESOURCES ---
  getStrategicResources: async (userId?: string): Promise<StrategicResource[]> => {
    if (!userId) return MOCK_RESOURCES_STRATEGY;
    const { data, error } = await supabase
      .from('strategic_resources')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) return MOCK_RESOURCES_STRATEGY;
    return data as StrategicResource[];
  },

  saveStrategicResource: async (res: Omit<StrategicResource, 'id'>, userId?: string): Promise<StrategicResource> => {
    if (!userId) throw new Error("Auth required");
    const { data, error } = await supabase
      .from('strategic_resources')
      .insert({ ...res, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data as StrategicResource;
  }
};
