import React, { useState } from 'react';

const SharePage = () => {
  /* --- ESTADOS --- */
  const [activeTab, setActiveTab] = useState('setup');
  const [setupMode, setSetupMode] = useState('principal');
  const [selectedPart, setSelectedPart] = useState(null);
  const [vaultSelectedId, setVaultSelectedId] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Função simulada para o SharePage não dar erro se não houver a função real
  const triggerHaptic = (type: string) => console.log('Haptic:', type);

  const tokens = {
    bg: '#F8F9FD',
    surface: '#FFFFFF',
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
        specs: 'Rato: Logitech G703 | Teclado: Higround 65+ | Microfone: FDuce SL40X | Mixer: Fifine | Rato: Razer Naga | LED: Govee | Mesa: IKEA | Misc: Stream Deck | Luz: Xiaomi | Cabo: Epomaker',
        hotspots: [
          { id: 0, label: 'Rato', sub: 'Logitech G703', top: '40%', left: '68%' },
          { id: 1, label: 'Teclado', sub: 'Higround 65+', top: '55%', left: '52%' }
        ]
      },
      { 
        id: 'main_audio', name: 'AUDIO', brand: 'Astro A50 & XSANYUN', icon: '🎙️', 
        pos: { top: '80%', left: '15%' }, img: '/audio.jpg', cat: 'AUDIO',
        specs: 'Headset: Astro A50 | Colunas: xSanuyn | Suporte: RICOO | LED: Govee Bar | Misc: Art3d',
        hotspots: [
          { id: 0, label: 'Headset', sub: 'Astro A50', top: '75%', left: '46%' }
        ]
      },
      { 
        id: 'main_lights', name: 'TOP SHELF', brand: 'GOVEE + DECORAÇÃO', icon: '💡', 
        pos: { top: '34%', left: '20%' }, img: '/topshelf.jpg', cat: 'LIGHTS',
        specs: 'Estante: IKEA LACK | Dioramas: Custom | Decoração: Plantas | LED: Govee Strip',
        hotspots: [
          { id: 0, label: 'Diorama', sub: 'Nintendo Switch', top: '50%', left: '49%' }
        ]
      },
    ],
    extra: [
      { 
        id: 'ex_mac', name: 'LAPTOP DESK', brand: 'MACBOOK M3', icon: '🍎', 
        pos: { top: '72%', left: '85%' }, img: '/macbook.jpg', cat: 'INPUT',
        specs: 'Laptop: Macbook M3 15" | Rato: Logitech Pebble',
        hotspots: [{ id: 0, label: 'Macbook', sub: 'M3 Chip', top: '50%', left: '50%' }]
      }
    ]
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const rawItems = setupMode === 'principal' ? setupData.principal : setupData.extra;

  return (
    <div className="share-page" style={{ 
      background: tokens.bg, minHeight: '100vh', fontFamily: 'Outfit, sans-serif', paddingBottom: '120px',
      '--zoom-x': selectedPart ? selectedPart.pos.left : '50%',
      '--zoom-y': selectedPart ? selectedPart.pos.top : '50%'
    } as any}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Outfit:wght@300;400;600;800&display=swap');
        .st-header { padding: 50px 24px 20px; text-align: center; }
        .st-header h1 { font-family: 'Syncopate'; font-size: 18px; letter-spacing: 4px; }
        .st-nav-pills { display: flex; background: #E9ECF5; padding: 6px; border-radius: 24px; margin: 20px auto; max-width: 320px; }
        .st-pill { flex: 1; border: none; background: transparent; padding: 12px; border-radius: 20px; font-size: 11px; font-weight: 800; cursor: pointer; }
        .st-pill.active { background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .st-photo-container { position: relative; margin: 0 20px; border-radius: 30px; overflow: hidden; background: #000; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .st-main-img { width: 100%; display: block; transition: 0.8s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: var(--zoom-x) var(--zoom-y); }
        .st-main-img.zoom { transform: scale(1.8); filter: brightness(0.6); }
        .st-hotspot { position: absolute; width: 35px; height: 35px; transform: translate(-50%, -50%); z-index: 10; }
        .st-hotspot-inner { width: 100%; height: 100%; border: 3px solid var(--color); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .st-list { padding: 30px 20px; display: grid; gap: 15px; }
        .st-item { background: white; padding: 20px; border-radius: 25px; display: flex; align-items: center; gap: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
        .st-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 40px 40px 0 0; z-index: 2000; padding: 40px 24px 120px; transform: translateY(100%); transition: 0.6s cubic-bezier(0.19, 1, 0.22, 1); max-height: 85vh; overflow-y: auto; }
        .st-sheet.open { transform: translateY(0); }
        .st-sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1999; opacity: 0; pointer-events: none; transition: 0.4s; }
        .st-sheet-overlay.show { opacity: 1; pointer-events: auto; }
        .v-tooltip { position: absolute; background: white; padding: 10px; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); z-index: 100; min-width: 100px; text-align: center; }
      `}</style>

      {activeTab === 'setup' ? (
        <>
          <header className="st-header">
            <h1>GEAR COLLECT</h1>
            <div className="st-nav-pills">
              <button className={`st-pill ${setupMode === 'principal' ? 'active' : ''}`} onClick={() => setSetupMode('principal')}>MAIN</button>
              <button className={`st-pill ${setupMode === 'extra' ? 'active' : ''}`} onClick={() => setSetupMode('extra')}>SECOND</button>
            </div>
          </header>

          <div className="st-photo-container">
            <img 
              src={setupMode === 'principal' ? "/Foto Principal Setup.jpg" : "/Foto Extra.jpg"} 
              className={`st-main-img ${selectedPart ? 'zoom' : ''}`} 
            />
            {!selectedPart && rawItems.map(item => (
              <div key={item.id} className="st-hotspot" style={{ top: item.pos.top, left: item.pos.left, '--color': tokens.accent[item.cat as keyof typeof tokens.accent] } as any} onClick={() => setSelectedPart(item)}>
                <div className="st-hotspot-inner"><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tokens.accent[item.cat as keyof typeof tokens.accent] }} /></div>
              </div>
            ))}
          </div>

          <div className="st-list">
            {rawItems.map(item => (
              <div key={item.id} className="st-item" onClick={() => setSelectedPart(item)}>
                <div style={{ fontSize: '24px' }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '10px', color: tokens.accent[item.cat as keyof typeof tokens.accent], fontWeight: '900' }}>{item.brand}</div>
                  <div style={{ fontSize: '16px', fontWeight: '800' }}>{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syncopate' }}>THE VAULT</h2>
          <p>Coleção Pokémon Brevemente</p>
        </div>
      )}

      {/* MODAL DETALHES */}
      <div className={`st-sheet-overlay ${selectedPart ? 'show' : ''}`} onClick={() => setSelectedPart(null)} />
      <div className={`st-sheet ${selectedPart ? 'open' : ''}`}>
        {selectedPart && (
          <div>
            <div style={{ width: '40px', height: '5px', background: '#ddd', borderRadius: '10px', margin: '-10px auto 30px' }} />
            <div style={{ position: 'relative', background: '#f5f5f5', borderRadius: '20px', overflow: 'hidden', marginBottom: '25px' }}>
                <img src={selectedPart.img} style={{ width: '100%' }} />
                {selectedPart.hotspots?.map(hs => (
                    <div key={hs.id} style={{ position: 'absolute', top: hs.top, left: hs.left }} onClick={() => setVaultSelectedId(hs.id)}>
                        <div style={{ width: '15px', height: '15px', border: '3px solid white', borderRadius: '50%', background: tokens.accent[selectedPart.cat as keyof typeof tokens.accent] }} />
                        {vaultSelectedId === hs.id && (
                            <div className="v-tooltip" style={{ top: '-45px', left: '-45px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '900' }}>{hs.label}</div>
                                <div style={{ fontSize: '12px' }}>{hs.sub}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 20px' }}>{selectedPart.name}</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {selectedPart.specs.split('|').map((s, i) => (
                <div key={i} style={{ background: '#f8f9fd', padding: '15px', borderRadius: '15px', fontWeight: '600' }}>{s.trim()}</div>
              ))}
            </div>
            <button onClick={() => setSelectedPart(null)} style={{ width: '100%', marginTop: '30px', padding: '20px', borderRadius: '20px', background: '#000', color: '#fff', border: 'none', fontWeight: '800' }}>FECHAR</button>
          </div>
        )}
      </div>

      {/* DOCK INFERIOR */}
      <nav style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '12px 25px', borderRadius: '35px', display: 'flex', gap: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 2000 }}>
        <button onClick={() => setActiveTab('pokemon')} style={{ background: 'none', border: 'none', opacity: activeTab === 'pokemon' ? 1 : 0.3 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" style={{ width: '24px' }} alt="pk" />
        </button>
        <button onClick={() => setActiveTab('setup')} style={{ background: 'none', border: 'none', fontSize: '24px', opacity: activeTab === 'setup' ? 1 : 0.3 }}>🖥️</button>
      </nav>

      {/* TOAST LINK COPIADO */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: '120px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', color: 'white', padding: '12px 25px', borderRadius: '20px', zIndex: 9999, fontWeight: 'bold', fontSize: '12px' }}>
          LINK COPIADO ✨
        </div>
      )}
    </div>
  );
};

export default SharePage;