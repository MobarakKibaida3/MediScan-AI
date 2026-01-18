
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AnalysisView from './components/AnalysisView';
import AuthModal from './components/AuthModal';
import LegalModal from './components/LegalModal';
import ImageQualityChecker from './components/ImageQualityChecker';
import { analyzeHealthData } from './services/geminiService';
import { auth, db, onAuthStateChanged, signOut, collection, query, where, getDocs, orderBy, addDoc } from './services/firebase';
import { AnalysisResult, ScanType, Language, Translations, User } from './types';

const translations: Record<Language, Translations> = {
  ar: {
    heroTitle: 'MediScan AI: مساعدك الصحي الذكي',
    heroSub: 'حول روشتاتك وتقاريرك إلى معلومات مفهومة مع جداول جرعات وتنبيهات أمان فورية. أمان كامل وخصوصية مطلقة.',
    tabPrescription: 'روشتة',
    tabMedicine: 'دواء',
    tabSymptoms: 'أعراض',
    tabInteractions: 'تفاعلات',
    uploadTitle: 'ارفع صورة المستند',
    uploadSub: 'تأكد من الوضوح والإضاءة لنتائج دقيقة طبياً',
    uploadBtn: 'اختر صورة',
    symptomsPlaceholder: 'صف الأعراض (للكبار أو الأطفال)...',
    analyzeBtn: 'بدء الفحص بالذكاء الاصطناعي',
    loading: 'جاري القراءة والتحليل طبياً...',
    featurePrivacy: 'وضع الخصوصية: لا يتم حفظ الصور نهائياً.',
    featureSpeed: 'معالجة فورية عبر Gemini 3 Flash.',
    featureReports: 'تقارير PDF و QR Code للمشاركة الآمنة.',
    footerAbout: 'MediScan AI: نبسط الطب لنحمي الأرواح.',
    footerLegal: 'إرشاد طبي فقط. استشر طبيبك دائماً.',
    footerRights: 'جميع الحقوق محفوظة.',
    newAnalysis: 'جديد',
    print: 'طباعة',
    warningHeader: 'تحذير',
    recHeader: 'نصيحة',
    login: 'دخول',
    logout: 'خروج',
    signup: 'تسجيل',
    email: 'إيميل',
    password: 'كلمة السر',
    googleLogin: 'دخول جوجل',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب؟',
    authRequired: 'سجل لحفظ تاريخك الصحي سحابياً.',
    exportPdf: 'تصدير PDF',
    preview: 'معاينة'
  },
  en: {
    heroTitle: 'MediScan AI: Smart Health Hub',
    heroSub: 'Convert prescriptions into clear insights with dosage schedules and instant safety alerts. Total privacy.',
    tabPrescription: 'Prescription',
    tabMedicine: 'Medicine',
    tabSymptoms: 'Symptoms',
    tabInteractions: 'Interactions',
    uploadTitle: 'Upload Document',
    uploadSub: 'Ensure clarity and lighting for medical precision',
    uploadBtn: 'Pick Image',
    symptomsPlaceholder: 'Describe symptoms (Adult or Child)...',
    analyzeBtn: 'Start AI Scan',
    loading: 'Processing medical data...',
    featurePrivacy: 'Privacy Mode: No images are stored.',
    featureSpeed: 'Instant processing via Gemini 3 Flash.',
    featureReports: 'PDF & QR Reports for safe sharing.',
    footerAbout: 'MediScan AI: Simplifying medicine to save lives.',
    footerLegal: 'Guidance only. Always consult a doctor.',
    footerRights: 'All rights reserved.',
    newAnalysis: 'New',
    print: 'Print',
    warningHeader: 'Warning',
    recHeader: 'Advice',
    login: 'Login',
    logout: 'Logout',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    googleLogin: 'Google Sign-in',
    noAccount: 'No account?',
    hasAccount: 'Have account?',
    authRequired: 'Register to sync history to cloud.',
    exportPdf: 'Export PDF',
    preview: 'Preview'
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<ScanType>('prescription');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [userHistory, setUserHistory] = useState<AnalysisResult[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [symptomsText, setSymptomsText] = useState('');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [userConsent, setUserConsent] = useState(false);
  const [legalModal, setLegalModal] = useState<{isOpen: boolean, type: 'privacy' | 'terms' | 'disclaimer'}>({
    isOpen: false,
    type: 'privacy'
  });

  const isAr = lang === 'ar';
  const t = translations[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email}&background=0D8ABC&color=fff`
        });
        fetchUserHistory(firebaseUser.uid);
      } else {
        setUser(null);
        const local = localStorage.getItem('mediscan_guest_history');
        setUserHistory(local ? JSON.parse(local) : []);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserHistory = async (userId: string) => {
    try {
      const q = query(collection(db, "analyses"), where("userId", "==", userId), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const history: AnalysisResult[] = [];
      querySnapshot.forEach((doc) => { history.push({ id: doc.id, ...doc.data() } as AnalysisResult); });
      setUserHistory(history);
    } catch (e) { console.error(e); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
        setBase64Data((ev.target?.result as string).split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (!userConsent) {
      alert(isAr ? 'يرجى الموافقة على بروتوكول الخصوصية أولاً.' : 'Please agree to privacy protocol first.');
      return;
    }
    setLoading(true);
    try {
      const context = `Privacy: ${privacyMode}, Language: ${lang}`;
      let payload = base64Data || symptomsText;
      const res = await analyzeHealthData(activeTab, payload, !!base64Data, lang, context);
      const finalResult = { ...res, userId: user?.id || 'guest', timestamp: Date.now() };

      if (user && !privacyMode) {
        const docRef = await addDoc(collection(db, "analyses"), finalResult);
        setResult({ ...finalResult, id: docRef.id });
      } else {
        setResult({ ...finalResult, id: 'guest-' + Date.now() });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col font-['Tajawal'] ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Header lang={lang} setLang={setLang} user={user} onLogout={async () => { await signOut(auth); setResult(null); }} onOpenAuth={() => setIsAuthModalOpen(true)} t={t} />
      
      <main className="flex-grow py-8 px-4 container mx-auto">
        {!result ? (
          <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
            <section className="text-center py-10 space-y-8">
               <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-blue-100 mb-2 shadow-sm">
                  <i className="fas fa-sparkles"></i> AI-Powered Clinical Intelligence
               </div>
               <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                  {isAr ? ' MediScan AI' : 'MediScan AI'}
               </h1>
              <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.heroSub}</p>
              
              <div className="flex flex-col items-center gap-6 pt-4">
                <label className="flex items-center gap-4 cursor-pointer bg-white px-8 py-4 rounded-[2rem] border-2 border-slate-50 shadow-sm hover:border-blue-200 transition-all">
                  <input 
                    type="checkbox" 
                    checked={userConsent} 
                    onChange={e => setUserConsent(e.target.checked)}
                    className="w-6 h-6 rounded-lg accent-blue-600"
                  />
                  <span className="text-sm font-black text-slate-600">
                    {isAr ? 'أوافق على فحص بياناتي للأغراض الإرشادية فقط' : 'I agree to scan my data for informational purposes only'}
                  </span>
                </label>
              </div>
            </section>

            <div className="flex flex-wrap justify-center gap-3">
              {(['prescription', 'labs', 'medicine', 'symptoms', 'firstaid'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPreviewUrl(null); setBase64Data(null); }}
                  className={`px-6 py-4 rounded-[2rem] font-black transition-all flex items-center gap-3 border-2 ${activeTab === tab ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-105' : (darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50')}`}
                >
                  <i className={`fas ${tab === 'prescription' ? 'fa-receipt' : tab === 'medicine' ? 'fa-pills' : tab === 'labs' ? 'fa-vial' : tab === 'symptoms' ? 'fa-heart-pulse' : 'fa-kit-medical'}`}></i>
                  {tab === 'labs' ? (isAr ? 'تحاليل' : 'Labs') : t[`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof Translations]}
                </button>
              ))}
            </div>

            <div className={`rounded-[3.5rem] shadow-3xl p-10 border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
               <div className="text-center">
                   {loading ? (
                     <div className="py-20 flex flex-col items-center gap-8">
                       <div className="w-20 h-20 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                       <div className="text-blue-600 font-black text-2xl animate-pulse">{t.loading}</div>
                     </div>
                   ) : (
                     <div className="space-y-8">
                      {activeTab === 'symptoms' ? (
                        <textarea value={symptomsText} onChange={(e) => setSymptomsText(e.target.value)} placeholder={t.symptomsPlaceholder} className={`w-full h-56 p-8 rounded-[2.5rem] border-2 outline-none text-xl transition-all ${darkMode ? 'bg-slate-950 border-slate-800 focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500 focus:bg-white'}`} />
                      ) : (
                        <div onClick={() => document.getElementById('file-in')?.click()} className={`border-4 border-dashed rounded-[3rem] p-16 cursor-pointer transition-all hover:bg-blue-50/10 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                          {previewUrl ? (
                            <img src={previewUrl} className="max-h-80 mx-auto rounded-3xl shadow-2xl border-4 border-white" />
                          ) : (
                            <div className="space-y-6">
                              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                                <i className="fas fa-camera-rotate text-4xl"></i>
                              </div>
                              <h3 className="text-3xl font-black text-slate-800">{t.uploadTitle}</h3>
                              <p className="text-slate-400 max-w-xs mx-auto text-lg">{t.uploadSub}</p>
                            </div>
                          )}
                          <input id="file-in" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                      )}
                      
                      <button onClick={handleStartAnalysis} className="w-full max-w-xl py-6 rounded-[2rem] font-black text-2xl shadow-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-4 mx-auto active:scale-95">
                        <i className="fas fa-wand-sparkles"></i>
                        {t.analyzeBtn}
                      </button>
                     </div>
                   )}
                </div>
            </div>
          </div>
        ) : (
          <AnalysisView result={result} onReset={() => setResult(null)} lang={lang} />
        )}
      </main>

      <footer className={`py-16 px-6 mt-auto border-t ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-50'}`}>
        <div className="container mx-auto max-w-4xl text-center space-y-10">
           
           {/* --- Professional Logo in Footer --- */}
           <div className="flex flex-col items-center gap-4">
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg rotate-3"></div>
                <i className="fas fa-heart-pulse text-white text-2xl relative z-10"></i>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                  <i className="fas fa-search text-[8px] text-white"></i>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-black tracking-tighter leading-none">
                    <span className="text-blue-600">Medi</span><span className="text-emerald-500">Scan</span>
                  </h2>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase rounded-full border border-slate-200 tracking-tight">
                    Free
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                  Your Health, Our Help — <span className="text-blue-600/70 font-black">100% Free Service</span>
                </p>
              </div>
           </div>

           <div className="flex justify-center gap-10 text-xs font-black uppercase text-slate-400">
              <button onClick={() => setLegalModal({isOpen: true, type: 'privacy'})} className="hover:text-blue-500 transition-colors">Privacy</button>
              <button onClick={() => setLegalModal({isOpen: true, type: 'terms'})} className="hover:text-blue-500 transition-colors">Terms</button>
              <button onClick={() => setLegalModal({isOpen: true, type: 'disclaimer'})} className="hover:text-blue-500 transition-colors">Disclaimer</button>
           </div>

           <p className="text-[10px] opacity-40 leading-relaxed italic max-w-lg mx-auto text-slate-400">{t.footerLegal}</p>
           <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">© 2024 MediScan AI - All Rights Reserved</p>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} lang={lang} t={t} />
      <LegalModal isOpen={legalModal.isOpen} type={legalModal.type} lang={lang} onClose={() => setLegalModal({...legalModal, isOpen: false})} />
    </div>
  );
};

export default App;
