import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface HemoglobinChartProps {
    data: { date: Date; value: number; type: 'analysis' | 'transfusion_before' | 'transfusion_after' }[];
    period: '1M' | '3M' | '6M' | '1Y' | 'ALL';
}

export const HemoglobinChart: React.FC<HemoglobinChartProps> = ({ data, period }) => {
    const filteredData = useMemo(() => {
        const now = new Date();
        let cutoff = new Date();

        if (period === '1M') cutoff.setMonth(now.getMonth() - 1);
        else if (period === '3M') cutoff.setMonth(now.getMonth() - 3);
        else if (period === '6M') cutoff.setMonth(now.getMonth() - 6);
        else if (period === '1Y') cutoff.setFullYear(now.getFullYear() - 1);
        else cutoff = new Date(0); // ALL

        return data
            .filter(d => d.date >= cutoff)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [data, period]);

    if (filteredData.length < 2) {
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

    const minVal = Math.min(...filteredData.map(d => d.value)) - 5;
    const maxVal = Math.max(...filteredData.map(d => d.value)) + 5;
    const minTime = filteredData[0].date.getTime();
    const maxTime = filteredData[filteredData.length - 1].date.getTime();

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

    const pathD = filteredData.reduce((acc, point, i) => {
        const x = getX(point.date);
        const y = getY(point.value);
        return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
    }, '');

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-sm">
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

                <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                <path d={`${pathD} L ${getX(filteredData[filteredData.length - 1].date)},${height} L ${getX(filteredData[0].date)},${height} Z`} fill="url(#gradient)" opacity="0.1" />

                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {filteredData.map((point, i) => (
                    <circle
                        key={i}
                        cx={getX(point.date)}
                        cy={getY(point.value)}
                        r="3"
                        fill="white"
                        stroke="#ef4444"
                        strokeWidth="2"
                    />
                ))}
            </svg>
            <div className="flex justify-between text-[10px] text-gray-400 px-2 mt-2">
                <span>{filteredData[0].date.toLocaleDateString()}</span>
                <span>{filteredData[filteredData.length - 1].date.toLocaleDateString()}</span>
            </div>
        </div>
    );
};
