
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MOCK_SURVEYS } from '../services/mockData';
import { storageService } from '../services/storageService';
import { Survey, Question, ParticipantData } from '../types';
import { Clock, CheckCircle, ChevronRight, ArrowLeft, User, Building, Briefcase, Calendar, Shield, Info, Users, Lock } from 'lucide-react';

interface SurveyViewProps {
  userId?: string;
  role?: string;
}

const SurveyView: React.FC<SurveyViewProps> = ({ userId, role }) => {
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [completedSurveyIds, setCompletedSurveyIds] = useState<string[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  const isSupervisor = role === 'supervisor';

  // Steps: 'list' -> 'setup' -> 'questions' -> 'completed'
  const [step, setStep] = useState<'list' | 'setup' | 'questions' | 'completed'>('list');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Centralized Data
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);

  // Participant State
  const [participant, setParticipant] = useState<ParticipantData>({
    name: '',
    age: '',
    gender: '',
    department: '',
    tenure: '',
    isAnonymous: false
  });

  const GENDER_OPTIONS = [
    "Mulher Cisgênero",
    "Mulher Transgênero",
    "Homem Cisgênero",
    "Homem Transgênero",
    "Não-binário",
    "Agênero",
    "Gênero Fluido",
    "Prefiro não responder",
    "Outro"
  ];

  useEffect(() => {
    // Carregar departamentos centralizados
    const loadSettings = async () => {
      const settings = await storageService.getSettings(userId);
      setAvailableDepartments(settings.departments);
    };

    loadSettings();
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check BOTH survey_submissions (legacy/auth tracker) AND survey_responses (actual answers)
      const { data: submissions, error: errSub } = await supabase
        .from('survey_submissions')
        .select('survey_id')
        .eq('user_id', user.id);

      const { data: responses, error: errResp } = await supabase
        .from('survey_responses')
        .select('survey_id')
        .eq('user_id', user.id);

      if (errSub) throw errSub;
      if (errResp) throw errResp;

      const combinedIds = Array.from(new Set([
        ...(submissions?.map(d => d.survey_id) || []),
        ...(responses?.map(d => d.survey_id) || [])
      ]));

      setCompletedSurveyIds(combinedIds);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSelectSurvey = (survey: Survey) => {
    if (completedSurveyIds.includes(survey.id) && !isSupervisor) {
      alert("Você já respondeu este questionário. Cada usuário pode responder apenas uma vez.");
      return;
    }
    setActiveSurvey(survey);
    setStep('setup');
    setParticipant({ name: '', age: '', gender: '', department: '', tenure: '', isAnonymous: false });
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleStartQuestions = () => {
    if (!participant.isAnonymous && (!participant.name || !participant.department)) {
      alert("Por favor, preencha seu nome e departamento ou selecione a opção anônima.");
      return;
    }
    setStep('questions');
  };

  const handleAnswer = (value: any) => {
    if (!activeSurvey) return;
    const question = activeSurvey.questions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (!activeSurvey) return;
    if (currentQuestionIndex < activeSurvey.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishSurvey();
    }
  };

  const finishSurvey = async () => {
    if (activeSurvey) {
      setLoadingSubmissions(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Salvar Resposta Completa no Supabase (Permanent Storage)
        await storageService.saveResponse(activeSurvey.id, participant, answers, userId || user?.id);

        if (user) {
          // 2. Registrar submissão no tracker de acesso (redundante agora, mas mantém compatibilidade)
          await supabase
            .from('survey_submissions')
            .upsert({
              user_id: user.id,
              survey_id: activeSurvey.id
            });

          // Atualizar estado local
          setCompletedSurveyIds(prev => [...prev, activeSurvey.id]);
        }

        setStep('completed');
      } catch (err) {
        console.error('Error saving submission:', err);
        alert("Ocorreu um erro ao salvar sua resposta no banco de dados. Verifique sua conexão e tente novamente.");
      } finally {
        setLoadingSubmissions(false);
      }
    }
  };

  const handleBackToList = () => {
    setActiveSurvey(null);
    setStep('list');
  };

  const renderQuestionInput = (question: Question) => {
    const currentVal = answers[question.id];

    switch (question.type) {
      case 'scale':
        return (
          <div className="flex flex-col gap-4 mt-6">
            <div className="flex justify-between text-sm text-slate-500 px-1">
              <span>Discordo Totalmente</span>
              <span>Concordo Totalmente</span>
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => handleAnswer(val)}
                  className={`flex-1 py-4 rounded-lg font-bold transition-all ${currentVal === val
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        );
      case 'text':
        return (
          <textarea
            className="w-full mt-4 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[120px]"
            placeholder={question.placeholder || "Escreva a sua resposta aqui..."}
            value={currentVal || ''}
            onChange={(e) => handleAnswer(e.target.value)}
          />
        );
      case 'boolean':
        return (
          <div className="flex gap-4 mt-6">
            {['Sim', 'Não'].map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt === 'Sim')}
                className={`flex-1 py-4 rounded-lg font-bold transition-all ${(currentVal === true && opt === 'Sim') || (currentVal === false && opt === 'Não')
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      case 'choice':
        return (
          <div className="flex flex-col gap-3 mt-6">
            {question.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${currentVal === opt
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      case 'multi-choice':
        const currentSelection = (Array.isArray(currentVal) ? currentVal : []) as string[];
        return (
          <div className="flex flex-col gap-3 mt-6">
            {question.options?.map((opt) => {
              const isSelected = currentSelection.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => {
                    const newSelection = isSelected
                      ? currentSelection.filter(i => i !== opt)
                      : [...currentSelection, opt];
                    handleAnswer(newSelection);
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-all flex justify-between items-center ${isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {opt}
                  {isSelected && <CheckCircle className="w-5 h-5 text-blue-600" />}
                </button>
              )
            })}
          </div>
        );
      default:
        return null;
    }
  };

  // --- VIEW 1: LIST OF SURVEYS ---
  if (!activeSurvey || step === 'list') {
    const sortedSurveys = [...MOCK_SURVEYS].sort((a, b) => a.title.localeCompare(b.title));

    const categoryLabels: Record<string, string> = {
      mental: 'Saúde Mental',
      physical: 'Saúde Física',
      social: 'Social',
      org: 'Organizacional',
      preferences: 'Preferências',
      initiatives: 'Iniciativas'
    };

    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Questionários Disponíveis</h2>
          {loadingSubmissions && <span className="text-xs text-slate-400 animate-pulse">Sincronizando...</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSurveys.map((survey) => {
            const isCompleted = completedSurveyIds.includes(survey.id);
            const showAsCompleted = isCompleted && !isSupervisor;

            return (
              <div key={survey.id} className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow relative ${showAsCompleted ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                {showAsCompleted && (
                  <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 z-10">
                    <CheckCircle className="w-3 h-3" /> RESPONDIDO
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${survey.category === 'mental' ? 'bg-purple-100 text-purple-700' :
                    survey.category === 'physical' ? 'bg-green-100 text-green-700' :
                      survey.category === 'social' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                    }`}>
                    {categoryLabels[survey.category] || survey.category}
                  </span>
                  <span className="flex items-center text-slate-400 text-xs">
                    <Clock className="w-3 h-3 mr-1" /> {survey.estimatedTime}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{survey.title}</h3>
                <p className="text-slate-500 text-sm mb-6 flex-1">{survey.description}</p>
                <button
                  onClick={() => handleSelectSurvey(survey)}
                  disabled={(showAsCompleted) || loadingSubmissions}
                  className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${showAsCompleted
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                >
                  {showAsCompleted ? (
                    <>
                      <Lock className="w-4 h-4" /> Concluído
                    </>
                  ) : (
                    <>
                      {isCompleted && isSupervisor ? 'Refazer Teste' : 'Começar'} <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- VIEW 2: PARTICIPANT SETUP (IDENTIFICATION) ---
  if (step === 'setup') {
    return (
      <div className="max-w-xl mx-auto py-10 animate-fade-in">
        <button
          onClick={handleBackToList}
          className="text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Dados do Participante</h2>
          <p className="text-slate-500 mb-6">Por favor, preencha os seus dados abaixo. Se preferir, pode optar por responder anonimamente.</p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              A sua honestidade é fundamental. Garantimos que os dados individuais serão tratados com confidencialidade e usados apenas para fins estatísticos e de melhoria do bem-estar.
            </p>
          </div>

          <div className="space-y-4">
            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => setParticipant(p => ({ ...p, isAnonymous: !p.isAnonymous }))}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${participant.isAnonymous ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Responder Anonimamente</p>
                  <p className="text-xs text-slate-500">Os seus dados pessoais não serão registados.</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${participant.isAnonymous ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                {participant.isAnonymous && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </div>

            {/* Form Fields - Disabled if Anonymous */}
            <div className={`space-y-4 transition-all duration-300 ${participant.isAnonymous ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome"
                    value={participant.name}
                    onChange={e => setParticipant({ ...participant, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Idade</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 30"
                      value={participant.age}
                      onChange={e => setParticipant({ ...participant, age: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tempo de Empresa</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <select
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      value={participant.tenure}
                      onChange={e => setParticipant({ ...participant, tenure: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      <option value="<1">Menos de 1 ano</option>
                      <option value="1-3">1 a 3 anos</option>
                      <option value="3-5">3 a 5 anos</option>
                      <option value=">5">Mais de 5 anos</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Setor / Departamento</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <select
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      value={participant.department}
                      onChange={e => setParticipant({ ...participant, department: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {availableDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gênero</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <select
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      value={participant.gender}
                      onChange={e => setParticipant({ ...participant, gender: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {GENDER_OPTIONS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartQuestions}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Iniciar Questionário <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- VIEW 3: COMPLETION ---
  if (step === 'completed') {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Obrigado pela sua participação!</h2>
        <p className="text-slate-600 mb-8">
          As suas respostas foram registadas com sucesso no nosso sistema seguro.
        </p>
        <button
          onClick={handleBackToList}
          className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
        >
          Voltar aos Questionários
        </button>
      </div>
    );
  }

  // --- VIEW 4: ACTIVE QUESTIONS ---
  if (activeSurvey) {
    const question = activeSurvey.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / activeSurvey.questions.length) * 100;
    const isAnswered = answers[question.id] !== undefined && answers[question.id] !== '';

    return (
      <div className="max-w-2xl mx-auto py-8 animate-fade-in">
        <button
          onClick={handleBackToList}
          className="text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Cancelar
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="h-2 bg-slate-100 w-full">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-8 md:p-12">
            <span className="text-sm font-semibold text-blue-600 mb-2 block">
              Questão {currentQuestionIndex + 1} de {activeSurvey.questions.length}
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">
              {question.text}
            </h2>

            {renderQuestionInput(question)}

            <div className="mt-10 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {currentQuestionIndex === activeSurvey.questions.length - 1 ? 'Submeter' : 'Próxima'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SurveyView;
