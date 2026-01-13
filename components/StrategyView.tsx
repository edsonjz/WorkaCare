import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { SwotItem, StrategicGoal, StrategicResource } from '../types';
import { Plus, Target, Calendar, CheckSquare, Trash2, Coins, Eye, Layers, AlertCircle } from 'lucide-react';

interface StrategyViewProps {
  userId?: string;
}

const StrategyView: React.FC<StrategyViewProps> = ({ userId }) => {
  const [swot, setSwot] = useState<SwotItem[]>([]);
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [resources, setResources] = useState<StrategicResource[]>([]);
  const [vision, setVision] = useState("Ser uma organização de referência onde o bem-estar e a performance coexistem em harmonia.");
  const [newSwotText, setNewSwotText] = useState('');
  const [swotCategory, setSwotCategory] = useState<SwotItem['type']>('strength');
  const [loading, setLoading] = useState(true);

  // Goal inputs
  const [newGoal, setNewGoal] = useState({ text: '', deadline: '', target: '' });
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Resource inputs
  const [newResource, setNewResource] = useState({ item: '', cost: '' });

  useEffect(() => {
    refreshData();
  }, [userId]);

  const refreshData = async () => {
    setLoading(true);
    const swotData = await storageService.getSwot(userId);
    const goalsData = await storageService.getGoals(userId);
    const resData = await storageService.getStrategicResources(userId);

    setSwot(swotData);
    setGoals(goalsData);
    setResources(resData);
    setLoading(false);
  };

  const addSwotItem = async () => {
    if (!newSwotText.trim() || !userId) return;
    try {
      await storageService.saveSwotItem({
        text: newSwotText,
        type: swotCategory
      }, userId);
      await refreshData();
      setNewSwotText('');
    } catch (err) {
      console.error('Error adding swot item:', err);
    }
  };

  const removeSwotItem = async (id: string) => {
    try {
      await storageService.deleteSwotItem(id);
      await refreshData();
    } catch (err) {
      console.error('Error removing swot item:', err);
    }
  };
  const addResource = async () => {
    if (!newResource.item || !newResource.cost || !userId) return;
    try {
      await storageService.saveStrategicResource({
        item: newResource.item,
        cost: parseFloat(newResource.cost),
        allocated: false
      }, userId);
      await refreshData();
      setNewResource({ item: '', cost: '' });
    } catch (err) {
      console.error('Error adding resource:', err);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.text || !newGoal.deadline || !userId) return;
    try {
      await storageService.saveGoal({
        text: newGoal.text,
        status: 'planned',
        deadline: newGoal.deadline,
        kpiTarget: newGoal.target || 'N/A'
      }, userId);
      await refreshData();
      setNewGoal({ text: '', deadline: '', target: '' });
      setIsAddingGoal(false);
    } catch (err) {
      console.error('Error adding goal:', err);
    }
  };

  const renderSwotCard = (title: string, type: SwotItem['type'], colorClass: string, bgClass: string) => (
    <div className={`p-4 rounded-xl border ${colorClass} ${bgClass} flex flex-col h-full`}>
      <h3 className={`font-bold uppercase tracking-wider text-sm mb-4 ${colorClass.replace('border-', 'text-')}`}>
        {title}
      </h3>
      <div className="space-y-2 flex-1">
        {swot.filter(i => i.type === type).map(item => (
          <div key={item.id} className="bg-white/80 p-2 rounded shadow-sm text-sm text-slate-700 flex justify-between group">
            <span>{item.text}</span>
            <button onClick={() => removeSwotItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {swot.filter(i => i.type === type).length === 0 && (
          <span className="text-slate-400 text-sm italic">Nenhum item registrado</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Planejamento Estratégico</h2>
        <p className="text-slate-500">Definição de visão, objetivos, recursos e análise de contexto.</p>
      </div>

      {/* Vision Section */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-lg">
            <Eye className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Visão Organizacional</h3>
            <textarea
              className="w-full bg-transparent text-xl md:text-2xl font-light italic focus:outline-none resize-none"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* SWOT Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Layers className="w-5 h-5" /> Matriz SWOT
          </h3>

          <div className="flex gap-2">
            <select
              className="border border-slate-300 rounded-md text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500"
              value={swotCategory}
              onChange={(e) => setSwotCategory(e.target.value as any)}
            >
              <option value="strength">Força</option>
              <option value="weakness">Fraqueza</option>
              <option value="opportunity">Oportunidade</option>
              <option value="threat">Ameaça</option>
            </select>
            <input
              type="text"
              placeholder="Novo item..."
              className="border border-slate-300 rounded-md text-sm p-1.5 w-64 focus:ring-blue-500 focus:border-blue-500"
              value={newSwotText}
              onChange={(e) => setNewSwotText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSwotItem()}
            />
            <button
              onClick={addSwotItem}
              className="bg-slate-800 text-white p-1.5 rounded-md hover:bg-slate-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
          {renderSwotCard('Forças (Interno)', 'strength', 'border-green-200', 'bg-green-50')}
          {renderSwotCard('Fraquezas (Interno)', 'weakness', 'border-red-200', 'bg-red-50')}
          {renderSwotCard('Oportunidades (Externo)', 'opportunity', 'border-blue-200', 'bg-blue-50')}
          {renderSwotCard('Ameaças (Externo)', 'threat', 'border-orange-200', 'bg-orange-50')}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Goals Section */}
        <section>
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" /> Objetivos SMART
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {goals.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  Nenhum objetivo definido. Clique abaixo para adicionar.
                </div>
              )}
              {goals.map((goal) => (
                <div key={goal.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-slate-800">{goal.text}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${goal.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                      goal.status === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                      {goal.status === 'completed' ? 'Concluído' : goal.status === 'in-progress' ? 'Em Progresso' : 'Planejado'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono bg-slate-100 px-1.5 rounded">{goal.kpiTarget}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 w-full">
                <Plus className="w-4 h-4" /> Adicionar Objetivo
              </button>
            </div>
          </div>
        </section>

        {/* Resources & Budget Section */}
        <section>
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5" /> Orçamento e Recursos
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between">
              <span className="text-sm font-medium text-slate-500">Orçamento Total</span>
              <span className="text-sm font-bold text-slate-800">
                {resources.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /
                R$ 10.000,00
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {resources.length === 0 && (
                <div className="p-6 text-center text-slate-400 italic text-sm">
                  Nenhum recurso alocado.
                </div>
              )}
              {resources.map((res) => (
                <div key={res.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${res.allocated ? 'bg-green-500' : 'bg-orange-400'}`} />
                    <span className="text-sm text-slate-700">{res.item}</span>
                  </div>
                  <span className="font-mono text-sm font-medium text-slate-800">
                    {res.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2">
              <input
                type="text"
                placeholder="Item"
                className="flex-1 text-sm border border-slate-300 rounded px-2 py-1"
                value={newResource.item}
                onChange={e => setNewResource({ ...newResource, item: e.target.value })}
              />
              <input
                type="number"
                placeholder="Valor"
                className="w-24 text-sm border border-slate-300 rounded px-2 py-1"
                value={newResource.cost}
                onChange={e => setNewResource({ ...newResource, cost: e.target.value })}
              />
              <button
                onClick={addResource}
                className="text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded px-3 py-1 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StrategyView;