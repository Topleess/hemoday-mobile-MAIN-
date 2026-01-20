import React from 'react';
import { Scale, FlaskConical, ChevronRight, ListFilter, Pill } from 'lucide-react';
import { Header, Card } from '../../components';

interface MyDataScreenProps {
    onBack: () => void;
}

export const MyDataScreen: React.FC<MyDataScreenProps> = ({ onBack }) => {
    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
            <Header title="Мои данные" onBack={onBack} />

            <div className="p-4 space-y-6">
                {/* Weight Section */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase ml-1 mb-2">Общие</h3>
                    <Card className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                <Scale size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Последний вес</p>
                                <p className="text-xs text-gray-400">Обновлено: 11 сен 2025</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">70</span>
                            <span className="text-sm text-gray-500">кг</span>
                        </div>
                    </Card>
                </div>

                {/* Analyses Types Section */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Шаблоны анализов</h3>
                        <button className="text-red-500 text-xs font-bold uppercase hover:bg-red-50 px-2 py-1 rounded">Добавить</button>
                    </div>
                    <div className="space-y-2">
                        <Card className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FlaskConical size={20} className="text-gray-400" />
                                <span className="font-medium text-gray-900">Общий анализ крови</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Card>
                        <Card className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FlaskConical size={20} className="text-gray-400" />
                                <span className="font-medium text-gray-900">Биохимия</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Card>
                    </div>
                </div>

                {/* Parameters Section */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Параметры</h3>
                        <button className="text-red-500 text-xs font-bold uppercase hover:bg-red-50 px-2 py-1 rounded">Добавить</button>
                    </div>
                    <div className="space-y-2">
                        <Card className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ListFilter size={20} className="text-gray-400" />
                                <span className="font-medium text-gray-900">Гемоглобин</span>
                            </div>
                            <span className="text-sm text-gray-400">г/л</span>
                        </Card>
                        <Card className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ListFilter size={20} className="text-gray-400" />
                                <span className="font-medium text-gray-900">Ферритин</span>
                            </div>
                            <span className="text-sm text-gray-400">нг/мл</span>
                        </Card>
                    </div>
                </div>

                {/* Chelators Section */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Препараты (Хелаторы)</h3>
                        <button className="text-red-500 text-xs font-bold uppercase hover:bg-red-50 px-2 py-1 rounded">Добавить</button>
                    </div>
                    <div className="space-y-2">
                        <Card className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Pill size={20} className="text-purple-400" />
                                <span className="font-medium text-gray-900">Десферал</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Card>
                        <Card className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Pill size={20} className="text-purple-400" />
                                <span className="font-medium text-gray-900">Эксиджад</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
