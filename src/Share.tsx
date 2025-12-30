import React, { useState } from 'react';

const SharePage = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [setupMode, setSetupMode] = useState('principal');
  const [selectedPart, setSelectedPart] = useState(null);
  const [vaultSelectedId, setVaultSelectedId] = useState(null);

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
        pos: { top: '52%', left: '32%' }, img: '/Foto Principal Setup.jpg', cat: 'PC',
        specs: 'Caixa: Phanteks P500a | Motherboard: Asus Rog Strix B550-E Gaming | Memórias: Gskill Trident Z DDR4 6000MHz CL30 | CPU: AMD Ryzen 5 5600X | GPU: Nvidia GeForce RTX 3080 (ASUS TUF Gaming) | Fonte: NZXT Gold 850W | Cooler: Corsair H100i Platinum | Decoração: Funko Stormtrooper | Plantas: IKEA FEJKA',
        hotspots: [
          { id: 0, label: 'Caixa', sub: 'Phanteks P500a', top: '95%', left: '85%' },
          { id: 1, label: 'GPU', sub: 'RTX 3080 TUF', top: '65%', left: '45%' },
          { id: 2, label: 'RAM', sub: 'Gskill Trident Z', top: '40%', left: '55%' }
        ]
      },
      { 
        id: 'main_monitors', name: 'MONITORES', brand: 'MSI TRIPLE SETUP', icon: '📺', 
        pos: { top: '55%', left: '22%' }, img: '/Foto Principal Setup.jpg', cat: 'DISPLAY',
        specs: 'Principal: MSI Optix MAG274QRF-QD 27" | Secundário Topo: MSI G2712F 27" | Vertical: MSI G2722 27" | Webcam: Logitech C920',
        hotspots: [
          { id: 0, label: 'Monitor Central', sub: 'MAG274QRF-QD', top: '72%', left: '62%' }
        ]
      }
      // Adiciona aqui os outros itens se necessário seguindo o mesmo padrão
    ]
  };

  const renderPokemonTab = () => (
    <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '100vh', background: '#F8F9FD' }}>
       <div style={{
          width: '140px', height: '140px', background: 'linear-gradient(to bottom, #ee1515 50%, white 50%)',
          borderRadius: '50%', border: '10px solid #222', position: 'relative', margin: '0 auto 30px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
        }}>
          <div style={{ position: 'absolute', width: '100%', height: '10px', background: '#222', top: '50%', transform: 'translateY(-50%)' }} />
          <div style={{
            position: 'absolute', width: '40px', height: '40px', background: 'white', 
            border: '8px solid #222', borderRadius: '50%', top: '50%', left: '50%', 
            transform: 'translate(-50%, -50%)', zIndex: 10
          }} />
        </div>
        <h2 style={{ fontFamily: 'Syncopate', fontSize: '18px', letterSpacing: '2px' }}>THE VAULT</h2>
        <p style={{ fontFamily: 'Outfit', color: tokens.muted }}>Coleção Pokémon Brevemente</p>
    </div>
  );

  return (
    <div className="share-container" style={{
      background: tokens.bg,
      minHeight: '100vh',
      fontFamily: 'Outfit, sans-serif',
      color: tokens.text,
      paddingBottom: '120px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Outfit:wght@300;400;600;800&display=swap');
        
        .st-header { padding: 60px 24px 30px; text-align: center; }
        .st-header h1 { font-family: 'Syncopate'; font-size: 22px; margin: 0; letter-spacing: 2px; }
        .st-header p { font-size: 12px; color: ${tokens.muted}; margin-top: 8px; font-weight: 600; }

        .st-photo-wrapper { position: relative; margin: 0 20px; border-radius: 30px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); background: #000; }
        .st-img { width: 100%; display: block; transition: 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .st-img.zoom { transform: scale(1.5); filter: brightness(0.6); }

        .st-hotspot { position: absolute; width: 35px; height: 35px; transform: translate(-50%, -50%); z-index: 10; cursor: pointer; }
        .st-hotspot-inner { width: 100%; height: 100%; border-radius: 50%; border: 3px solid var(--color); display: flex; align-items: center; justify-content: center; }
        
        .st-list { padding: 30px 20px; display: grid; gap: 15px; }
        .st-item { background: white; padding: 20px; border-radius: 25px; display: flex; align-items: center; gap: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); cursor: pointer; }
        .st-icon-box { width: 55px; height: 55px; background: #f0f2f5; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; }

        .st-sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); z-index: 1000; opacity: 0; pointer-events: none; transition: 0.5s; }
        .st-sheet-overlay.active { opacity: 1; pointer-events: auto; }

        .st-sheet { 
          position: fixed; bottom: 0; left: 0; right: 0; background: white; 
          border-radius: 40px 40px 0 0; z-index: 1001; padding: 40px 24px 120px;
          transform: translateY(100%); transition: 0.6s cubic-bezier(0.19, 1, 0.22, 1);
          max-height: 85vh; overflow-y: auto;
        }
        .st-sheet.active { transform: translateY(0); }

        .spec-card { background: #f8f9fb; padding: 18px; border-radius: 20px; margin-bottom: 12px; font-weight: 600; font-size: 14px; border: 1px solid rgba(0,0,0,0.03); }

        .nav-dock { 
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); 
          background: rgba(255,255,255,0.9); backdrop-filter: blur(20px);
          padding: 12px 25px; border-radius: 35px; display: flex; gap: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 2000;
        }
      `}</style>

      {activeTab === 'setup' ? (
        <>
          <header className="st-header">
            <h1>Meu Setup Interativo</h1>
            <p>Vê os componentes abaixo:</p>
          </header>

          <div className="st-photo-wrapper">
            <img 
              src="/Foto Principal Setup.jpg" 
              className={`st-img ${selectedPart ? 'zoom' : ''}`} 
              style={selectedPart ? { transformOrigin: `${selectedPart.pos.left} ${selectedPart.pos.top}` } : {}}
            />
            {!selectedPart && setupData.principal.map(item => (
              <div 
                key={item.id} 
                className="st-hotspot" 
                style={{ top: item.pos.top, left: item.pos.left, '--color': tokens.accent[item.cat as keyof typeof tokens.accent] } as any}
                onClick={() => setSelectedPart(item)}
              >
                <div className="st-hotspot-inner">
                  <div style={{ width: '8px', height: '8px', background: tokens.accent[item.cat as keyof typeof tokens.accent], borderRadius: '50%' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="st-list">
            {setupData.principal.map(item => (
              <div key={item.id} className="st-item" onClick={() => setSelectedPart(item)}>
                <div className="st-icon-box">{item.icon}</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: tokens.accent[item.cat as keyof typeof tokens.accent] }}>{item.brand}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : renderPokemonTab()}

      {/* MODAL DE DETALHES (SHEET) */}
      <div className={`st-sheet-overlay ${selectedPart ? 'active' : ''}`} onClick={() => setSelectedPart(null)} />
      <div className={`st-sheet ${selectedPart ? 'active' : ''}`}>
        {selectedPart && (
          <div>
            <div style={{ width: '40px', height: '5px', background: '#ddd', borderRadius: '10px', margin: '-10px auto 30px' }} />
            <img src={selectedPart.img} style={{ width: '100%', borderRadius: '25px', marginBottom: '25px' }} />
            <div style={{ color: tokens.accent[selectedPart.cat as keyof typeof tokens.accent], fontWeight: '900', fontSize: '12px' }}>{selectedPart.cat} MODULE</div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '5px 0 25px' }}>{selectedPart.name}</h2>
            
            <div style={{ display: 'grid', gap: '10px' }}>
              {selectedPart.specs.split('|').map((spec, i) => (
                <div key={i} className="spec-card">{spec.trim()}</div>
              ))}
            </div>

            <button 
              onClick={() => setSelectedPart(null)}
              style={{ width: '100%', marginTop: '30px', padding: '20px', borderRadius: '22px', background: '#1A1B1E', color: 'white', border: 'none', fontWeight: '800', fontSize: '16px' }}
            >
              FECHAR DETALHES
            </button>
          </div>
        )}
      </div>

      {/* MENU INFERIOR (DOCK) */}
      <nav className="nav-dock">
        <button onClick={() => { setActiveTab('pokemon'); setSelectedPart(null); }} style={{ background: 'none', border: 'none', padding: 0, opacity: activeTab === 'pokemon' ? 1 : 0.3 }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" style={{ width: '24px' }} alt="pk" />
        </button>
        <button onClick={() => { setActiveTab('setup'); setSelectedPart(null); }} style={{ background: 'none', border: 'none', fontSize: '24px', opacity: activeTab === 'setup' ? 1 : 0.3 }}>
          🖥️
        </button>
      </nav>
    </div>
  );
};

export default SharePage;