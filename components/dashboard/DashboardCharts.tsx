import React from 'react';
import {
    AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Radar, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie
} from 'recharts';
import { Heart, Target, Smile, TrendingUp, Users } from 'lucide-react';
import Card from '../ui/Card';
import { CategoryScore, ChartDataPoint, DepartmentData } from '../../types';

interface DashboardChartsProps {
    categoryScores: CategoryScore[];
    chartData: ChartDataPoint[];
    deptData: DepartmentData[];
    moodData: any[];
    pulseValue: number;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({
    categoryScores,
    chartData,
    deptData,
    moodData,
    pulseValue
}) => {
    const radarData = categoryScores.length > 0 ? categoryScores.map(cat => ({
        subject: cat.name,
        A: cat.score,
        fullMark: 100
    })) : [
        { subject: 'Mental', A: 0, fullMark: 100 },
        { subject: 'Físico', A: 0, fullMark: 100 },
        { subject: 'Social', A: 0, fullMark: 100 },
        { subject: 'Material', A: 0, fullMark: 100 },
        { subject: 'Liderança', A: 0, fullMark: 100 },
        { subject: 'DEI', A: 0, fullMark: 100 },
    ];

    return (
        <div className="space-y-6">
            {/* Row 2: Organizational Health Index (Bar) & Radar 360 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Saúde Organizacional Detalhada" icon={<Heart className="w-4 h-4 text-rose-500" /> as any}>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryScores} layout="vertical" margin={{ left: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                                    {categoryScores.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Radar 360º (Físico, Mental, Pulse)" icon={<Target className="w-4 h-4 text-emerald-500" /> as any}>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Média Atual" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Row 3: Pulse Analysis & Evolution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Termômetro de Humor & Energia" icon={<Smile className="w-4 h-4 text-teal-500" /> as any} className="lg:col-span-1">
                    <div className="h-64 relative">
                        {moodData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                                Sem dados de Pulse Check
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={moodData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {moodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4 pointer-events-none">
                            <span className="text-3xl font-bold text-slate-800">{pulseValue}</span>
                            <span className="block text-xs text-slate-500">Média Geral</span>
                        </div>
                    </div>
                </Card>

                <Card title="Evolução: Mental, Físico e Material" icon={<TrendingUp className="w-4 h-4 text-blue-500" /> as any} className="lg:col-span-2">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorMental" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a4de6c" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#a4de6c" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorFisico" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMaterial" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#83a6ed" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#83a6ed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Area type="monotone" dataKey="mental" stroke="#a4de6c" fillOpacity={1} fill="url(#colorMental)" name="Saúde Mental" />
                                <Area type="monotone" dataKey="fisico" stroke="#ffc658" fillOpacity={1} fill="url(#colorFisico)" name="Saúde Física" />
                                <Area type="monotone" dataKey="material" stroke="#83a6ed" fillOpacity={1} fill="url(#colorMaterial)" name="Bem-Estar Material" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Row 4: Department Breakdown */}
            <Card title="Análise Dimensional por Departamento" icon={<Users className="w-4 h-4 text-slate-600" /> as any}>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend />
                            <Bar dataKey="mental" fill="#a4de6c" name="Mental" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="fisico" fill="#ffc658" name="Físico" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="material" fill="#83a6ed" name="Material" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="stress" fill="#14b8a6" name="Engajamento" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default DashboardCharts;
