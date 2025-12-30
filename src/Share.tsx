import React, { useState } from 'react';

const SharePage = () => {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('setup');
  const [setupMode, setSetupMode] = useState('principal');
  const [selectedPart, setSelectedPart] = useState(null);
  const [setupFilter, setSetupFilter] = useState('ALL');
  const [vaultSelectedId, setVaultSelectedId] = useState(null);

  // Função para evitar erros de compilação
  const triggerHaptic = (type: string) => console.log('Haptic:', type);

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

  const setupData = {
    principal: [
      { 
        id: 'main_pc', name: 'PC', brand: 'COMPONENTES', icon: '🖥️', 
        pos: { top: '52%', left: '32%' }, img: '/pc.jpg', cat: 'PC',
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
        id: 'main_monitors', name: 'MONITORES', brand: 'MSI TRIPLE SETUP', icon: '📺', 
        pos: { top: '55%', left: '22%' }, img: '/monitores.jpg', cat: 'DISPLAY',
        specs: 'Principal: MSI Optix MAG274QRF-QD 27" | Secundário Topo: MSI G2712F 27" | Vertical: MSI G2722 27" | Webcam: Logitech C920',
        hotspots: [
          { id: 0, label: 'Monitor Central', sub: 'MAG274QRF-QD', top: '72%', left: '62%' },
          { id: 1, label: 'Monitor Topo', sub: 'MSI G2712F', top: '22%', left: '64%' },
          { id: 2, label: 'Monitor Vertical', sub: 'MSI G2722', top: '48%', left: '24%' },
          { id: 3, label: 'Webcam', sub: 'Logitech C920', top: '15%', left: '28%' }
        ]
      },
      { 
        id: 'main_perifericos', name: 'DESK SETUP', brand: 'PERIFÉRICOS + MESA', icon: '⌨️', 
        pos: { top: '65%', left: '28%' }, img: '/desk.jpg', cat: 'INPUT',
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
        id: 'main_audio', name: 'AUDIO', brand: 'Astro A50 & XSANYUN', icon: '🎙️', 
        pos: { top: '80%', left: '15%' }, img: '/audio.jpg', cat: 'AUDIO',
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
        id: 'main_lights', name: 'TOP SHELF', brand: 'GOVEE + DECORAÇÃO', icon: '💡', 
        pos: { top: '34%', left: '20%' }, img: '/topshelf.jpg', cat: 'LIGHTS',
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
    extra: []
  };

  const rawItems = setupMode === 'principal' ? setupData.principal : setupData.extra;
  const filteredItems = rawItems.filter(item => setupFilter === 'ALL' || item.cat === setupFilter);

  // --- COMPONENTE POKÉBOLA REAL ---
  const renderPokemonTab = () => (
    <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '100vh', background: '#F8F9FD' }}>
       <div style={{
          width: '140px', height: '140px', background: 'linear-gradient(to bottom, #ee1515 50%, white 50%)',
          borderRadius: '50%', border: '10px solid #222', position: 'relative', margin: '40px auto',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)', cursor: 'pointer'
        }}>
          <div style={{ position: 'absolute', width: '100%', height: '10px', background: '#222', top: '50%', transform: 'translateY(-50%)' }} />
          <div style={{
            position: 'absolute', width: '40px', height: '40px', background: 'white', 
            border: '8px solid #222', borderRadius: '50%', top: '50%', left: '50%', 
            transform: 'translate(-50%, -50%)', zIndex: 10
          }} />
        </div>
        <h2 style={{ fontFamily: 'Syncopate', fontSize: '18px', letterSpacing: '2px' }}>THE VAULT</h2>
        <p style={{ fontFamily: 'Outfit', color: tokens.muted, marginTop: '10px' }}>Coleção Selada Pokémon</p>
    </div>
  );

  return (
    <div className="setup-mobile-pro" style={{ 
      '--zoom-x': selectedPart ? selectedPart.pos.left : '50%',
      '--zoom-y': selectedPart ? selectedPart.pos.top : '50%'
    } as any}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Outfit:wght@300;400;600;800&display=swap');
        .setup-mobile-pro { background: ${tokens.bg}; color: ${tokens.text}; min-height: 100vh; font-family: 'Outfit', sans-serif; padding-bottom: 140px; position: relative; overflow-x: hidden; }
        .st-header { padding: 40px 24px 20px; position: relative; z-index: 10; }
        .st-header h1 { font-family: 'Syncopate'; font-size: 16px; letter-spacing: 4px; margin: 0; background: linear-gradient(90deg, #1A1B1E, #7C7E8B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .st-header p { font-size: 11px; font-weight: 600; color: ${tokens.muted}; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
        .st-photo-container { position: relative; margin: 0 24px; border-radius: 36px; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 30px 60px -20px rgba(0,0,0,0.15); overflow: hidden; background: #000; }
        .st-main-img { width: 100%; display: block; transition: 0.8s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: var(--zoom-x) var(--zoom-y); }
        .st-main-img.zoom-active { transform: scale(1.8); filter: brightness(0.7); }
        .st-hotspot { position: absolute; width: 40px; height: 40px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; z-index: 15; }
        .st-hotspot-inner { width: 32px; height: 32px; background: transparent; border-radius: 50%; border: 3px solid var(--color); display: flex; align-items: center; justify-content: center; }
        .st-list { padding: 40px 24px; display: grid; gap: 20px; }
        .st-item { background: #FFFFFF; padding: 22px; border-radius: 30px; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.04); }
        .st-card-icon { width: 65px; height: 65px; background: #F8F9FD; border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
        .st-sheet { position: fixed; left: 0; right: 0; bottom: 0; background: #FFFFFF; border-top-left-radius: 44px; border-top-right-radius: 44px; z-index: 2000; padding: 45px 28px 160px; transform: translateY(100%); transition: 0.6s cubic-bezier(0.19, 1, 0.22, 1); box-shadow: 0 -25px 50px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto; }
        .st-sheet.open { transform: translateY(0); }
        .st-sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1999; opacity: 0; pointer-events: none; transition: 0.6s; }
        .st-sheet-overlay.show { opacity: 1; pointer-events: auto; }
        .vault-hero-frame { position: relative; border-radius: 30px; overflow: hidden; background: #F1F3F7; min-height: 320px; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; }
        .st-vault-dot { width: 18px; height: 18px; background: transparent; border: 4px solid var(--vault-color); border-radius: 50%; }
        .st-spec-pill { background: #F8F9FD; padding: 18px; border-radius: 20px; margin-bottom: 10px; font-weight: 600; font-size: 14px; }
        .public-nav { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: white; padding: 12px 30px; border-radius: 40px; display: flex; gap: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 3000; }
      `}</style>

      {activeTab === 'setup' ? (
        <>
          <header className="st-header">
            <h1>GEAR COLLECT</h1>
            <p>Public View // System 2025</p>
          </header>

          <div className="st-photo-container">
            <img src="/Foto Principal Setup.jpg" className={`st-main-img ${selectedPart ? 'zoom-active' : ''}`} alt="Setup" />
            {rawItems.map(item => (
              <div key={item.id} className="st-hotspot" style={{ '--color': tokens.accent[item.cat as keyof typeof tokens.accent], top: item.pos.top, left: item.pos.left } as any} onClick={() => { setSelectedPart(item); setVaultSelectedId(null); }}>
                <div className="st-hotspot-inner"><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tokens.accent[item.cat as keyof typeof tokens.accent] }}></div></div>
              </div>
            ))}
          </div>

          <div className="st-list">
            {filteredItems.map(item => (
              <div key={item.id} className="st-item" onClick={() => { setSelectedPart(item); setVaultSelectedId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className="st-card-icon">{item.icon}</div>
                <div>
                  <div style={{ fontSize: '10px', color: tokens.accent[item.cat as keyof typeof tokens.accent], fontWeight: '800' }}>{item.brand}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : renderPokemonTab()}

      <div className={`st-sheet-overlay ${selectedPart ? 'show' : ''}`} onClick={() => setSelectedPart(null)}></div>
      <div className={`st-sheet ${selectedPart ? 'open' : ''}`}>
        {selectedPart && (
          <div>
            <div className="vault-hero-frame"><img src={selectedPart.img} style={{width: '100%'}} /></div>
            <h3 style={{ fontSize: '28px', fontWeight: '800' }}>{selectedPart.name}</h3>
            <p style={{ color: tokens.accent[selectedPart.cat as keyof typeof tokens.accent], fontWeight: '900', marginBottom: '20px' }}>{selectedPart.cat} MODULE</p>
            {selectedPart.specs.split('|').map((s, i) => (
              <div key={i} className="st-spec-pill">{s.trim()}</div>
            ))}
            <button onClick={() => setSelectedPart(null)} style={{ width: '100%', marginTop: '30px', padding: '20px', borderRadius: '20px', background: '#000', color: '#fff', border: 'none', fontWeight: '800' }}>FECHAR</button>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default SharePage;