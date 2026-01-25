import React, { useState } from 'react';
import { Droplet, BarChart3, Bell, Share2, ChevronRight, Check } from 'lucide-react';
import { Button } from './Button';

interface OnboardingProps {
    onComplete: () => void;
    onSkip: () => void;
}

const SLIDES = [
    {
        id: 1,
        title: 'Следите за переливаниями',
        text: 'Записывайте каждое переливание, чтобы иметь полную историю лечения под рукой.',
        icon: <Droplet size={64} className="text-red-500" />,
        color: 'bg-red-50'
    },
    {
        id: 2,
        title: 'Контролируйте анализы',
        text: 'Отслеживайте уровень ферритина и другие показатели на удобных графиках.',
        icon: <BarChart3 size={64} className="text-blue-500" />,
        color: 'bg-blue-50'
    },
    {
        id: 3,
        title: 'Не пропускайте важное',
        text: 'Настраивайте напоминания о сдаче анализов и записи к врачу.',
        icon: <Bell size={64} className="text-indigo-500" />,
        color: 'bg-indigo-50'
    },
    {
        id: 4,
        title: 'Делитесь с врачом',
        text: 'Легко экспортируйте историю болезни или делитесь ей с лечащим врачом.',
        icon: <Share2 size={64} className="text-teal-500" />,
        color: 'bg-teal-50'
    }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onComplete();
        }
    };

    const isLastSlide = currentSlide === SLIDES.length - 1;

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in fade-in duration-300">
            <div className="absolute top-6 right-6 z-10">
                <button
                    onClick={onSkip}
                    className="text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                    Пропустить
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-32 h-32 ${SLIDES[currentSlide].color} rounded-full flex items-center justify-center mb-8 transition-colors duration-300`}>
                        {SLIDES[currentSlide].icon}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 animate-in slide-in-from-bottom-4 duration-500 key-[currentSlide]">
                        {SLIDES[currentSlide].title}
                    </h2>

                    <p className="text-gray-500 text-lg leading-relaxed animate-in slide-in-from-bottom-2 duration-500 delay-100 key-[currentSlide]">
                        {SLIDES[currentSlide].text}
                    </p>
                </div>
            </div>

            <div className="p-8">
                <div className="flex justify-center gap-2 mb-8">
                    {SLIDES.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-red-500' : 'w-2 bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                <Button
                    fullWidth
                    size="lg"
                    onClick={handleNext}
                    className="flex items-center justify-center gap-2"
                >
                    {isLastSlide ? (
                        <>Начать <Check size={20} /></>
                    ) : (
                        <>Далее <ChevronRight size={20} /></>
                    )}
                </Button>
            </div>
        </div>
    );
};
