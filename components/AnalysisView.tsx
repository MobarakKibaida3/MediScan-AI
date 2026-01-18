
import React, { useState } from 'react';
import { AnalysisResult, Language } from '../types';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
  lang: Language;
}

const AnalysisView: React.FC<Props> = ({ result, onReset, lang }) => {
  const isAr = lang === 'ar';
  const isEmergency = result.symptomInsights?.urgency?.toLowerCase().includes('emergency');
  const [hideSensitive, setHideSensitive] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState<Set<number>>(new Set());

  const toggleAlert = (idx: number, medicine: string) => {
    if (activeAlerts.has(idx)) {
      setActiveAlerts(prev => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    } else {
      if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            alert(isAr ? `تنبيه دواء: ${medicine}` : `Reminder: ${medicine}`);
            setActiveAlerts(prev => new Set(prev).add(idx));
          }
        });
      }
    }
  };

  const copyDoctorSummary = () => {
    const meds = result.prescriptionData?.map(m => `- ${m.name}: ${m.dosage} (${m.frequency})`).join('\n') || '';
    const summaryText = `[MediScan AI Clinical Summary]\n\nPatient ID: ${hideSensitive ? '****' : result.userId}\nTitle: ${result.title}\nSummary: ${result.summary}\n\nMedications:\n${meds}\n\nRecommendations: ${result.recommendations.join(', ')}\n\n⚠️ Disclaimer: For guidance only.`;
    
    navigator.clipboard.writeText(summaryText);
    alert(isAr ? 'تم نسخ ملخص الطبيب بنجاح' : 'Doctor summary copied successfully');
  };

  const shareReport = () => {
    const text = `${hideSensitive ? 'MediScan AI Clinical Report' : result.title}\n${result.summary}\n\nVia MediScan AI`;
    if (navigator.share) {
      navigator.share({ title: 'MediScan Report', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert(isAr ? 'تم نسخ رابط التقرير بأمان' : 'Report link copied securely');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 animate-fade-in p-2 print:p-0" dir={isAr ? 'rtl' : 'ltr'}>
      {isEmergency && (
        <div className="bg-red-600 text-white p-10 rounded-[3rem] shadow-3xl flex items-center gap-10 border-4 border-red-400 animate-pulse">
          <i className="fas fa-exclamation-triangle text-6xl"></i>
          <div>
            <h3 className="text-4xl font-black mb-2">{isAr ? 'خطر طبي حرج!' : 'Critical Medical Risk!'}</h3>
            <p className="text-xl opacity-90 leading-tight">
              {isAr ? 'يجب التوجه لأقرب قسم طوارئ فوراً.' : 'Immediate ER visit required.'}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[4rem] shadow-3xl overflow-hidden border border-slate-100 print:shadow-none print:border-none">
        <div className={`p-12 text-white flex flex-col md:flex-row justify-between items-start gap-10 ${isEmergency ? 'bg-red-800' : 'bg-gradient-to-br from-blue-900 to-blue-700'}`}>
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap gap-4 items-center">
               <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                 <i className="fas fa-shield-heart"></i> Verified Clinical Logic
               </div>
               <button onClick={() => setHideSensitive(!hideSensitive)} className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all">
                 <i className={`fas ${hideSensitive ? 'fa-eye' : 'fa-eye-slash'}`}></i> {isAr ? (hideSensitive ? 'إظهار البيانات' : 'إخفاء البيانات') : (hideSensitive ? 'Show Data' : 'Hide Data')}
               </button>
            </div>
            <h2 className="text-5xl font-black leading-tight tracking-tight">
              {hideSensitive ? (isAr ? 'تقرير طبي محمي' : 'Protected Clinical Report') : result.title}
            </h2>
            <p className="text-blue-10 opacity-80 max-w-3xl text-xl leading-relaxed italic">{result.summary}</p>
            
            <button 
              onClick={copyDoctorSummary}
              className="bg-white text-blue-900 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-blue-50 transition-colors shadow-lg"
            >
              <i className="fas fa-copy"></i>
              {isAr ? 'نسخ ملخص الطبيب' : 'Copy Doctor Summary'}
            </button>
          </div>
          
          <div className="hidden md:flex flex-col items-center gap-4 bg-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl border border-white/20 shrink-0">
             <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center p-3 shadow-2xl">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}&color=1e3a8a`} alt="QR" className="w-full h-full" />
             </div>
             <span className="text-[10px] font-black opacity-60 uppercase tracking-tighter">Secure Sharing Hub</span>
          </div>
        </div>

        <div className="p-12 space-y-20">
          {result.dosageSchedule && result.dosageSchedule.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"><i className="fas fa-clock text-2xl"></i></div>
                <h3 className="text-3xl font-black text-emerald-900">{isAr ? 'الجدول الزمني للجرعات' : 'Dosage Timeline'}</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.dosageSchedule.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 relative group hover:scale-105 transition-all">
                    <button onClick={() => toggleAlert(idx, item.medicine)} className={`absolute top-6 ${isAr ? 'left-6' : 'right-6'} w-10 h-10 rounded-full flex items-center justify-center ${activeAlerts.has(idx) ? 'bg-emerald-600 text-white' : 'bg-white text-slate-300 shadow-sm'}`}>
                      <i className={`fas ${activeAlerts.has(idx) ? 'fa-bell' : 'fa-bell-slash'}`}></i>
                    </button>
                    <div className="text-3xl font-black text-emerald-700 mb-2">{item.time}</div>
                    <div className="text-xl font-black text-slate-900 mb-3">{item.medicine}</div>
                    <p className="text-slate-500 text-sm italic">{item.instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.labAnalysis && result.labAnalysis.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><i className="fas fa-vial text-2xl"></i></div>
                <h3 className="text-3xl font-black text-blue-900">{isAr ? 'تحليل النتائج المخبرية' : 'Lab Result Analysis'}</h3>
              </div>
              <div className="grid gap-4">
                {result.labAnalysis.map((test, idx) => (
                  <div key={idx} className={`p-8 rounded-[2rem] border-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${test.status === 'High' ? 'bg-red-50 border-red-100' : test.status === 'Low' ? 'bg-orange-50 border-orange-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div>
                      <h4 className="font-black text-xl text-slate-900">{test.testName}</h4>
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{test.referenceRange}</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-black ${test.status === 'High' ? 'text-red-600' : test.status === 'Low' ? 'text-orange-600' : 'text-emerald-600'}`}>{test.value}</div>
                      <div className="text-xs font-black uppercase opacity-60">{test.status}</div>
                    </div>
                    <p className="md:max-w-xs text-sm text-slate-600 leading-relaxed font-medium italic">{test.simplifiedExplanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-10 pt-12 border-t border-slate-100">
            <div className="bg-red-50/50 p-10 rounded-[3rem] border-2 border-red-50 space-y-6">
              <h4 className="text-2xl font-black text-red-700 flex items-center gap-4"><i className="fas fa-biohazard"></i> {isAr ? 'تنبيهات الأمان' : 'Safety Alerts'}</h4>
              <ul className="space-y-4">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-sm font-black text-red-900 flex gap-3 leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span> {w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50/50 p-10 rounded-[3rem] border-2 border-blue-50 space-y-6">
              <h4 className="text-2xl font-black text-blue-700 flex items-center gap-4"><i className="fas fa-stethoscope"></i> {isAr ? 'توصيات المساعد' : 'Clinical Guidance'}</h4>
              <ul className="space-y-4">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm font-black text-blue-900 flex gap-3 leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="p-12 bg-slate-50 border-t flex flex-wrap gap-6 print:hidden">
          <button onClick={onReset} className="flex-1 min-w-[180px] bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95">
            <i className="fas fa-plus-circle"></i> {isAr ? 'فحص جديد' : 'New Scan'}
          </button>
          <button onClick={shareReport} className="flex-1 min-w-[180px] bg-white border-2 border-slate-200 text-slate-700 py-6 rounded-[2rem] font-black text-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-4 active:scale-95">
            <i className="fas fa-share-nodes"></i> {isAr ? 'مشاركة آمنة' : 'Secure Share'}
          </button>
          <button onClick={() => window.print()} className="flex-1 min-w-[180px] bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95">
            <i className="fas fa-file-pdf"></i> {isAr ? 'تصدير PDF' : 'Save PDF'}
          </button>
        </div>

        <div className="p-10 bg-slate-900 text-slate-500 text-[10px] text-center italic border-t border-slate-800">
          <p className="max-w-3xl mx-auto leading-relaxed">{result.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
