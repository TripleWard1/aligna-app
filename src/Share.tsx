import React, { useState } from 'react';

const SharePage = () => {
  /* --- ESTADOS NECESSÁRIOS NO TOPO DO COMPONENTE --- */
const [setupMode, setSetupMode] = useState('principal');
const [selectedPart, setSelectedPart] = useState(null);
const [setupSearch, setSetupSearch] = useState('');
const [setupFilter, setSetupFilter] = useState('ALL');
const [vaultSelectedId, setVaultSelectedId] = useState(null);
const [showToast, setShowToast] = useState(false);

const renderSetupTab = () => {
  const tokens = {
    bg: '#F8F9FD',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.06)',
    text: '#1A1B1E',
    muted: '#7C7E8B',
    accent: {
      PC: '#FF4757',
      DISPLAY: '#3742FA',
      INPUT: '#FFA502',
      AUDIO: '#70A1FF',
      LIGHTS: '#2ED573',
      VAULT: '#FFD32A'
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      triggerHaptic('medium'); [cite: 2025-12-17]
      setShowToast(true); [cite: 2025-12-18]
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const setupData = {
    principal: [
      { 
        id: 'main_pc', 
        name: 'PC', 
        brand: 'COMPONENTES', 
        icon: '🖥️', 
        pos: { top: '52%', left: '32%' }, 
        img: '/pc.jpg', 
        cat: 'PC',
        specs: 'Caixa: Phanteks P500a | Motherboard: Asus Rog Strix B550-E Gaming | Memórias: Gskill Trident Z DDR4 6000MHz CL30 | CPU: AMD Ryzen 5 5600X | GPU: Nvidia GeForce RTX 3080 (ASUS TUF Gaming) | Fonte: NZXT Gold 850W | Cooler: Corsair H100i Platinum | Decoração: Funko Stormtrooper | Plantas: IKEA FEJKA',
        hotspots: [
          { id: 0, label: 'Caixa', sub: 'Phanteks P500a', top: '95%', left: '85%' },
          { id: 1, label: 'GPU', sub: 'RTX 3080 TUF', top: '65%', left: '45%' },
          { id: 2, label: 'RAM', sub: 'Gskill Trident Z', top: '40%', left: '55%' },
          { id: 3, label: 'Cooler', sub: 'Corsair H100i', top: '45%', left: '42%' },
          { id: 4, label: 'Motherboard', sub: 'ROG Strix B550-E', top: '35%', left: '35%' },
          { id: 5, label: 'Fonte', sub: 'NZXT 850W Gold', top: '90%', left: '20%' },
          { id: 6, label: 'Funko', sub: 'Stormtrooper', top: '8%', left: '52%' },
          { id: 7, label: 'Plantas', sub: 'IKEA FEJKA', top: '12%', left: '25%' },
          { id: 8, label: 'CPU', sub: 'AMD Ryzen 5 5600X', top: '43%', left: '48%' }
        ]
      },
      { 
        id: 'main_monitors', 
        name: 'MONITORES', 
        brand: 'MSI TRIPLE SETUP', 
        icon: '📺', 
        pos: { top: '55%', left: '22%' }, 
        img: '/monitores.jpg', 
        cat: 'DISPLAY',
        specs: 'Principal: MSI Optix MAG274QRF-QD 27" | Secundário Topo: MSI G2712F 27" | Vertical: MSI G2722 27" | Webcam: Logitech C920',
        hotspots: [
          { id: 0, label: 'Monitor Central', sub: 'MAG274QRF-QD', top: '72%', left: '62%' },
          { id: 1, label: 'Monitor Topo', sub: 'MSI G2712F', top: '22%', left: '64%' },
          { id: 2, label: 'Monitor Vertical', sub: 'MSI G2722', top: '48%', left: '24%' },
          { id: 3, label: 'Webcam', sub: 'Logitech C920', top: '15%', left: '28%' }
        ]
      },
      { 
        id: 'main_perifericos', 
        name: 'DESK SETUP', 
        brand: 'PERIFÉRICOS + MESA', 
        icon: '⌨️', 
        pos: { top: '65%', left: '28%' }, 
        img: '/desk.jpg', 
        cat: 'INPUT',
        specs: 'Rato: Logitech G703 Lightspeed | Teclado: Higround Basecamp 65+ SNOWSTONE | Microfone: FDuce SL40X | Mixer: Fifine Mixer | Braço Microfone: Elgato Low Profile Arm | Rato: Razer Naga Wireless | LED: Govee Rope Light | Desk: IKEA LAGKAPTEN + Alex | Misc: Stream Deck Mk.2 | Luz: Barra de Luz Xiaomi | Cabo: Epomaker Coiled Aviator Cable',
        hotspots: [
          { id: 0, label: 'Rato', sub: 'Logitech G703', top: '40%', left: '68%' },
          { id: 1, label: 'Teclado', sub: 'Higround 65+ Snowstone', top: '55%', left: '52%' },
          { id: 2, label: 'Microfone', sub: 'FDuce SL40X', top: '25%', left: '72%' },
          { id: 3, label: 'Mixer', sub: 'Fifine SC3', top: '30%', left: '53%' },
          { id: 4, label: 'Braço Mic', sub: 'Elgato Low Profile', top: '28%', left: '85%' },
          { id: 5, label: 'Rato', sub: 'Razer Naga Wireless', top: '40%', left: '35%' },
          { id: 6, label: 'LED', sub: 'Govee Rope', top: '55%', left: '85%' },
          { id: 7, label: 'Mesa', sub: 'Gavetas Alex + Tampo LAGKAPTEN', top: '85%', left: '50%' },
          { id: 8, label: 'Misc', sub: 'Stream Deck Mk.2', top: '45%', left: '20%' },
          { id: 9, label: 'Luz', sub: 'Barra Luz Xiaomi', top: '65%', left: '5%' },
          { id: 10, label: 'Cabo', sub: 'Epomaker Coiled Aviator Cable', top: '45%', left: '52%' }
        ]
      },
      { 
        id: 'main_audio', 
        name: 'AUDIO', 
        brand: 'Astro A50 & XSANYUN', 
        icon: '🎙️', 
        pos: { top: '80%', left: '15%' }, 
        img: '/audio.jpg', 
        cat: 'AUDIO',
        specs: 'Headset: Astro A50 | Colunas: xSanuyn | Suporte: RICOO Suporte de Coluna | LED: Govee Bar | Misc: Art3d Painéis de Parede',
        hotspots: [
          { id: 0, label: 'Headset', sub: 'Astro A50', top: '75%', left: '46%' },
          { id: 1, label: 'Colunas', sub: 'xSanuyn', top: '25%', left: '42%' },
          { id: 2, label: 'LED', sub: 'Govee Bar', top: '15%', left: '65%' },
          { id: 3, label: 'Paineis', sub: 'Art3d Wall', top: '45%', left: '70%' },
          { id: 4, label: 'Suporte', sub: 'RICOO Wall Mount', top: '32%', left: '42%' }
        ]
      },
      { 
        id: 'main_lights', 
        name: 'TOP SHELF', 
        brand: 'GOVEE + DECORAÇÃO', 
        icon: '💡', 
        pos: { top: '34%', left: '20%' }, 
        img: '/topshelf.jpg', 
        cat: 'LIGHTS',
        specs: 'Estante: IKEA LACK | Dioramas: Custom Nintendo Switch & Dreamcast | Decoração: 5 Plantas IKEA | LED: Govee Led Strip',
        hotspots: [
          { id: 0, label: 'Diorama', sub: 'Custom Nintendo Switch', top: '50%', left: '49%' },
          { id: 1, label: 'Diorama', sub: 'Custom Dreamcast', top: '57%', left: '85%' },
          { id: 2, label: 'Plantas', sub: 'IKEA FEJKA', top: '61%', left: '21%' },
          { id: 3, label: 'Estante', sub: 'IKEA LACK Black', top: '75%', left: '43%' },
          { id: 4, label: 'LED Strip', sub: 'Govee RGBIC', top: '70%', left: '16%' }
        ]
      },
    ],
    extra: [
      { 
        id: 'ex_mac', 
        name: 'LAPTOP DESK SETUP', 
        brand: 'MACBOOK M3 15"', 
        icon: '🍎', 
        pos: { top: '72%', left: '85%' }, 
        img: '/macbook.jpg', 
        cat: 'INPUT',
        specs: 'Laptop: Macbook M3 15" | Rato: Logitech Pebble | Desk: IKEA LAGKAPTEN + Alex',
        hotspots: [{ id: 0, label: 'Macbook', sub: 'M3 Chip', top: '50%', left: '50%' }]
      },
      { 
        id: 'ex_tcl', 
        name: 'TV', 
        brand: 'TCL 55"', 
        icon: '🎮', 
        pos: { top: '50%', left: '92%' }, 
        img: '/tcl.jpg', 
        cat: 'DISPLAY',
        specs: 'TV: TCL 55"',
        hotspots: [{ id: 0, label: 'Display', sub: '4K HDR', top: '50%', left: '50%' }]
      },
      { 
        id: 'ex_switch', 
        name: 'Nintendo Hub', 
        brand: 'Switch', 
        icon: '🕹️', 
        pos: { top: '60%', left: '80%' }, 
        img: '/switch.jpg', 
        cat: 'PC',
        specs: 'Consola: Nintendo Switch Preta | Comandos: 2 x Nintendo Switch Pro Controller',
        hotspots: [
          { id: 0, label: 'Switch', sub: 'Console', top: '50%', left: '50%' },
          { id: 1, label: 'Pro Controller', sub: 'Nintendo', top: '70%', left: '40%' }
        ]
      },
      { 
        id: 'ex_vault_1', 
        name: 'COLLECTIBLES', 
        brand: 'Retro Collection', 
        icon: '⭐', 
        pos: { top: '45%', left: '81%' }, 
        img: '/meu-setup-vault.jpg', 
        isVault: true, 
        cat: 'VAULT',
        specs: 'Consola: Dreamcast + Comando Original | Collectibles: Sealed Shrouded Fable ETB | Collectibles: Sealed White Flare ETB | Collectibles: Sealed Black Bolt ETB',
        hotspots: [
          { id: 0, label: 'Dreamcast', sub: 'Console + Pad', top: '40%', left: '30%' },
          { id: 1, label: 'ETB Shrouded', sub: 'Sealed', top: '55%', left: '50%' },
          { id: 2, label: 'ETB Flare/Bolt', sub: 'Sealed', top: '65%', left: '70%' }
        ]
      },
    ]
  };

  const rawItems = setupMode === 'principal' ? setupData.principal : setupData.extra;
  const filteredItems = rawItems.filter(item => setupFilter === 'ALL' || item.cat === setupFilter);

  return (
    <div className="setup-mobile-pro" style={{ 
      '--zoom-x': selectedPart ? selectedPart.pos.left : '50%',
      '--zoom-y': selectedPart ? selectedPart.pos.top : '50%'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Outfit:wght@300;400;600;800&display=swap');

        .setup-mobile-pro { background: ${tokens.bg}; color: ${tokens.text}; min-height: 100vh; font-family: 'Outfit', sans-serif; padding-bottom: 140px; position: relative; overflow-x: hidden; }
        .st-header { padding: 40px 24px 20px; position: relative; z-index: 10; }
        .st-header h1 { font-family: 'Syncopate'; font-size: 16px; letter-spacing: 4px; margin: 0; background: linear-gradient(90deg, #1A1B1E, #7C7E8B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .st-header p { font-size: 11px; font-weight: 600; color: ${tokens.muted}; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
        
        .st-nav-pills { display: flex; background: #E9ECF5; padding: 6px; border-radius: 24px; margin-top: 25px; box-shadow: inset 0 2px 6px rgba(0,0,0,0.05); }
        .st-pill { flex: 1; border: none; background: transparent; color: ${tokens.muted}; padding: 14px; border-radius: 20px; font-size: 12px; font-weight: 800; transition: 0.4s; }
        .st-pill.active { background: #FFFFFF; color: ${tokens.text}; box-shadow: 0 8px 20px rgba(0,0,0,0.08); transform: translateY(-1px); }

        .st-photo-container { position: relative; margin: 0 24px; border-radius: 36px; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 30px 60px -20px rgba(0,0,0,0.15); z-index: 10; overflow: hidden; background: #000; }
        .st-main-img { width: 100%; display: block; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: var(--zoom-x) var(--zoom-y); }
        .st-main-img.zoom-active { transform: scale(1.8); filter: brightness(0.7); }
        
        .st-hotspot { position: absolute; width: 40px; height: 40px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; z-index: 15; cursor: pointer; }
        .st-hotspot-inner { width: 32px; height: 32px; background: transparent; border-radius: 50%; border: 3px solid var(--color); display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .st-hotspot.hidden { opacity: 0; pointer-events: none; }

        .st-list { padding: 40px 24px; display: grid; gap: 20px; position: relative; z-index: 10; }
        .st-item { background: #FFFFFF; padding: 22px; border-radius: 30px; display: flex; align-items: center; gap: 20px; border: 1px solid rgba(0,0,0,0.03); box-shadow: 0 10px 25px rgba(0,0,0,0.04); transition: 0.3s; }
        .st-card-icon { width: 65px; height: 65px; background: #F8F9FD; border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 28px; }

        .st-sheet { position: fixed; left: 0; right: 0; bottom: 0; background: #FFFFFF; border-radius: 44px 44px 0 0; z-index: 2000; padding: 45px 28px 140px; transform: translateY(100%); transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1); box-shadow: 0 -25px 50px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto; }
        .st-sheet.open { transform: translateY(0); }
        .st-sheet-overlay { position: fixed; inset: 0; background: rgba(26, 27, 30, 0.4); backdrop-filter: blur(4px); z-index: 1999; opacity: 0; pointer-events: none; transition: 0.6s; }
        .st-sheet-overlay.show { opacity: 1; pointer-events: auto; }

        .vault-hero-frame { position: relative; border-radius: 30px; overflow: hidden; background: #F1F3F7; min-height: 320px; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; }
        .st-vault-hotspot { position: absolute; transform: translate(-50%, -50%); z-index: 100; cursor: pointer; }
        .st-vault-dot { width: 18px; height: 18px; background: transparent; border: 4px solid var(--vault-color); border-radius: 50%; transition: 0.3s; }
        
        .v-tooltip { position: absolute; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-radius: 16px; padding: 12px; min-width: 120px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; flexDirection: column; alignItems: center; z-index: 110; }
        .v-tooltip.pos-right { left: 25px; top: -20px; }
        .v-tooltip.pos-left { right: 25px; top: -20px; }

        .st-spec-pill { background: #F8F9FD; padding: 18px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.02); display: flex; align-items: center; gap: 15px; font-size: 14px; font-weight: 600; }
      `}</style>

      {/* BOTÃO PARTILHAR */}
      <button 
        onClick={(e) => { e.preventDefault(); handleShare(); }}
        style={{ position: 'absolute', top: '40px', right: '24px', background: 'white', padding: '10px 16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: '900', zIndex: 100, cursor: 'pointer' }}
      >
        PARTILHAR 📤
      </button>

      <header className="st-header">
        <h1>GEAR COLLECT</h1>
        <p>Hardware Collection // System 2025</p>
        <div className="st-nav-pills">
          <button className={`st-pill ${setupMode === 'principal' ? 'active' : ''}`} onClick={() => setSetupMode('principal')}>MAIN SETUP</button>
          <button className={`st-pill ${setupMode === 'extra' ? 'active' : ''}`} onClick={() => setSetupMode('extra')}>SECOND SETUP</button>
        </div>
      </header>

      <div className="st-photo-container">
        <img src={setupMode === 'principal' ? "/Foto Principal Setup.jpg" : "/Foto Extra.jpg"} className={`st-main-img ${selectedPart ? 'zoom-active' : ''}`} alt="Setup" />
        {rawItems.map(item => (
          <div key={item.id} className={`st-hotspot ${selectedPart ? 'hidden' : ''}`} style={{ '--color': tokens.accent[item.cat as keyof typeof tokens.accent] } as any} onClick={() => { setSelectedPart(item); setVaultSelectedId(null); triggerHaptic('medium'); }}>
            <div className="st-hotspot-inner"><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tokens.accent[item.cat as keyof typeof tokens.accent] }}></div></div>
          </div>
        ))}
      </div>

      <div className="st-list">
        {filteredItems.map(item => (
          <div key={item.id} className="st-item" onClick={() => { setSelectedPart(item); setVaultSelectedId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="st-card-icon">{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: tokens.accent[item.cat as keyof typeof tokens.accent], fontWeight: '800', textTransform: 'uppercase' }}>{item.brand}</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: tokens.text }}>{item.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={`st-sheet-overlay ${selectedPart ? 'show' : ''}`} onClick={() => { setSelectedPart(null); setVaultSelectedId(null); }}></div>

      <div className={`st-sheet ${selectedPart ? 'open' : ''}`}>
        {selectedPart && (
          <div>
            <div style={{ width: '50px', height: '6px', background: '#EEE', borderRadius: '10px', margin: '-15px auto 35px' }}></div>
            
            <div className="vault-hero-frame">
              <img src={selectedPart.img} alt={selectedPart.name} style={{ width: '100%', objectFit: 'contain' }} />
              {selectedPart.hotspots?.map(hs => (
                <div key={hs.id} className="st-vault-hotspot" style={{ top: hs.top, left: hs.left, '--vault-color': tokens.accent[selectedPart.cat as keyof typeof tokens.accent] } as any} onClick={(e) => { e.stopPropagation(); setVaultSelectedId(hs.id); triggerHaptic('light'); }}>
                  <div className="st-vault-dot"></div>
                  {vaultSelectedId === hs.id && (
                    <div className={`v-tooltip ${parseFloat(hs.left) > 50 ? 'pos-left' : 'pos-right'}`}>
                      <div style={{ fontSize: '9px', fontWeight: '900', color: tokens.accent[selectedPart.cat as keyof typeof tokens.accent], textTransform: 'uppercase' }}>{hs.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: tokens.text }}>{hs.sub}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '25px' }}>
              <div style={{ background: `${tokens.accent[selectedPart.cat as keyof typeof tokens.accent]}15`, color: tokens.accent[selectedPart.cat as keyof typeof tokens.accent], padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', display: 'inline-block' }}>{selectedPart.cat} MODULE</div>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: '800' }}>{selectedPart.name}</h3>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              {selectedPart.specs.split('|').map((s, i) => (
                <div key={i} className="st-spec-pill">
                  <span style={{ color: tokens.accent[selectedPart.cat as keyof typeof tokens.accent], opacity: 0.4 }}>✦</span>
                  {s.trim()}
                </div>
              ))}
            </div>

            <button onClick={() => { setSelectedPart(null); setVaultSelectedId(null); }} style={{ width: '100%', marginTop: '40px', padding: '24px', borderRadius: '28px', border: 'none', background: tokens.text, color: '#FFF', fontWeight: '800', fontSize: '15px' }}>
              FECHAR JANELA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};