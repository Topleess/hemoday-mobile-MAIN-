import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, Header, Button, Input, DropdownSelect, DatePicker } from '../../components';
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import Analysis from '../../database/models/Analysis';
import AnalysisItem from '../../database/models/AnalysisItem';
import AnalysisTemplate from '../../database/models/AnalysisTemplate';
import withObservables from '@nozbe/with-observables';
import { sync } from '../../database/sync';
import { useNotification } from '../../context/NotificationContext';

interface AddAnalysisScreenProps {
    onClose: () => void;
    initialData?: Analysis;
    templates: AnalysisTemplate[];
}

const AddAnalysisScreenComponent: React.FC<AddAnalysisScreenProps> = ({ onClose, initialData, templates }) => {
    const { showAlert, showConfirm } = useNotification();
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [name, setName] = useState(initialData?.name || '');
    const [items, setItems] = useState<{ name: string, value: string, unit: string }[]>(
        initialData ? [] : [{ name: '', value: '', unit: '' }]
    );
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

    const isEdit = !!initialData;

    React.useEffect(() => {
        if (initialData) {
            initialData.items.fetch().then((fetchedItems: AnalysisItem[]) => {
                setItems(fetchedItems.map(i => ({ name: i.name, value: i.value, unit: i.unit })));
            });
        }
    }, [initialData]);

    const handleTemplateSelect = async (templateId: string) => {
        setSelectedTemplateId(templateId);

        if (!templateId) {
            setName('');
            setItems([{ name: '', value: '', unit: '' }]);
            return;
        }

        const template = templates.find(t => t.id === templateId);
        if (template) {
            setName(template.name);
            const templateItems = await template.items.fetch();
            setItems(templateItems.map(ti => ({ name: ti.name, value: '', unit: ti.unit })));
        }
    };

    const handleItemChange = (index: number, field: 'name' | 'value' | 'unit', val: string) => {
        const newItems = [...items];
        newItems[index][field] = val;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { name: '', value: '', unit: '' }]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSave = async () => {
        try {
            await database.write(async () => {
                let analysis: Analysis;

                if (isEdit && initialData) {
                    analysis = initialData;
                    await analysis.update(a => {
                        a.date = date;
                        a.name = name;
                    });

                    const existingItems = await analysis.items.fetch();
                    const deleteOps = existingItems.map(i => i.prepareDestroyPermanently());
                    const createOps = items.map(item => database.get<AnalysisItem>('analysis_items').prepareCreate(i => {
                        i.analysis.set(analysis);
                        i.name = item.name;
                        i.value = item.value;
                        i.unit = item.unit;
                    }));

                    await database.batch(...deleteOps, ...createOps);
                } else {
                    analysis = await database.get<Analysis>('analyses').create(a => {
                        a.date = date;
                        a.name = name;
                    });

                    const createOps = items.map(item => database.get<AnalysisItem>('analysis_items').prepareCreate(i => {
                        i.analysis.set(analysis);
                        i.name = item.name;
                        i.value = item.value;
                        i.unit = item.unit;
                    }));

                    await database.batch(...createOps);
                }
            });
            sync().catch(e => console.error('Analysis sync failed', e));
            onClose();
        } catch (error) {
            console.error("Failed to save analysis", error);
            showAlert('Ошибка', 'Не удалось сохранить анализ.', 'error');
        }
    };

    const handleDelete = async () => {
        if (isEdit && initialData) {
            showConfirm('Удаление', 'Вы уверены, что хотите удалить эту запись?', async () => {
                try {
                    await database.write(async () => {
                        const itemsToDelete = await initialData.items.fetch();
                        const deleteOps = itemsToDelete.map(i => i.prepareDestroyPermanently());
                        deleteOps.push(initialData.prepareDestroyPermanently());

                        await database.batch(...deleteOps);
                    });
                    sync().catch(e => console.error('Analysis delete sync failed', e));
                    onClose();
                } catch (error) {
                    console.error("Failed to delete", error);
                    showAlert('Ошибка', 'Не удалось удалить запись.', 'error');
                }
            });
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            <Header
                title={isEdit ? "Редактирование анализа" : "Добавление анализа"}
                onBack={onClose}
                rightAction={
                    <button onClick={handleSave} className="text-red-500 font-medium hover:text-red-600">Сохранить</button>
                }
            />

            <div className="p-4 space-y-4">
                <Card>
                    <DatePicker label="Дата" value={date} onChange={setDate} />
                </Card>

                {!isEdit && templates.length > 0 && (
                    <Card>
                        <DropdownSelect
                            label="Загрузить из шаблона"
                            placeholder="Выберите шаблон"
                            value={selectedTemplateId}
                            onChange={handleTemplateSelect}
                            options={[
                                { value: '', label: 'Без шаблона' },
                                ...templates.map(t => ({ value: t.id, label: t.name }))
                            ]}
                        />
                    </Card>
                )}

                <Card>
                    <Input
                        label="Название анализа"
                        placeholder="Например: Общий анализ крови"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Card>

                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-bold">Результаты</h3>
                </div>

                {items.map((item, idx) => (
                    <Card key={idx} className="space-y-3 relative group">
                        {items.length > 1 && (
                            <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        )}

                        <Input
                            label={idx === 0 ? "Показатель" : undefined}
                            placeholder="Название показателя"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        />

                        <div className="flex gap-3">
                            <Input
                                label={idx === 0 ? "Значение" : undefined}
                                className="flex-[2]"
                                placeholder="0.0"
                                value={item.value}
                                onChange={(e) => handleItemChange(idx, 'value', e.target.value)}
                            />
                            <Input
                                label={idx === 0 ? "Ед. изм." : undefined}
                                className="flex-1"
                                placeholder="Ед."
                                value={item.unit}
                                onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            />
                        </div>
                    </Card>
                ))}

                <Button onClick={addItem} variant="outline" fullWidth className="bg-white border-none shadow-sm py-4 text-red-500">
                    <Plus size={20} />
                    Добавить показатель
                </Button>

                {isEdit && (
                    <Button variant="danger" fullWidth onClick={handleDelete} className="mt-2">
                        <Trash2 size={20} />
                        Удалить запись
                    </Button>
                )}
                <div className="h-10"></div>
            </div>
        </div>
    );
};

const enhance = withObservables([], () => ({
    templates: database.get<AnalysisTemplate>('analysis_templates')
        .query()
        .observe(),
}));

export default enhance(AddAnalysisScreenComponent);
