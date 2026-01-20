import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  BarChart3, 
  FileText, 
  User as UserIcon, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  FlaskConical, 
  Droplet, 
  Lock, 
  FileCheck, 
  LogOut,
  History,
  Eye,
  Settings,
  CheckCircle2,
  TrendingUp,
  Trash2,
  ChevronDown,
  Mail,
  ArrowRight,
  Share2,
  Copy,
  Users,
  Scale,
  Pill,
  ListFilter,
  Folder
} from 'lucide-react';
import { ScreenName, Transfusion, Analysis, Reminder, User } from './types';
import { MOCK_TRANSFUSIONS, MOCK_ANALYSES, MOCK_REMINDERS } from './mockData';

// --- Shared Components ---

const Button: React.FC<{ 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; 
  className?: string; 
  children: React.ReactNode;
  fullWidth?: boolean;
}> = ({ onClick, variant = 'primary', className = '', children, fullWidth = false }) => {
  const baseStyles = "px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200",
    secondary: "bg-red-50 text-red-500 hover:bg-red-100",
    outline: "border-2 border-gray-200 text-gray-700 hover:bg-gray-50",
    ghost: "text-red-500 hover:bg-red-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-7 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-red-500' : 'bg-gray-300'}`}
  >
    <div 
      className={`w-5 h-5 bg-white rounded-full shadow absolute top-1 transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`} 
    />
  </button>
);

const Input: React.FC<{
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightIcon?: React.ReactNode;
  readOnly?: boolean;
  className?: string;
}> = ({ label, type = "text", placeholder, value, onChange, rightIcon, readOnly, className = '' }) => (
  <div className={`w-full ${className}`}>
    {label && <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1">{label}</label>}
    <div className="relative">
      <input
        type={type}
        className={`w-full bg-gray-100 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all ${readOnly ? 'cursor-default' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
      {rightIcon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  </div>
);

// New Custom Dropdown Select (In-place)
const DropdownSelect: React.FC<{
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  placeholder?: string;
}> = ({ label, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="mb-4 w-full relative" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1">{label}</label>}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-100 text-gray-900 rounded-xl px-4 py-3.5 flex items-center justify-between focus:outline-none transition-all ${isOpen ? 'ring-2 ring-red-200 bg-white' : ''}`}
      >
        <span className={!selectedOption ? "text-gray-400" : "flex items-center gap-2"}>
          {selectedOption?.icon && <span className="text-red-500">{selectedOption.icon}</span>}
          {selectedOption ? selectedOption.label : placeholder || "Выберите..."}
        </span>
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top">
           <div className="max-h-60 overflow-y-auto">
             {options.map((opt) => (
               <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-gray-50 ${
                    value === opt.value ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'
                  }`}
               >
                 {opt.icon && <span className={value === opt.value ? 'text-red-500' : 'text-gray-400'}>{opt.icon}</span>}
                 {opt.label}
                 {value === opt.value && <CheckCircle2 size={16} className="ml-auto text-red-500" />}
               </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl p-4 shadow-sm ${className}`}>
    {children}
  </div>
);

const Header: React.FC<{ title: string; onBack?: () => void; rightAction?: React.ReactNode; className?: string }> = ({ title, onBack, rightAction, className = '' }) => (
  <div className={`flex items-center justify-between px-4 py-4 bg-[#f3f4f6]/85 backdrop-blur-md sticky top-0 z-30 border-b border-transparent transition-all ${className}`}>
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors -ml-2 text-red-500 font-medium flex items-center gap-1">
          <ChevronLeft size={20} />
          Назад
        </button>
      )}
      {!onBack && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
    </div>
    {rightAction}
  </div>
);

// --- Simple Line Chart Component ---

const HemoglobinChart: React.FC<{ 
  data: { date: Date; value: number; type: 'analysis' | 'transfusion_before' | 'transfusion_after' }[]; 
  period: '1M' | '3M' | '6M' | '1Y' | 'ALL';
}> = ({ data, period }) => {
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
        
        <path d={`${pathD} L ${getX(filteredData[filteredData.length-1].date)},${height} L ${getX(filteredData[0].date)},${height} Z`} fill="url(#gradient)" opacity="0.1" />
        
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
}

// --- Sub-Screens ---

const AuthScreen: React.FC<{ 
  mode: 'login' | 'register' | 'forgot'; 
  setMode: (m: 'login' | 'register' | 'forgot') => void; 
  onLogin: () => void;
  onSkip: () => void;
}> = ({ mode, setMode, onLogin, onSkip }) => {
  return (
    <div className="flex flex-col min-h-screen p-6 justify-center max-w-md mx-auto bg-gray-50 relative">
      <div className="absolute top-6 right-6 z-10">
        <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 font-medium transition-colors">
          Пропустить
        </button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-6">
          <Droplet size={40} fill="currentColor" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {mode === 'login' ? 'С возвращением' : mode === 'register' ? 'Создать аккаунт' : 'Восстановление'}
        </h1>
        <p className="text-gray-500 text-center">
          {mode === 'login' ? 'Войдите, чтобы продолжить' : mode === 'register' ? 'Начните вести свой дневник переливаний' : 'Введите email для сброса пароля'}
        </p>
      </div>

      <div className="space-y-2">
        <Input placeholder="Ваш email" type="email" />
        {mode !== 'forgot' && <Input placeholder="Пароль" type="password" />}
        {mode === 'register' && <Input placeholder="Повторите пароль" type="password" />}
      </div>

      {mode === 'login' && (
        <div className="flex justify-end mb-6 mt-2">
          <button onClick={() => setMode('forgot')} className="text-sm text-gray-500 hover:text-red-500">Забыли пароль?</button>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <Button fullWidth onClick={onLogin}>
          {mode === 'login' ? 'Войти' : mode === 'register' ? 'Создать аккаунт' : 'Отправить ссылку'}
        </Button>
        
        <div className="text-center">
          {mode === 'login' ? (
             <p className="text-gray-500">Нет аккаунта? <button onClick={() => setMode('register')} className="text-red-500 font-medium">Создать</button></p>
          ) : (
             <p className="text-gray-500">Уже есть аккаунт? <button onClick={() => setMode('login')} className="text-red-500 font-medium">Войти</button></p>
          )}
        </div>
      </div>
      
      {mode === 'register' && (
        <p className="text-xs text-gray-400 text-center mt-8">
          Продолжая вы соглашаетесь с <span className="underline cursor-pointer">Условиями сервиса</span> и <span className="underline cursor-pointer">Политикой конфиденциальности</span>.
        </p>
      )}
    </div>
  );
};

const ChangePasswordScreen: React.FC<{ 
  onBack: () => void; 
  initialEmail?: string;
}> = ({ onBack, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    // Mock API call
    setSent(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <Header title="Смена пароля" onBack={onBack} />
      
      <div className="p-6 flex flex-col items-center pt-20">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
          <Lock size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Сброс пароля</h2>
        <p className="text-gray-500 text-center mb-8 max-w-xs">
          Введите ваш email, и мы отправим вам ссылку для создания нового пароля.
        </p>

        {!sent ? (
          <div className="w-full space-y-4">
            <Input 
              placeholder="user@example.com" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              rightIcon={<Mail size={20} />}
            />
            <Button fullWidth onClick={handleSubmit}>
              Отправить ссылку
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
             <div className="text-green-500 mb-2">
               <CheckCircle2 size={48} />
             </div>
             <p className="text-lg font-medium text-gray-900">Письмо отправлено!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ShareDataScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [inviteCode, setInviteCode] = useState('HEMO-8392-XM');
  const [inputCode, setInputCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
      <Header title="Делиться данными" onBack={onBack} />
      
      <div className="p-4 space-y-6">
        <Card className="flex flex-col items-center p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
            <Share2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Пригласить в семью</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Отправьте этот код члену семьи или доктору, чтобы они могли видеть ваши данные.
          </p>
          
          <div className="w-full bg-gray-100 rounded-xl p-4 flex items-center justify-between mb-4 border border-gray-200">
            <span className="font-mono text-lg font-bold text-gray-800 tracking-wider">{inviteCode}</span>
            <button onClick={handleCopy} className="text-gray-500 hover:text-red-500 transition-colors">
              {isCopied ? <CheckCircle2 size={24} className="text-green-500" /> : <Copy size={24} />}
            </button>
          </div>
          <Button variant="outline" className="text-sm" onClick={handleCopy}>
            {isCopied ? 'Скопировано!' : 'Скопировать код'}
          </Button>
        </Card>

        <div className="flex items-center gap-4 py-2">
           <div className="h-px bg-gray-200 flex-1"></div>
           <span className="text-gray-400 text-sm font-medium">ИЛИ</span>
           <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <Card className="p-6">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
               <Users size={20} />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">Присоединиться</h3>
               <p className="text-xs text-gray-500">Введите код приглашения</p>
             </div>
           </div>
           
           <div className="space-y-4">
             <Input 
               placeholder="XXXX-XXXX-XX" 
               className="font-mono uppercase"
               value={inputCode}
               onChange={(e) => setInputCode(e.target.value)}
             />
             <Button fullWidth onClick={() => alert('Запрос отправлен!')}>
               Отправить запрос
             </Button>
           </div>
        </Card>
      </div>
    </div>
  );
};

const MyDataScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
      <Header title="Мои данные" onBack={onBack} />
      
      <div className="p-4 space-y-6">
        {/* Weight Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase ml-1 mb-2">Общие</h3>
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                <Scale size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Последний вес</p>
                <p className="text-xs text-gray-400">Обновлено: 11 сен 2025</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">70</span>
              <span className="text-sm text-gray-500">кг</span>
            </div>
          </Card>
        </div>

        {/* Analyses Types Section */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
             <h3 className="text-sm font-semibold text-gray-500 uppercase">Шаблоны анализов</h3>
             <button className="text-red-500 text-xs font-bold uppercase hover:bg-red-50 px-2 py-1 rounded">Добавить</button>
          </div>
          <div className="space-y-2">
            <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FlaskConical size={20} className="text-gray-400" />
                <span className="font-medium text-gray-900">Общий анализ крови</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </Card>
            <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FlaskConical size={20} className="text-gray-400" />
                <span className="font-medium text-gray-900">Биохимия</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </Card>
          </div>
        </div>

        {/* Parameters Section */}
        <div>
           <div className="flex items-center justify-between mb-2 px-1">
             <h3 className="text-sm font-semibold text-gray-500 uppercase">Параметры</h3>
             <button className="text-red-500 text-xs font-bold uppercase hover:bg-red-50 px-2 py-1 rounded">Добавить</button>
          </div>
          <div className="space-y-2">
            <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ListFilter size={20} className="text-gray-400" />
                <span className="font-medium text-gray-900">Гемоглобин</span>
              </div>
              <span className="text-sm text-gray-400">г/л</span>
            </Card>
            <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ListFilter size={20} className="text-gray-400" />
                <span className="font-medium text-gray-900">Ферритин</span>
              </div>
              <span className="text-sm text-gray-400">нг/мл</span>
            </Card>
          </div>
        </div>

        {/* Chelators Section */}
        <div>
           <div className="flex items-center justify-between mb-2 px-1">
             <h3 className="text-sm font-semibold text-gray-500 uppercase">Препараты (Хелаторы)</h3>
             <button className="text-red-500 text-xs font-bold uppercase hover:bg-red-50 px-2 py-1 rounded">Добавить</button>
          </div>
          <div className="space-y-2">
            <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Pill size={20} className="text-purple-400" />
                <span className="font-medium text-gray-900">Десферал</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </Card>
             <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Pill size={20} className="text-purple-400" />
                <span className="font-medium text-gray-900">Эксиджад</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Modals / Full Screen Forms (EDITABLE) ---

const AddTransfusionScreen: React.FC<{ onClose: () => void; initialData?: Transfusion }> = ({ onClose, initialData }) => {
  const [indicator, setIndicator] = useState('hemoglobin');
  const [drug, setDrug] = useState(initialData?.chelator ? 'desferal' : 'none'); 
  const [volume, setVolume] = useState(initialData ? initialData.volume.toString() : '250');
  const [hbBefore, setHbBefore] = useState(initialData ? initialData.hbBefore.toString() : '85');
  const [hbAfter, setHbAfter] = useState(initialData ? initialData.hbAfter.toString() : '100');

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
          <Input label="Дата" value={initialData ? initialData.date : "Сегодня"} rightIcon={<ChevronRight size={20} />} readOnly />
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

const AddAnalysisScreen: React.FC<{ onClose: () => void; initialData?: Analysis }> = ({ onClose, initialData }) => {
  const [template, setTemplate] = useState(initialData ? 'custom' : '');
  const [items, setItems] = useState<{name: string, value: string, unit: string}[]>(
    initialData ? initialData.items : [{ name: '', value: '', unit: '' }]
  );

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
          <Input label="Дата" value={initialData ? initialData.date : "Сегодня"} rightIcon={<ChevronRight size={20} />} readOnly />
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

const AddReminderScreen: React.FC<{ onClose: () => void; initialData?: Reminder }> = ({ onClose, initialData }) => {
  const isEdit = !!initialData;
  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-4 bg-white shadow-sm sticky top-0 z-10">
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <X size={20} className="text-gray-600" />
        </button>
        <h2 className="text-lg font-bold">{isEdit ? "Редактирование" : "Новое напоминание"}</h2>
        <button onClick={onClose} className="text-red-500 font-medium hover:text-red-600">Сохранить</button>
      </div>

      <div className="p-4 space-y-4">
        <Card>
          <Input label="Название напоминания" placeholder="Пример: принять лекарство" value={initialData?.title} />
        </Card>

        <Card className="space-y-0 divide-y divide-gray-100">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
               <CalendarIcon size={20} className="text-gray-500" />
               <span className="font-medium">Дата</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span>{initialData?.date || "Сегодня"}</span>
              <ChevronRight size={18} />
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
               <History size={20} className="text-gray-500" />
               <span className="font-medium">Время</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span>{initialData?.time || "9:00"}</span>
              <ChevronRight size={18} />
            </div>
          </div>
        </Card>

        <Card>
           <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
               <History size={20} className="text-gray-500" />
               <span className="font-medium">Повторения</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span>{initialData?.repeat || "Ежедневно"}</span>
              <ChevronRight size={18} />
            </div>
          </div>
        </Card>

        <Card>
          <label className="block text-sm font-medium text-gray-500 mb-2">Напоминание</label>
          <textarea 
            className="w-full bg-gray-100 rounded-xl p-3 h-32 resize-none focus:outline-none" 
            placeholder="Добавьте какую-нибудь информацию"
            defaultValue={initialData?.note}
          ></textarea>
        </Card>

        {isEdit && (
          <Button variant="danger" fullWidth onClick={onClose} className="mt-4">
            <Trash2 size={20} />
            Удалить напоминание
          </Button>
        )}
      </div>
    </div>
  );
}

const CalendarScreen: React.FC<{ 
  transfusions: Transfusion[]; 
  reminders: Reminder[];
  onNavigate: (s: ScreenName) => void;
  onEdit: (type: 'transfusion' | 'analysis' | 'reminder', item: any) => void;
}> = ({ transfusions, reminders, onNavigate, onEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysSince = useMemo(() => {
    if (transfusions.length === 0) return 0;
    const lastTransfusion = new Date(transfusions[0].date); // Assuming sorted
    const diffTime = Math.abs(new Date().getTime() - lastTransfusion.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  }, [transfusions]);

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Adjust for Sunday start (0) to match the UI grid
    // The UI grid is Sunday (BC) -> Saturday (СБ)
    const padding = firstDay; 
    
    const daysArray = [];
    for (let i = 0; i < padding; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= numDays; i++) {
      daysArray.push(new Date(year, month, i));
    }
    return daysArray;
  }, [currentDate]);

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const transfusion = transfusions.find(t => t.date === dateStr);
    if (transfusion) {
      onEdit('transfusion', transfusion);
      return;
    }

    const reminder = reminders.find(r => r.date === dateStr);
    if (reminder) {
      onEdit('reminder', reminder);
      return;
    }
  };

  return (
    <div className="pb-24">
      <Header title="Календарь" />
      
      <div className="px-4 mb-6 mt-2">
        <Card className="flex flex-col items-start py-6 px-5 relative overflow-hidden">
          <div className="relative z-10">
             <h3 className="text-lg font-bold text-gray-900 mb-1">Дней с последнего переливания</h3>
             <p className="text-sm text-gray-500 mb-4">Последнее: 11 сентября 2025</p>
             <div className="text-6xl font-bold text-red-500">{daysSince}</div>
          </div>
          <Droplet className="absolute -right-6 -bottom-6 text-red-50 opacity-50 w-48 h-48 rotate-12 pointer-events-none" fill="currentColor" />
        </Card>
      </div>

      <div className="px-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-lg capitalize">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-gray-400 font-medium">
            <div>ВС</div><div>ПН</div><div>ВТ</div><div>СР</div><div>ЧТ</div><div>ПТ</div><div>СБ</div>
          </div>
          <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-sm font-medium text-gray-700">
             {days.map((date, index) => {
               if (!date) return <div key={`empty-${index}`} />;
               
               const dateStr = date.toISOString().split('T')[0];
               const hasTransfusion = transfusions.some(t => t.date === dateStr);
               const hasReminder = reminders.some(r => r.date === dateStr);
               const isToday = new Date().toDateString() === date.toDateString();

               return (
                 <button 
                  key={index} 
                  onClick={() => handleDateClick(date)}
                  className={`relative h-10 w-full flex items-center justify-center rounded-lg transition-colors
                    ${isToday ? 'bg-red-500 text-white font-bold' : 'hover:bg-gray-50'}
                    ${(hasTransfusion || hasReminder) ? 'font-bold' : ''}
                  `}
                 >
                   {date.getDate()}
                   <div className="absolute bottom-1 flex gap-0.5 justify-center w-full">
                     {hasTransfusion && (
                       <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-red-500'}`} />
                     )}
                     {hasReminder && (
                       <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-indigo-500'}`} />
                     )}
                   </div>
                 </button>
               );
             })}
          </div>
        </Card>
      </div>

      <div className="px-4 space-y-3 mb-6">
        <Card onClick={() => onNavigate('ADD_TRANSFUSION')} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 group-hover:bg-red-200 transition-colors">
            <Droplet size={20} />
          </div>
          <span className="font-medium text-gray-900 group-hover:text-red-500 transition-colors">Добавить переливание</span>
        </Card>
        <Card onClick={() => onNavigate('ADD_ANALYSIS')} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 group-hover:bg-blue-200 transition-colors">
             <FlaskConical size={20} />
          </div>
          <span className="font-medium text-gray-900 group-hover:text-blue-500 transition-colors">Добавить анализы</span>
        </Card>
        <Card onClick={() => onNavigate('ADD_REMINDER')} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors group">
           <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-200 transition-colors">
             <Bell size={20} />
          </div>
          <span className="font-medium text-gray-900 group-hover:text-indigo-500 transition-colors">Добавить напоминание</span>
        </Card>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">История переливаний</h2>
          <button onClick={() => onNavigate('DATA')} className="text-blue-500 text-sm font-medium">Показать все</button>
        </div>
        <Card className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <Droplet size={20} fill="currentColor" />
            </div>
            <div>
              <p className="font-bold text-gray-900">11 сентября 2025</p>
              <p className="text-sm text-gray-500">Hb: 100 г/л</p>
            </div>
          </div>
          <ChevronRight className="text-gray-300" />
        </Card>
      </div>
    </div>
  );
};

const DataScreen: React.FC<{
  transfusions: Transfusion[];
  analyses: Analysis[];
  reminders: Reminder[];
  onNavigate: (s: ScreenName) => void;
  onEdit: (type: 'transfusion' | 'analysis' | 'reminder', item: any) => void;
}> = ({ transfusions, onNavigate, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'transfusions' | 'analyses' | 'reminders' | 'chart'>('transfusions');
  const [chartPeriod, setChartPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');

  const chartData = useMemo(() => {
    const points: { date: Date; value: number; type: 'analysis' | 'transfusion_before' | 'transfusion_after' }[] = [];
    transfusions.forEach(t => {
      points.push({ date: new Date(t.date), value: t.hbBefore, type: 'transfusion_before' });
      points.push({ date: new Date(t.date), value: t.hbAfter, type: 'transfusion_after' });
    });
    MOCK_ANALYSES.forEach(a => {
      const hbItem = a.items.find(i => i.name.toLowerCase().includes('гемоглобин'));
      if (hbItem) {
        points.push({ date: new Date(a.date), value: parseFloat(hbItem.value), type: 'analysis' });
      }
    });
    return points.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transfusions]);

  return (
    <div className="pb-24">
      {/* Sticky Container for Header and Tabs */}
      <div className="sticky top-0 z-30 bg-[#f3f4f6]/95 backdrop-blur-xl border-b border-gray-200/50">
        <Header title="Данные" className="!static !bg-transparent !border-none !py-4" />
        
        <div className="px-4 pb-3">
          <div className="flex bg-gray-200/50 p-1 rounded-xl shadow-inner overflow-x-auto no-scrollbar">
            {(['transfusions', 'analyses', 'reminders', 'chart'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[90px] py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-white text-red-500 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab === 'transfusions' ? 'Переливания' : tab === 'analyses' ? 'Анализы' : tab === 'reminders' ? 'Напоминания' : 'График'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4">
        {activeTab === 'chart' && (
          <div className="px-4 space-y-4">
             <Card className="p-4">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp size={20} className="text-red-500" />
                    Уровень гемоглобина
                  </h3>
                  <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold">
                    г/л
                  </div>
               </div>
               
               <HemoglobinChart data={chartData} period={chartPeriod} />
               
               <div className="mt-6 flex justify-between bg-gray-50 rounded-lg p-1">
                 {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(p => (
                   <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`text-xs py-1.5 px-3 rounded-md font-medium transition-colors ${
                        chartPeriod === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                   >
                     {p === '1M' ? '1 мес' : p === '3M' ? '3 мес' : p === '6M' ? '6 мес' : p === '1Y' ? '1 год' : 'Все'}
                   </button>
                 ))}
               </div>
             </Card>
             
             <div className="text-xs text-gray-400 text-center px-4">
               График строится на основе данных о переливаниях (Hb до/после) и результатов анализов.
             </div>
          </div>
        )}

        {activeTab !== 'chart' && (
          <div className="px-4 mb-4">
            <Card className="flex items-center justify-between py-3 px-4">
              <span className="text-sm font-medium text-gray-900">23.04.2020</span>
              <span className="text-xs text-gray-400">до</span>
              <span className="text-sm font-medium text-gray-900">23.04.2024</span>
              <CalendarIcon size={18} className="text-gray-400" />
            </Card>
          </div>
        )}

        {activeTab !== 'chart' && (
          <div className="px-4 mb-4">
            <Button fullWidth onClick={() => {
              if (activeTab === 'transfusions') onNavigate('ADD_TRANSFUSION');
              else if (activeTab === 'analyses') onNavigate('ADD_ANALYSIS');
              else onNavigate('ADD_REMINDER');
            }}>
              <Plus size={20} />
              {activeTab === 'transfusions' ? 'ДОБАВИТЬ ПЕРЕЛИВАНИЕ' : activeTab === 'analyses' ? 'ДОБАВИТЬ АНАЛИЗ' : 'ДОБАВИТЬ НАПОМИНАНИЕ'}
            </Button>
          </div>
        )}

        <div className="px-4 space-y-4">
          {activeTab === 'transfusions' && transfusions.map((item) => (
            <Card key={item.id} className="p-5 cursor-pointer hover:bg-gray-50 border border-transparent hover:border-red-100 transition-all" onClick={() => onEdit('transfusion', item)}>
              <div className="flex items-center gap-3 mb-4">
                <Droplet className="text-red-500" fill="currentColor" />
                <h3 className="text-lg font-bold text-gray-900">
                  {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Объём:</span>
                  <span className="font-medium">{item.volume} мл</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Объём/кг:</span>
                  <span className="font-medium">{item.volumePerKg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hb до:</span>
                  <span className="font-medium">{item.hbBefore} г/л</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hb после:</span>
                  <span className="font-medium">{item.hbAfter} г/л</span>
                </div>
                <div className="h-px bg-gray-100 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ΔHb:</span>
                  <span className="font-medium text-green-500">+{item.deltaHb} г/л</span>
                </div>
                {item.chelator && (
                  <div className="flex justify-between mt-1">
                    <span className="text-purple-500">Хеллатор:</span>
                    <span className="font-medium text-purple-600">{item.chelator}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {activeTab === 'analyses' && MOCK_ANALYSES.map((item) => (
            <Card key={item.id} className="p-5 cursor-pointer hover:bg-gray-50 border border-transparent hover:border-blue-100 transition-all" onClick={() => onEdit('analysis', item)}>
              <div className="flex items-center gap-3 mb-4">
                <FlaskConical className="text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900">
                   {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
              </div>
              {item.items.map((sub, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{sub.name}</span>
                  <span className="font-medium">{sub.value} <span className="text-gray-400 text-xs">{sub.unit}</span></span>
                </div>
              ))}
            </Card>
          ))}
          
          {activeTab === 'reminders' && MOCK_REMINDERS.map((item) => (
             <Card key={item.id} className="p-5 cursor-pointer hover:bg-gray-50 border border-transparent hover:border-indigo-100 transition-all" onClick={() => onEdit('reminder', item)}>
               <div className="flex items-center gap-3 mb-2">
                 <Bell className="text-indigo-500" />
                 <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
               </div>
               <p className="text-gray-500 text-sm mb-2">{item.date} в {item.time}</p>
               <div className="flex gap-2">
                 <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-md">{item.repeat}</span>
               </div>
             </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProfileScreen: React.FC<{ 
  onLogout: () => void; 
  onNavigate: (s: ScreenName) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onTestNotification: () => void;
  isGuest: boolean;
}> = ({ onLogout, onNavigate, notificationsEnabled, onToggleNotifications, onTestNotification, isGuest }) => (
  <div className="pb-24">
    <Header title="Профиль" />
    <div className="px-4 mb-6">
      <Card className="flex items-center gap-4 p-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isGuest ? 'bg-orange-100' : 'bg-gray-100'}`}>
           <UserIcon size={24} className={isGuest ? "text-orange-500" : "text-gray-400"} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">
            {isGuest ? 'Гость' : 'user@example.com'}
          </p>
          <p className="text-gray-500">
            {isGuest ? 'Ограниченный доступ' : 'Пользователь'}
          </p>
        </div>
      </Card>
    </div>
    
    <div className="px-4 mb-6 space-y-3">
       <Button variant="secondary" fullWidth onClick={() => onNavigate('MY_DATA')} className="justify-between group">
         <span className="flex items-center gap-2">
           <Folder size={20} />
           Мои данные
         </span>
         <ChevronRight size={20} className="opacity-50 group-hover:opacity-100" />
      </Button>

      <Button variant="secondary" fullWidth onClick={() => onNavigate('SHARE_DATA')} className="justify-between group">
         <span className="flex items-center gap-2">
           <Share2 size={20} />
           Делиться данными
         </span>
         <ChevronRight size={20} className="opacity-50 group-hover:opacity-100" />
      </Button>
    </div>

    <div className="px-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase ml-1 mb-2">Настройки</h3>
      <div className="space-y-3">
         <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 text-gray-700">
            <Bell size={20} className="text-indigo-500" />
            <div>
              <p className="font-medium text-gray-900">Push-уведомления</p>
              <p className="text-xs text-gray-500">Напоминания об анализах</p>
            </div>
          </div>
          <Toggle checked={notificationsEnabled} onChange={onToggleNotifications} />
        </Card>
        
        {notificationsEnabled && (
           <Button variant="outline" className="text-xs py-2 !border-indigo-100 !text-indigo-500 w-full" onClick={onTestNotification}>
             <CheckCircle2 size={14} /> Проверить уведомления
           </Button>
        )}
      </div>
    </div>

    <div className="px-4 mb-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase ml-1 mb-2">Аккаунт</h3>
      <div className="space-y-3">
        {!isGuest && (
          <Card onClick={() => onNavigate('CHANGE_PASSWORD')} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3 text-gray-700">
              <Lock size={20} className="text-blue-500" />
              <span>Сменить пароль</span>
            </div>
            <ChevronRight className="text-gray-300" />
          </Card>
        )}

        <Card onClick={() => onNavigate('LEGAL_PRIVACY')} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3 text-gray-700">
            <FileCheck size={20} className="text-gray-500" />
            <span>Политика конфиденциальности</span>
          </div>
          <ChevronRight className="text-gray-300" />
        </Card>

        <Card onClick={() => onNavigate('LEGAL_TERMS')} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3 text-gray-700">
            <FileText size={20} className="text-gray-500" />
            <span>Условия сервиса</span>
          </div>
          <ChevronRight className="text-gray-300" />
        </Card>
      </div>
    </div>

    <div className="px-4 mt-6">
      <Button onClick={onLogout} variant="outline" fullWidth className="!text-red-500 !border-red-100 hover:!bg-red-50">
        <LogOut size={20} />
        {isGuest ? 'Войти / Зарегистрироваться' : 'Выйти'}
      </Button>
    </div>
  </div>
);

const LegalScreen: React.FC<{ type: 'terms' | 'privacy'; onBack: () => void }> = ({ type, onBack }) => {
  const title = type === 'terms' ? 'Условия сервиса' : 'Конфиденциальность';
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <Header title={title} onBack={onBack} />
      <div className="p-6 overflow-y-auto pb-24">
        <div className="space-y-4 text-gray-600">
          <p className="font-medium text-gray-900">Последнее обновление: 12 сентября 2025</p>
          
          <p>
            Это демонстрационный текст. В реальном приложении здесь будет располагаться юридически значимая информация, касающаяся {type === 'terms' ? 'правил использования сервиса' : 'обработки персональных данных'}.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6">1. Общие положения</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6">2. {type === 'terms' ? 'Права и обязанности' : 'Сбор данных'}</h3>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          
          <h3 className="text-lg font-bold text-gray-900 mt-6">3. {type === 'terms' ? 'Отказ от ответственности' : 'Хранение и защита'}</h3>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App Controller ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('AUTH_LOGIN');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Fake state for prototype
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // State for Editing
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsGuest(false);
    setCurrentScreen('CALENDAR');
  };

  const handleGuestLogin = () => {
    setIsLoggedIn(true);
    setIsGuest(true);
    setCurrentScreen('CALENDAR');
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsGuest(false);
    setCurrentScreen('AUTH_LOGIN');
    setAuthMode('login');
  };
  
  const handleEditItem = (type: 'transfusion' | 'analysis' | 'reminder', item: any) => {
    setEditingItem(item);
    if (type === 'transfusion') setCurrentScreen('EDIT_TRANSFUSION');
    if (type === 'analysis') setCurrentScreen('EDIT_ANALYSIS');
    if (type === 'reminder') setCurrentScreen('EDIT_REMINDER');
  };

  const handleCloseOverlay = () => {
    setEditingItem(null);
    setCurrentScreen('DATA'); // Or navigate back to where we were
  };

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      if (!("Notification" in window)) {
        alert("Ваш браузер не поддерживает уведомления.");
        return;
      }
      
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification("HemoTrack", { 
          body: "Уведомления включены! Теперь вы не пропустите напоминания.",
          icon: "/icon.png"
        });
      } else {
        alert("Пожалуйста, разрешите уведомления в настройках браузера.");
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const sendTestNotification = () => {
    if (notificationsEnabled && Notification.permission === 'granted') {
       new Notification("Напоминание HemoTrack", { 
          body: "Время принять лекарство!",
      });
    } else {
      alert("Уведомления выключены или заблокированы.");
    }
  };

  // Main Navigation Logic
  const renderScreen = () => {
    switch (currentScreen) {
      case 'AUTH_LOGIN':
      case 'AUTH_REGISTER':
      case 'AUTH_FORGOT':
        return <AuthScreen mode={authMode} setMode={setAuthMode} onLogin={handleLogin} onSkip={handleGuestLogin} />;
      
      case 'CALENDAR':
        return <CalendarScreen 
          transfusions={MOCK_TRANSFUSIONS} 
          reminders={MOCK_REMINDERS}
          onNavigate={setCurrentScreen} 
          onEdit={handleEditItem}
        />;
      
      case 'DATA':
        return <DataScreen 
          transfusions={MOCK_TRANSFUSIONS} 
          analyses={MOCK_ANALYSES} 
          reminders={MOCK_REMINDERS} 
          onNavigate={setCurrentScreen} 
          onEdit={handleEditItem}
        />;
      
      case 'PROFILE':
        return <ProfileScreen 
          onLogout={handleLogout} 
          onNavigate={setCurrentScreen} 
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={handleNotificationToggle}
          onTestNotification={sendTestNotification}
          isGuest={isGuest}
        />;
      
      default:
        return <CalendarScreen transfusions={MOCK_TRANSFUSIONS} reminders={MOCK_REMINDERS} onNavigate={setCurrentScreen} onEdit={handleEditItem} />;
    }
  };

  const renderOverlays = () => {
    switch (currentScreen) {
      case 'ADD_TRANSFUSION':
        return <AddTransfusionScreen onClose={() => setCurrentScreen('CALENDAR')} />;
      case 'EDIT_TRANSFUSION':
        return <AddTransfusionScreen onClose={handleCloseOverlay} initialData={editingItem} />;
        
      case 'ADD_ANALYSIS':
        return <AddAnalysisScreen onClose={() => setCurrentScreen('CALENDAR')} />;
      case 'EDIT_ANALYSIS':
         return <AddAnalysisScreen onClose={handleCloseOverlay} initialData={editingItem} />;

      case 'ADD_REMINDER':
        return <AddReminderScreen onClose={() => setCurrentScreen('CALENDAR')} />;
      case 'EDIT_REMINDER':
        return <AddReminderScreen onClose={handleCloseOverlay} initialData={editingItem} />;

      case 'LEGAL_TERMS':
        return <LegalScreen type="terms" onBack={() => setCurrentScreen('PROFILE')} />;
      case 'LEGAL_PRIVACY':
        return <LegalScreen type="privacy" onBack={() => setCurrentScreen('PROFILE')} />;
      case 'CHANGE_PASSWORD':
        return <ChangePasswordScreen onBack={() => setCurrentScreen('PROFILE')} initialEmail={isGuest ? '' : 'user@example.com'} />;
      case 'SHARE_DATA':
        return <ShareDataScreen onBack={() => setCurrentScreen('PROFILE')} />;
      case 'MY_DATA':
        return <MyDataScreen onBack={() => setCurrentScreen('PROFILE')} />;
      default:
        return null;
    }
  };

  const showBottomNav = isLoggedIn && ['CALENDAR', 'DATA', 'PROFILE'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-100 max-w-md mx-auto shadow-2xl relative border-x border-gray-200">
      
      <main className="min-h-screen relative">
        {renderScreen()}
        {renderOverlays()}
      </main>

      {showBottomNav && (
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center py-3 pb-6 z-40">
          <button onClick={() => setCurrentScreen('CALENDAR')} className={`flex flex-col items-center gap-1 ${currentScreen === 'CALENDAR' ? 'text-red-500' : 'text-gray-400'}`}>
            <CalendarIcon size={24} />
            <span className="text-[10px] font-medium">Календарь</span>
          </button>
          <button onClick={() => setCurrentScreen('DATA')} className={`flex flex-col items-center gap-1 ${currentScreen === 'DATA' ? 'text-red-500' : 'text-gray-400'}`}>
            <BarChart3 size={24} />
            <span className="text-[10px] font-medium">Данные</span>
          </button>
          <button onClick={() => setCurrentScreen('PROFILE')} className={`flex flex-col items-center gap-1 ${currentScreen === 'PROFILE' ? 'text-red-500' : 'text-gray-400'}`}>
            <UserIcon size={24} />
            <span className="text-[10px] font-medium">Профиль</span>
          </button>
        </div>
      )}
    </div>
  );
}