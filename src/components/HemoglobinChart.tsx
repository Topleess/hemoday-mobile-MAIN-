import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface HemoglobinChartProps {
    data: {
        date: Date;
        value: number;
        type: 'analysis' | 'transfusion_before' | 'transfusion_after';
        hasChelator?: boolean;
    }[];
    showBefore: boolean;
    showAfter: boolean;
    showChelators: boolean;
}

export const HemoglobinChart: React.FC<HemoglobinChartProps> = ({ data, showBefore, showAfter, showChelators }) => {
    // Data is already filtered by date in parent
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [data]);

    if (sortedData.length < 2) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <TrendingUp size={48} className="mb-2 opacity-50" />
                <p>Недостаточно данных для графика</p>
            </div>
        );
    }

    const width = 300;
    const height = 200;
    const padding = 20;

    const allValues = sortedData.map(d => d.value);
    const minVal = Math.min(...allValues) - 5;
    const maxVal = Math.max(...allValues) + 5;
    const minTime = sortedData[0].date.getTime();
    const maxTime = sortedData[sortedData.length - 1].date.getTime();

    const getX = (date: Date) => {
        const time = date.getTime();
        const range = maxTime - minTime;
        if (range === 0) return width / 2;
        return padding + ((time - minTime) / range) * (width - padding * 2);
    };

    const getY = (val: number) => {
        const range = maxVal - minVal;
        if (range === 0) return height / 2;
        return height - padding - ((val - minVal) / range) * (height - padding * 2);
    };

    // Separate paths
    const generatePath = (points: typeof sortedData) => {
        if (points.length === 0) return '';
        return points.reduce((acc, point, i) => {
            const x = getX(point.date);
            const y = getY(point.value);
            return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
        }, '');
    };

    // Before/Analysis series (Gray)
    const beforePoints = sortedData.filter(d => d.type === 'transfusion_before' || d.type === 'analysis');
    const beforePath = generatePath(beforePoints);

    // After series (Red)
    const afterPoints = sortedData.filter(d => d.type === 'transfusion_after');
    const afterPath = generatePath(afterPoints);

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-sm">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(t => {
                    const val = minVal + t * (maxVal - minVal);
                    const y = getY(val);
                    return (
                        <g key={t}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                            <text x={0} y={y + 3} fontSize="8" fill="#9ca3af">{Math.round(val)}</text>
                        </g>
                    )
                })}

                {/* Chelator Bands */}
                {showChelators && sortedData.map((point, i) => {
                    if (point.hasChelator) {
                        const x = getX(point.date);
                        // Width of band. If tight points, small width. 
                        // Let's make it a fixed visual width or simple vertical line with thickness
                        return (
                            <rect
                                key={`chelator-${i}`}
                                x={x - 2}
                                y={padding}
                                width={4}
                                height={height - padding * 2}
                                fill="#22c55e"
                                opacity="0.15" // Light green shade
                            />
                        );
                    }
                    return null;
                })}

                {/* Paths */}
                {showBefore && (
                    <path d={beforePath} fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                )}
                {showAfter && (
                    <path d={afterPath} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {/* Points and Tooltips/Interactivity hooks could go here */}
                {showBefore && beforePoints.map((point, i) => (
                    <circle key={`b-${i}`} cx={getX(point.date)} cy={getY(point.value)} r="2" fill="white" stroke="#9ca3af" strokeWidth="1.5" />
                ))}
                {showAfter && afterPoints.map((point, i) => (
                    <circle key={`a-${i}`} cx={getX(point.date)} cy={getY(point.value)} r="3" fill="white" stroke="#ef4444" strokeWidth="2" />
                ))}

            </svg>
            <div className="flex justify-between text-[10px] text-gray-400 px-2 mt-2">
                <span>{sortedData[0].date.toLocaleDateString()}</span>
                <span>{sortedData[sortedData.length - 1].date.toLocaleDateString()}</span>
            </div>
        </div>
    );
};
