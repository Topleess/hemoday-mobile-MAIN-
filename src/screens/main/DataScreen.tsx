import React, { useState, useMemo } from 'react';
import { Plus, Droplet, FlaskConical, Bell, ChevronRight, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { Card, Header, Button, HemoglobinChart } from '../../components';
import { Transfusion, Analysis, Reminder, ScreenName } from '../../types';
import { MOCK_ANALYSES, MOCK_REMINDERS } from '../../data/mockData';

interface DataScreenProps {
    transfusions: Transfusion[];
    analyses: Analysis[];
    reminders: Reminder[];
    onNavigate: (s: ScreenName) => void;
    onEdit: (type: 'transfusion' | 'analysis' | 'reminder', item: any) => void;
}

const DataScreen: React.FC<DataScreenProps> = ({ transfusions, onNavigate, onEdit }) => {
    const [activeTab, setActiveTab] = useState<'transfusions' | 'analyses' | 'reminders' | 'chart'>('transfusions');
    const [chartPeriod, setChartPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');

    const chartData = useMemo(() => {
        const points: { date: Date; value: number; type: 'analysis' | 'transfusion_before' | 'transfusion_after' }[] = [];
        transfusions.forEach(t => {
            points.push({ date: new Date(t.date), value: t.hbBefore, type: 'transfusion_before' });
            points.push({ date: new Date(t.date), value: t.hbAfter, type: 'transfusion_after' });
        });
        MOCK_ANALYSES.forEach(a => {
            const hbItem = a.items.find(i => i.name.toLowerCase().includes('гемоглобин'));
            if (hbItem) {
                points.push({ date: new Date(a.date), value: parseFloat(hbItem.value), type: 'analysis' });
            }
        });
        return points.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [transfusions]);

    return (
        <div className="pb-24">
            {/* Sticky Container for Header and Tabs */}
            <div className="sticky top-0 z-30 bg-[#f3f4f6]/95 backdrop-blur-xl border-b border-gray-200/50">
                <Header title="Данные" className="!static !bg-transparent !border-none !py-4" />

                <div className="px-4 pb-3">
                    <div className="flex bg-gray-200/50 p-1 rounded-xl shadow-inner overflow-x-auto no-scrollbar">
                        {(['transfusions', 'analyses', 'reminders', 'chart'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 min-w-[90px] py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab
                                        ? 'bg-white text-red-500 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab === 'transfusions' ? 'Переливания' : tab === 'analyses' ? 'Анализы' : tab === 'reminders' ? 'Напоминания' : 'График'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-4">
                {activeTab === 'chart' && (
                    <div className="px-4 space-y-4">
                        <Card className="p-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-red-500" />
                                    Уровень гемоглобина
                                </h3>
                                <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold">
                                    г/л
                                </div>
                            </div>

                            <HemoglobinChart data={chartData} period={chartPeriod} />

                            <div className="mt-6 flex justify-between bg-gray-50 rounded-lg p-1">
                                {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setChartPeriod(p)}
                                        className={`text-xs py-1.5 px-3 rounded-md font-medium transition-colors ${chartPeriod === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {p === '1M' ? '1 мес' : p === '3M' ? '3 мес' : p === '6M' ? '6 мес' : p === '1Y' ? '1 год' : 'Все'}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <div className="text-xs text-gray-400 text-center px-4">
                            График строится на основе данных о переливаниях (Hb до/после) и результатов анализов.
                        </div>
                    </div>
                )}

                {activeTab !== 'chart' && (
                    <div className="px-4 mb-4">
                        <Card className="flex items-center justify-between py-3 px-4">
                            <span className="text-sm font-medium text-gray-900">23.04.2020</span>
                            <span className="text-xs text-gray-400">до</span>
                            <span className="text-sm font-medium text-gray-900">23.04.2024</span>
                            <CalendarIcon size={18} className="text-gray-400" />
                        </Card>
                    </div>
                )}

                {activeTab !== 'chart' && (
                    <div className="px-4 mb-4">
                        <Button fullWidth onClick={() => {
                            if (activeTab === 'transfusions') onNavigate('ADD_TRANSFUSION');
                            else if (activeTab === 'analyses') onNavigate('ADD_ANALYSIS');
                            else onNavigate('ADD_REMINDER');
                        }}>
                            <Plus size={20} />
                            {activeTab === 'transfusions' ? 'ДОБАВИТЬ ПЕРЕЛИВАНИЕ' : activeTab === 'analyses' ? 'ДОБАВИТЬ АНАЛИЗ' : 'ДОБАВИТЬ НАПОМИНАНИЕ'}
                        </Button>
                    </div>
                )}

                <div className="px-4 space-y-4">
                    {activeTab === 'transfusions' && transfusions.map((item) => (
                        <Card key={item.id} className="p-5 cursor-pointer hover:bg-gray-50 border border-transparent hover:border-red-100 transition-all" onClick={() => onEdit('transfusion', item)}>
                            <div className="flex items-center gap-3 mb-4">
                                <Droplet className="text-red-500" fill="currentColor" />
                                <h3 className="text-lg font-bold text-gray-900">
                                    {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Объём:</span>
                                    <span className="font-medium">{item.volume} мл</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Объём/кг:</span>
                                    <span className="font-medium">{item.volumePerKg.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Hb до:</span>
                                    <span className="font-medium">{item.hbBefore} г/л</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Hb после:</span>
                                    <span className="font-medium">{item.hbAfter} г/л</span>
                                </div>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ΔHb:</span>
                                    <span className="font-medium text-green-500">+{item.deltaHb} г/л</span>
                                </div>
                                {item.chelator && (
                                    <div className="flex justify-between mt-1">
                                        <span className="text-purple-500">Хеллатор:</span>
                                        <span className="font-medium text-purple-600">{item.chelator}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}

                    {activeTab === 'analyses' && MOCK_ANALYSES.map((item) => (
                        <Card key={item.id} className="p-5 cursor-pointer hover:bg-gray-50 border border-transparent hover:border-blue-100 transition-all" onClick={() => onEdit('analysis', item)}>
                            <div className="flex items-center gap-3 mb-4">
                                <FlaskConical className="text-blue-500" />
                                <h3 className="text-lg font-bold text-gray-900">
                                    {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>
                            </div>
                            {item.items.map((sub, idx) => (
                                <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-600">{sub.name}</span>
                                    <span className="font-medium">{sub.value} <span className="text-gray-400 text-xs">{sub.unit}</span></span>
                                </div>
                            ))}
                        </Card>
                    ))}

                    {activeTab === 'reminders' && MOCK_REMINDERS.map((item) => (
                        <Card key={item.id} className="p-5 cursor-pointer hover:bg-gray-50 border border-transparent hover:border-indigo-100 transition-all" onClick={() => onEdit('reminder', item)}>
                            <div className="flex items-center gap-3 mb-2">
                                <Bell className="text-indigo-500" />
                                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                            </div>
                            <p className="text-gray-500 text-sm mb-2">{item.date} в {item.time}</p>
                            <div className="flex gap-2">
                                <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-md">{item.repeat}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DataScreen;
