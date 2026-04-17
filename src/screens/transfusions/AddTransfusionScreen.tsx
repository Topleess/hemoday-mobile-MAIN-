import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Droplet, FlaskConical, History } from 'lucide-react';
import { Card, Header, Button, Input, DropdownSelect, DatePicker } from '../../components';
import { database } from '../../database';
import Transfusion from '../../database/models/Transfusion';
import ComponentType from '../../database/models/ComponentType';
import ChelatorType from '../../database/models/ChelatorType';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { sync } from '../../database/sync';
import { useNotification } from '../../context/NotificationContext';

interface AddTransfusionScreenProps {
    onClose: () => void;
    initialData?: Transfusion;
    preselectedDate?: string | null;
    componentTypes: ComponentType[];
    chelatorTypes: ChelatorType[];
}

const AddTransfusionScreenComponent: React.FC<AddTransfusionScreenProps> = ({ onClose, initialData, preselectedDate, componentTypes, chelatorTypes }) => {
    const { showToast, showConfirm, showAlert } = useNotification();

    // Inverse mapping for editing: map stored component string back to internal 'indicator' value if possible
    const getInitialIndicator = () => {
        if (!initialData?.component) return componentTypes[0]?.name || 'Гемоглобин';
        return initialData.component;
    };

    const getInitialChelator = () => {
        if (!initialData?.chelator) return chelatorTypes[0]?.name || 'Нет';
        return initialData.chelator || 'none';
    };

    const [indicator, setIndicator] = useState(getInitialIndicator());
    const [drug, setDrug] = useState(getInitialChelator());
    const [volume, setVolume] = useState(initialData ? initialData.volume.toString() : '250');
    const [weight, setWeight] = useState(initialData ? initialData.weight.toString() : '70');
    const [hbBefore, setHbBefore] = useState(initialData ? initialData.hbBefore.toString() : '85');
    const [hbAfter, setHbAfter] = useState(initialData ? initialData.hbAfter.toString() : '100');

    const [date, setDate] = useState(initialData?.date || preselectedDate || (() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })());
    const [chelatorDosage, setChelatorDosage] = useState(initialData?.chelatorDosage ? initialData.chelatorDosage.toString() : '');
    const [note, setNote] = useState(initialData?.note || '');

    const isEdit = !!initialData;

    useEffect(() => {
        const loadLastValues = async () => {
            if (!initialData) {
                try {
                    const transfusions = await database.get<Transfusion>('transfusions')
                        .query(
                            Q.sortBy('date', Q.desc),
                            Q.sortBy('created_at', Q.desc),
                            Q.take(1)
                        )
                        .fetch();

                    if (transfusions.length > 0) {
                        setWeight(transfusions[0].weight.toString());
                    }

                    // Load last chelator dosage for the currently selected drug
                    const withDosage = await database.get<Transfusion>('transfusions')
                        .query(
                            Q.where('chelator_dosage', Q.notEq(null)),
                            Q.sortBy('date', Q.desc),
                            Q.sortBy('created_at', Q.desc),
                            Q.take(1)
                        )
                        .fetch();

                    if (withDosage.length > 0 && withDosage[0].chelatorDosage) {
                        setChelatorDosage(withDosage[0].chelatorDosage.toString());
                    }
                } catch (error) {
                    console.error('Failed to load last values', error);
                }
            }
        };

        loadLastValues();
    }, [initialData]);

    const volumePerKg = useMemo(() => {
        const vol = parseFloat(volume) || 0;
        const w = parseFloat(weight) || 1;
        return (vol / w).toFixed(2);
    }, [volume, weight]);

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'droplet': return <Droplet size={18} />;
            case 'flask-conical': return <FlaskConical size={18} />;
            case 'history': return <History size={18} />;
            default: return <Droplet size={18} />;
        }
    };

    const componentOptions = useMemo(() => {
        return componentTypes.map(ct => ({
            value: ct.name,
            label: ct.name,
            icon: getIconComponent(ct.iconName),
        }));
    }, [componentTypes]);

    const chelatorOptions = useMemo(() => {
        return chelatorTypes.map(ch => ({
            value: ch.name,
            label: ch.name,
        }));
    }, [chelatorTypes]);

    const handleSave = async () => {
        const vol = parseFloat(volume);
        const hbB = parseFloat(hbBefore);
        const hbA = parseFloat(hbAfter);
        const w = parseFloat(weight);
        const volKg = vol / w;
        const delta = hbA - hbB;
        const chelatorVal = drug === 'Нет' ? undefined : drug;
        const chelatorDosageVal = chelatorDosage ? parseFloat(chelatorDosage) : undefined;

        try {
            await database.write(async () => {
                if (isEdit && initialData) {
                    await initialData.update(t => {
                        t.date = date;
                        t.volume = vol;
                        t.weight = w;
                        t.volumePerKg = volKg;
                        t.hbBefore = hbB;
                        t.hbAfter = hbA;
                        t.deltaHb = delta;
                        t.chelator = chelatorVal;
                        t.component = indicator;
                        t.chelatorDosage = chelatorDosageVal;
                        t.note = note || undefined;
                    });
                } else {
                    await database.get<Transfusion>('transfusions').create(t => {
                        t.date = date;
                        t.volume = vol;
                        t.weight = w;
                        t.volumePerKg = volKg;
                        t.hbBefore = hbB;
                        t.hbAfter = hbA;
                        t.deltaHb = delta;
                        t.chelator = chelatorVal;
                        t.component = indicator;
                        t.chelatorDosage = chelatorDosageVal;
                        t.note = note || undefined;
                    });
                }
            });
            sync().catch(e => {
                console.error("Auto-sync failed", e);
                showToast({ message: "Синхронизация не удалась. Сохранено локально.", type: 'warning' });
            });
            onClose();
        } catch (error) {
            console.error("Failed to save transfusion", error);
            showAlert('Ошибка', 'Не удалось сохранить данные.', 'error');
        }
    };

    const handleDelete = async () => {
        if (isEdit && initialData) {
            showConfirm('Удаление', 'Вы уверены, что хотите удалить эту запись?', async () => {
                try {
                    await database.write(async () => {
                        await initialData.markAsDeleted();
                    });
                    sync().catch(e => console.error('Delete sync failed', e));
                    onClose();
                } catch (error) {
                    console.error("Failed to delete transfusion", error);
                    showAlert('Ошибка', 'Не удалось удалить запись.', 'error');
                }
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            <Header
                title={isEdit ? "Редактирование переливания" : "Добавление переливания"}
                onBack={onClose}
                rightAction={
                    <button onClick={handleSave} className="text-red-500 font-medium hover:text-red-600">
                        Сохранить
                    </button>
                }
            />

            <div className="p-4 space-y-4">
                <Card>
                    <DatePicker label="Дата" value={date} onChange={setDate} />
                </Card>

                <Card className="space-y-4">
                    <DropdownSelect
                        label="Показатель"
                        value={indicator}
                        onChange={setIndicator}
                        options={componentOptions}
                    />
                    <DropdownSelect
                        label="Хелатор"
                        value={drug}
                        onChange={setDrug}
                        options={chelatorOptions}
                    />
                    {drug !== 'Нет' && (
                        <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-900">Дозировка (мг)</label>
                            <div className="w-32">
                                <Input value={chelatorDosage} onChange={(e) => setChelatorDosage(e.target.value)} type="number" placeholder="мг" />
                            </div>
                        </div>
                    )}
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
                            <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <label className="font-medium text-gray-900">Объем/вес</label>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-gray-900">{volumePerKg}</span>
                            <span className="text-sm text-gray-500">мл/кг</span>
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
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                </Card>

                {isEdit && (
                    <Button variant="danger" fullWidth onClick={handleDelete} className="mt-6">
                        <Trash2 size={20} />
                        Удалить запись
                    </Button>
                )}
                <div className="h-6" />
            </div>
        </div>
    );
};

const enhance = withObservables([], () => ({
    componentTypes: database.get<ComponentType>('component_types')
        .query(Q.sortBy('sort_order', Q.asc))
        .observe(),
    chelatorTypes: database.get<ChelatorType>('chelator_types')
        .query(Q.sortBy('sort_order', Q.asc))
        .observe(),
}));

export const AddTransfusionScreen = enhance(AddTransfusionScreenComponent);
export default AddTransfusionScreen;
