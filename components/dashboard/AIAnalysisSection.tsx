import React from 'react';
import { Brain } from 'lucide-react';
import { AnalysisReport } from '../../types';

interface AIAnalysisSectionProps {
    report: AnalysisReport;
}

const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ report }) => {
    const getRiskColor = (risk?: string) => {
        switch (risk) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-indigo-50 to-white p-4 border-b border-indigo-100 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-indigo-900">Diagnóstico IA Gemini</h3>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full border ${getRiskColor(report.riskLevel)} uppercase font-bold tracking-wide`}>
                    {report.riskLevel === 'high' ? 'Atenção Crítica' : report.riskLevel === 'medium' ? 'Alerta' : 'Estável'}
                </span>
            </div>
            <div className="p-6">
                <p className="text-slate-700 mb-6 leading-relaxed">{report.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-white transition-colors group">
                            <div className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {idx + 1}
                            </div>
                            <span className="text-slate-700 text-sm">{rec}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AIAnalysisSection;
