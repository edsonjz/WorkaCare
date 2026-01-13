import React from 'react';
import { Activity, Zap, AlertTriangle, DollarSign, Dumbbell, Brain, Heart, Users } from 'lucide-react';
import { KPIMetric } from '../../types';

interface KPICardsProps {
    metrics: KPIMetric[];
}

const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
    const getIcon = (label: string) => {
        if (label.includes('Engajamento')) return <Zap className="w-4 h-4 text-teal-500" />;
        if (label.includes('Burnout')) return <AlertTriangle className="w-4 h-4 text-red-500" />;
        if (label.includes('Material') || label.includes('Financeiro')) return <DollarSign className="w-4 h-4 text-blue-500" />;
        if (label.includes('Física')) return <Dumbbell className="w-4 h-4 text-emerald-500" />;
        if (label.includes('Mental')) return <Brain className="w-4 h-4 text-purple-500" />;
        if (label.includes('Social')) return <Heart className="w-4 h-4 text-pink-500" />;
        if (label.includes('Participação')) return <Users className="w-4 h-4 text-slate-500" />;
        return <Activity className="w-4 h-4 text-slate-400" />;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {metrics.map((kpi) => {
                const isNegative = kpi.inverse ? kpi.value > 40 : kpi.value < 50;
                return (
                    <div key={kpi.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-full opacity-5 transition-opacity group-hover:opacity-10 ${isNegative && kpi.inverse ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wide truncate pr-2" title={kpi.label}>{kpi.label}</span>
                            {getIcon(kpi.label)}
                        </div>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <span className="text-2xl font-bold text-slate-800">{kpi.value}<span className="text-sm font-normal text-slate-400">{kpi.unit}</span></span>
                            {kpi.change !== 0 && (
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KPICards;
