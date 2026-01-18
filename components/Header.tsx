
import React, { useState } from 'react';
import { Language, User, Translations } from '../types';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
  user: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  t: Translations;
}

const Header: React.FC<Props> = ({ lang, setLang, user, onLogout, onOpenAuth, t }) => {
  const isAr = lang === 'ar';
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full glass-morphism border-b border-blue-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <i className="fas fa-microscope text-xl"></i>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight">
            MediScan <span className="text-blue-600">AI</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 font-bold hover:bg-blue-50 transition-all text-sm"
          >
            <i className="fas fa-globe"></i>
            <span className="hidden sm:inline">{isAr ? 'English' : 'العربية'}</span>
            <span className="sm:hidden">{isAr ? 'EN' : 'AR'}</span>
          </button>
          
          <nav className="hidden lg:flex items-center gap-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              {isAr ? 'الرئيسية' : 'Home'}
            </a>
            <a href="#analyze" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              {isAr ? 'تحليل جديد' : 'New Analysis'}
            </a>
          </nav>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-blue-50 p-1 pr-3 rounded-full hover:bg-blue-100 transition-all border border-blue-100"
              >
                <span className="text-sm font-bold text-blue-900 hidden md:inline">{user.name}</span>
                <img src={user.avatar} className="w-8 h-8 rounded-full border-2 border-white" alt="Avatar" />
              </button>
              
              {showDropdown && (
                <div className={`absolute top-full mt-2 ${isAr ? 'left-0' : 'right-0'} w-48 bg-white rounded-2xl shadow-xl border border-blue-50 py-2 animate-fade-in`}>
                  <div className="px-4 py-2 border-b border-gray-50 mb-2">
                    <p className="text-xs text-gray-400 font-bold uppercase">{isAr ? 'الحساب' : 'Account'}</p>
                    <p className="text-sm font-bold truncate">{user.email}</p>
                  </div>
                  <button className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2">
                    <i className="fas fa-history text-blue-500"></i>
                    {isAr ? 'سجل التحليلات' : 'Analysis History'}
                  </button>
                  <button 
                    onClick={() => { onLogout(); setShowDropdown(false); }}
                    className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 text-sm md:text-base flex items-center gap-2"
            >
              <i className="fas fa-user-circle"></i>
              {t.login}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
