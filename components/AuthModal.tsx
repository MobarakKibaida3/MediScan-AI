
import React, { useState } from 'react';
import { Language, Translations } from '../types';
import { auth, signInWithPopup, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../services/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  t: Translations;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, lang, t }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const getErrorMessage = (err: any) => {
    const code = err.code || '';
    if (code === 'auth/email-already-in-use') return isAr ? 'هذا البريد مسجل مسبقاً' : 'Email already in use';
    if (code === 'auth/weak-password') return isAr ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') 
      return isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials';
    if (code === 'auth/internal-error') return isAr ? 'خطأ داخلي، يرجى المحاولة لاحقاً' : 'Internal error, please try again';
    return isAr ? 'حدث خطأ: ' + err.message : err.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
        <button onClick={onClose} className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600`}><i className="fas fa-times text-xl"></i></button>
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-900">{isLogin ? t.login : t.signup}</h2>
            <p className="text-gray-400 text-sm mt-1">{isAr ? 'انضم لمجتمع ميدي سكان' : 'Join MediScan Community'}</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
               <label className="text-xs font-bold text-gray-500 mr-2">{t.email}</label>
               <input 
                  type="email" 
                  required 
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:bg-white focus:border-blue-300 transition-all disabled:opacity-50" 
                  placeholder="user@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
            </div>
            <div className="space-y-1">
               <label className="text-xs font-bold text-gray-500 mr-2">{t.password}</label>
               <input 
                  type="password" 
                  required 
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:bg-white focus:border-blue-300 transition-all disabled:opacity-50" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform disabled:bg-blue-300 flex justify-center items-center gap-2"
            >
              {loading && <i className="fas fa-circle-notch animate-spin"></i>}
              {isLogin ? t.login : t.signup}
            </button>
          </form>

          <div className="relative my-8">
             <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
             <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">{isAr ? 'أو عبر' : 'Or continue with'}</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            {t.googleLogin}
          </button>
          
          <div className="mt-8 text-center text-sm">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              disabled={loading}
              className="text-blue-600 font-bold hover:underline"
            >
              {isLogin ? t.noAccount : t.hasAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
