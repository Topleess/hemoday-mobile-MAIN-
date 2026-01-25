import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, Header, Button, Input } from '../../components';
import { database } from '../../database';
import AnalysisTemplate from '../../database/models/AnalysisTemplate';
import AnalysisTemplateItem from '../../database/models/AnalysisTemplateItem';
import { sync } from '../../database/sync';

interface AddAnalysisTemplateScreenProps {
    onClose: () => void;
    initialData?: AnalysisTemplate;
}

const AddAnalysisTemplateScreen: React.FC<AddAnalysisTemplateScreenProps> = ({ onClose, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [items, setItems] = useState<{ name: string, unit: string }[]>([{ name: '', unit: '' }]);

    const isEdit = !!initialData;

    React.useEffect(() => {
        if (initialData) {
            initialData.items.fetch().then((fetchedItems: AnalysisTemplateItem[]) => {
                setItems(fetchedItems.map(i => ({ name: i.name, unit: i.unit })));
            });
        }
    }, [initialData]);

    const handleItemChange = (index: number, field: 'name' | 'unit', val: string) => {
        const newItems = [...items];
        newItems[index][field] = val;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { name: '', unit: '' }]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Введите название шаблона');
            return;
        }

        try {
            await database.write(async () => {
                let template: AnalysisTemplate;

                if (isEdit && initialData) {
                    template = initialData;
                    await template.update(t => {
                        t.name = name;
                    });

                    // Delete and recreate items
                    const existingItems = await template.items.fetch();
                    const deleteOps = existingItems.map(i => i.prepareDestroyPermanently());

                    const createOps = items.map(item =>
                        database.get<AnalysisTemplateItem>('analysis_template_items').prepareCreate(i => {
                            i.templateId = template.id;
                            i.name = item.name;
                            i.unit = item.unit;
                        })
                    );

                    await database.batch(...deleteOps, ...createOps);
                } else {
                    template = await database.get<AnalysisTemplate>('analysis_templates').create(t => {
                        t.name = name;
                    });

                    const createOps = items.map(item =>
                        database.get<AnalysisTemplateItem>('analysis_template_items').prepareCreate(i => {
                            i.templateId = template.id;
                            i.name = item.name;
                            i.unit = item.unit;
                        })
                    );

                    await database.batch(...createOps);
                }
            });
            sync().catch(e => console.error('Template sync failed', e));
            onClose();
        } catch (error) {
            console.error("Failed to save template", error);
            alert("Не удалось сохранить шаблон");
        }
    };

    const handleDelete = async () => {
        if (isEdit && initialData) {
            try {
                await database.write(async () => {
                    const itemsToDelete = await initialData.items.fetch();
                    const deleteOps = itemsToDelete.map(i => i.prepareDestroyPermanently());
                    deleteOps.push(initialData.prepareDestroyPermanently());

                    await database.batch(...deleteOps);
                });
                sync().catch(e => console.error('Template delete sync failed', e));
                onClose();
            } catch (error) {
                console.error("Failed to delete template", error);
                alert("Не удалось удалить шаблон");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            <Header
                title={isEdit ? "Редактирование шаблона" : "Создание шаблона"}
                onBack={onClose}
                rightAction={
                    <button onClick={handleSave} className="text-red-500 font-medium hover:text-red-600">Сохранить</button>
                }
            />

            <div className="p-4 space-y-4">
                <Card>
                    <Input
                        label="Название шаблона"
                        placeholder="Например: Общий анализ крови"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                </Card>

                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-bold">Параметры</h3>
                </div>

                {items.map((item, idx) => (
                    <Card key={idx} className="space-y-3 relative group">
                        {items.length > 1 && (
                            <button
                                onClick={() => removeItem(idx)}
                                className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}

                        <div className="flex gap-3">
                            <Input
                                label={idx === 0 ? "Название параметра" : undefined}
                                className="flex-[2]"
                                placeholder="Например: Гемоглобин"
                                value={item.name}
                                onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            />
                            <Input
                                label={idx === 0 ? "Единица измерения" : undefined}
                                className="flex-1"
                                placeholder="g/л"
                                value={item.unit}
                                onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            />
                        </div>
                    </Card>
                ))}

                <Button onClick={addItem} variant="outline" fullWidth className="bg-white border-none shadow-sm py-4 text-red-500">
                    <Plus size={20} />
                    Добавить параметр
                </Button>

                {isEdit && (
                    <Button variant="danger" fullWidth onClick={handleDelete} className="mt-2">
                        <Trash2 size={20} />
                        Удалить шаблон
                    </Button>
                )}
                <div className="h-10"></div>
            </div>
        </div>
    );
};

export default AddAnalysisTemplateScreen;
