import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { MOCK_OBSERVATIONS } from '../services/mockData';
import { Observation } from '../types';
import { Eye, Plus, Calendar, User, Save, X, ClipboardCheck } from 'lucide-react';

interface ChecklistItem {
  id: string;
  question: string;
}

interface Section {
  title: string;
  items: ChecklistItem[];
}

const CHECKLIST_SECTIONS: Section[] = [
  {
    title: 'A. Ambiente físico',
    items: [
      { id: 'a1', question: 'As cadeiras e mesas de trabalho são confortáveis e ajustáveis.' },
      { id: 'a2', question: 'A iluminação é adequada, evitando áreas com sombras ou ofuscamento.' },
      { id: 'a3', question: 'A temperatura e ventilação do ambiente são confortáveis.' },
      { id: 'a4', question: 'O nível de ruído no local de trabalho é aceitável e não interfere na concentração.' },
    ]
  },
  {
    title: 'B. Ambiente psicossocial',
    items: [
      { id: 'b1', question: 'As relações entre os colaboradores são cordiais e colaborativas.' },
      { id: 'b2', question: 'Existe frequente comunicação entre colegas de trabalho.' },
      { id: 'b3', question: 'Existe frequente comunicação entre colegas e gestores.' },
      { id: 'b4', question: 'Não ocorrem desacordos/disputas frequentes.' },
    ]
  },
  {
    title: 'C. Carga de Trabalho e Autonomia',
    items: [
      { id: 'c1', question: 'Os colaboradores aparentam gerir bem a sua carga de trabalho.' },
      { id: 'c2', question: 'Os colaboradores tomam decisões relacionadas com as suas funções.' },
      { id: 'c3', question: 'Os colaboradores fazem pausas regulares.' },
    ]
  },
  {
    title: 'D. Reconhecimento e Feedback',
    items: [
      { id: 'd1', question: 'Os gestores/supervisores dão feedback regular e construtivo sobre o desempenho.' },
      { id: 'd2', question: 'Os colegas reconhecem e apreciam os esforços e conquistas uns dos outros.' },
    ]
  },
  {
    title: 'E. Bem-estar emocional',
    items: [
      { id: 'e1', question: 'Os colaboradores têm uma postura relaxada, sem sinais de stress ou ansiedade.' },
      { id: 'e2', question: 'As expressões faciais dos colaboradores transmitem positividade.' },
    ]
  }
];

const SCALES = [
  'Não cumpre',
  'Cumpre pouco/mal',
  'Cumpre',
  'Cumpre muito/bem',
  'Cumpre totalmente',
  'Não aplicável'
];

interface ObservationViewProps {
  userId?: string;
}

const ObservationView: React.FC<ObservationViewProps> = ({ userId }) => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [observerName, setObserverName] = useState('');
  const [obsDate, setObsDate] = useState(new Date().toISOString().split('T')[0]);
  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState('');

  useEffect(() => {
    refreshData();
  }, [userId]);

  const refreshData = async () => {
    setLoading(true);
    const data = await storageService.getAllObservations(userId);
    setObservations(data);
    setLoading(false);
  };

  const handleRadioChange = (itemId: string, value: string) => {
    setChecklistAnswers(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!observerName.trim() || !userId) {
      alert("Por favor, preencha o nome do observador (e verifique login).");
      return;
    }

    // Determine general sentiment
    const sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';

    const obs: Omit<Observation, 'id'> = {
      date: obsDate,
      author: observerName,
      category: 'psicossocial',
      content: `CHECKLIST REALIZADO. Resumo: ${summary || 'Sem resumo adicional.'}`,
      sentiment: sentiment
    };

    try {
      await storageService.saveObservation(obs, userId);
      await refreshData();
      setFormOpen(false);

      // Reset form
      setObserverName('');
      setChecklistAnswers({});
      setSummary('');
    } catch (err) {
      console.error('Error saving observation:', err);
      alert('Erro ao salvar observação.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Observação Direta</h2>
          <p className="text-slate-500">Registo estruturado de fatores ambientais e psicossociais.</p>
        </div>
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Observação
          </button>
        )}
      </div>

      {formOpen ? (
        <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden animate-fade-in">
          <div className="bg-slate-50 p-6 border-b border-slate-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-indigo-600" />
                Observação: Saúde e Bem-estar no Trabalho
              </h3>
              <button onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Observador</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Seu nome"
                    value={observerName}
                    onChange={(e) => setObserverName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data da Observação</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={obsDate}
                    onChange={(e) => setObsDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {CHECKLIST_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">{section.title}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="text-xs text-slate-500 border-b bg-slate-50">
                        <th className="p-3 text-left w-1/3">Critério</th>
                        {SCALES.map((scale, i) => (
                          <th key={i} className="p-2 text-center w-[11%] font-medium">{scale}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-slate-50">
                          <td className="p-3 text-sm text-slate-700 font-medium">{item.question}</td>
                          {SCALES.map((scale) => (
                            <td key={scale} className="p-2 text-center">
                              <input
                                type="radio"
                                name={item.id}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                checked={checklistAnswers[item.id] === scale}
                                onChange={() => handleRadioChange(item.id, scale)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="space-y-2 pt-4 border-t border-slate-200">
              <label className="font-bold text-lg text-slate-800 block">Resumo das Observações Gerais</label>
              <p className="text-sm text-slate-500 mb-2">Adicione outros registos de interesse ou resuma os pontos principais.</p>
              <textarea
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]"
                placeholder="Escreva aqui o seu resumo..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setFormOpen(false)}
                className="px-6 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Save className="w-4 h-4" /> Guardar Registo
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {observations.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
              <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Nenhuma observação registada ainda.</p>
              <p className="text-sm text-slate-400">Clique em "Nova Observação" para começar.</p>
            </div>
          ) : (
            observations.map((obs) => (
              <div key={obs.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800">Checklist de Observação</h4>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" /> {obs.date} &bull; <User className="w-3 h-3" /> {obs.author}
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase tracking-wide">
                      {obs.category}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                      {obs.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ObservationView;