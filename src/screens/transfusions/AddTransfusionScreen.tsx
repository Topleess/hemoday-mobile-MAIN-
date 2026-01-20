import React, { useState } from 'react';
import { Trash2, Droplet, FlaskConical, History } from 'lucide-react';
import { Card, Header, Button, Input, DropdownSelect, DatePicker } from '../../components';
import { Transfusion } from '../../types';

interface AddTransfusionScreenProps {
    onClose: () => void;
    initialData?: Transfusion;
}

const AddTransfusionScreen: React.FC<AddTransfusionScreenProps> = ({ onClose, initialData }) => {
    const [indicator, setIndicator] = useState('hemoglobin');
    const [drug, setDrug] = useState(initialData?.chelator ? 'desferal' : 'none');
    const [volume, setVolume] = useState(initialData ? initialData.volume.toString() : '250');
    const [hbBefore, setHbBefore] = useState(initialData ? initialData.hbBefore.toString() : '85');
    const [hbAfter, setHbAfter] = useState(initialData ? initialData.hbAfter.toString() : '100');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

    const isEdit = !!initialData;

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            <Header
                title={isEdit ? "Редактирование" : "Новое переливание"}
                onBack={onClose}
                rightAction={
                    <button onClick={onClose} className="text-red-500 font-medium hover:text-red-600">
                        Сохранить
                    </button>
                }
            />

            <div className="p-4 space-y-4">
                <Card>
                    <DatePicker label="Дата" value={date} onChange={setDate} />
                </Card>

                <Card className="space-y-4">
                    {/* New Dropdown Selects */}
                    <DropdownSelect
                        label="Показатель"
                        value={indicator}
                        onChange={setIndicator}
                        options={[
                            { value: 'hemoglobin', label: 'Гемоглобин', icon: <Droplet size={18} /> },
                            { value: 'ferritin', label: 'Ферритин', icon: <FlaskConical size={18} /> },
                            { value: 'platelets', label: 'Тромбоциты', icon: <History size={18} /> },
                        ]}
                    />
                    <DropdownSelect
                        label="Препарат"
                        value={drug}
                        onChange={setDrug}
                        options={[
                            { value: 'none', label: 'Нет' },
                            { value: 'desferal', label: 'Десферал' },
                            { value: 'exjade', label: 'Эксиджад' },
                            { value: 'jadenu', label: 'Джадену' },
                        ]}
                    />
                </Card>

                <Card className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-900">Объем (мл)</label>
                        <div className="w-32">
                            <Input value={volume} onChange={(e) => setVolume(e.target.value)} type="number" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-900">Вес (кг)</label>
                        <div className="w-32">
                            <Input value="70" readOnly />
                        </div>
                    </div>
                </Card>

                <Card className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-900">Hb до (g/l)</label>
                        <div className="w-32">
                            <Input value={hbBefore} onChange={(e) => setHbBefore(e.target.value)} type="number" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-900">Hb после (g/l)</label>
                        <div className="w-32">
                            <Input value={hbAfter} onChange={(e) => setHbAfter(e.target.value)} type="number" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Заметка</label>
                    <textarea
                        className="w-full bg-gray-100 rounded-xl p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
                        placeholder="Добавьте какую-нибудь информацию по переливанию для себя"
                    ></textarea>
                </Card>

                {isEdit && (
                    <Button variant="danger" fullWidth onClick={onClose} className="mt-6">
                        <Trash2 size={20} />
                        Удалить запись
                    </Button>
                )}
                <div className="h-6" />
            </div>
        </div>
    );
};

export default AddTransfusionScreen;
