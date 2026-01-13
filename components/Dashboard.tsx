
import React, { useEffect, useState } from 'react';
import { Sparkles, ClipboardList, X, Download } from 'lucide-react';
import { MOCK_SURVEYS } from '../services/mockData';
import { storageService } from '../services/storageService';
import { analyzeWellbeingData } from '../services/geminiService';
import { AnalysisReport, KPIMetric, ChartDataPoint, DepartmentData, SurveyResponse, CategoryScore, UserRole } from '../types';

// Components
import KPICards from './dashboard/KPICards';
import AIAnalysisSection from './dashboard/AIAnalysisSection';
import DashboardCharts from './dashboard/DashboardCharts';
import ResponseTable from './dashboard/ResponseTable';
import Button from './ui/Button';

interface DashboardProps {
    role: UserRole;
    userId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ role, userId }) => {
    const [metrics, setMetrics] = useState<KPIMetric[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [deptData, setDeptData] = useState<DepartmentData[]>([]);
    const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
    const [responses, setResponses] = useState<SurveyResponse[]>([]);
    const [moodData, setMoodData] = useState<any[]>([]);

    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    const isOperator = role === 'operator';

    useEffect(() => {
        refreshData();
    }, [userId]);

    const refreshData = async () => {
        setLoadingData(true);
        try {
            const filterId = isOperator ? userId : undefined;

            const [dataMetrics, dataChart, dataDept, dataCats, allResponses, dataMood] = await Promise.all([
                storageService.getDashboardMetrics(filterId),
                storageService.getChartData(filterId),
                storageService.getDepartmentData(filterId),
                storageService.getCategoryScores(filterId),
                storageService.getAllResponses(filterId),
                storageService.getMoodDistribution(filterId)
            ]);

            setMetrics(dataMetrics);
            setChartData(dataChart);
            setDeptData(dataDept);
            setCategoryScores(dataCats);
            setResponses(allResponses);
            setMoodData(dataMood);
        } catch (err) {
            console.error('Error refreshing dashboard data:', err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleGenerateInsights = async (currentMetrics = metrics, currentCharts = chartData) => {
        if (currentCharts.length === 0) return;
        setLoadingAI(true);
        const result = await analyzeWellbeingData(currentMetrics, currentCharts);
        setReport(result);
        setLoadingAI(false);
    };

    const getQuestionText = (surveyId: string, questionId: string) => {
        const survey = MOCK_SURVEYS.find(s => s.id === surveyId);
        if (!survey) return questionId;
        const q = survey.questions.find(q => q.id === questionId);
        return q ? q.text : questionId;
    };

    const downloadCSV = (data: any[], filename: string) => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + data.map(e => e.join(";")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDeleteResponse = async (id: string) => {
        await storageService.deleteResponse(id);
        refreshData();
    };

    const handleExportAll = () => {
        if (responses.length === 0) return;
        const headers = ["ID Resposta", "Data", "Nome", "Departamento", "Gênero", "Idade", "Tempo Casa", "Questionário", "Categoria", "Score Calculado", "Questão ID", "Texto da Questão", "Resposta"];
        const rows = [headers];

        responses.forEach(resp => {
            const survey = MOCK_SURVEYS.find(s => s.id === resp.surveyId);
            Object.entries(resp.answers).forEach(([qId, answer]) => {
                const qText = survey?.questions.find(q => q.id === qId)?.text || qId;
                const formattedAnswer = Array.isArray(answer) ? answer.join(", ") : String(answer).replace(/(\r\n|\n|\r)/gm, " ");
                rows.push([
                    resp.id,
                    new Date(resp.timestamp).toLocaleDateString('pt-BR'),
                    resp.participant.isAnonymous ? "Anônimo" : resp.participant.name,
                    resp.participant.department,
                    resp.participant.gender || 'N/A',
                    resp.participant.age,
                    resp.participant.tenure,
                    resp.surveyTitle,
                    resp.surveyCategory,
                    String(resp.score || 0),
                    qId,
                    `"${qText.replace(/"/g, '""')}"`,
                    `"${formattedAnswer.replace(/"/g, '""')}"`
                ]);
            });
        });
        downloadCSV(rows, `workacare_completo_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportIndividual = (resp: SurveyResponse) => {
        const headers = ["Questão", "Resposta"];
        const rows = [headers];
        rows.push(["Participante", resp.participant.isAnonymous ? "Anônimo" : resp.participant.name]);
        rows.push(["Departamento", resp.participant.department]);
        rows.push(["Gênero", resp.participant.gender || 'N/A']);
        rows.push(["Data", new Date(resp.timestamp).toLocaleString()]);
        rows.push(["Questionário", resp.surveyTitle]);
        rows.push(["Score", String(resp.score)]);
        rows.push(["---", "---"]);

        const survey = MOCK_SURVEYS.find(s => s.id === resp.surveyId);
        Object.entries(resp.answers).forEach(([qId, answer]) => {
            const qText = survey?.questions.find(q => q.id === qId)?.text || qId;
            const formattedAnswer = Array.isArray(answer) ? answer.join(", ") : String(answer).replace(/(\r\n|\n|\r)/gm, " ");
            rows.push([`"${qText.replace(/"/g, '""')}"`, `"${formattedAnswer.replace(/"/g, '""')}"`]);
        });
        downloadCSV(rows, `resposta_${resp.participant.name || 'anonimo'}_${resp.surveyId}.csv`);
    };

    const pulseValue = metrics.find(m => m.label.includes('Engajamento'))?.value || 0;

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Sincronizando dados com o banco...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {isOperator ? 'Meus Resultados de Bem-Estar' : 'Visão Geral Corporativa'}
                    </h1>
                    <p className="text-slate-500">
                        {isOperator ? 'Acompanhe seu progresso e indicadores de saúde.' : 'Monitoramento 360º de saúde física, mental e material.'}
                    </p>
                </div>
                {!isOperator && (
                    <Button
                        variant="primary"
                        onClick={() => handleGenerateInsights()}
                        disabled={loadingAI || chartData.length === 0}
                        loading={loadingAI}
                        icon={!loadingAI && <Sparkles className="w-4 h-4" />}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        {loadingAI ? 'Processando IA...' : 'Análise Inteligente'}
                    </Button>
                )}
            </div>

            {/* Row 1: KPI Cards */}
            <KPICards metrics={metrics} />

            {/* AI Report Section */}
            {!isOperator && report && <AIAnalysisSection report={report} />}

            {/* Empty State or Charts */}
            {!isOperator && (
                chartData.length === 0 ? (
                    <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
                        <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700">Aguardando Dados</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">
                            Preencha os questionários de Saúde Mental (A), Física (B) e Pulse Check (G) para ativar os gráficos.
                        </p>
                    </div>
                ) : (
                    <DashboardCharts
                        categoryScores={categoryScores}
                        chartData={chartData}
                        deptData={deptData}
                        moodData={moodData}
                        pulseValue={pulseValue}
                    />
                )
            )}

            {/* Raw Data Table - For operators, only show their own responses (already filtered) */}
            <ResponseTable
                responses={responses}
                handleExportAll={handleExportAll}
                setSelectedResponse={setSelectedResponse}
                onDelete={!isOperator ? handleDeleteResponse : undefined}
            />

            {/* Modal Details */}
            {selectedResponse && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{selectedResponse.surveyTitle}</h3>
                                <p className="text-sm text-slate-500">
                                    {new Date(selectedResponse.timestamp).toLocaleString('pt-BR')} &bull; {selectedResponse.participant.name || 'Anônimo'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleExportIndividual(selectedResponse)}
                                    icon={<Download className="w-4 h-4" />}
                                >
                                    Exportar
                                </Button>
                                <button onClick={() => setSelectedResponse(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/50 space-y-4">
                            {Object.entries(selectedResponse.answers).map(([qId, answer], idx) => (
                                <div key={qId} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <p className="text-sm font-medium text-slate-700 mb-2">
                                        <span className="text-indigo-500 mr-2">Q{idx + 1}.</span> {getQuestionText(selectedResponse.surveyId, qId)}
                                    </p>
                                    <div className="bg-slate-50 p-3 rounded text-slate-800 text-sm font-medium">
                                        {Array.isArray(answer) ? answer.join(', ') : String(answer)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
