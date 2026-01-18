
import React from 'react';
import { Language } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'disclaimer';
  lang: Language;
}

const LegalModal: React.FC<Props> = ({ isOpen, onClose, type, lang }) => {
  const isAr = lang === 'ar';
  if (!isOpen) return null;

  const content = {
    privacy: {
      title: isAr ? 'سياسة الخصوصية' : 'Privacy Policy',
      body: isAr ? `
        نحن نلتزم بحماية بياناتك الصحية. 
        - لا يتم تخزين صور الروشتات أو الأدوية بشكل دائم على خوادمنا.
        - يتم معالجة البيانات لحظياً عبر الذكاء الاصطناعي وتشفيرها أثناء النقل.
        - لا نقوم بمشاركة بياناتك مع أي أطراف ثالثة لأغراض إعلانية.
      ` : `
        We are committed to protecting your health data.
        - Prescription and medicine images are not stored permanently on our servers.
        - Data is processed instantly via AI and encrypted during transmission.
        - We do not share your data with third parties for advertising purposes.
      `
    },
    terms: {
      title: isAr ? 'شروط الاستخدام' : 'Terms of Use',
      body: isAr ? `
        باستخدامك لـ MediScan AI، فإنك توافق على:
        - استخدام الموقع للأغراض التعليمية والإرشادية فقط.
        - تحمل المسؤولية الكاملة عن قراراتك الصحية.
        - عدم الاعتماد على نتائج الموقع كبديل للتشخيص الطبي الرسمي.
      ` : `
        By using MediScan AI, you agree to:
        - Use the site for educational and guidance purposes only.
        - Take full responsibility for your health decisions.
        - Not rely on site results as a substitute for official medical diagnosis.
      `
    },
    disclaimer: {
      title: isAr ? 'إخلاء المسؤولية الطبي' : 'Medical Disclaimer',
      body: isAr ? `
        تحذير هام:
        MediScan AI هو مساعد ذكي يستخدم تقنيات الذكاء الاصطناعي لتحليل البيانات الصحية. 
        هذا الموقع لا يقدم تشخيصاً طبياً، ولا يصف علاجاً، ولا يغني عن استشارة الطبيب المختص أو الصيدلي. 
        في حالات الطوارئ، يرجى الاتصال بالإسعاف فوراً.
      ` : `
        Important Warning:
        MediScan AI is an intelligent assistant using AI technology to analyze health data.
        This site does not provide medical diagnosis, prescribe treatment, or replace consultation with a specialist doctor or pharmacist.
        In emergencies, please contact emergency services immediately.
      `
    }
  };

  const active = content[type];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-black text-blue-900">{active.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <i className="fas fa-times-circle text-2xl"></i>
          </button>
        </div>
        <div className="p-8 max-h-[60vh] overflow-y-auto prose prose-slate">
          <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
            {active.body}
          </p>
        </div>
        <div className="p-6 bg-blue-50 text-center">
          <button onClick={onClose} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
            {isAr ? 'فهمت ذلك' : 'I Understand'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
