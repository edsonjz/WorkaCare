
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Session, ActionPlanItem } from '../types';
import { Users, User, Calendar, Plus, MessageCircle, ArrowLeft, CheckSquare, Lock, FileText, Clock, Trash2, Save, X, Info, MessageSquareQuote, Settings, Edit3 } from 'lucide-react';

interface SessionsViewProps {
    userId?: string;
}

const SessionsView: React.FC<SessionsViewProps> = ({ userId }) => {
    const [activeTab, setActiveTab] = useState<'individual' | 'focus_group'>('individual');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSession, setActiveSession] = useState<Session | null>(null);

    // Custom Settings State
    const [customQuestions, setCustomQuestions] = useState<string[]>([]);
    const [isConfiguringGuide, setIsConfiguringGuide] = useState(false);
    const [newQuestionText, setNewQuestionText] = useState('');

    // Scheduling State
    const [isScheduling, setIsScheduling] = useState(false);
    const [newSessionData, setNewSessionData] = useState({
        name: '',
        date: '',
        type: 'individual' as 'individual' | 'focus_group'
    });

    // Active Session State
    const [sessionMode, setSessionMode] = useState<'guide' | 'notes' | 'plan' | 'history'>('guide');
    const [noteContent, setNoteContent] = useState('');
    const [guideAnswers, setGuideAnswers] = useState<Record<string, string>>({});

    // Action Plan State
    const [newAction, setNewAction] = useState({ goal: '', deadline: '' });
    const [actionPlan, setActionPlan] = useState<ActionPlanItem[]>([]);

    useEffect(() => {
        refreshData();
    }, [userId]);

    const refreshData = async () => {
        const data = await storageService.getAllSessions(userId);
        setSessions(data);
        const settings = await storageService.getSettings(userId);
        setCustomQuestions(settings.customGuideQuestions || []);
    };

    // Guide Configuration Logic
    const handleAddQuestion = async () => {
        if (!newQuestionText.trim()) return;
        const updated = [...customQuestions, newQuestionText];

        try {
            const settings = await storageService.getSettings(userId);
            settings.customGuideQuestions = updated;
            await storageService.saveSettings(settings, userId);

            setCustomQuestions(updated);
            setNewQuestionText('');
        } catch (err) {
            console.error('Error adding question:', err);
            alert('Erro ao salvar configuração.');
        }
    };

    const handleRemoveQuestion = async (idx: number) => {
        const updated = customQuestions.filter((_item: string, i: number) => i !== idx);

        try {
            const settings = await storageService.getSettings(userId);
            settings.customGuideQuestions = updated;
            await storageService.saveSettings(settings, userId);
            setCustomQuestions(updated);
        } catch (err) {
            console.error('Error removing question:', err);
            alert('Erro ao remover questão.');
        }
    };

    // Open Session Manager
    const handleOpenSession = (session: Session) => {
        setActiveSession(session);
        setNoteContent(session.privateNotes || '');
        setGuideAnswers(session.guideAnswers || {});
        setActionPlan(session.actionPlan || []);
        setSessionMode('guide');
    };

    const handleCloseSession = () => {
        setActiveSession(null);
    };

    // Schedule Logic
    const handleScheduleSession = async () => {
        if (!newSessionData.name || !newSessionData.date || !userId) {
            alert("Por favor, preencha o nome e a data (e verifique login).");
            return;
        }

        const newSession: Session = {
            id: `temp_${Date.now()}`, // temp id until DB assigns UUID
            type: newSessionData.type,
            date: newSessionData.date,
            participantOrGroup: newSessionData.name,
            status: 'scheduled',
            privateNotes: '',
            guideAnswers: {},
            actionPlan: []
        };

        try {
            await storageService.saveSession(newSession, userId);
            await refreshData();
            setIsScheduling(false);
            setNewSessionData({ name: '', date: '', type: 'individual' });
        } catch (err) {
            console.error('Error scheduling session:', err);
            alert('Erro ao agendar sessão.');
        }
    };

    // Action Plan Logic
    const addActionItem = () => {
        if (!newAction.goal || !newAction.deadline) return;
        const item: ActionPlanItem = {
            id: Date.now().toString(),
            goal: newAction.goal,
            deadline: newAction.deadline,
            status: 'pending'
        };
        setActionPlan([...actionPlan, item]);
        setNewAction({ goal: '', deadline: '' });
    };

    const toggleActionItem = (id: string) => {
        setActionPlan(actionPlan.map(item =>
            item.id === id
                ? { ...item, status: item.status === 'done' ? 'pending' : 'done' }
                : item
        ));
    };

    const deleteActionItem = (id: string) => {
        setActionPlan(actionPlan.filter(item => item.id !== id));
    };

    // Save Session Data (Works for New and Editing Existing)
    const saveSessionData = async () => {
        if (!activeSession || !userId) return;

        const updatedSession: Session = {
            ...activeSession,
            privateNotes: noteContent,
            guideAnswers: guideAnswers,
            actionPlan: actionPlan,
            status: 'completed'
        };

        try {
            await storageService.saveSession(updatedSession, userId);
            await refreshData();
            alert('Sessão finalizada com sucesso!');
            handleCloseSession();
        } catch (err) {
            console.error('Error saving session:', err);
            alert('Erro ao guardar dados da sessão.');
        }
    };

    const handleDeleteSession = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.")) {
            return;
        }
        try {
            await storageService.deleteSession(id);
            await refreshData();
        } catch (err) {
            console.error('Error deleting session:', err);
            alert('Erro ao excluir sessão.');
        }
    };

    // Filtered List for Main View
    const filteredSessions = sessions
        .filter((s: Session) => s.type === activeTab)
        .sort((a: Session, b: Session) => a.participantOrGroup.localeCompare(b.participantOrGroup));

    // --- RENDER: ACTIVE SESSION MANAGER ---
    if (activeSession) {
        return (
            <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-fade-in">
                {/* Session Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={handleCloseSession} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {activeSession.participantOrGroup}
                                <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border">
                                    {activeSession.type === 'individual' ? 'Check-in Individual' : 'Grupo Focal'}
                                </span>
                            </h2>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> {new Date(activeSession.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Modo Confidencial
                        </span>
                        <button
                            onClick={saveSessionData}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                        >
                            <Save className="w-4 h-4" /> {activeSession.status === 'completed' ? 'Atualizar Dados' : 'Finalizar e Guardar'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Navigation */}
                    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                        <nav className="p-4 space-y-1">
                            <button
                                onClick={() => setSessionMode('guide')}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${sessionMode === 'guide' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <FileText className="w-5 h-5" /> Guia Estruturado
                            </button>
                            <button
                                onClick={() => setSessionMode('notes')}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${sessionMode === 'notes' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Lock className="w-5 h-5" /> Notas Confidenciais
                            </button>
                            <button
                                onClick={() => setSessionMode('plan')}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${sessionMode === 'plan' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <CheckSquare className="w-5 h-5" /> Plano de Ação
                            </button>
                            <button
                                onClick={() => setSessionMode('history')}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${sessionMode === 'history' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Clock className="w-5 h-5" /> Histórico
                            </button>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">

                        {/* VIEW: GUIDED SCRIPT */}
                        {sessionMode === 'guide' && (
                            <div className="max-w-4xl mx-auto space-y-8">

                                {/* Section: Propósito */}
                                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MessageSquareQuote className="w-6 h-6 text-blue-600 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-blue-900">Propósito da Sessão (Script de Abertura)</h4>
                                            <p className="text-blue-800 text-sm italic mt-2 leading-relaxed">
                                                "O objetivo desta sessão é perceber como se tem sentido, se há algo que possamos fazer para melhorar o seu bem-estar e satisfação em trabalhar conosco. A sua contribuição ajuda-nos a melhorar e garantir que estamos a dar o apoio e os recursos necessários."
                                            </p>
                                        </div>
                                    </div>
                                    <div className="border-t border-blue-200 pt-3 mt-2">
                                        <h5 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Dicas de Condução:</h5>
                                        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                                            <li>Faça perguntas abertas para encorajar a partilha.</li>
                                            <li>Ouça atentamente as respostas e faça perguntas de esclarecimento.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Section: Discussão */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                        <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                        Discussão e Diagnóstico
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            1. Para começar, gostaria de saber como você tem se sentido. Há algo específico que tem estado na sua mente?
                                        </label>
                                        <textarea
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm"
                                            placeholder="Registe a resposta..."
                                            value={guideAnswers['discuss_1'] || ''}
                                            onChange={(e) => setGuideAnswers({ ...guideAnswers, 'discuss_1': e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            2. Que tipo de desafios tem enfrentado no seu trabalho? Houve algum acontecimento da sua vida pessoal que impactou a forma como se tem sentido no trabalho?
                                        </label>
                                        <textarea
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 text-sm"
                                            placeholder="Registe os desafios ou impactos pessoais..."
                                            value={guideAnswers['discuss_2'] || ''}
                                            onChange={(e) => setGuideAnswers({ ...guideAnswers, 'discuss_2': e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            3. Que aspectos do seu ambiente de trabalho considera favoráveis e desfavoráveis ao seu bem-estar?
                                        </label>
                                        <textarea
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 text-sm"
                                            placeholder="Pontos favoráveis e desfavoráveis..."
                                            value={guideAnswers['discuss_3'] || ''}
                                            onChange={(e) => setGuideAnswers({ ...guideAnswers, 'discuss_3': e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            4. Sente-se à vontade para entrar em contacto com o seu supervisor ou o departamento de RH se precisar de apoio?
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            placeholder="Sim/Não e observações..."
                                            value={guideAnswers['discuss_4'] || ''}
                                            onChange={(e) => setGuideAnswers({ ...guideAnswers, 'discuss_4': e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Section: Recursos */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                        <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                        Recursos e Apoio
                                    </h3>

                                    <div className="bg-indigo-50 p-3 rounded-lg text-xs text-indigo-800 mb-4">
                                        <Info className="w-3 h-3 inline mr-1" />
                                        Informe sobre os recursos disponíveis (e.g., biblioteca de bem-estar, apoio psicológico, flexibilidade).
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            1. Conhece/tem acesso às iniciativas e recursos de bem-estar que oferecemos? Acha que são úteis?
                                        </label>
                                        <textarea
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm"
                                            value={guideAnswers['resources_1'] || ''}
                                            onChange={(e) => setGuideAnswers({ ...guideAnswers, 'resources_1': e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            2. Existem outras iniciativas ou recursos de bem-estar que gostaria de ver implementados?
                                        </label>
                                        <textarea
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm"
                                            value={guideAnswers['resources_2'] || ''}
                                            onChange={(e) => setGuideAnswers({ ...guideAnswers, 'resources_2': e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Section: Plano de Ação */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                        <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                        Definição do Plano de Ação
                                    </h3>

                                    <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 mb-4">
                                        <Info className="w-3 h-3 inline mr-1" />
                                        Use a aba "Plano de Ação" à esquerda para registar metas com datas específicas. Aqui, registe o resumo da discussão.
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            1. Que objetivos podemos estabelecer juntos para ajudá-lo?
                                        </label>
                                        <textarea
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm"
                                            value={guideAnswers['plan_1'] || ''}
                                            onChange={(e) => setGuideAnswers({ ...guideAnswers, 'plan_1': e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            2. Que áreas específicas do seu bem-estar gostaria de melhorar com o apoio da empresa?
                                        </label>
                                        <textarea
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm"
                                            value={guideAnswers['plan_2'] || ''}
                                            onChange={(e) => setGuideAnswers({ ...guideAnswers, 'plan_2': e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Section: QUESTÕES PERSONALIZADAS */}
                                {customQuestions.length > 0 && (
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                            <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                            Questões Adicionais (Personalizadas)
                                        </h3>
                                        {customQuestions.map((q, idx) => (
                                            <div key={idx}>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    {q}
                                                </label>
                                                <textarea
                                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm"
                                                    value={guideAnswers[`custom_${idx}`] || ''}
                                                    onChange={(e) => setGuideAnswers({ ...guideAnswers, [`custom_${idx}`]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Section: Encerramento */}
                                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4">
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-slate-700">
                                            Comentários Adicionais (Existe algo mais que gostaria de partilhar?)
                                        </label>
                                        <textarea
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm bg-white"
                                            value={guideAnswers['closing'] || ''}
                                            onChange={(e) => setGuideAnswers({ ...guideAnswers, 'closing': e.target.value })}
                                        />
                                    </div>

                                    <div className="border-t border-slate-200 pt-4 mt-2">
                                        <h4 className="font-bold text-slate-800 mb-1">Script de Encerramento</h4>
                                        <p className="text-slate-600 text-sm italic leading-relaxed">
                                            "Obrigado por ser aberto e honesto. Vamos usar o seu feedback para fazer melhorias e dar mais apoio aos nossos colaboradores. Se tiver mais pensamentos ou questões, por favor, não hesite em entrar em contato. Estamos aqui para apoiá-lo de qualquer forma possível."
                                        </p>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* VIEW: CONFIDENTIAL NOTES */}
                        {sessionMode === 'notes' && (
                            <div className="max-w-3xl mx-auto h-full flex flex-col">
                                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg text-yellow-800 text-sm mb-6 flex items-start gap-2">
                                    <Lock className="w-4 h-4 mt-0.5" />
                                    <p>Estas notas são estritamente confidenciais e visíveis apenas para você e administradores autorizados. Não são partilhadas com o colaborador.</p>
                                </div>
                                <textarea
                                    className="flex-1 w-full p-6 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-sm text-slate-700 leading-relaxed"
                                    placeholder="Digite aqui as suas observações privadas, impressões sobre o estado emocional, temas sensíveis, etc."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                />
                            </div>
                        )}

                        {/* VIEW: ACTION PLAN */}
                        {sessionMode === 'plan' && (
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Adicionar Novo Objetivo</h3>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Ex: Realizar pausas de 5 min a cada hora"
                                            value={newAction.goal}
                                            onChange={(e) => setNewAction({ ...newAction, goal: e.target.value })}
                                        />
                                        <input
                                            type="date"
                                            className="w-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={newAction.deadline}
                                            onChange={(e) => setNewAction({ ...newAction, deadline: e.target.value })}
                                        />
                                        <button
                                            onClick={addActionItem}
                                            className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-slate-800">Plano Atual</h3>
                                    {actionPlan.length === 0 && <p className="text-slate-500 italic">Nenhum objetivo definido.</p>}
                                    {actionPlan.map(item => (
                                        <div key={item.id} className={`bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between transition-all ${item.status === 'done' ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => toggleActionItem(item.id)}
                                                    className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${item.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white'}`}
                                                >
                                                    {item.status === 'done' && <CheckSquare className="w-4 h-4" />}
                                                </button>
                                                <span className={`${item.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                    {item.goal}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-xs px-2 py-1 rounded border ${item.status === 'done' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    {new Date(item.deadline).toLocaleDateString()}
                                                </span>
                                                <button onClick={() => deleteActionItem(item.id)} className="text-slate-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* VIEW: HISTORY */}
                        {sessionMode === 'history' && (
                            <div className="max-w-3xl mx-auto">
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Histórico de Sessões</h3>
                                <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                                    {/* Current Session (Visual Placeholder) */}
                                    <div className="ml-6">
                                        <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white"></span>
                                        <h4 className="font-bold text-indigo-700">Hoje (Em andamento)</h4>
                                        <p className="text-sm text-slate-500">Sessão atual de check-in.</p>
                                    </div>

                                    {/* Previous Sessions */}
                                    {sessions.filter(s => s.id !== activeSession.id && s.participantOrGroup === activeSession.participantOrGroup && s.status === 'completed').map(hist => (
                                        <div key={hist.id} className="ml-6">
                                            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white"></span>
                                            <h4 className="font-bold text-slate-700">{new Date(hist.date).toLocaleDateString()}</h4>
                                            <p className="text-sm text-slate-500 mb-2">{hist.type === 'individual' ? 'Check-in Individual' : 'Grupo Focal'}</p>
                                            {hist.privateNotes && (
                                                <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-600">
                                                    <span className="font-semibold text-xs uppercase text-slate-400 block mb-1">Notas:</span>
                                                    {hist.privateNotes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: MAIN LIST VIEW ---
    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Sessões e Guia Estruturado</h2>
                    <p className="text-slate-500">Gestão de check-ins individuais e planos de ação.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsConfiguringGuide(true)}
                        className="px-4 py-1.5 rounded-md text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Settings className="w-4 h-4" /> Configurar Guia
                    </button>
                    <div className="flex bg-slate-200 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('individual')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'individual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            Individual
                        </button>
                        <button
                            onClick={() => setActiveTab('focus_group')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'focus_group' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            Grupos Focais
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Scheduler Card */}
                <div className="md:col-span-1 bg-indigo-50 border border-indigo-100 p-6 rounded-xl h-fit">
                    <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Agendar Nova Sessão
                    </h3>
                    <p className="text-sm text-indigo-700/80 mb-6">
                        {activeTab === 'individual'
                            ? 'Agende conversas individuais para acompanhar o bem-estar pessoal, definir planos de ação e registrar notas confidenciais.'
                            : 'Organize sessões de grupo para discutir temas específicos e recolher feedback coletivo.'}
                    </p>
                    <button
                        onClick={() => setIsScheduling(true)}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                    >
                        Agendar {activeTab === 'individual' ? 'Check-in' : 'Grupo Focal'}
                    </button>
                </div>

                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    {filteredSessions.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                            Nenhuma sessão agendada.
                        </div>
                    ) : (
                        filteredSessions.map(session => (
                            <div key={session.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${session.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {activeTab === 'individual' ? <User className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800 text-lg">{session.participantOrGroup}</h4>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {session.date}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs border ${session.status === 'completed'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {session.status === 'completed' ? 'Realizada' : 'Agendada'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDeleteSession(session.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        title="Excluir Sessão"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleOpenSession(session)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 justify-center sm:justify-start ${session.status === 'completed'
                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                            : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-200'
                                            }`}
                                    >
                                        {session.status === 'completed' ? <Edit3 className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                                        {session.status === 'completed' ? 'Ver / Editar' : 'Iniciar Sessão'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MODAL: SCHEDULE NEW SESSION */}
            {isScheduling && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-fade-in overflow-hidden">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Agendar Nova Sessão</h3>
                            <button onClick={() => setIsScheduling(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {activeTab === 'individual' ? 'Nome do Colaborador' : 'Nome do Grupo / Equipe'}
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={activeTab === 'individual' ? 'Ex: João Silva' : 'Ex: Equipe de Vendas'}
                                    value={newSessionData.name}
                                    onChange={(e) => setNewSessionData({ ...newSessionData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                                <input
                                    type="date"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newSessionData.date}
                                    onChange={(e) => setNewSessionData({ ...newSessionData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                <select
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    value={newSessionData.type}
                                    onChange={(e) => setNewSessionData({ ...newSessionData, type: e.target.value as any })}
                                >
                                    <option value="individual">Individual</option>
                                    <option value="focus_group">Grupo Focal</option>
                                </select>
                            </div>
                            <button
                                onClick={handleScheduleSession}
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 mt-2 transition-colors"
                            >
                                Confirmar Agendamento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: CONFIGURE GUIDE */}
            {isConfiguringGuide && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl animate-fade-in overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-600" /> Configurar Guia Estruturado
                            </h3>
                            <button onClick={() => setIsConfiguringGuide(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <p className="text-sm text-slate-500 mb-4">
                                Adicione perguntas personalizadas que aparecerão na seção "Questões Adicionais" de todas as sessões.
                            </p>

                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="Digite a nova pergunta..."
                                    value={newQuestionText}
                                    onChange={(e) => setNewQuestionText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                                />
                                <button
                                    onClick={handleAddQuestion}
                                    className="bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {customQuestions.length === 0 && (
                                    <p className="text-center text-slate-400 text-sm italic py-4">Nenhuma questão personalizada definida.</p>
                                )}
                                {customQuestions.map((q, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-200">
                                        <span className="text-sm text-slate-700">{q}</span>
                                        <button onClick={() => handleRemoveQuestion(idx)} className="text-red-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setIsConfiguringGuide(false)}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                            >
                                Concluído
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SessionsView;
