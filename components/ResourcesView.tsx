
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Resource } from '../types';
import { BookOpen, PlayCircle, FileText, ExternalLink, X, Clock, Tag, Plus, Save, Trash2 } from 'lucide-react';
import { UserRole } from '../types';

interface ResourcesViewProps {
    role?: UserRole;
    userId?: string;
}

const ResourcesView: React.FC<ResourcesViewProps> = ({ role, userId }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    const isOperator = role === 'operator';
    // Create Mode State
    const [isCreating, setIsCreating] = useState(false);
    const [newRes, setNewRes] = useState<Partial<Resource>>({
        title: '',
        type: 'article',
        category: 'mental',
        duration: '',
        content: ''
    });

    const categoryLabels: Record<string, string> = {
        mental: 'Saúde Mental',
        physical: 'Saúde Física',
        nutrition: 'Nutrição',
        ergonomics: 'Ergonomia'
    };

    useEffect(() => {
        refreshResources();
    }, []);

    const refreshResources = async () => {
        const data = await storageService.getAllResources(userId);
        setResources(data);
    };

    const formatContent = (content?: string) => {
        if (!content) return <p className="text-slate-500 italic">Conteúdo indisponível.</p>;

        // Simple formatter for newlines and bold text (**text**)
        return content.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={i} className="mb-2 text-slate-700 leading-relaxed">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-slate-900">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    const handleDeleteResource = async (id: string) => {
        if (!window.confirm("Deseja excluir este recurso?")) return;
        try {
            await storageService.deleteCustomResource(id);
            refreshResources();
        } catch (err) {
            console.error('Error deleting resource:', err);
        }
    };

    const handleSaveResource = async () => {
        if (!newRes.title || !newRes.content || !userId) {
            alert("Preencha o título e o conteúdo (e verifique se está logado).");
            return;
        }

        const resource: Resource = {
            id: Date.now().toString(),
            title: newRes.title!,
            type: newRes.type as any || 'article',
            category: newRes.category as any || 'mental',
            duration: newRes.duration || '5 min',
            content: newRes.content!,
            thumbnail: '📄'
        };

        await storageService.saveCustomResource(resource, userId);
        refreshResources();
        setIsCreating(false);
        setNewRes({ title: '', type: 'article', category: 'mental', duration: '', content: '' });
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Biblioteca de Recursos</h2>
                    <p className="text-slate-500">Conteúdos curados e personalizados para promoção de bem-estar.</p>
                </div>
                {!isOperator && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" /> Novo Recurso
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {resources.map(resource => (
                    <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
                        <div className="h-32 bg-slate-100 flex items-center justify-center text-4xl group-hover:bg-slate-200 transition-colors">
                            {resource.thumbnail}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded ${resource.category === 'mental' ? 'bg-purple-100 text-purple-700' :
                                    resource.category === 'physical' ? 'bg-green-100 text-green-700' :
                                        resource.category === 'nutrition' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {categoryLabels[resource.category] || resource.category}
                                </span>
                                {resource.type === 'video' ? <PlayCircle className="w-4 h-4 text-slate-400" /> : <FileText className="w-4 h-4 text-slate-400" />}
                                {!isOperator && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteResource(resource.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2 leading-tight flex-1">{resource.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {resource.duration}
                            </p>
                            <button
                                onClick={() => setSelectedResource(resource)}
                                className="w-full py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                            >
                                Acessar <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Resource Modal (View) */}
            {selectedResource && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
                                    {selectedResource.thumbnail}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                            {categoryLabels[selectedResource.category] || selectedResource.category}
                                        </span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1 bg-white border px-2 py-0.5 rounded">
                                            <Clock className="w-3 h-3" /> {selectedResource.duration}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">{selectedResource.title}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedResource(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto bg-white">
                            <div className="prose prose-slate max-w-none">
                                {formatContent(selectedResource.content)}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setSelectedResource(null)}
                                className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Resource Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in overflow-hidden">
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Adicionar Novo Recurso
                            </h3>
                            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Ex: Guia de Meditação Rápida"
                                    value={newRes.title}
                                    onChange={(e) => setNewRes({ ...newRes, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                    <select
                                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                                        value={newRes.type}
                                        onChange={(e) => setNewRes({ ...newRes, type: e.target.value as any })}
                                    >
                                        <option value="article">Artigo</option>
                                        <option value="guide">Guia</option>
                                        <option value="video">Vídeo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                                    <select
                                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                                        value={newRes.category}
                                        onChange={(e) => setNewRes({ ...newRes, category: e.target.value as any })}
                                    >
                                        <option value="mental">Saúde Mental</option>
                                        <option value="physical">Saúde Física</option>
                                        <option value="nutrition">Nutrição</option>
                                        <option value="ergonomics">Ergonomia</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duração Estimada</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                                        placeholder="Ex: 5 min"
                                        value={newRes.duration}
                                        onChange={(e) => setNewRes({ ...newRes, duration: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo (Suporta Markdown simples **negrito**)</label>
                                <textarea
                                    className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-40"
                                    placeholder="Escreva o conteúdo do recurso aqui..."
                                    value={newRes.content}
                                    onChange={(e) => setNewRes({ ...newRes, content: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleSaveResource}
                                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Salvar Recurso
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ResourcesView;
