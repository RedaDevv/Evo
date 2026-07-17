import React, { useState } from 'react';
import { ThemeType, UserData } from '../types';
import { THEMES } from '../constants';
import { ExternalLink, HelpCircle, Code, Play, Check, AlertTriangle, Save, Eye, RefreshCw, Layers } from 'lucide-react';

interface AdSenseGuideProps {
  theme: ThemeType;
  userData: Partial<UserData>;
  onUpdateUserData: (updates: Partial<UserData>) => void;
}

export const AdSenseGuide: React.FC<AdSenseGuideProps> = ({
  theme,
  userData,
  onUpdateUserData
}) => {
  const currentTheme = THEMES[theme];
  const [activeTab, setActiveTab] = useState<'guide' | 'simulator'>('guide');
  
  // States for AdSense config
  const [publisherId, setPublisherId] = useState(userData.adsensePublisherId || 'ca-pub-XXXXXXXXXXXXXXXX');
  const [slotId, setSlotId] = useState(userData.adsenseSlotId || 'XXXXXXXXXX');
  const [adsEnabled, setAdsEnabled] = useState(!!userData.adsenseEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveConfig = () => {
    setIsSaving(true);
    onUpdateUserData({
      adsensePublisherId: publisherId,
      adsenseSlotId: slotId,
      adsenseEnabled: adsEnabled
    });
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 600);
  };

  return (
    <section className={`${currentTheme.card} p-8 rounded-[2.5rem] border ${currentTheme.accent} shadow-xl relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none -mr-16 -mt-16" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-400/10 text-amber-400">
            <Layers size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Monétisation Google AdSense</h3>
            <p className="text-xs font-bold opacity-50 uppercase tracking-wider">Configurez et intégrez vos blocs d'annonces</p>
          </div>
        </div>
        
        {/* Tab Selector */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'guide' ? 'bg-white/10 text-white' : 'opacity-60 hover:opacity-100'}`}
          >
            <HelpCircle size={14} /> Guide d'intégration
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'simulator' ? 'bg-white/10 text-white' : 'opacity-60 hover:opacity-100'}`}
          >
            <Eye size={14} /> Simulateur & Configuration
          </button>
        </div>
      </div>

      {activeTab === 'guide' ? (
        /* STEP BY STEP GUIDE */
        <div className="space-y-6 relative z-10 animate-in fade-in duration-300">
          <p className="text-sm text-[var(--text)]/70 leading-relaxed">
            Pour diffuser de vraies annonces Google AdSense sur votre application, il est nécessaire de lier votre code de script AdSense à la page principale et d'insérer des emplacements d'annonces réactifs. Suivez ces étapes simples :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center font-black text-xs">
                1
              </div>
              <h4 className="font-bold text-sm">Ajouter le Script Global</h4>
              <p className="text-xs opacity-50 leading-relaxed">
                Insérez le tag de script officiel AdSense dans l'en-tête de votre fichier <code className="text-amber-400 font-mono">index.html</code> (avant la fermeture de la balise <code className="opacity-80 font-mono">&lt;/head&gt;</code>) :
              </p>
              <div className="bg-black/40 p-2 rounded-lg text-[10px] font-mono text-white/80 overflow-x-auto select-all border border-white/5 whitespace-pre leading-normal">
{`<!-- AdSense Global Script -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>`}
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center font-black text-xs">
                2
              </div>
              <h4 className="font-bold text-sm">Insérer l'Emplacement</h4>
              <p className="text-xs opacity-50 leading-relaxed">
                Placez le code HTML du bloc d'annonces là où vous souhaitez qu'il apparaisse. Nous avons conçu pour vous un composant réactif qui adapte sa taille automatiquement :
              </p>
              <div className="bg-black/40 p-2 rounded-lg text-[10px] font-mono text-white/80 overflow-x-auto select-all border border-white/5 whitespace-pre leading-normal">
{`<ins className="adsbygoogle"
     style={{ display: 'block' }}
     data-ad-client="ca-pub-XXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true" />`}
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center font-black text-xs">
                3
              </div>
              <h4 className="font-bold text-sm">Initialiser Dynamiquement</h4>
              <p className="text-xs opacity-50 leading-relaxed">
                Dans les applications React, les annonces doivent être déclenchées à la volée lors de l'affichage du composant :
              </p>
              <div className="bg-black/40 p-2 rounded-lg text-[10px] font-mono text-white/80 overflow-x-auto select-all border border-white/5 whitespace-pre leading-normal">
{`useEffect(() => {
  try {
    ((window as any).adsbygoogle = 
     (window as any).adsbygoogle || [])
     .push({});
  } catch (e) {
    console.error(e);
  }
}, []);`}
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center p-4 rounded-xl bg-amber-400/5 border border-amber-400/10 text-amber-400 text-xs leading-relaxed">
            <AlertTriangle size={18} className="shrink-0" />
            <p className="font-medium">
              <strong>Conseil AdSense :</strong> Veillez à configurer le fichier <code className="font-mono">ads.txt</code> à la racine de votre nom de domaine pour garantir la monétisation optimale de votre trafic et éviter les alertes de gains perdus de Google.
            </p>
          </div>
        </div>
      ) : (
        /* CONFIGURATION AND SIMULATOR */
        <div className="space-y-6 relative z-10 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Parameters column */}
            <div className="lg:col-span-5 bg-black/30 p-5 rounded-2xl border border-white/5 space-y-4 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Code size={14} /> Paramètres AdSense
              </span>
              <p className="opacity-70 leading-relaxed font-semibold">
                Saisissez vos identifiants AdSense pour activer la monétisation réelle sur l'application.
              </p>
              
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1.5">ID Éditeur (Publisher ID) :</label>
                  <input 
                    type="text" 
                    value={publisherId}
                    onChange={(e) => setPublisherId(e.target.value)}
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-[11px] font-mono outline-none focus:border-amber-400 transition-colors text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1.5">ID de l'Emplacement (Slot ID) :</label>
                  <input 
                    type="text" 
                    value={slotId}
                    onChange={(e) => setSlotId(e.target.value)}
                    placeholder="XXXXXXXXXX"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-[11px] font-mono outline-none focus:border-amber-400 transition-colors text-white"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <span className="font-bold block text-sm">Activer les blocs d'annonces</span>
                    <span className="opacity-40 text-[10px]">Permet d'afficher les espaces publicitaires.</span>
                  </div>
                  <button
                    onClick={() => setAdsEnabled(!adsEnabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${adsEnabled ? 'bg-amber-400' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-all ${adsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                  {showSuccess ? 'Enregistré avec succès !' : 'Enregistrer la configuration'}
                </button>
              </div>
            </div>

            {/* Live mockup simulator column */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest opacity-40">Aperçu Visuel de l'Emplacement d'Annonce</span>
                
                {/* Simulated Ad box */}
                <div className="w-full border-2 border-dashed border-amber-400/20 bg-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between items-center min-h-[220px] text-center">
                  <span className="absolute top-2 left-3 text-[9px] font-bold opacity-30 tracking-widest uppercase">Annonce Google AdSense Simulée</span>
                  <span className="absolute top-2 right-3 text-[8px] font-mono text-amber-400 opacity-60 bg-amber-400/15 border border-amber-400/20 px-1.5 py-0.5 rounded">
                    Format Responsive
                  </span>

                  <div className="my-auto space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400 mx-auto">
                      <Play size={20} className="fill-amber-400/20" />
                    </div>
                    <h5 className="font-black text-sm text-[var(--text)]">Vos études méritent EVO Study Premium</h5>
                    <p className="text-xs opacity-50 max-w-sm leading-relaxed text-[var(--text)]">
                      L'outil idéal pour organiser vos études, synchroniser vos calendriers, écouter des ondes sonores relaxantes et réussir vos examens sereinement.
                    </p>
                  </div>

                  <div className="w-full pt-3 border-t border-white/5 flex justify-between items-center text-[10px] opacity-40 font-mono">
                    <span>Client: {publisherId}</span>
                    <span>Slot: {slotId}</span>
                  </div>
                </div>

                <p className="text-[10px] opacity-45 leading-relaxed italic text-center">
                  * Cet aperçu simule exactement le rendu d'une publicité sur l'application. Si vous configurez de vrais identifiants et intégrez le script global, des annonces personnalisées y seront insérées à la place de cette simulation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
