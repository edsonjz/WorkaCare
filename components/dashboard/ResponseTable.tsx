import React from 'react';
import { FileText, FileSpreadsheet, Eye, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { SurveyResponse } from '../../types';

interface ResponseTableProps {
    responses: SurveyResponse[];
    handleExportAll: () => void;
    setSelectedResponse: (resp: SurveyResponse) => void;
    onDelete?: (id: string) => void;
}

const ResponseTable: React.FC<ResponseTableProps> = ({
    responses,
    handleExportAll,
    setSelectedResponse,
    onDelete
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <h3 className="font-semibold text-slate-800">Registro de Respostas</h3>
                    <span className="text-xs font-mono bg-white border px-2 py-1 rounded text-slate-500">
                        {responses.length} REC
                    </span>
                </div>

                <Button
                    variant="success"
                    size="sm"
                    onClick={handleExportAll}
                    disabled={responses.length === 0}
                    icon={<FileSpreadsheet className="w-4 h-4" />}
                >
                    Exportar Completo (CSV)
                </Button>
            </div>
            <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 shadow-sm z-10">
                        <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Colaborador</th>
                            <th className="px-6 py-3">Questionário</th>
                            <th className="px-6 py-3">Score</th>
                            <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {responses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    Nenhum dado disponível.
                                </td>
                            </tr>
                        ) : (
                            responses.map((resp) => (
                                <tr key={resp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 whitespace-nowrap text-slate-600">
                                        {new Date(resp.timestamp).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-slate-800">
                                        {resp.participant.isAnonymous ? 'Anônimo' : resp.participant.name}
                                        <span className="block text-xs text-slate-400 font-normal">{resp.participant.department}</span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">
                                        {resp.surveyTitle}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${(resp.score || 0) >= 80 ? 'bg-green-100 text-green-700' :
                                            (resp.score || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {resp.score}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedResponse(resp)}
                                                className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded transition-colors"
                                                title="Ver Detalhes"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {onDelete && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Tem certeza que deseja excluir este registro de resposta?')) {
                                                            onDelete(resp.id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                                                    title="Excluir Resposta"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResponseTable;
