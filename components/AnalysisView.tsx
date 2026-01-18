
import React from 'react';
import { AnalysisResult, Language } from '../types';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
  lang: Language;
}

const AnalysisView: React.FC<Props> = ({ result, onReset, lang }) => {
  const isAr = lang === 'ar';
  const isEmergency = result.symptomInsights?.urgency === 'EMERGENCY';
  
  const handleShare = async () => {
    const text = `${result.title}\n${result.summary}\nMediScan AI`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MediScan AI Report', text, url: window.location.href });
      } catch (e) { console.log(e); }
    } else {
      const el = document.createElement('textarea');
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      alert(isAr ? 'تم نسخ الرابط للمشاركة' : 'Link copied to share');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in p-4 print:p-0 print:m-0 print:max-w-none" dir={isAr ? 'rtl' : 'ltr'}>
      {isEmergency && (
        <div className="bg-red-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-6 animate-pulse border-4 border-red-400 print:border-red-600">
          <i className="fas fa-ambulance text-4xl"></i>
          <div>
            <h3 className="text-xl font-black">{isAr ? 'حالة طوارئ محتملة!' : 'Potential Emergency Detected!'}</h3>
            <p className="text-sm opacity-90">{isAr ? 'الأعراض المذكورة قد تشير لخطورة. يرجى التوجه لأقرب مستشفى فوراً.' : 'The symptoms described may be serious. Please visit the nearest ER immediately.'}</p>
          </div>
        </div>
      )}

      <div className={`bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border ${isEmergency ? 'border-red-200' : 'border-blue-50'} print:shadow-none print:border-none print:rounded-none`}>
        <div className={`${isEmergency ? 'bg-red-700' : 'bg-blue-600'} p-8 text-white flex justify-between items-center print:bg-white print:text-blue-900 print:border-b-2 print:border-blue-100`}>
          <div className="flex-1">
            <h2 className="text-3xl font-black mb-2 print:text-2xl">{result.title}</h2>
            <p className="text-blue-50 opacity-90 max-w-lg print:text-gray-600 print:text-sm">{result.summary}</p>
          </div>
          <div className="hidden print:block text-right">
             <div className="text-xl font-black text-blue-600">MediScan AI</div>
             <div className="text-[10px] text-gray-400">{new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</div>
          </div>
        </div>

        <div className="p-8 space-y-12 print:p-4">
          {/* تم إصلاح عرض الجدول هنا لضمان عدم ظهور خلايا فارغة */}
          {result.prescriptionData && result.prescriptionData.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-file-prescription text-xl"></i>
                </div>
                <h3 className="text-2xl font-black text-blue-900">
                  {isAr ? 'بيانات الروشتة المستخرجة' : 'Extracted Prescription Data'}
                </h3>
              </div>
              
              <div className="overflow-hidden rounded-[2rem] border border-blue-100 shadow-sm">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-blue-50/50 text-blue-900 font-bold">
                      <th className="p-5 border-b border-blue-50">{isAr ? 'الدواء' : 'Medicine'}</th>
                      <th className="p-5 border-b border-blue-50">{isAr ? 'الجرعة' : 'Dosage'}</th>
                      <th className="p-5 border-b border-blue-50">{isAr ? 'التكرار' : 'Frequency'}</th>
                      <th className="p-5 border-b border-blue-50">{isAr ? 'المدة' : 'Duration'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {result.prescriptionData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                        <td className="p-5 font-bold text-blue-700 text-lg">{item.name || '—'}</td>
                        <td className="p-5 text-gray-600">{item.dosage || '—'}</td>
                        <td className="p-5 text-gray-600">{item.frequency || '—'}</td>
                        <td className="p-5 text-gray-600">{item.duration || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* عرض جدول الجرعات بشكل أفضل */}
          {result.dosageSchedule && result.dosageSchedule.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-clock text-xl"></i>
                </div>
                <h3 className="text-2xl font-black text-emerald-900">
                  {isAr ? 'جدول المواعيد اليومي' : 'Daily Dosage Schedule'}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.dosageSchedule.map((item, idx) => (
                  <div key={idx} className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100 hover:shadow-md transition-all">
                    <div className="text-emerald-700 font-black text-xl mb-2">{item.time}</div>
                    <div className="text-slate-900 font-bold mb-1">{item.medicine}</div>
                    <div className="text-slate-500 text-sm">{item.instruction}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 border-t border-slate-100 pt-10">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-red-700 flex items-center gap-2"><i className="fas fa-shield-virus"></i>{isAr ? 'تحذيرات هامة' : 'Safety Alerts'}</h3>
              {result.warnings.map((w, i) => (
                <div key={i} className="flex gap-3 text-red-800 bg-red-50 p-5 rounded-[1.5rem] text-sm font-medium border border-red-100 shadow-sm">{w}</div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-black text-blue-800 flex items-center gap-2"><i className="fas fa-user-md"></i>{isAr ? 'توصيات طبية' : 'Advice'}</h3>
              {result.recommendations.map((r, i) => (
                <div key={i} className="flex gap-3 text-blue-800 bg-blue-50 p-5 rounded-[1.5rem] text-sm font-medium border border-blue-100 shadow-sm">{r}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t flex flex-wrap gap-4 print:hidden">
          <button onClick={onReset} className="flex-1 min-w-[150px] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
            <i className="fas fa-redo"></i> {isAr ? 'تحليل جديد' : 'New Analysis'}
          </button>
          <button onClick={handleExportPDF} className="flex-1 min-w-[150px] bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
            <i className="fas fa-file-pdf"></i> {isAr ? 'تصدير PDF' : 'Export PDF'}
          </button>
          <button onClick={handleShare} className="flex-1 min-w-[150px] bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            <i className="fas fa-share-alt"></i> {isAr ? 'مشاركة' : 'Share'}
          </button>
        </div>

        <div className="p-8 bg-slate-900 text-slate-400 text-xs text-center italic border-t border-slate-800 print:bg-white print:text-black print:border-slate-200">
          <p className="mb-2">{result.disclaimer}</p>
          <p className="font-bold opacity-50 uppercase tracking-widest">MediScan AI - Health Intelligence System</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
