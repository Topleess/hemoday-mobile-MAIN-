import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, Header, Button, Input, DropdownSelect, DatePicker } from '../../components';
import { Analysis } from '../../types';

interface AddAnalysisScreenProps {
    onClose: () => void;
    initialData?: Analysis;
}

const AddAnalysisScreen: React.FC<AddAnalysisScreenProps> = ({ onClose, initialData }) => {
    const [template, setTemplate] = useState(initialData ? 'custom' : '');
    const [items, setItems] = useState<{ name: string, value: string, unit: string }[]>(
        initialData ? initialData.items : [{ name: '', value: '', unit: '' }]
    );
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

    const isEdit = !!initialData;

    const handleTemplateChange = (val: string) => {
        setTemplate(val);
        if (val === 'common') {
            setItems([
                { name: 'Гемоглобин', value: '', unit: 'г/дл' },
                { name: 'Ферритин', value: '', unit: 'нг/мл' },
                { name: 'Тромбоциты', value: '', unit: '10^9/л' }
            ]);
        } else if (val === 'biochem') {
            setItems([
                { name: 'АЛТ', value: '', unit: 'Ед/л' },
                { name: 'АСТ', value: '', unit: 'Ед/л' },
                { name: 'Билирубин', value: '', unit: 'мкмоль/л' }
            ]);
        } else if (val === 'new') {
            setItems([{ name: '', value: '', unit: '' }]);
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

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            <Header
                title={isEdit ? "Редактирование" : "Новый анализ"}
                onBack={onClose}
                rightAction={
                    <button onClick={onClose} className="text-red-500 font-medium hover:text-red-600">Сохранить</button>
                }
            />

            <div className="p-4 space-y-4">
                <Card>
                    <DatePicker label="Дата" value={date} onChange={setDate} />
                    <div className="mt-4">
                        <DropdownSelect
                            label="Шаблон анализов"
                            placeholder="Выберите шаблон"
                            value={template}
                            onChange={handleTemplateChange}
                            options={[
                                { value: 'common', label: 'Общий анализ крови' },
                                { value: 'biochem', label: 'Биохимия' },
                                { value: 'new', label: '+ Создать новый шаблон' },
                                ...(isEdit ? [{ value: 'custom', label: 'Текущие данные' }] : [])
                            ]}
                        />
                    </div>
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
                    <Button variant="danger" fullWidth onClick={onClose} className="mt-2">
                        <Trash2 size={20} />
                        Удалить запись
                    </Button>
                )}
                <div className="h-10"></div>
            </div>
        </div>
    );
};

export default AddAnalysisScreen;
