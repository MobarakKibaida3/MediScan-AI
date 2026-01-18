
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
    <header className="sticky top-0 z-50 w-full glass-morphism border-b border-blue-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Navigation Controls Only */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <button 
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-100 text-slate-500 font-bold hover:bg-blue-50 hover:text-blue-600 transition-all text-xs"
          >
            <i className="fas fa-globe text-blue-400"></i>
            <span className="hidden sm:inline">{isAr ? 'English' : 'العربية'}</span>
            <span className="sm:hidden uppercase">{isAr ? 'en' : 'ar'}</span>
          </button>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-white/50 p-1 pr-3 rounded-full border border-slate-100 hover:border-blue-200 transition-all"
              >
                <img src={user.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="Avatar" />
                <i className={`fas fa-chevron-down text-[9px] text-slate-300 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}></i>
              </button>
              
              {showDropdown && (
                <div className={`absolute top-full mt-2 ${isAr ? 'left-0' : 'right-0'} w-48 bg-white rounded-2xl shadow-xl border border-blue-50 py-2 animate-fade-in z-[100]`}>
                  <button className={`w-full ${isAr ? 'text-right' : 'text-left'} px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-blue-50 flex items-center gap-3 transition-colors`}>
                    <i className="fas fa-history text-blue-500"></i>
                    {isAr ? 'السجل الطبي' : 'History'}
                  </button>
                  <div className="h-px bg-slate-50 my-1"></div>
                  <button 
                    onClick={() => { onLogout(); setShowDropdown(false); }}
                    className={`w-full ${isAr ? 'text-right' : 'text-left'} px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors`}
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
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-black text-xs hover:bg-blue-600 transition-all shadow-md active:scale-95"
            >
              {t.login}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
