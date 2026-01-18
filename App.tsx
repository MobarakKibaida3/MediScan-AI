
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AnalysisView from './components/AnalysisView';
import AuthModal from './components/AuthModal';
import LegalModal from './components/LegalModal';
import { analyzeHealthData } from './services/geminiService';
import { auth, db, onAuthStateChanged, signOut, collection, query, where, getDocs, orderBy, addDoc } from './services/firebase';
import { AnalysisResult, ScanType, Language, Translations, User } from './types';

const translations: Record<Language, Translations> = {
  ar: {
    heroTitle: 'افهم صحتك بذكاء، أمان، وسهولة',
    heroSub: 'حول تقاريرك الطبية وروشتاتك إلى معلومات مفهومة. مساعدك الأول لفهم الأدوية والتحاليل والأعراض.',
    tabPrescription: 'مسح روشتة',
    tabMedicine: 'تحليل دواء',
    tabSymptoms: 'فحص أعراض',
    tabInteractions: 'تفاعل الأدوية',
    uploadTitle: 'ارفع صورة واضحة',
    uploadSub: 'تأكد من وضوح النص والإضاءة الجيدة',
    uploadBtn: 'اختر الصورة',
    symptomsPlaceholder: 'صف أعراضك بدقة...',
    analyzeBtn: 'بدء التحليل',
    loading: 'جاري المعالجة طبياً...',
    featurePrivacy: 'بياناتك مشفرة ومحمية سحابياً.',
    featureSpeed: 'تحليل فوري بذكاء Gemini 3.',
    featureReports: 'تقارير شاملة مع جدول جرعات يومي.',
    footerAbout: 'MediScan AI: بوابتك لفهم لغة الطب والتحاليل بسهولة.',
    footerLegal: 'تنبيه: لأغراض إرشادية فقط. لا يغني عن الطبيب.',
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
    authRequired: 'يرجى الدخول لحفظ بياناتك.',
    exportPdf: 'تصدير',
    preview: 'معاينة'
  },
  en: {
    heroTitle: 'Understand Health Smarter & Safer',
    heroSub: 'Convert medical reports and prescriptions into clear insights. Your guide to meds, labs, and symptoms.',
    tabPrescription: 'Prescription',
    tabMedicine: 'Medicine Info',
    tabSymptoms: 'Symptoms',
    tabInteractions: 'Interactions',
    uploadTitle: 'Upload Clear Photo',
    uploadSub: 'Ensure text is readable and well-lit',
    uploadBtn: 'Pick Image',
    symptomsPlaceholder: 'Describe your symptoms...',
    analyzeBtn: 'Start Analysis',
    loading: 'Processing medical data...',
    featurePrivacy: 'Data is encrypted and stored securely.',
    featureSpeed: 'Instant analysis with Gemini 3.',
    featureReports: 'Comprehensive reports with schedules.',
    footerAbout: 'MediScan AI: Simplifying medical language for everyone.',
    footerLegal: 'Disclaimer: Guidance only. No substitute for a doctor.',
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
    authRequired: 'Please login to save data.',
    exportPdf: 'Export',
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
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: 'disclaimer' as any });

  // 1. مراقبة حالة تسجيل الدخول عبر Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email}&background=0D8ABC&color=fff`
        };
        setUser(u);
        fetchUserHistory(u.id);
      } else {
        setUser(null);
        setUserHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserHistory = async (userId: string) => {
    try {
      const q = query(
        collection(db, "analyses"), 
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const history: AnalysisResult[] = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() } as AnalysisResult);
      });
      setUserHistory(history);
    } catch (e) {
      console.error("Error fetching history:", e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setResult(null);
  };

  const runAnalysis = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setLoading(true);
    try {
      let analysisData: any;
      if (activeTab === 'symptoms') analysisData = { text: 'General analysis' };
      else {
        if (!base64Data) throw new Error("No image");
        analysisData = base64Data;
      }

      const res = await analyzeHealthData(activeTab, analysisData, !!base64Data, lang);
      
      const finalResultData = {
        ...res,
        userId: user.id,
        timestamp: Date.now()
      };

      // حفظ في Firestore
      const docRef = await addDoc(collection(db, "analyses"), finalResultData);
      const finalResult = { ...finalResultData, id: docRef.id } as AnalysisResult;

      setResult(finalResult);
      setUserHistory(prev => [finalResult, ...prev]);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        lang={lang} 
        setLang={setLang} 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
        t={t} 
      />
      
      <main className="flex-grow py-8 px-4">
        {!result ? (
          <div className="max-w-6xl mx-auto space-y-12">
            <section className="text-center py-10">
              <h1 className="text-5xl font-black text-blue-900 mb-4 tracking-tight">{t.heroTitle}</h1>
              <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">{t.heroSub}</p>
            </section>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {(['prescription', 'medicine', 'labs', 'symptoms', 'interactions', 'firstaid'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPreviewUrl(null); setBase64Data(null); }}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all border-2 flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-white text-blue-600 border-blue-50 hover:bg-blue-50'}`}
                >
                  <i className={`fas ${tab === 'prescription' ? 'fa-file-medical' : tab === 'medicine' ? 'fa-pills' : tab === 'labs' ? 'fa-microscope' : tab === 'symptoms' ? 'fa-stethoscope' : tab === 'interactions' ? 'fa-vial' : 'fa-kit-medical'}`}></i>
                  {tab === 'labs' ? (lang === 'ar' ? 'قارئ التحاليل' : 'Labs Reader') : 
                   tab === 'firstaid' ? (lang === 'ar' ? 'إسعافات أولية' : 'First Aid') : 
                   t[`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof Translations]}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-blue-50 relative overflow-hidden">
               <div className="text-center space-y-6">
                   {loading ? (
                     <div className="p-20 flex flex-col items-center justify-center gap-4">
                       <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <div className="text-blue-600 font-bold text-xl animate-pulse">{t.loading}</div>
                     </div>
                   ) : (
                     <>
                      <div 
                        onClick={() => document.getElementById('file-in')?.click()}
                        className="border-4 border-dashed border-blue-100 rounded-[2.5rem] p-16 cursor-pointer hover:bg-blue-50/50 transition-all group relative overflow-hidden"
                      >
                        {previewUrl ? (
                          <div className="relative inline-block">
                            <img src={previewUrl} className="max-h-64 mx-auto rounded-3xl shadow-2xl border-8 border-white" />
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 group-hover:scale-110 transition-transform">
                              <i className="fas fa-camera-retro text-4xl"></i>
                            </div>
                            <div>
                              <h3 className="text-2xl font-black text-blue-900">{t.uploadTitle}</h3>
                              <p className="text-gray-400 mt-2 max-w-xs mx-auto">{t.uploadSub}</p>
                            </div>
                          </div>
                        )}
                        <input id="file-in" type="file" className="hidden" accept="image/*" onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setPreviewUrl(reader.result as string);
                              setBase64Data((reader.result as string).split(',')[1]);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>
                      <div className="pt-6">
                        <button 
                          onClick={runAnalysis} 
                          className="w-full max-w-sm py-5 rounded-2xl font-black text-xl shadow-xl bg-blue-600 text-white hover:bg-blue-700 mx-auto flex items-center justify-center gap-3"
                        >
                          <i className="fas fa-brain"></i>
                          {t.analyzeBtn}
                        </button>
                      </div>
                     </>
                   )}
                </div>
            </div>

            {user && userHistory.length > 0 && !loading && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-px bg-slate-200 flex-grow"></div>
                  <h3 className="font-black text-slate-400 text-xs uppercase tracking-[0.2em]">{lang === 'ar' ? 'سجلك الصحي السحابي' : 'Cloud Health History'}</h3>
                  <div className="h-px bg-slate-200 flex-grow"></div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userHistory.map((h) => (
                    <div key={h.id} onClick={() => setResult(h)} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all group">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <i className="fas fa-file-prescription"></i>
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm text-slate-800 truncate">{h.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(h.timestamp).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <AnalysisView result={result} onReset={() => setResult(null)} lang={lang} />
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-16 px-4">
        <div className="container mx-auto text-center space-y-4">
          <p className="text-[11px] opacity-50">{t.footerLegal}</p>
          <div className="flex justify-center gap-4 text-xs font-bold">
             <button onClick={() => setLegalModal({isOpen: true, type: 'privacy'})} className="hover:text-white transition-colors">Privacy</button>
             <button onClick={() => setLegalModal({isOpen: true, type: 'terms'})} className="hover:text-white transition-colors">Terms</button>
          </div>
          <p className="text-center text-[10px] opacity-30">© {new Date().getFullYear()} MediScan AI. Connected to Firebase.</p>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} lang={lang} t={t} />
      <LegalModal isOpen={legalModal.isOpen} type={legalModal.type} lang={lang} onClose={() => setLegalModal({...legalModal, isOpen: false})} />
    </div>
  );
};

export default App;
