import React from 'react';
import { FlaskConical } from 'lucide-react';
import { Card } from './Card'; // Adjust path if needed, usually ./Card or ../components/Card
import withObservables from '@nozbe/with-observables';
import Analysis from '../database/models/Analysis'; // Adjust path
import AnalysisItem from '../database/models/AnalysisItem'; // Adjust path

interface AnalysisCardProps {
    analysis: Analysis;
    items: AnalysisItem[];
    onEdit: (item: Analysis) => void;
}

const AnalysisCardComponent: React.FC<AnalysisCardProps> = ({ analysis, items, onEdit }) => {
    return (
        <Card className="p-5 cursor-pointer hover:bg-gray-50 border border-transparent hover:border-blue-100 transition-all" onClick={() => onEdit(analysis)}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <FlaskConical className="text-blue-500 mt-1" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {analysis.name || 'Анализ'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {analysis?.date ? new Date(analysis.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Без даты'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Limit to showing first 3 items to avoid clutter */}
            {items && items.length > 0 ? (
                <>
                    {items.slice(0, 4).map((sub, idx) => (
                        <div key={sub.id || idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <span className="text-gray-600 flex-1 pr-2 leading-tight">{sub.name || 'Показатель'}</span>
                            <span className="font-medium whitespace-nowrap">
                                {sub.value || '--'} <span className="text-gray-400 text-xs ml-0.5">{sub.unit || ''}</span>
                            </span>
                        </div>
                    ))}
                    {items.length > 4 && (
                        <div className="text-center text-xs text-gray-400 mt-2">
                            + еще {items.length - 4}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-gray-400 text-sm">Нет показателей</div>
            )}
        </Card>
    );
};

const enhance = withObservables(['analysis'], ({ analysis }: { analysis: Analysis }) => ({
    analysis, // pass through
    items: analysis.items.observe(), // Observe the children
}));

export const AnalysisCard = enhance(AnalysisCardComponent);
