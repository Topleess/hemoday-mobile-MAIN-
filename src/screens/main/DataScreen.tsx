import React, { useState, useMemo } from 'react';
import { Plus, Droplet, FlaskConical, Bell, ChevronRight, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { Card, Header, Button, HemoglobinChart, AnalysisCard, ErrorBoundary, DatePicker } from '../../components';
import { ScreenName } from '../../types';
import withObservables from '@nozbe/with-observables';
import { database } from '../../database';
import Transfusion from '../../database/models/Transfusion';
import Analysis from '../../database/models/Analysis';
import Reminder from '../../database/models/Reminder';

interface DataScreenProps {
    transfusions: Transfusion[];
    analyses: Analysis[];
    reminders: Reminder[];
    onNavigate: (s: ScreenName) => void;
    onEdit: (type: 'transfusion' | 'analysis' | 'reminder', item: any) => void;

    // Lifted state props
    activeTab: 'transfusions' | 'analyses' | 'reminders' | 'chart';
    onTabChange: (tab: 'transfusions' | 'analyses' | 'reminders' | 'chart') => void;
}

const DataScreenComponent: React.FC<DataScreenProps> = ({ transfusions, analyses, reminders, onNavigate, onEdit, activeTab, onTabChange }) => {
    // Chart view state
    const [showBefore, setShowBefore] = useState(true);
    const [showAfter, setShowAfter] = useState(true);
    const [showChelators, setShowChelators] = useState(true);

    // Calculate earliest date for default filter
    const earliestDate = useMemo(() => {
        const allDates: string[] = [];
        transfusions.forEach(t => allDates.push(t.date));
        analyses.forEach(a => allDates.push(a.date));
        reminders.forEach(r => allDates.push(r.date));

        if (allDates.length === 0) {
            const d = new Date();
            d.setMonth(d.getMonth() - 1);
            return d.toISOString().split('T')[0];
        }

        allDates.sort(); // String sort works for YYYY-MM-DD
        return allDates[0];
    }, [transfusions.length, analyses.length, reminders.length]); // Optimize dependency to length to avoid deep recalculations on every render, though strictly should be content. 
    // Actually, passing the arrays is safer and typically fine for these list sizes.
    // Let's stick to simple deps for correctness first.

    // Date filter state
    // Initialize once with earliest date to capture everything by default
    const [startDate, setStartDate] = useState(earliestDate);

    // Only update start date if a NEW record appears that is OLDER than the current start date.
    // This prevents the filter from jumping if the user is just looking at data, 
    // but ensures if they add a historical record, it becomes visible.
    React.useEffect(() => {
        if (earliestDate < startDate) {
            setStartDate(earliestDate);
        }
    }, [earliestDate]);

    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const sortItems = <T extends { date: string; createdAt?: number | Date }>(items: T[]) => {
        return items.sort((a, b) => {
            // Primary: Date Descending
            if (a.date > b.date) return -1;
            if (a.date < b.date) return 1;

            // Secondary: CreatedAt Descending
            // Normalize createdAt to number
            const tA = a.createdAt instanceof Date ? a.createdAt.getTime() : (typeof a.createdAt === 'number' ? a.createdAt : 0);
            const tB = b.createdAt instanceof Date ? b.createdAt.getTime() : (typeof b.createdAt === 'number' ? b.createdAt : 0);

            return tB - tA;
        });
    };

    // Filter items based on date range
    const filteredTransfusions = useMemo(() => {
        const filtered = transfusions.filter(t => t.date >= startDate && t.date <= endDate);
        return sortItems([...filtered]);
    }, [transfusions, startDate, endDate]);

    const filteredAnalyses = useMemo(() => {
        const filtered = analyses.filter(a => a.date >= startDate && a.date <= endDate);
        return sortItems([...filtered]);
    }, [analyses, startDate, endDate]);

    const filteredReminders = useMemo(() => {
        const filtered = reminders.filter(r => r.date >= startDate && r.date <= endDate);
        return sortItems([...filtered]);
    }, [reminders, startDate, endDate]);

    // Filter chart data from transfusions only
    const chartData = useMemo(() => {
        const points: { date: Date; value: number; type: 'analysis' | 'transfusion_before' | 'transfusion_after'; hasChelator?: boolean }[] = [];
        filteredTransfusions.forEach(t => {
            const hasChelator = !!t.chelator && t.chelator !== 'none';
            points.push({ date: new Date(t.date), value: t.hbBefore, type: 'transfusion_before', hasChelator });
            points.push({ date: new Date(t.date), value: t.hbAfter, type: 'transfusion_after', hasChelator });
        });

        // Chart needs chronological order (Ascending)
        return points.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [filteredTransfusions]);

    return (
        <div className="pb-24">
            <div className="sticky top-0 z-30 bg-[#f3f4f6]/95 backdrop-blur-xl border-b border-gray-200/50">
                <Header title="Данные" className="!static !bg-transparent !border-none !py-4" />

                <div className="px-4 pb-3">
                    <div className="flex bg-gray-200/50 p-1 rounded-xl shadow-inner overflow-x-auto no-scrollbar mb-3 gap-1">
                        {(['transfusions', 'analyses', 'reminders', 'chart'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onTabChange(tab)}
                                className={`flex-shrink-0 min-w-[100px] px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-white text-red-500 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab === 'transfusions' ? 'Переливания' : tab === 'analyses' ? 'Анализы' : tab === 'reminders' ? 'Напоминания' : 'График'}
                            </button>
                        ))}
                    </div>

                    {/* Date Filters - Show for ALL tabs now */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1">
                            <DatePicker
                                value={startDate}
                                onChange={setStartDate}
                            />
                        </div>

                        <span className="text-gray-300 font-bold text-xl pb-0.5">-</span>

                        <div className="flex-1">
                            <DatePicker
                                value={endDate}
                                onChange={setEndDate}
                                align="right"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-2">
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

                            <HemoglobinChart
                                data={chartData}
                                showBefore={showBefore}
                                showAfter={showAfter}
                                showChelators={showChelators}
                            />
                        </Card>

                        {/* Chart Controls - Moved Below */}
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                            <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer select-none active:scale-95 transition-transform">
                                <input
                                    type="checkbox"
                                    checked={showBefore}
                                    onChange={(e) => setShowBefore(e.target.checked)}
                                    className="w-4 h-4 rounded text-gray-500 focus:ring-gray-500"
                                />
                                <span className="text-sm font-medium text-gray-600">Hb До</span>
                            </label>
                            <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer select-none active:scale-95 transition-transform">
                                <input
                                    type="checkbox"
                                    checked={showAfter}
                                    onChange={(e) => setShowAfter(e.target.checked)}
                                    className="w-4 h-4 rounded text-red-500 focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-600">Hb После</span>
                            </label>
                            <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer select-none active:scale-95 transition-transform">
                                <input
                                    type="checkbox"
                                    checked={showChelators}
                                    onChange={(e) => setShowChelators(e.target.checked)}
                                    className="w-4 h-4 rounded text-green-500 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-600">Хелаторы</span>
                            </label>
                        </div>
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
                    {activeTab === 'transfusions' && filteredTransfusions.map((item) => (
                        <Card key={item.id} className="p-5 cursor-pointer hover:bg-gray-50 border border-transparent hover:border-red-100 transition-all" onClick={() => onEdit('transfusion', item)}>
                            <div className="flex items-center gap-3 mb-4">
                                <Droplet className="text-red-500" fill="currentColor" />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                        {item.component || 'Переливание'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Объём:</span>
                                    <span className="font-medium">{item.volume} мл</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Hb до:</span>
                                    <span className="font-medium">{item.hbBefore} г/л</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Hb после:</span>
                                    <span className="font-medium">{item.hbAfter} г/л</span>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {activeTab === 'reminders' && filteredReminders.map((item) => (
                        <Card key={item.id} className="p-5 cursor-pointer hover:bg-gray-50 border border-transparent hover:border-indigo-100 transition-all" onClick={() => onEdit('reminder', item)}>
                            <div className="flex items-center gap-3 mb-2">
                                <Bell className="text-indigo-500" />
                                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                            </div>
                            <p className="text-gray-500 text-sm mb-2">{item.date}</p>
                        </Card>
                    ))}
                    {activeTab === 'analyses' && filteredAnalyses.map((item) => (
                        <ErrorBoundary key={item.id} fallback={<div className="p-4 mb-3 bg-red-50 text-red-500 rounded-xl">Ошибка отображения анализа</div>}>
                            <AnalysisCard
                                analysis={item}
                                onEdit={(item) => onEdit('analysis', item)}
                            />
                        </ErrorBoundary>
                    ))}

                    {/* Empty states */}
                    {activeTab === 'transfusions' && filteredTransfusions.length === 0 && (
                        <div className="text-center py-10 text-gray-400">Нет данных за выбранный период</div>
                    )}
                    {activeTab === 'analyses' && filteredAnalyses.length === 0 && (
                        <div className="text-center py-10 text-gray-400">Нет данных за выбранный период</div>
                    )}
                    {activeTab === 'reminders' && filteredReminders.length === 0 && (
                        <div className="text-center py-10 text-gray-400">Нет данных за выбранный период</div>
                    )}
                </div>
            </div>
        </div >
    );
};

const enhance = withObservables([], () => ({
    transfusions: database.get<Transfusion>('transfusions').query().observe(),
    analyses: database.get<Analysis>('analyses').query().observe(),
    reminders: database.get<Reminder>('reminders').query().observe(),
}));

export default enhance(DataScreenComponent);
