import React, { useState, useEffect, useRef } from 'react';

const SetupComponent = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [setupMode, setSetupMode] = useState('principal');
  const [selectedPart, setSelectedPart] = useState(null);
  const [activeTab, setActiveTab] = useState('setup');
  const [showToast, setShowToast] = useState(false);
  const [vaultSelectedId, setVaultSelectedId] = useState(null);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (selectedPart) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      if (sheetRef.current) sheetRef.current.scrollTop = 0;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [selectedPart]);

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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => setHasEntered(true), 600);
  };

  const setupData = {
    principal: [
      { id: 'main_pc', name: 'PC', brand: 'COMPONENTES', icon: '🖥️', pos: { top: '52%', left: '32%' }, img: '/pc.jpg', cat: 'PC', specs: 'Caixa: Phanteks P500a | Motherboard: Asus Rog Strix B550-E Gaming | Memórias: Gskill Trident Z DDR4 6000MHz CL30 | CPU: AMD Ryzen 5 5600X | GPU: Nvidia GeForce RTX 3080 (ASUS TUF Gaming) | Fonte: NZXT Gold 850W | Cooler: Corsair H100i Platinum | Decoração: Funko Stormtrooper | Plantas: IKEA FEJKA', hotspots: [{ id: 0, label: 'Caixa', sub: 'Phanteks P500a', top: '95%', left: '85%' }, { id: 1, label: 'GPU', sub: 'RTX 3080 TUF', top: '65%', left: '45%' }, { id: 2, label: 'RAM', sub: 'Gskill Trident Z', top: '40%', left: '55%' }, { id: 3, label: 'Cooler', sub: 'Corsair H100i', top: '45%', left: '42%' }, { id: 4, label: 'Motherboard', sub: 'ROG Strix B550-E', top: '35%', left: '35%' }, { id: 5, label: 'Fonte', sub: 'NZXT 850W Gold', top: '90%', left: '20%' }, { id: 6, label: 'Funko', sub: 'Stormtrooper', top: '8%', left: '52%' }, { id: 7, label: 'Plantas', sub: 'IKEA FEJKA', top: '12%', left: '25%' }, { id: 8, label: 'CPU', sub: 'AMD Ryzen 5 5600X', top: '43%', left: '48%' }] },
      { id: 'main_monitors', name: 'MONITORES', brand: 'MSI TRIPLE SETUP', icon: '📺', pos: { top: '55%', left: '22%' }, img: '/monitores.jpg', cat: 'DISPLAY', specs: 'Principal: MSI Optix MAG274QRF-QD 27" | Secundário Topo: MSI G2712F 27" | Vertical: MSI G2722 27" | Webcam: Logitech C920', hotspots: [{ id: 0, label: 'Monitor Central', sub: 'MAG274QRF-QD', top: '72%', left: '62%' }, { id: 1, label: 'Monitor Topo', sub: 'MSI G2712F', top: '22%', left: '64%' }, { id: 2, label: 'Monitor Vertical', sub: 'MSI G2722', top: '48%', left: '24%' }, { id: 3, label: 'Webcam', sub: 'Logitech C920', top: '15%', left: '28%' }] },
      { id: 'main_perifericos', name: 'DESK SETUP', brand: 'PERIFÉRICOS + MESA', icon: '⌨️', pos: { top: '65%', left: '28%' }, img: '/desk.jpg', cat: 'INPUT', specs: 'Rato: Logitech G703 Lightspeed | Teclado: Higround Basecamp 65+ SNOWSTONE | Microfone: FDuce SL40X | Mixer: Fifine Mixer | Braço Microfone: Elgato Low Profile Arm | Rato: Razer Naga Wireless | LED: Govee Rope Light | Desk: IKEA LAGKAPTEN + Alex | Misc: Stream Deck Mk.2 | Luz: Barra de Luz Xiaomi | Cabo: Epomaker Coiled Aviator Cable', hotspots: [{ id: 0, label: 'Rato', sub: 'Logitech G703', top: '40%', left: '68%' }, { id: 1, label: 'Teclado', sub: 'Higround 65+ Snowstone', top: '55%', left: '52%' }, { id: 2, label: 'Microfone', sub: 'FDuce SL40X', top: '25%', left: '72%' }, { id: 3, label: 'Mixer', sub: 'Fifine SC3', top: '30%', left: '53%' }, { id: 4, label: 'Braço Mic', sub: 'Elgato Low Profile', top: '28%', left: '85%' }, { id: 5, label: 'Rato', sub: 'Razer Naga Wireless', top: '40%', left: '35%' }, { id: 6, label: 'LED', sub: 'Govee Rope', top: '55%', left: '85%' }, { id: 7, label: 'Mesa', sub: 'Gavetas Alex + Tampo LAGKAPTEN', top: '85%', left: '50%' }, { id: 8, label: 'Misc', sub: 'Stream Deck Mk.2', top: '45%', left: '20%' }, { id: 9, label: 'Luz', sub: 'Barra Luz Xiaomi', top: '65%', left: '5%' }, { id: 10, label: 'Cabo', sub: 'Epomaker Coiled Aviator Cable', top: '45%', left: '52%' }] },
      { id: 'main_audio', name: 'AUDIO', brand: 'Astro A50 & XSANYUN', icon: '🎙️', pos: { top: '80%', left: '15%' }, img: '/audio.jpg', cat: 'AUDIO', specs: 'Headset: Astro A50 | Colunas: xSanuyn | Suporte: RICOO Suporte de Coluna | LED: Govee Bar | Misc: Art3d Painéis de Parede', hotspots: [{ id: 0, label: 'Headset', sub: 'Astro A50', top: '75%', left: '46%' }, { id: 1, label: 'Colunas', sub: 'xSanuyn', top: '25%', left: '42%' }, { id: 2, label: 'LED', sub: 'Govee Bar', top: '15%', left: '65%' }, { id: 3, label: 'Paineis', sub: 'Art3d Wall', top: '45%', left: '70%' }, { id: 4, label: 'Suporte', sub: 'RICOO Wall Mount', top: '32%', left: '42%' }] },
      { id: 'main_lights', name: 'TOP SHELF', brand: 'GOVEE + DECORAÇÃO', icon: '💡', pos: { top: '34%', left: '20%' }, img: '/topshelf.jpg', cat: 'LIGHTS', specs: 'Estante: IKEA LACK | Dioramas: Custom Nintendo Switch & Dreamcast | Decoração: 5 Plantas IKEA | LED: Govee Led Strip', hotspots: [{ id: 0, label: 'Diorama', sub: 'Custom Nintendo Switch', top: '50%', left: '49%' }, { id: 1, label: 'Diorama', sub: 'Custom Dreamcast', top: '57%', left: '85%' }, { id: 2, label: 'Plantas', sub: 'IKEA FEJKA', top: '61%', left: '21%' }, { id: 3, label: 'Estante', sub: 'IKEA LACK Black', top: '75%', left: '43%' }, { id: 4, label: 'LED Strip', sub: 'Govee RGBIC', top: '70%', left: '16%' }] }
    ],
    extra: [
      { id: 'ex_mac', name: 'LAPTOP DESK SETUP', brand: 'MACBOOK M3 15"', icon: '🍎', pos: { top: '72%', left: '85%' }, img: '/macbook.jpg', cat: 'INPUT', specs: 'Laptop: Macbook M3 15" | Rato: Logitech Pebble | Desk: IKEA LAGKAPTEN + Alex', hotspots: [{ id: 0, label: 'Macbook', sub: 'M3 Chip', top: '50%', left: '50%' }] },
      { id: 'ex_tcl', name: 'TV', brand: 'TCL 55"', icon: '🎮', pos: { top: '50%', left: '92%' }, img: '/tcl.jpg', cat: 'DISPLAY', specs: 'TV: TCL 55"', hotspots: [{ id: 0, label: 'Display', sub: '4K HDR', top: '50%', left: '50%' }] },
      { id: 'ex_switch', name: 'Nintendo Hub', brand: 'Switch', icon: '🕹️', pos: { top: '60%', left: '80%' }, img: '/switch.jpg', cat: 'PC', specs: 'Consola: Nintendo Switch Preta | Comandos: 2 x Nintendo Switch Pro Controller', hotspots: [{ id: 0, label: 'Switch', sub: 'Console', top: '50%', left: '50%' }, { id: 1, label: 'Pro Controller', sub: 'Nintendo', top: '70%', left: '40%' }] },
      { id: 'ex_vault_1', name: 'COLLECTIBLES', brand: 'Retro Collection', icon: '⭐', pos: { top: '45%', left: '81%' }, img: '/meu-setup-vault.jpg', isVault: true, cat: 'VAULT', specs: 'Consola: Dreamcast + Comando Original | Collectibles: Sealed Shrouded Fable ETB | Collectibles: Sealed White Flare ETB | Collectibles: Sealed Black Bolt ETB', hotspots: [{ id: 0, label: 'Dreamcast', sub: 'Console + Pad', top: '40%', left: '30%' }, { id: 1, label: 'ETB Shrouded', sub: 'Sealed', top: '55%', left: '50%' }, { id: 2, label: 'ETB Flare/Bolt', sub: 'Sealed', top: '65%', left: '70%' }] }
    ]
  };

  const rawItems = setupMode === 'principal' ? setupData.principal : setupData.extra;

  if (!hasEntered) {
    return (
      <div onClick={handleEnter} style={{
        height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center',
        cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
        transition: 'all 0.6s ease', opacity: isExiting ? 0 : 1, transform: isExiting ? 'scale(1.1)' : 'scale(1)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
           <img src="/Foto Principal Setup.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center' }} alt="Setup" />
        </div>
        
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
          
          .pulse-button { 
            animation: pulse-glow 2s infinite; 
            font-family: 'Inter'; 
            font-size: 16px; 
            letter-spacing: 5px; 
            font-weight: 900;
            z-index: 2; 
            color: #FFFFFF;
            padding: 18px 40px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(5px);
            border-radius: 100px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            text-shadow: 0 0 10px rgba(255,255,255,0.5);
          }

          @keyframes pulse-glow { 
            0% { transform: scale(1); box-shadow: 0 0 0px rgba(255,255,255,0); } 
            50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255,255,255,0.3); background: rgba(255,255,255,0.15); } 
            100% { transform: scale(1); box-shadow: 0 0 0px rgba(255,255,255,0); } 
          }

          .landing-overlay { 
            position: absolute; inset: 0;
            background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4));
            z-index: 1;
          }

          .landing-capsule {
            background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
            backdrop-filter: blur(1px);
            padding: 10px 28px;
            border-radius: 100px;
            border: 1px solid rgba(255,255,255,0.25);
            display: inline-block;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          }

          .main-glass-card {
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(7px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50px;
            padding: 50px 30px;
            z-index: 2;
            position: relative;
            max-width: 90%;
            box-shadow: inset 0 0 20px rgba(255,255,255,0.05);
          }
        `}</style>
        <div className="landing-overlay" />
        <div className="main-glass-card">
          <div className="landing-capsule">
            <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '4px', color: '#FFF' }}>BATTLESTATIONS</span>
          </div>
          <h1 style={{ fontFamily: 'Inter', fontSize: '38px', letterSpacing: '3px', marginBottom: '12px', fontWeight: '900' }}>HUGO BARROS</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '100px', letterSpacing: '4px', fontWeight: '600' }}>EDIÇÃO 2025</p>
          <div className="pulse-button">CLICA PARA EXPLORAR</div>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-mobile-pro" style={{ '--zoom-x': selectedPart ? selectedPart.pos.left : '50%', '--zoom-y': selectedPart ? selectedPart.pos.top : '50%' } as any}>
      <style>{`
        .setup-mobile-pro { 
          background: #000; 
          color: #FFF; 
          min-height: 100vh; 
          font-family: 'Outfit', sans-serif; 
          padding-bottom: 60px; 
          position: relative; 
          overflow-x: hidden; 
        }
        .setup-mobile-pro::before {
            content: "";
            position: fixed;
            inset: 0;
            background-image: url("/Foto Principal Setup.jpg");
            background-size: cover;
            background-position: center;
            filter: blur(3px) brightness(0.6);
            opacity: 0.7;
            z-index: 0;
        }

        .st-header { 
          position: relative;
          z-index: 1;
          padding: 60px 24px 30px; 
          text-align: center; 
        }
        
        .header-capsule-main {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px 30px;
            border-radius: 35px;
            display: inline-block;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }

        .st-header h1 { 
          font-family: 'Inter'; 
          font-size: 18px; 
          letter-spacing: 2px; 
          margin: 0; 
          color: #FFF;
          font-weight: 900;
        }

        .st-nav-pills { 
            display: flex; 
            background: rgba(255, 255, 255, 0.05); 
            padding: 4px; 
            border-radius: 100px; 
            margin: 20px auto 0; 
            width: fit-content; 
            border: 1px solid rgba(255,255,255,0.1);
        }
        .st-pill { 
            border: none; 
            background: transparent; 
            color: rgba(255,255,255,0.4); 
            padding: 10px 20px; 
            border-radius: 100px; 
            font-size: 11px; 
            font-weight: 800; 
            cursor: pointer; 
            transition: 0.3s;
        }
        .st-pill.active { 
            background: #FFFFFF; 
            color: #000; 
            box-shadow: 0 4px 15px rgba(255,255,255,0.2); 
        }

        .st-photo-container { 
            position: relative; 
            z-index: 1;
            margin: 0 auto; 
            width: calc(100% - 40px); 
            max-width: 600px; 
            border-radius: 40px; 
            overflow: hidden; 
            background: #000; 
            box-shadow: 0 25px 50px rgba(0,0,0,0.4); 
            border: 5px solid rgba(255,255,255,0.1); 
        }
        .st-main-img { width: 100%; height: auto; display: block; transition: 0.8s; transform-origin: var(--zoom-x) var(--zoom-y); }
        .st-main-img.zoom-active { transform: scale(1.8); filter: brightness(0.6); }
        
        .st-hotspot { position: absolute; width: 32px; height: 32px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; z-index: 15; cursor: pointer; }
        .st-hotspot-inner { width: 24px; height: 24px; border-radius: 50%; border: 3px solid var(--color); display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); box-shadow: 0 0 15px var(--color); }

        .st-list { position: relative; z-index: 1; padding: 30px 20px; display: grid; gap: 14px; max-width: 600px; margin: 0 auto; }
        
        .st-item { 
            background: rgba(255, 255, 255, 0.98); 
            padding: 16px 20px; 
            border-radius: 22px; 
            display: flex; 
            align-items: center; 
            justify-content: flex-start;
            gap: 16px; 
            border-left: 5px solid var(--item-color); 
            cursor: pointer; 
            transition: 0.2s; 
            box-shadow: 0 6px 18px rgba(0,0,0,0.08); 
            color: ${tokens.text};
            min-height: 85px; 
            width: 100%;
            box-sizing: border-box;
        }
        
        .st-card-icon { 
            flex-shrink: 0;
            width: 50px; 
            height: 50px; 
            background: #F4F6FB; 
            border-radius: 16px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 24px; 
        }

        .st-item-text { display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
        .st-label-main { 
            font-family: 'Inter', sans-serif; 
            font-size: 11px; 
            font-weight: 900; 
            color: #1A1B1E; 
            margin-bottom: 4px; 
            letter-spacing: 1px;
            text-transform: uppercase; 
        }
        .st-label-sub { 
            font-size: 16px; 
            font-weight: 700; 
            color: #555; 
            line-height: 1.2; 
        }

        .st-sheet { 
            position: fixed; 
            top: 0; left: 0; right: 0; bottom: 0; 
            background: rgba(15, 15, 20, 0.9); 
            backdrop-filter: blur(25px);
            z-index: 2000; 
            transform: translateY(100%); 
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); 
            overflow-y: auto; 
            color: #FFF;
        }
        .st-sheet.open { transform: translateY(0); }
        .st-sheet-content { padding: 0 24px 160px; }

        .vault-hero-frame { position: relative; width: calc(100% - 40px); margin: 24px auto 30px; line-height: 0; border-radius: 36px; overflow: hidden; background: #000; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
        .vault-hero-frame img { width: 100%; height: auto; display: block; }
        
        .st-vault-hotspot { position: absolute; width: 24px; height: 24px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; z-index: 10; cursor: pointer; }
        .st-vault-dot { width: 12px; height: 12px; border-radius: 50%; background: #FFF; border: 3px solid var(--vault-color); box-shadow: 0 0 15px var(--vault-color); transition: 0.3s; }
        
        .v-tooltip { 
            position: absolute; 
            bottom: 40px; 
            background: rgba(255, 255, 255, 0.9); 
            backdrop-filter: blur(20px);
            padding: 12px 24px; 
            border-radius: 100px; 
            width: max-content; 
            color: #000; 
            box-shadow: 0 15px 35px rgba(0,0,0,0.3); 
            animation: vPop 0.5s cubic-bezier(0.2, 1, 0.3, 1.2); 
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 12px;
            border: 1.5px solid rgba(255,255,255,0.4);
        }
        @keyframes vPop { from { opacity: 0; transform: translateY(20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        .v-tooltip span:first-of-type { font-weight: 800; font-size: 14px; text-transform: uppercase; }
        .v-tooltip span:last-of-type { font-weight: 500; font-size: 14px; color: rgba(0,0,0,0.6); padding-left: 12px; border-left: 1.5px solid rgba(0,0,0,0.1); }

        .st-spec-pill { 
            background: rgba(255, 255, 255, 0.05); 
            padding: 16px 20px; 
            border-radius: 22px; 
            font-size: 14px; 
            font-weight: 700; 
            margin-bottom: 12px; 
            color: #FFF; 
            border: 1px solid rgba(255,255,255,0.1); 
            display: flex; 
            align-items: center; 
            gap: 12px; 
        }
        .st-pill-dot { flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; background: var(--cat-color); }
      `}</style>

      <button onClick={handleShare} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: '#FFF', padding: '12px 20px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: '900', zIndex: 110 }}>PARTILHAR 📤</button>

      <header className="st-header">
        <div className="header-capsule-main">
            <h1>DUAL SETUP</h1>
            <p style={{ fontWeight: 700, marginTop: '8px', opacity: 0.6, fontSize: '12px', color: '#FFF', letterSpacing: '1px' }}>HUGO BARROS // BATTLESTATION</p>
            <div className="st-nav-pills">
                <button className={`st-pill ${setupMode === 'principal' ? 'active' : ''}`} onClick={() => setSetupMode('principal')}>SETUP PRINCIPAL</button>
                <button className={`st-pill ${setupMode === 'extra' ? 'active' : ''}`} onClick={() => setSetupMode('extra')}>SETUP SECUNDÁRIO</button>
            </div>
        </div>
      </header>

      <div className="st-photo-container">
        <img src="/Foto Principal Setup.jpg" className={`st-main-img ${selectedPart ? 'zoom-active' : ''}`} alt="Setup" />
        {rawItems.map(item => (
          <div key={item.id} className="st-hotspot" style={{ '--color': tokens.accent[item.cat], top: item.pos.top, left: item.pos.left } as any} onClick={() => setSelectedPart(item)}>
            <div className="st-hotspot-inner"><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tokens.accent[item.cat] }}></div></div>
          </div>
        ))}
      </div>

      <div className="st-list">
        {rawItems.map(item => (
          <div key={item.id} className="st-item" style={{ '--item-color': tokens.accent[item.cat] } as any} onClick={() => setSelectedPart(item)}>
            <div className="st-card-icon">{item.icon}</div>
            <div className="st-item-text">
              <span className="st-label-main">{item.name}</span>
              <span className="st-label-sub">{item.brand}</span>
            </div>
          </div>
        ))}
      </div>

      <div ref={sheetRef} className={`st-sheet ${selectedPart ? 'open' : ''}`}>
        {selectedPart && (
          <>
            <div className="vault-hero-frame">
              <img src={selectedPart.img} alt={selectedPart.name} />
              {selectedPart.hotspots?.map(hs => (
                <div key={hs.id} className="st-vault-hotspot" style={{ top: hs.top, left: hs.left, '--vault-color': tokens.accent[selectedPart.cat] } as any} onClick={() => setVaultSelectedId(vaultSelectedId === hs.id ? null : hs.id)}>
                  <div className="st-vault-dot"></div>
                  {vaultSelectedId === hs.id && (
                    <div className="v-tooltip">
                      <span style={{ color: tokens.accent[selectedPart.cat] }}>{hs.label}</span>
                      <span>{hs.sub}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="st-sheet-content">
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px' }}>{selectedPart.name}</h3>
              {selectedPart.specs.split('|').map((s, i) => (
                <div key={i} className="st-spec-pill">
                  <div className="st-pill-dot" style={{ '--cat-color': tokens.accent[selectedPart.cat] } as any}></div>
                  <span style={{ flex: 1 }}>{s.trim()}</span>
                </div>
              ))}
              <button onClick={() => setSelectedPart(null)} style={{ width: '100%', marginTop: '30px', padding: '24px', borderRadius: '24px', background: '#FFF', color: '#000', fontWeight: '800', border: 'none', fontSize: '16px', cursor: 'pointer' }}>FECHAR JANELA</button>
            </div>
          </>
        )}
      </div>

      {showToast && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: '#1A1B1E', color: 'white', padding: '12px 24px', borderRadius: '100px', fontWeight: '800', zIndex: 9999, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>LINK COPIADO ✨</div>
      )}
    </div>
  );
};

export default SetupComponent;