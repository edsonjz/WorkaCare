
import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, BarChart3, Settings, Plus, Trash2, X } from 'lucide-react';
import { storageService } from '../services/storageService';
import { MOCK_SURVEYS } from '../services/mockData';
import { SurveyResponse } from '../types';

type ReportType = 'general' | 'department' | 'category' | 'kpi' | 'specific_survey';

interface ReportsViewProps {
    userId?: string;
}

const ReportsView: React.FC<ReportsViewProps> = ({ userId }) => {
    const [reportType, setReportType] = useState<ReportType>('general');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [dateRange, setDateRange] = useState('30'); // dias
    const [generatedData, setGeneratedData] = useState<any[] | null>(null);

    // Specific Survey State
    const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');

    // Dynamic Lists
    const [departments, setDepartments] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    // Settings Modal State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [settingsTab, setSettingsTab] = useState<'dept' | 'cat'>('dept');

    useEffect(() => {
        refreshSettings();
    }, [userId]);

    const refreshSettings = async () => {
        const settings = await storageService.getSettings(userId);
        setDepartments(settings.departments);
        setCategories(settings.reportCategories);
    };

    const handleAddItem = async () => {
        if (!newItemText.trim()) return;
        const settings = await storageService.getSettings(userId);

        if (settingsTab === 'dept') {
            settings.departments = [...settings.departments, newItemText];
        } else {
            settings.reportCategories = [...settings.reportCategories, newItemText];
        }

        await storageService.saveSettings(settings, userId);
        refreshSettings();
        setNewItemText('');
    };

    const handleRemoveItem = async (item: string) => {
        const settings = await storageService.getSettings(userId);

        if (settingsTab === 'dept') {
            settings.departments = settings.departments.filter(d => d !== item);
        } else {
            settings.reportCategories = settings.reportCategories.filter(c => c !== item);
        }

        await storageService.saveSettings(settings, userId);
        refreshSettings();
    };

    const handleGenerateReport = async () => {
        const responses = await storageService.getAllResponses();
        let filtered = responses;

        // Filtro de Data (Simulado)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
        filtered = filtered.filter(r => new Date(r.timestamp) >= cutoffDate);

        // Filtro de Departamento
        if (departmentFilter !== 'all') {
            filtered = filtered.filter(r => r.participant.department === departmentFilter);
        }

        // Filtro Específico de Questionário
        if (reportType === 'specific_survey' && selectedSurveyId) {
            filtered = filtered.filter(r => r.surveyId === selectedSurveyId);
        }

        // Processamento baseados no tipo
        let reportData: any[] = [];

        if (reportType === 'general') {
            // Resumo geral por questionário
            const surveyGroups: Record<string, { total: number, sum: number, title: string }> = {};
            filtered.forEach(r => {
                if (!surveyGroups[r.surveyId]) {
                    surveyGroups[r.surveyId] = { total: 0, sum: 0, title: r.surveyTitle };
                }
                surveyGroups[r.surveyId].total++;
                surveyGroups[r.surveyId].sum += (r.score || 0);
            });
            reportData = Object.values(surveyGroups).map(g => ({
                item: g.title,
                metric: 'Média de Score',
                value: Math.round(g.sum / g.total),
                count: g.total
            }));
        } else if (reportType === 'department') {
            // Comparativo entre departamentos (se 'all') ou detalhe do departamento
            const deptGroups: Record<string, { total: number, sum: number }> = {};

            filtered.forEach(r => {
                const dept = r.participant.department || 'N/A';
                if (!deptGroups[dept]) deptGroups[dept] = { total: 0, sum: 0 };
                deptGroups[dept].total++;
                deptGroups[dept].sum += (r.score || 0);
            });
            reportData = Object.keys(deptGroups).map(d => ({
                item: d,
                metric: 'Bem-Estar Geral',
                value: Math.round(deptGroups[d].sum / deptGroups[d].total),
                count: deptGroups[d].total
            }));
        } else if (reportType === 'category') {
            // Por categoria (Mental, Físico, etc)
            const catGroups: Record<string, { total: number, sum: number }> = {};
            filtered.forEach(r => {
                const cat = r.surveyCategory || 'Geral';
                if (!catGroups[cat]) catGroups[cat] = { total: 0, sum: 0 };
                catGroups[cat].total++;
                catGroups[cat].sum += (r.score || 0);
            });
            reportData = Object.keys(catGroups).map(c => ({
                item: c.toUpperCase(),
                metric: 'Score Médio',
                value: Math.round(catGroups[c].sum / catGroups[c].total),
                count: catGroups[c].total
            }));
        } else if (reportType === 'kpi') {
            // KPIs Estratégicos (Alinhado ao Dashboard)
            const kpiIds = {
                'A-mental-wellbeing': 'Saúde Mental',
                'B-physical-wellbeing': 'Saúde Física',
                'C-social-wellbeing': 'Bem-Estar Social',
                'H-financial': 'Bem-Estar Financeiro',
                'G-burnout': 'Risco de Burnout',
                'F-leadership': 'Liderança',
                'I-dei': 'Diversidade & Inclusão'
            };

            const kpiGroups: Record<string, { total: number, sum: number }> = {};

            filtered.forEach(r => {
                // @ts-ignore
                const kpiName = kpiIds[r.surveyId] || (r.surveyCategory === 'social' ? 'Bem-Estar Social' : null);

                if (kpiName) {
                    if (!kpiGroups[kpiName]) kpiGroups[kpiName] = { total: 0, sum: 0 };
                    kpiGroups[kpiName].total++;
                    kpiGroups[kpiName].sum += (r.score || 0);
                }
            });

            reportData = Object.keys(kpiGroups).map(k => ({
                item: k,
                metric: k === 'Risco de Burnout' ? 'Índice de Risco' : 'Índice de Saúde',
                value: Math.round(kpiGroups[k].sum / kpiGroups[k].total),
                count: kpiGroups[k].total
            }));
        } else if (reportType === 'specific_survey') {
            // Detalhe por Questão dentro de um Survey Específico
            const survey = MOCK_SURVEYS.find(s => s.id === selectedSurveyId);

            if (survey) {
                const questionStats: Record<string, { sum: number, count: number, text: string }> = {};

                filtered.forEach(r => {
                    Object.entries(r.answers).forEach(([qId, val]) => {
                        if (typeof val === 'number') {
                            if (!questionStats[qId]) {
                                const qText = survey.questions.find(q => q.id === qId)?.text || qId;
                                questionStats[qId] = { sum: 0, count: 0, text: qText };
                            }
                            questionStats[qId].sum += val;
                            questionStats[qId].count++;
                        }
                    });
                });

                reportData = Object.values(questionStats).map(qs => ({
                    item: qs.text.length > 50 ? qs.text.substring(0, 50) + '...' : qs.text,
                    metric: 'Média da Resposta',
                    value: Math.round((qs.sum / qs.count) * 20), // Normalize to 100 for consistency
                    count: qs.count
                }));
            }
        }

        setGeneratedData(reportData);
    };

    const downloadReportCSV = () => {
        if (!generatedData) return;

        const headers = ["Item / Grupo", "Métrica", "Valor", "Participantes"];
        const rows = [headers];
        generatedData.forEach(row => {
            rows.push([row.item, row.metric, row.value, row.count]);
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(";")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Central de Relatórios</h2>
                    <p className="text-slate-500">Gere relatórios personalizados para análise aprofundada.</p>
                </div>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Settings className="w-4 h-4" /> Gerenciar Opções
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuração do Relatório */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-indigo-600" /> Configuração
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Relatório</label>
                            <select
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                value={reportType}
                                onChange={(e) => {
                                    setReportType(e.target.value as ReportType);
                                    // Reset selection if switching
                                    if (e.target.value !== 'specific_survey') setSelectedSurveyId('');
                                }}
                            >
                                <option value="general">Resumo Geral de Bem-Estar</option>
                                <option value="kpi">Indicadores Estratégicos (KPIs)</option>
                                <option value="department">Comparativo por Departamento</option>
                                <option value="category">Análise por Dimensão (Categorias)</option>
                                <option value="specific_survey">Análise por Questionário Específico</option>
                            </select>
                        </div>

                        {reportType === 'specific_survey' && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Selecione o Questionário</label>
                                <select
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    value={selectedSurveyId}
                                    onChange={(e) => setSelectedSurveyId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {MOCK_SURVEYS.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Departamento (Filtro)</label>
                            <select
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <option value="all">Todos os Departamentos</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Período</label>
                            <select
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="7">Últimos 7 dias</option>
                                <option value="30">Últimos 30 dias</option>
                                <option value="90">Últimos 3 meses</option>
                                <option value="365">Último ano</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerateReport}
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                            <BarChart3 className="w-4 h-4" /> Gerar Relatório
                        </button>
                    </div>
                </div>

                {/* Visualização */}
                <div className="lg:col-span-2 space-y-6">
                    {!generatedData ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center h-full flex flex-col justify-center items-center">
                            <FileText className="w-16 h-16 text-slate-300 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700">Nenhum relatório gerado</h3>
                            <p className="text-slate-500 max-w-sm mt-2">
                                Selecione os parâmetros ao lado e clique em "Gerar Relatório" para visualizar os dados.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Pré-visualização dos Dados</h3>
                                    <p className="text-sm text-slate-500">
                                        {generatedData.length} registros encontrados
                                    </p>
                                </div>
                                <button
                                    onClick={downloadReportCSV}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Exportar CSV
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                        <tr>
                                            <th className="p-4">Item / Grupo</th>
                                            <th className="p-4">Métrica Analisada</th>
                                            <th className="p-4">Valor (Score)</th>
                                            <th className="p-4 text-right">Amostra</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {generatedData.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-slate-400">
                                                    Nenhum dado encontrado para os filtros selecionados.
                                                </td>
                                            </tr>
                                        ) : (
                                            generatedData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="p-4 font-medium text-slate-800">{row.item}</td>
                                                    <td className="p-4 text-slate-600">{row.metric}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${row.value >= 75 ? 'bg-green-100 text-green-700' :
                                                                row.value >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {row.value}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right text-slate-600">{row.count}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-fade-in overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-600" /> Gerenciar Listas Centralizadas
                            </h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setSettingsTab('dept')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${settingsTab === 'dept' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Departamentos
                            </button>
                            <button
                                onClick={() => setSettingsTab('cat')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${settingsTab === 'cat' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Categorias de Relatório
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <p className="text-xs text-slate-500 mb-4 bg-yellow-50 p-2 rounded border border-yellow-100">
                                Nota: As alterações aqui refletem-se em todo o sistema (questionários e filtros), garantindo consistência.
                            </p>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder={settingsTab === 'dept' ? 'Novo Departamento...' : 'Nova Categoria...'}
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                />
                                <button
                                    onClick={handleAddItem}
                                    className="bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {(settingsTab === 'dept' ? departments : categories).map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-200">
                                        <span className="text-sm text-slate-700">{item}</span>
                                        <button onClick={() => handleRemoveItem(item)} className="text-red-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ReportsView;
