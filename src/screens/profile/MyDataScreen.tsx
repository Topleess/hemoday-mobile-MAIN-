import React, { useState } from 'react';
import { Scale, FlaskConical, ChevronRight, ListFilter, Pill, Pencil, Check, Plus, Trash2, Droplet, History, FileText } from 'lucide-react';
import { Header, Card, Input, Button } from '../../components';
import withObservables from '@nozbe/with-observables';
import { database } from '../../database';
import Transfusion from '../../database/models/Transfusion';
import ComponentType from '../../database/models/ComponentType';
import ChelatorType from '../../database/models/ChelatorType';
import AnalysisTemplate from '../../database/models/AnalysisTemplate';
import { Q } from '@nozbe/watermelondb';
import { sync } from '../../database/sync';
import { useNotification } from '../../context/NotificationContext';

interface MyDataScreenProps {
    onBack: () => void;
    onEditTemplate: (template: AnalysisTemplate | null) => void;
    transfusions: Transfusion[];
    componentTypes: ComponentType[];
    chelatorTypes: ChelatorType[];
    analysisTemplates: AnalysisTemplate[];
}

const MyDataScreenComponent: React.FC<MyDataScreenProps> = ({ onBack, onEditTemplate, transfusions, componentTypes, chelatorTypes, analysisTemplates }) => {
    const { showAlert, showConfirm, showToast } = useNotification();
    const latestTransfusion = transfusions.length > 0 ? transfusions[0] : null;
    const [isEditingWeight, setIsEditingWeight] = useState(false);
    const [weight, setWeight] = useState(latestTransfusion?.weight?.toString() || '');

    // Component Type editing
    const [showComponentForm, setShowComponentForm] = useState(false);
    const [editingComponent, setEditingComponent] = useState<ComponentType | null>(null);
    const [componentName, setComponentName] = useState('');
    const [componentIcon, setComponentIcon] = useState('droplet');

    // Chelator Type editing
    const [showChelatorForm, setShowChelatorForm] = useState(false);
    const [editingChelator, setEditingChelator] = useState<ChelatorType | null>(null);
    const [chelatorName, setChelatorName] = useState('');

    React.useEffect(() => {
        if (latestTransfusion) {
            setWeight(latestTransfusion.weight.toString());
        }
    }, [latestTransfusion]);

    const handleSaveWeight = async () => {
        if (!latestTransfusion) return;
        try {
            await database.write(async () => {
                await latestTransfusion.update(t => {
                    const newWeight = parseFloat(weight);
                    t.weight = newWeight;
                    t.volumePerKg = t.volume / newWeight;
                });
            });
            setIsEditingWeight(false);
            showToast({ message: 'Вес сохранен', type: 'success' });
            sync().catch(e => console.error('Weight sync failed', e));
        } catch (e) {
            console.error(e);
            showAlert('Ошибка', 'Не удалось сохранить вес.', 'error');
        }
    };

    const handleAddComponent = () => {
        setEditingComponent(null);
        setComponentName('');
        setComponentIcon('droplet');
        setShowComponentForm(true);
    };

    const handleEditComponent = (ct: ComponentType) => {
        setEditingComponent(ct);
        setComponentName(ct.name);
        setComponentIcon(ct.iconName);
        setShowComponentForm(true);
    };

    const handleSaveComponent = async () => {
        if (!componentName.trim()) {
            showAlert('Ошибка', 'Введите название показателя', 'error');
            return;
        }

        try {
            await database.write(async () => {
                if (editingComponent) {
                    await editingComponent.update(ct => {
                        ct.name = componentName;
                        ct.iconName = componentIcon;
                    });
                } else {
                    const maxSort = componentTypes.reduce((max, ct) => Math.max(max, ct.sortOrder), 0);
                    await database.get<ComponentType>('component_types').create(ct => {
                        ct.name = componentName;
                        ct.iconName = componentIcon;
                        ct.isDefault = false;
                        ct.sortOrder = maxSort + 1;
                    });
                }
            });
            setEditingComponent(null);
            setComponentName('');
            setShowComponentForm(false);
            showToast({ message: 'Показатель сохранен', type: 'success' });
            sync().catch(e => console.error('Component sync failed', e));
        } catch (e) {
            console.error(e);
            showAlert('Ошибка', 'Ошибка сохранения', 'error');
        }
    };

    const handleDeleteComponent = async (ct: ComponentType) => {
        if (ct.isDefault) {
            showAlert('Ошибка', 'Нельзя удалить стандартный показатель', 'error');
            return;
        }

        showConfirm('Удаление', `Удалить показатель "${ct.name}"?`, async () => {
            try {
                await database.write(async () => {
                    await ct.markAsDeleted();
                    await ct.destroyPermanently();
                });
                showToast({ message: 'Показатель удален', type: 'success' });
                sync().catch(e => console.error('Component delete sync failed', e));
            } catch (e) {
                console.error(e);
                showAlert('Ошибка', 'Ошибка удаления', 'error');
            }
        });
    };

    const handleAddChelator = () => {
        setEditingChelator(null);
        setChelatorName('');
        setShowChelatorForm(true);
    };

    const handleEditChelator = (ch: ChelatorType) => {
        setEditingChelator(ch);
        setChelatorName(ch.name);
        setShowChelatorForm(true);
    };

    const handleSaveChelator = async () => {
        if (!chelatorName.trim()) {
            showAlert('Ошибка', 'Введите название препарата', 'error');
            return;
        }

        try {
            await database.write(async () => {
                if (editingChelator) {
                    await editingChelator.update(ch => {
                        ch.name = chelatorName;
                    });
                } else {
                    const maxSort = chelatorTypes.reduce((max, ch) => Math.max(max, ch.sortOrder), 0);
                    await database.get<ChelatorType>('chelator_types').create(ch => {
                        ch.name = chelatorName;
                        ch.isDefault = false;
                        ch.sortOrder = maxSort + 1;
                    });
                }
            });
            setEditingChelator(null);
            setChelatorName('');
            setShowChelatorForm(false);
            showToast({ message: 'Препарат сохранен', type: 'success' });
            sync().catch(e => console.error('Chelator sync failed', e));
        } catch (e) {
            console.error(e);
            showAlert('Ошибка', 'Ошибка сохранения', 'error');
        }
    };

    const handleDeleteChelator = async (ch: ChelatorType) => {
        if (ch.isDefault) {
            showAlert('Ошибка', 'Нельзя удалить стандартный препарат', 'error');
            return;
        }

        showConfirm('Удаление', `Удалить препарат "${ch.name}"?`, async () => {
            try {
                await database.write(async () => {
                    await ch.markAsDeleted();
                    await ch.destroyPermanently();
                });
                showToast({ message: 'Препарат удален', type: 'success' });
                sync().catch(e => console.error('Chelator delete sync failed', e));
            } catch (e) {
                console.error(e);
                showAlert('Ошибка', 'Ошибка удаления', 'error');
            }
        });
    };

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'droplet': return <Droplet size={18} />;
            case 'flask-conical': return <FlaskConical size={18} />;
            case 'history': return <History size={18} />;
            default: return <Droplet size={18} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
            <Header title="Мои данные" onBack={onBack} />

            <div className="p-4 space-y-6 pb-20">
                {/* Weight Section */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase ml-1 mb-2">Общие</h3>
                    <Card className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                <Scale size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Текущий вес</p>
                                <p className="text-xs text-gray-400">
                                    {latestTransfusion
                                        ? `Из переливания от ${new Date(latestTransfusion.date).toLocaleDateString()}`
                                        : 'Нет данных о переливаниях'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditingWeight ? (
                                <div className="w-20">
                                    <Input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="py-1"
                                    />
                                </div>
                            ) : (
                                <span className="text-xl font-bold text-gray-900">{latestTransfusion?.weight || '---'}</span>
                            )}
                            <span className="text-sm text-gray-500 mr-2">кг</span>

                            {latestTransfusion && (
                                <button
                                    onClick={() => isEditingWeight ? handleSaveWeight() : setIsEditingWeight(true)}
                                    className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    {isEditingWeight ? <Check size={16} /> : <Pencil size={16} />}
                                </button>
                            )}
                        </div>
                    </Card>
                    <p className="text-xs text-center text-gray-400 mt-2">Вес обновляется автоматически при добавлении переливания.</p>
                </div>

                {/* Component Types Section */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Показатели</h3>
                        <button
                            onClick={handleAddComponent}
                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                        >
                            <Plus size={16} />
                            Добавить
                        </button>
                    </div>

                    {showComponentForm && (
                        <Card className="p-4 mb-3 border-2 border-red-200">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                {editingComponent ? 'Редактировать показатель' : 'Новый показатель'}
                            </p>
                            <div className="space-y-3">
                                <Input
                                    placeholder="Название показателя"
                                    value={componentName}
                                    onChange={(e) => setComponentName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleSaveComponent} className="flex-1">
                                        <Check size={16} />
                                        Сохранить
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setEditingComponent(null);
                                            setComponentName('');
                                            setShowComponentForm(false);
                                        }}
                                        className="flex-1"
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="divide-y divide-gray-100">
                        {componentTypes.map(ct => (
                            <div key={ct.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="text-gray-600">
                                        {getIconComponent(ct.iconName)}
                                    </div>
                                    <span className="font-medium text-gray-900">{ct.name}</span>
                                    {ct.isDefault && (
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">По умолчанию</span>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditComponent(ct)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    {!ct.isDefault && (
                                        <button
                                            onClick={() => handleDeleteComponent(ct)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* Chelator Types Section */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Препараты</h3>
                        <button
                            onClick={handleAddChelator}
                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                        >
                            <Plus size={16} />
                            Добавить
                        </button>
                    </div>

                    {showChelatorForm && (
                        <Card className="p-4 mb-3 border-2 border-red-200">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                {editingChelator ? 'Редактировать препарат' : 'Новый препарат'}
                            </p>
                            <div className="space-y-3">
                                <Input
                                    placeholder="Название препарата"
                                    value={chelatorName}
                                    onChange={(e) => setChelatorName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleSaveChelator} className="flex-1">
                                        <Check size={16} />
                                        Сохранить
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setEditingChelator(null);
                                            setChelatorName('');
                                            setShowChelatorForm(false);
                                        }}
                                        className="flex-1"
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="divide-y divide-gray-100">
                        {chelatorTypes.map(ch => (
                            <div key={ch.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="text-gray-600">
                                        <Pill size={18} />
                                    </div>
                                    <span className="font-medium text-gray-900">{ch.name}</span>
                                    {ch.isDefault && (
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">По умолчанию</span>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditChelator(ch)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    {!ch.isDefault && (
                                        <button
                                            onClick={() => handleDeleteChelator(ch)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* Analysis Templates Section */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Шаблоны анализов</h3>
                        <button
                            onClick={() => onEditTemplate(null)}
                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                        >
                            <Plus size={16} />
                            Добавить
                        </button>
                    </div>

                    <Card className="divide-y divide-gray-100">
                        {analysisTemplates.map(template => (
                            <div key={template.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="text-gray-600">
                                        <FileText size={18} />
                                    </div>
                                    <span className="font-medium text-gray-900">{template.name}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onEditTemplate(template)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </div>
    );
};

const enhance = withObservables([], () => ({
    transfusions: database.get<Transfusion>('transfusions')
        .query(
            Q.sortBy('date', Q.desc),
            Q.sortBy('created_at', Q.desc),
            Q.take(1)
        )
        .observe(),
    componentTypes: database.get<ComponentType>('component_types')
        .query(Q.sortBy('sort_order', Q.asc))
        .observe(),
    chelatorTypes: database.get<ChelatorType>('chelator_types')
        .query(Q.sortBy('sort_order', Q.asc))
        .observe(),
    analysisTemplates: database.get<AnalysisTemplate>('analysis_templates')
        .query()
        .observe(),
}));

export const MyDataScreen = enhance(MyDataScreenComponent);
