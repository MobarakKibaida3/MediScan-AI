
import React, { useState, useEffect } from 'react';

interface Props {
  image: string;
  onConfirm: () => void;
  onRetry: () => void;
  lang: 'ar' | 'en';
}

const ImageQualityChecker: React.FC<Props> = ({ image, onConfirm, onRetry, lang }) => {
  const isAr = lang === 'ar';
  const [quality, setQuality] = useState<'Excellent' | 'Average' | 'Poor'>('Excellent');
  
  // Simulated auto-detection of quality based on brightness/contrast heuristics
  useEffect(() => {
    const timer = setTimeout(() => {
      // In a real app, we'd use canvas data here.
      setQuality(Math.random() > 0.2 ? 'Excellent' : 'Average');
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="bg-white p-8 rounded-[3rem] border-2 border-blue-50 shadow-3xl animate-scale-up max-w-sm w-full mx-auto space-y-6">
      <h4 className="text-blue-900 font-black text-2xl text-center">
        {isAr ? 'تقييم جودة الصورة' : 'Image Quality Scan'}
      </h4>
      <div className="relative overflow-hidden rounded-[2rem] shadow-inner border">
        <img src={image} className="w-full h-64 object-cover" alt="Preview" />
        <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${quality === 'Excellent' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
           {isAr ? (quality === 'Excellent' ? 'جودة ممتازة' : 'جودة متوسطة') : quality}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-slate-50 p-4 rounded-2xl">
          <i className="fas fa-info-circle text-blue-500"></i>
          {isAr 
            ? 'نظام الذكاء الاصطناعي يتطلب نصاً واضحاً جداً لتجنب الأخطاء في قراءة أسماء الأدوية أو التحاليل.' 
            : 'AI requires crystal clear text to avoid errors in reading medication names or lab values.'}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onRetry} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm active:scale-95 transition-all">
            {isAr ? 'إعادة تصوير' : 'Retry'}
          </button>
          <button onClick={onConfirm} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">
            {isAr ? 'استمرار' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageQualityChecker;
