import React, { useEffect, useRef } from 'react';
import { ThemeType, UserData } from '../types';
import { THEMES } from '../constants';
import { Crown, Sparkles } from 'lucide-react';

interface AdSenseAdProps {
  theme: ThemeType;
  userData: Partial<UserData>;
  onGoToSettings?: () => void;
  slotType?: 'banner' | 'sidebar' | 'inline';
}

export const AdSenseAd: React.FC<AdSenseAdProps> = ({
  theme,
  userData,
  onGoToSettings,
  slotType = 'banner'
}) => {
  const currentTheme = THEMES[theme];
  const isPremium = !!userData.isPremium;
  const adsEnabled = !!userData.adsenseEnabled;
  const publisherId = userData.adsensePublisherId || 'ca-pub-XXXXXXXXXX';
  const slotId = userData.adsenseSlotId || 'XXXXXXXXXX';
  const scriptInjectedRef = useRef<boolean>(false);

  // 1. Check if the user is Premium: Premium users NEVER get ads!
  if (isPremium) {
    return null;
  }

  // 2. Inject Google AdSense script dynamically in head when ads are enabled
  useEffect(() => {
    if (!adsEnabled || scriptInjectedRef.current) return;

    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      scriptInjectedRef.current = true;
    }

    // Initialize adsbygoogle
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.warn("Google AdSense loading or push error:", e);
    }
  }, [adsEnabled, publisherId, slotId]);

  // If Ads are explicitly enabled, render the real Google AdSense block
  if (adsEnabled) {
    return (
      <div className="w-full my-6 p-4 bg-black/10 rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center">
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-30 mb-2">Publicité AdSense</span>
        
        {/* Real Google AdSense Tag */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '90px', width: '100%' }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        
        <span className="text-[8px] font-mono opacity-25 mt-2">ID: {publisherId} | Slot: {slotId}</span>
      </div>
    );
  }

  // If ads are not enabled, render a beautiful native promo box inviting user to upgrade to premium (house ad)
  return (
    <div className={`w-full my-8 ${currentTheme.card} p-6 rounded-3xl border ${currentTheme.accent} relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none -mr-8 -mt-8" />
      
      <div className="flex items-center gap-4 relative z-10 text-center md:text-left flex-col md:flex-row">
        <div className="p-3.5 rounded-2xl bg-amber-400/10 text-amber-400">
          <Sparkles size={22} className="animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-tight flex items-center justify-center md:justify-start gap-1.5">
            Optimisez vos révisions avec EVO Premium ! <span className="text-[10px] bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full font-black uppercase">Sans Pub</span>
          </h4>
          <p className="text-xs opacity-50 max-w-xl leading-relaxed mt-1">
            Débloquez la planification intelligente par l'Assistant IA, les ondes sonores de concentration (Alpha, Bêta, Thêta), et profitez d'une interface épurée sans aucune distraction.
          </p>
        </div>
      </div>

      {onGoToSettings && (
        <button
          onClick={onGoToSettings}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-lg relative z-10 flex items-center gap-2"
        >
          <Crown size={14} className="fill-black/10" /> Découvrir Premium
        </button>
      )}
    </div>
  );
};
