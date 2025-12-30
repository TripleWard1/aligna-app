import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { ref, push, onValue, set, remove, update, get } from "firebase/database";
// Adiciona isto logo no início do teu ficheiro, fora da função principal
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import './Setup.css';
import Share from './Share'; // Importa a página pública


const TWELVE_DATA_KEY = "49563e179ee146c5a53279200c654f29";

const handleLogin = () => {
  // Verifica se o email e a senha preenchidos batem com os gravados nas definições
  if (email === settings.email && password === settings.password) {
    if (typeof triggerHaptic === 'function') triggerHaptic('medium');
    setUser(email); // Define o utilizador ativo para entrar na app
    localStorage.setItem('f_user', email); // Guarda a sessão no navegador
  } else {
    alert("Dados incorretos. Tenta novamente!");
  }
};

// Objeto CATEGORIES atualizado no seu Código Principal
const CATEGORIES = {
  alimentacao: { label: 'Alimentação', icon: '🍔', color: '#FF9500' },
  lazer: { label: 'Lazer', icon: '🎬', color: '#AF52DE' },
  transporte: { label: 'Transporte', icon: '🚗', color: '#5856D6' },
  saude: { label: 'Saúde', icon: '💊', color: '#FF3B30' },
  casa: { label: 'Casa', icon: '🏠', color: '#FFCC00' },
  luz: { label: 'Eletricidade', icon: '⚡', color: '#FFD60A' },
  gas: { label: 'Gás', icon: '🔥', color: '#5AC8FA' },
  servicos: { label: 'Servicos Casa', icon: '🛠️', color: '#8E8E93' },
  internet: { label: 'Internet/TV', icon: '🌐', color: '#007AFF' },
  
  // --- Novas Categorias ---
  condominio: { label: 'Condomínio', icon: '🏢', color: '#8E8E93' },
  seguros: { label: 'Seguros', icon: '🛡️', color: '#5856D6' },
  impostos: { label: 'Impostos/IMI', icon: '🏛️', color: '#FF3B30' },
  mecanico: { label: 'Mecânico', icon: '🔧', color: '#FF9500' },
  estetica: { label: 'Beleza/Cuidado', icon: '💅', color: '#AF52DE' },
  passes: { label: 'Passes/Bilhetes', icon: '🎫', color: '#5AC8FA' },
  desporto: { label: 'Ginásio/Desp.', icon: '🏋️‍♂️', color: '#34C759' },
  pets: { label: 'Animais', icon: '🐾', color: '#FFCC00' }, // Sugestão comum
  
  salario: { label: 'Salário', icon: '💰', color: '#34C759' },
  investimento: { label: 'Investimento', icon: '📈', color: '#5AC8FA' },
  transferencia: { label: 'Transferência', icon: '🔄', color: '#007AFF' },
  outros: { label: 'Outros', icon: '📦', color: '#8E8E93' }
};

// Lógica de categorias no formulário (default case)
// Lembre-se de atualizar esta lista no seu método getDynamicContent
const expenseCategories = [
  'alimentacao', 'lazer', 'transporte', 'saude', 'casa', 'luz', 'gas', 
  'servicos', 'internet', 'condominio', 'seguros', 'impostos', 
  'mecanico', 'estetica', 'passes', 'desporto', 'pets', 'outros'
];

const ASSET_TYPES = ['ETF', 'Ações', 'Crypto', 'Bonds', 'PPR', 'Outro'];
const AVATARS = ['👤', '👨‍💻', '👩‍💼', '🧥', '🎨', '🚀', '🐱', '🦁', '⭐'];
const ACC_ICONS = ['👛', '🏦', '🐖', '💳', '💎', '📊', '💰'];



export default function App() {
  // 1. Lógica de Roteamento Simples
  if (window.location.pathname === '/share') {
    return <Share />;
  }
  // --- SISTEMA DE FEEDBACK (SOM E VIBRAÇÃO) ---
  const [audio] = useState(new Audio('https://www.myinstants.com/media/sounds/coin.mp3'));
  // 1. ESTADOS (Garante que estes estão no topo, fora da função render)
 // Importante: garante que o useEffect está importado no topo: 
// import { useState, useEffect } from 'react';

useEffect(() => {
  // Captura os parâmetros da URL
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');

  // SÓ muda para setup se o parâmetro estiver lá explicitamente
  if (tabParam === 'setup') {
    // Substitui 'setActiveTab' pelo nome da tua função (ex: setView)
    setActiveTab('setup'); 
    
    // IMPORTANTE: Limpa o parâmetro da URL após entrar. 
    // Assim, se o user fizer "refresh", ele não fica preso no setup.
    window.history.replaceState({}, '', window.location.pathname);
  } else {
    // Se não houver parâmetro (link normal), garante que começa na Home
    // setActiveTab('home'); 
  }
}, []);
  const [setupMode, setSetupMode] = useState('principal');
  const [selectedPart, setSelectedPart] = useState(null);
  const [setupSearch, setSetupSearch] = useState('');
  const [setupFilter, setSetupFilter] = useState('ALL');
  const [vaultSelectedId, setVaultSelectedId] = useState(null);

  
  
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
    
      const shareData = {
        title: 'Meu Setup - Aligna',
        text: 'Vê os detalhes do meu hardware e periféricos no meu setup interativo!',
        url: shareUrl, 
      };
    
      try {
        if (navigator.share) {
          // Agora o await é permitido
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link do Setup copiado! ✨');
        }
      } catch (err) { 
        console.log('Erro ao partilhar:', err); 
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
          img: 'pc.jpg', 
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
          img: 'monitores.jpg', 
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
          img: 'desk.jpg', 
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
          img: 'audio.jpg', 
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
          img: 'topshelf.jpg', 
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
          img: '/specs/macbook.jpg', 
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
          img: '/specs/tcl.jpg', 
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
          img: '/specs/switch.jpg', 
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
          img: 'meu-setup-vault.jpg', 
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
  
          /* DESIGN PÁGINA PRINCIPAL REVERTIDO */
          .setup-mobile-pro { background: ${tokens.bg}; color: ${tokens.text}; min-height: 100vh; font-family: 'Outfit', sans-serif; padding-bottom: 140px; position: relative; overflow-x: hidden; }
          .setup-mobile-pro::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0), linear-gradient(to bottom, transparent, #FFFFFF 80%); background-size: 24px 24px, 100% 100%; z-index: 1; pointer-events: none; }
          .setup-mobile-pro::after { content: ''; position: fixed; inset: 0; background: radial-gradient(circle at 10% 20%, rgba(112, 161, 255, 0.1) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 71, 87, 0.08) 0%, transparent 40%); animation: blobFloat 20s infinite alternate ease-in-out; z-index: 0; pointer-events: none; opacity: 0.6; }
          @keyframes blobFloat { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.1) translate(20px, 40px); } }
  
          .st-header { padding: 40px 24px 20px; position: relative; z-index: 10; }
          .st-header h1 { font-family: 'Syncopate'; font-size: 16px; letter-spacing: 4px; margin: 0; background: linear-gradient(90deg, #1A1B1E, #7C7E8B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .st-header p { font-size: 11px; font-weight: 600; color: ${tokens.muted}; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
          .st-nav-pills { display: flex; background: #E9ECF5; padding: 6px; border-radius: 24px; margin-top: 25px; box-shadow: inset 0 2px 6px rgba(0,0,0,0.05); }
          .st-pill { flex: 1; border: none; background: transparent; color: ${tokens.muted}; padding: 14px; border-radius: 20px; font-size: 12px; font-weight: 800; transition: 0.4s; }
          .st-pill.active { background: #FFFFFF; color: ${tokens.text}; box-shadow: 0 8px 20px rgba(0,0,0,0.08); transform: translateY(-1px); }
  
          .st-photo-container { position: relative; margin: 0 24px; border-radius: 36px; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 30px 60px -20px rgba(0,0,0,0.15), 0 0 0 10px rgba(255,255,255,0.5); z-index: 10; overflow: hidden; background: #000; }
          .st-main-img { width: 100%; display: block; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease; transform-origin: var(--zoom-x) var(--zoom-y); }
          .st-main-img.zoom-active { transform: scale(1.8); filter: brightness(0.7) contrast(1.1); }
          
          .st-hotspot { position: absolute; width: 40px; height: 40px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; z-index: 15; cursor: pointer; }
          
          /* ALTERAÇÃO AQUI: FUNDO TRANSPARENTE PÁGINA PRINCIPAL */
          .st-hotspot-inner { 
              width: 32px; height: 32px; 
              background: transparent; 
              border-radius: 50%; 
              border: 3px solid var(--color); 
              display: flex; align-items: center; justify-content: center; 
              box-shadow: 0 10px 20px rgba(0,0,0,0.2); 
              transition: 0.3s; 
          }
          
          .st-hotspot.hidden { opacity: 0; pointer-events: none; }
  
          .st-list { padding: 40px 24px; display: grid; gap: 20px; position: relative; z-index: 10; }
          .st-item { background: #FFFFFF; padding: 22px; border-radius: 30px; display: flex; align-items: center; gap: 20px; position: relative; border: 1px solid rgba(0,0,0,0.03); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.04); transition: 0.3s; }
          .st-item::before { content: ''; position: absolute; left: 0; top: 25%; width: 4px; height: 50%; background: var(--accent); border-radius: 0 4px 4px 0; }
          .st-card-icon { width: 65px; height: 65px; background: #F8F9FD; border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 28px; border: 1px solid rgba(0,0,0,0.04); }
          .st-rarity-tag { font-size: 8px; font-weight: 900; color: #FFF; background: var(--accent); padding: 3px 8px; border-radius: 6px; position: absolute; top: -8px; left: 22px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
  
          .st-sheet { 
            position: fixed; 
            left: 0; 
            right: 0; 
            bottom: 0; 
            background: #FFFFFF; 
            border-top-left-radius: 44px; 
            border-top-right-radius: 44px; 
            z-index: 2000; 
            /* Aumentamos o padding inferior para 160px para subir o botão */
            padding: 45px 28px 160px; 
            transform: translateY(100%); 
            transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1); 
            box-shadow: 0 -25px 50px rgba(0,0,0,0.1); 
            max-height: 90vh; 
            overflow-y: auto; 
            /* Garante que o scroll seja suave em iOS */
            -webkit-overflow-scrolling: touch; 
          }
          .st-sheet.open { transform: translateY(0); }
          .st-sheet-overlay { position: fixed; inset: 0; background: rgba(26, 27, 30, 0.4); backdrop-filter: blur(4px); z-index: 1999; opacity: 0; pointer-events: none; transition: 0.6s; }
          .st-sheet-overlay.show { opacity: 1; pointer-events: auto; }
  
          /* FOCUS MODE UPGRADES */
          .vault-hero-frame { position: relative; border-radius: 30px; overflow: hidden; background: #F1F3F7; min-height: 320px; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
          .vault-hero-frame img { width: 100%; height: 100%; object-fit: contain; z-index: 1; }
          
          .v-line { position: absolute; background: var(--vault-color); height: 1.5px; opacity: 0; transition: 0.3s; transform-origin: left center; z-index: 3; pointer-events: none; }
          .st-vault-hotspot:hover + .v-line, .st-vault-hotspot.active + .v-line { opacity: 0.6; width: 30px; }
  
          .v-tooltip { position: absolute; background: #FFF; border-radius: 18px; padding: 6px; width: 150px; box-shadow: 0 12px 30px rgba(0,0,0,0.15); opacity: 0; transform: translateY(10px); transition: 0.2s; z-index: 110; pointer-events: none; }
          .st-vault-hotspot:hover .v-tooltip, .st-vault-hotspot:focus-within .v-tooltip { opacity: 1; transform: translateY(0); }
          .v-tooltip.pos-right { left: 25px; top: -20px; }
          .v-tooltip.pos-left { right: 25px; top: -20px; }
          .v-thumb { width: 100%; height: 90px; border-radius: 12px; object-fit: cover; margin-bottom: 6px; border: 1px solid rgba(0,0,0,0.04); }
  
          .st-spec-pill { background: #F8F9FD; padding: 18px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.02); display: flex; align-items: center; gap: 15px; font-size: 14px; font-weight: 600; transition: 0.3s; cursor: pointer; }
          .st-spec-pill.active { background: #FFF; border-color: var(--vault-color); box-shadow: 0 10px 25px -5px rgba(255, 211, 42, 0.25); transform: translateX(60px); }
  
          .st-vault-hotspot { position: absolute; transform: translate(-50%, -50%); z-index: 100; cursor: pointer; outline: none; }
          
          /* ALTERAÇÃO AQUI: FUNDO TRANSPARENTE FOCUS MODE */
          .st-vault-dot { 
              width: 18px; height: 18px; 
              background: transparent; 
              border: 4px solid var(--vault-color); 
              border-radius: 50%; 
              box-shadow: 0 0 10px rgba(0,0,0,0.2); 
              transition: 0.3s; 
          }
          
          .st-vault-hotspot.active .st-vault-dot { transform: scale(1.3); box-shadow: 0 0 15px var(--vault-color); }
        `}</style>

<button 
  onClick={(e) => {
    e.preventDefault();
    handleShare();
  }}
  style={{
    position: 'absolute', top: '0', right: '0',
    background: 'white', padding: '10px 16px', borderRadius: '14px',
    border: '1px solid rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: '900',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', gap: '8px', zIndex: 100,
    cursor: 'pointer'
  }}
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
          <img src="/Foto Principal Setup.jpg" className={`st-main-img ${selectedPart ? 'zoom-active' : ''}`} alt="Setup" />
          {rawItems.map(item => (
            <div key={item.id} className={`st-hotspot ${selectedPart ? 'hidden' : ''}`} style={{ '--color': tokens.accent[item.cat], top: item.pos.top, left: item.pos.left }} onClick={() => { setSelectedPart(item); setVaultSelectedId(null); triggerHaptic('medium'); }}>
              <div className="st-hotspot-inner"><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tokens.accent[item.cat] }}></div></div>
            </div>
          ))}
        </div>
  
        <div className="st-list">
          {filteredItems.map(item => (
            <div key={item.id} className="st-item" style={{ '--accent': tokens.accent[item.cat], borderLeft: selectedPart?.id === item.id ? `6px solid ${tokens.accent[item.cat]}` : '1px solid rgba(0,0,0,0.03)' }} onClick={() => { setSelectedPart(item); setVaultSelectedId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              {item.isVault && <div className="st-rarity-tag">SPECIAL EDITION</div>}
              <div className="st-card-icon">{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: tokens.accent[item.cat], fontWeight: '800', textTransform: 'uppercase' }}>{item.brand}</div>
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
                <img src={selectedPart.img} alt={selectedPart.name} />
                {selectedPart.hotspots?.map(hs => (
                  <div key={hs.id}>
                    <div 
                      className={`st-vault-hotspot ${vaultSelectedId === hs.id ? 'active' : ''}`}
                      style={{ top: hs.top, left: hs.left, '--vault-color': tokens.accent[selectedPart.cat] }}
                      onClick={(e) => { e.stopPropagation(); setVaultSelectedId(hs.id); triggerHaptic('light'); }}
                    >
                      <div className="st-vault-dot"></div>
                      <div className={`v-tooltip ${parseFloat(hs.left) > 50 ? 'pos-left' : 'pos-right'}`} 
  style={{ 
    width: 'auto', 
    minWidth: '120px', 
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: `1px solid ${tokens.accent[selectedPart.cat]}30`,
    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px'
  }}
>
  <div style={{ 
    fontSize: '9px', 
    fontWeight: '900', 
    color: tokens.accent[selectedPart.cat], 
    letterSpacing: '1.5px', 
    textTransform: 'uppercase',
    marginBottom: '2px'
  }}>
    {hs.label}
  </div>
  <div style={{ 
    fontSize: '13px', 
    fontWeight: '700', 
    color: tokens.text, 
    letterSpacing: '-0.3px'
  }}>
    {hs.sub}
  </div>
  
  {/* Pequeno indicador visual no fundo */}
  <div style={{ 
    width: '20px', 
    height: '3px', 
    background: tokens.accent[selectedPart.cat], 
    borderRadius: '2px', 
    marginTop: '6px',
    opacity: 0.6 
  }} />
</div>
                    </div>
                    <div className="v-line" style={{ top: hs.top, left: hs.left, transform: `rotate(${parseFloat(hs.left) > 50 ? '180deg' : '0deg'}) translateX(10px)`, '--vault-color': tokens.accent[selectedPart.cat] }}></div>
                  </div>
                ))}
              </div>
  
              <div style={{ marginBottom: '25px' }}>
                <div style={{ background: `${tokens.accent[selectedPart.cat]}15`, color: tokens.accent[selectedPart.cat], padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', display: 'inline-block' }}>{selectedPart.cat} MODULE</div>
                <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: '800' }}>{selectedPart.name}</h3>
              </div>
  
              <div style={{ display: 'grid', gap: '14px' }}>
                {selectedPart.specs.split('|').map((s, i) => (
                  <div 
                    key={i} 
                    className={`st-spec-pill ${vaultSelectedId === i ? 'active' : ''}`}
                    style={{ '--vault-color': tokens.accent[selectedPart.cat] }}
                    onClick={() => setVaultSelectedId(i)}
                  >
                    <span style={{ color: tokens.accent[selectedPart.cat], opacity: 0.4 }}>✦</span>
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

  // --- ESTADOS DO INVENTÁRIO ---
  const [isLocked, setIsLocked] = useState(true);
  const [invFilter, setInvFilter] = useState('TODOS'); 
  const [viewPhoto, setViewPhoto] = useState(null); 
  const [inventory, setInventory] = useState([]);
  // --- ESTADOS POKÉMON (Versão Limpa) ---
  const [pokemonCards, setPokemonCards] = useState([]);
  const [displayValue, setDisplayValue] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
    const [pokemonData, setPokemonData] = useState({ 
    name: '', number: '', set: '', setLogo: '', rarity: '', buyPrice: '', marketValue: '', photo: '', condition: 'Near Mint' 
  });
  const searchPokemonInAPI = async () => {
    if (!pokemonSearchTerm) return;
    setIsSearching(true);
    try {
      // Procura cartas pelo nome na API oficial
      const resp = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${pokemonSearchTerm}"&pageSize=10`);
      const data = await resp.json();
      
      if (data.data) {
        setSearchResults(data.data); // Guarda as 10 primeiras cartas encontradas
      }
    } catch (err) {
      console.error("Erro na busca:", err);
    } finally {
      setIsSearching(false);
    }
  };
  // Atualiza o valor do dashboard automaticamente ao abrir
  useEffect(() => {
    const total = pokemonCards.reduce((acc, c) => acc + (Number(c.marketValue) || 0), 0);
    setDisplayValue(total);
  }, [pokemonCards]);

  // --- FUNÇÃO DE ATUALIZAÇÃO (CORRIGIDA E LIMPA) ---
  const refreshAllPrices = async () => {
    setIsSyncing(true);
    if (typeof triggerHaptic === 'function') triggerHaptic('medium');

    try {
      // 1. Criamos uma lista de promessas para atualizar todas as cartas ao mesmo tempo
      const updatedCards = await Promise.all(pokemonCards.map(async (card) => {
        try {
          // Procuramos na API pelo nome da carta e número (se disponível)
          const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${card.name}"`);
          const data = await response.json();
          
          if (data.data && data.data.length > 0) {
            // Pegamos no preço de mercado (tcgplayer market value)
            const apiPrice = data.data[0].tcgplayer?.prices?.holofoil?.market || 
                             data.data[0].tcgplayer?.prices?.normal?.market || 
                             card.marketValue;

            // Atualizamos no Firebase para ficar guardado permanentemente
            await update(ref(db, `users/${user}/pokemonCollection/${card.id}`), {
              marketValue: apiPrice,
              lastUpdate: Date.now()
            });

            return { ...card, marketValue: apiPrice };
          }
          return card; // Se não encontrar na API, mantém o valor antigo
        } catch (err) {
          console.error(`Erro ao atualizar ${card.name}:`, err);
          return card;
        }
      }));

      // 2. Atualizamos o estado local e o Dashboard
      setPokemonCards(updatedCards);
      const novoTotal = updatedCards.reduce((acc, c) => acc + Number(c.marketValue), 0);
      
      // Animação dos números no Dashboard
      let start = displayValue;
      const increment = (novoTotal - start) / 20;
      const timer = setInterval(() => {
        start += increment;
        if (Math.abs(start - novoTotal) < 0.1) {
          setDisplayValue(novoTotal);
          clearInterval(timer);
        } else {
          setDisplayValue(start);
        }
      }, 50);

    } catch (error) {
      console.error("Erro geral na sincronização:", error);
    } finally {
      setIsSyncing(false);
      if (typeof triggerHaptic === 'function') triggerHaptic('success');
    }
  };

  // Função auxiliar para os números "correrem" no ecrã
  const animarTotal = (objetivo) => {
    let atual = displayValue;
    const passo = (objetivo - atual) / 15;
    const intervalo = setInterval(() => {
      atual += passo;
      if (Math.abs(atual - objetivo) < 0.1) {
        setDisplayValue(objetivo);
        clearInterval(intervalo);
      } else {
        setDisplayValue(atual);
      }
    }, 40);
  };

  

  // --- ESTADOS DE INTERFACE (DECLARADOS APENAS UMA VEZ) ---
  const [showAddPokemon, setShowAddPokemon] = useState(false);
  const [pokemonSearchTerm, setPokemonSearchTerm] = useState('');
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [invData, setInvData] = useState({ 
    name: '', 
    buyPrice: '', 
    resellValue: '', 
    photo: '', 
    category: 'OUTROS' 
  });


  const [editingCard, setEditingCard] = useState(null);

// FUNÇÃO PARA EDITAR CARTA EXISTENTE
const handleEditCard = (card) => {
  // 1. Preenche o estado do formulário com os dados da carta selecionada
  setPokemonData({
    ...card,
    id: card.id // Mantemos o ID para saber que é uma edição e não uma nova carta
  });
  
  // 2. Abre o formulário
  setShowAddPokemon(true);
  
  // 3. Scroll suave até ao topo para ver o formulário aberto
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

  // --- ESTADOS GERAIS ---
  const gerarRelatorioMensal = () => {
    const doc = new jsPDF();
    
    // 1. FILTRAGEM (Mantida igual ao teu pedido)
    let transacoesFiltradas = list.filter(t => {
      if (!t.date) return false;
      const dataStr = String(t.date);
      const mesFormatado = reportMonth < 10 ? `0${reportMonth}` : `${reportMonth}`;
      const busca = reportMonth === 0 ? `${reportYear}` : `${reportYear}-${mesFormatado}`;
      return dataStr.includes(busca);
    });
  
    if (transacoesFiltradas.length === 0) {
      transacoesFiltradas = list.slice(0, 20);
    }
  
    transacoesFiltradas.sort((a, b) => new Date(b.date) - new Date(a.date));
  
    // --- FUNÇÃO AUXILIAR PARA CORRIGIR O NaN ---
    const limparValor = (valor) => {
      if (!valor) return 0;
      // Remove o símbolo €, espaços e troca vírgula por ponto
      const str = String(valor).replace('€', '').replace(/\s/g, '').replace(',', '.');
      return parseFloat(str) || 0;
    };
  
    // 2. CÁLCULOS (Corrigidos para evitar NaN)
    const entradas = transacoesFiltradas
      .filter(t => t.type === 'income' || t.type === 'receita')
      .reduce((acc, t) => acc + limparValor(t.val || t.value || t.amount), 0);
      
    const saidas = transacoesFiltradas
      .filter(t => t.type === 'expense' || t.type === 'saída' || t.type === 'gasto')
      .reduce((acc, t) => acc + limparValor(t.val || t.value || t.amount), 0);
    
    const balanco = entradas - saidas;
  
    // Cabeçalho e Resumo
    doc.setFontSize(20);
    doc.text("ALIGNA — DETALHE MENSAL", 14, 22);
    
    const mesNome = reportMonth === 0 ? "GERAL" : new Date(0, reportMonth - 1).toLocaleString('pt', {month: 'long'}).toUpperCase();
    doc.setFontSize(10);
    doc.text(`HUGO BARROS | ${mesNome} / ${reportYear}`, 14, 30);
  
    doc.setFontSize(12);
    doc.text(`Receitas: +${entradas.toFixed(2)}€`, 14, 45);
    doc.text(`Gastos: -${saidas.toFixed(2)}€`, 14, 52);
    doc.setTextColor(balanco >= 0 ? 52 : 255, balanco >= 0 ? 199 : 59, balanco >= 0 ? 89 : 48);
    doc.text(`Balanço: ${balanco.toFixed(2)}€`, 14, 60);
    doc.setTextColor(0, 0, 0);
  
    // 3. TABELA (Corrigida descrição e valores)
    const tableRows = transacoesFiltradas.map(t => {
      const v = limparValor(t.val || t.value || t.amount);
      const eReceita = t.type === 'income' || t.type === 'receita';
      
      return [
        t.date ? String(t.date).split('-').reverse().join('/') : '---',
        // Se 'desc' estiver vazio, tenta 'description' ou 'label'
        (t.desc || t.description || t.label || 'MOVIMENTO').toUpperCase(),
        (t.category || t.acc || 'GERAL').toUpperCase(),
        eReceita ? `+${v.toFixed(2)}€` : `-${v.toFixed(2)}€`
      ];
    });
  
    doc.autoTable({
      startY: 70,
      head: [['DATA', 'DESCRIÇÃO', 'CONTA', 'VALOR']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [28, 28, 30] },
      columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } },
      didParseCell: function(data) {
        if (data.column.index === 3 && data.cell.section === 'body') {
          const txt = data.cell.raw || '';
          if (txt.includes('+')) data.cell.styles.textColor = [52, 199, 89];
          else if (txt.includes('-')) data.cell.styles.textColor = [255, 59, 48];
        }
      }
    });
  
    doc.save(`Relatorio_Hugo_${mesNome}.pdf`);
  };
  const [pokemonToDelete, setPokemonToDelete] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [savingPokemon, setSavingPokemon] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null); // Guarda o item para edição rápida
const [tempPrice, setTempPrice] = useState(''); // Guarda o valor que estás a digitar
  const [searchTerm, setSearchTerm] = useState(''); // Estado para a barra de pesquisa
  const [searchResults, setSearchResults] = useState([]);
const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState(localStorage.getItem('f_user') || null);
  const [list, setList] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [activeTab, setActiveTab] = useState('home');
  const triggerHaptic = (style = 'light') => {
    if (window.navigator && window.navigator.vibrate) {
      const duration = style === 'heavy' ? 100 : style === 'medium' ? 50 : 20;
      window.navigator.vibrate(duration);
    }
  };
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [transType, setTransType] = useState('expense');
  const [newAccName, setNewAccName] = useState('');
  const [newAccIcon, setNewAccIcon] = useState('🏦');
  
  const [editingId, setEditingId] = useState(null);
  const [sortOrder, setSortOrder] = useState('entry'); 
  const [sortBy, setSortBy] = useState('recent'); // Default: Recentemente Adicionada
  const [filterSet, setFilterSet] = useState('all');

  const [formData, setFormData] = useState({
    desc: '', val: '', cat: 'alimentacao', acc: 'carteira', toAcc: 'carteira', assetType: 'ETF', perf: '', date: new Date().toISOString().split('T')[0]
  });
  
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Estados de Login/Registo
  const [loginMode, setLoginMode] = useState('profiles'); 
  const [selectingUser, setSelectingUser] = useState(null);
  const [loginName, setLoginName] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');


  
  const [settings, setSettings] = useState({ 
    lowBalanceLimit: 50, currency: '€', privacyMode: false, avatar: AVATARS[0], 
    email: '', password: '', accounts: { 'carteira': { label: 'Carteira', icon: '👛' } } 
  });

  useEffect(() => {
    onValue(ref(db, `users`), (snap) => {
      setAllUsers(snap.val() || {});
    });

    if (user) {
      onValue(ref(db, `users/${user}/settings`), (snap) => {
        if (snap.val()) setSettings(prev => ({ ...prev, ...snap.val() }));
      });
      onValue(ref(db, `users/${user}/transactions`), (snap) => {
        const data = snap.val();
        setList(data ? Object.keys(data).map(id => ({ ...data[id], id })) : []);
        onValue(ref(db, `users/${user}/inventory`), (snap) => {
          const data = snap.val();
          setInventory(data ? Object.keys(data).map(id => ({ ...data[id], id })) : []);
        });
        onValue(ref(db, `users/${user}/pokemonCollection`), (snap) => {
          const data = snap.val();
          setPokemonCards(data ? Object.keys(data).map(id => ({ ...data[id], id })) : []);
        });
      });
    }
  }, [user]);

  useEffect(() => {
    if (transType === 'income') {
      setFormData(prev => ({ ...prev, cat: 'salario' }));
    } else if (transType === 'expense') {
      setFormData(prev => ({ ...prev, cat: 'alimentacao' }));
    } else if (transType === 'investimento') {
      setFormData(prev => ({ ...prev, cat: 'investimento' }));
    } else if (transType === 'transfer') {
      setFormData(prev => ({ ...prev, cat: 'transferencia' }));
    }
  }, [transType]);

  const updateSettings = (newSet) => {
    const updated = { ...settings, ...newSet };
    setSettings(updated);
    if (user) set(ref(db, `users/${user}/settings`), updated);
  };

  const handleEntry = async (targetUser) => {
    const uName = targetUser || loginName.toLowerCase().trim();
    if (!uName) return;

    const userRef = ref(db, `users/${uName}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      alert("Utilizador não encontrado.");
      return;
    }

    const userData = snapshot.val();
    if (userData.settings?.password && loginPass !== userData.settings.password) {
      alert("⚠️ Password Incorreta!");
      return;
    }

    const known = JSON.parse(localStorage.getItem('known_profiles') || '[]');
    if (!known.includes(uName)) {
        known.push(uName);
        localStorage.setItem('known_profiles', JSON.stringify(known));
    }

    localStorage.setItem('f_user', uName);
    setUser(uName);
    setSelectingUser(null);
    setLoginPass('');
    setLoginName('');
    setLoginMode('profiles');
  };

  const handleRegister = () => {
    if (!regName || !regEmail || !regPass) {
      alert("Campos vazios."); return;
    }
    const userId = regName.toLowerCase().trim();
    if (allUsers[userId]) {
      alert("Utilizador já existe."); return;
    }
    const initialSettings = { ...settings, email: regEmail, password: regPass, avatar: AVATARS[0] };
    set(ref(db, `users/${userId}/settings`), initialSettings).then(() => {
      const known = JSON.parse(localStorage.getItem('known_profiles') || '[]');
      known.push(userId);
      localStorage.setItem('known_profiles', JSON.stringify(known));
      localStorage.setItem('f_user', userId);
      setUser(userId);
      setLoginMode('profiles');
    });
  };

  const getAccountBalance = (accKey) => {
    return list.reduce((total, t) => {
      const tAcc = t.account || 'carteira';
      if ((t.type === 'income' || t.type === 'investimento') && tAcc === accKey) return total + t.amount;
      if (t.type === 'expense' && tAcc === accKey) return total - t.amount;
      if (t.type === 'transfer') {
        if (tAcc === accKey) return total - t.amount; 
        if (t.toAccount === accKey) return total + t.amount;
      }
      return total;
    }, 0);
  };

  const totalBalance = Object.keys(settings.accounts || {}).reduce((sum, key) => sum + getAccountBalance(key), 0);
  // Verifica se o saldo atual é menor que o limite definido nas definições (ou 50€ por defeito)
const isLowBalance = totalBalance < (settings.lowBalanceLimit || 50);
  const formatValue = (val) => settings.privacyMode ? "••••" : val.toFixed(2) + settings.currency;

  const getDynamicContent = () => {
    switch(transType) {
      case 'investimento': return { placeholder: "Ticker (ex: BTC/USD)", categories: ['investimento'], color: '#5AC8FA' };
      case 'income': return { placeholder: "Origem (ex: Salário)", categories: ['salario', 'outros'], color: '#34C759' };
      case 'transfer': return { placeholder: "Motivo da troca", categories: ['transferencia'], color: '#5856D6' };
      default: return { 
        placeholder: "Onde gastou?", 
        // ADICIONE AS NOVAS CHAVES NESTE ARRAY ABAIXO:
        categories: [
          'alimentacao', 'lazer', 'transporte', 'saude', 'casa', 
          'luz', 'gas', 'servicos', 'internet', 'condominio', 
          'seguros', 'impostos', 'mecanico', 'estetica', 
          'passes', 'desporto', 'pets', 'outros'
        ], 
        color: '#007AFF' 
      };
    }
  };

  const content = getDynamicContent();
  // --- FUNÇÕES POKÉMON (ATUALIZADO PARA SELEÇÃO MÚLTIPLA) ---
  const searchPokemonCard = async (query) => {
    if (!query) return;
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const onlyNumbers = query.replace(/\D/g, "");
      const cleanText = query.replace(/[0-9]/g, "").replace(/['’"“”]/g, "").trim();
      
      // Criamos uma query que foca no número 191 e ordena pelas mais RECENTES
      let q = onlyNumbers ? `number:${onlyNumbers}` : `name:${cleanText}*`;
      
      // Mudamos a URL para ordenar por Data de Lançamento Decrescente (-set.releaseDate)
      const url = `https://api.pokemontcg.io/v2/cards?q=${q}&orderBy=-set.releaseDate&pageSize=20`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        setSearchResults(data.data);
      } else {
        alert("Nenhuma carta encontrada. Tente: Houndoom 191");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("A ligação demorou demasiado. Tente apenas o número '191'.");
    } finally {
      setIsSearching(false);
    }
};

const handlePokemonSubmit = async (data) => {
  setIsSyncing(true); // Ativa a Pokébola

  setTimeout(async () => {
    try {
      const pokemonRef = ref(db, `users/${user}/pokemonCollection`);
      await push(pokemonRef, {
        ...data,
        timestamp: Date.now()
      });
      
      // Fecha tudo após o sucesso
      setIsSyncing(false);
      setShowAddPokemon(false);
      setPokemonData({}); 
    } catch (error) {
      console.error("Erro:", error);
      setIsSyncing(false);
      alert("Erro ao guardar.");
    }
  }, 1000); // Espera exatamente 1 segundo (a animação)
};

const filteredCards = pokemonCards
    ? pokemonCards
        .filter(card => {
          const matchesName = (card.name || '').toLowerCase().includes((searchTerm || '').toLowerCase());
          const matchesSet = filterSet === 'all' || card.set === filterSet;
          return matchesName && matchesSet;
        })
        .sort((a, b) => {
          if (sortBy === 'expensive') return (Number(b.marketValue) || 0) - (Number(a.marketValue) || 0);
          if (sortBy === 'cheapest') return (Number(a.marketValue) || 0) - (Number(b.marketValue) || 0);
          if (sortBy === 'recent') return (b.timestamp || 0) - (a.timestamp || 0);
          return 0;
        })
    : [];

  const uniqueSets = pokemonCards ? [...new Set(pokemonCards.map(c => c.set).filter(Boolean))] : [];
  const handleEditInventory = (item) => {
    setInvData({ ...item }); 
    setShowAddInventory(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDateInfo = (ts) => {
    if (!ts) return { text: "", color: "#8E8E93" };
    
    const diffInDays = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
    const dateStr = new Date(ts).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
    
    // Se não atualizas o preço há mais de 30 dias, fica Laranja (#FF9500)
    const color = diffInDays > 30 ? '#FF9500' : '#8E8E93';
    
    return { text: dateStr, color };
  };
  
  const compressImage = (base64Str, maxWidth = 400, maxHeight = 400) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
  
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Comprime para 70% de qualidade
      };
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result);
        setInvData({ ...invData, photo: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    let autoPerformance = formData.perf || "0";

    if (transType === 'investimento' && formData.desc) {
      try {
        const response = await fetch(`https://api.twelvedata.com/quote?symbol=${formData.desc.toUpperCase()}&apikey=${TWELVE_DATA_KEY}`);
        const data = await response.json();
        if (data && data.percent_change) autoPerformance = parseFloat(data.percent_change).toFixed(2);
      } catch (err) { console.error(err); }
    }

    const selectedDate = new Date(formData.date);
    const tData = { 
      description: formData.desc.toUpperCase(), 
      amount: Math.abs(parseFloat(formData.val)), 
      type: transType, 
      category: transType === 'transfer' ? 'transferencia' : formData.cat,
      assetDetails: transType === 'investimento' ? { type: formData.assetType, performance: autoPerformance } : null,
      account: formData.acc, 
      toAccount: transType === 'transfer' ? formData.toAcc : null, 
      date: selectedDate.toLocaleDateString('pt-PT'),
      isoDate: formData.date, 
      month: selectedDate.getMonth() + 1,
      year: selectedDate.getFullYear(),
      timestamp: editingId ? list.find(x => x.id === editingId).timestamp : Date.now() 
    };

    // A partir daqui continua com o resto do seu código original (set, push, etc)

    if (editingId) {
      update(ref(db, `users/${user}/transactions/${editingId}`), tData);
      setEditingId(null);
    } else {
      push(ref(db, `users/${user}/transactions`), tData);
    }

    setFormData({ ...formData, desc: '', val: '', perf: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (t) => {
    setTransType(t.type);
    setEditingId(t.id);
    setFormData({
      desc: t.description,
      val: t.amount,
      cat: t.category,
      acc: t.account,
      toAcc: t.toAccount || 'carteira',
      assetType: t.assetDetails?.type || 'ETF',
      perf: t.assetDetails?.performance || '',
      date: t.isoDate || new Date().toISOString().split('T')[0]
    });
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  

  const getSortedList = () => {
    let sorted = [...list];
    if (sortOrder === 'entry') {
      return sorted.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 15);
    }
    return sorted.sort((a, b) => {
      const dateA = a.isoDate || "0000-00-00";
      const dateB = b.isoDate || "0000-00-00";
      return dateB.localeCompare(dateA);
    }).slice(0, 15);
  };

  // --- BLOCO ATUALIZADO COM GRÁFICO CIRCULAR ---

  const getCategoryHistory = (catKey) => {
    const history = {};
    list.filter(t => t.category === catKey && t.type === 'expense').forEach(t => {
      const label = `${t.month}/${t.year.toString().slice(-2)}`;
      history[label] = (history[label] || 0) + Number(t.amount);
    });
    return Object.entries(history)
      .map(([date, val]) => ({ date, val }))
      .sort((a, b) => {
        const [mA, yA] = a.date.split('/');
        const [mB, yB] = b.date.split('/');
        return new Date(2000 + parseInt(yA), mA - 1) - new Date(2000 + parseInt(yB), mB - 1);
      }).slice(-6);
  };

  

  const filteredList = list.filter(t => {
    const yearMatch = Number(t.year) === Number(reportYear);
    const monthMatch = reportMonth === 0 ? true : Number(t.month) === Number(reportMonth);
    return yearMatch && monthMatch;
  });

  const totalsByCat = filteredList.reduce((acc, t) => {
    if (t.type === 'expense') {
      const catName = t.category || 'outros';
      acc[catName] = (acc[catName] || 0) + (Number(t.amount) || 0);
    }
    return acc;
  }, {});

  const totalsByCatIncome = filteredList.reduce((acc, t) => {
    if (t.type === 'income') {
      const catName = t.category || 'salario';
      acc[catName] = (acc[catName] || 0) + (Number(t.amount) || 0);
    }
    return acc;
  }, {});

  const monthlyExpenses = Object.values(totalsByCat).reduce((a, b) => a + b, 0);
  const monthlyIncome = Object.values(totalsByCatIncome).reduce((a, b) => a + b, 0);
  const maxCategoryValue = Math.max(...Object.values(totalsByCat).map(Number), 0);

  // FUNÇÃO PARA O GRÁFICO DONUT
  const getDonutData = () => {
    if (monthlyExpenses === 0) return [];
    let cumulativePercentage = 0;
    return Object.keys(totalsByCat).map(cat => {
      const percentage = (totalsByCat[cat] / monthlyExpenses) * 100;
      const startOffset = cumulativePercentage;
      cumulativePercentage += percentage;
      return {
        cat,
        percentage,
        color: CATEGORIES[cat]?.color || '#8E8E93',
        offset: startOffset
      };
    });
  };

  // --- FIM DO BLOCO ---

  if (!user) {
    const exportToPDF = () => {
      const doc = new jsPDF() as jsPDFWithPlugin;
      const dateStr = reportMonth === 0 ? `Ano_${reportYear}` : `${reportMonth}_${reportYear}`;
    
      doc.setFontSize(18);
      doc.text("ALIGNA - Relatório Financeiro", 14, 15);
      doc.setFontSize(10);
      doc.text(`Período: ${dateStr} | Utilizador: ${user?.toUpperCase()}`, 14, 22);
      
      const tableRows = filteredList.map(t => [
        t.date,
        t.description,
        CATEGORIES[t.category]?.label || t.category,
        `${t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}${settings.currency}`
      ]);
    
      doc.autoTable({
        startY: 28,
        head: [["Data", "Descrição", "Categoria", "Valor"]],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [28, 28, 30] }
      });
    
      doc.save(`Relatorio_Aligna_${dateStr}.pdf`);
    };
    // ... resto do código do login
    const knownProfiles = JSON.parse(localStorage.getItem('known_profiles') || '[]');
    const filteredCards = pokemonCards
    ? pokemonCards
        .filter(card => {
          const matchesName = card.name?.toLowerCase().includes((searchTerm || '').toLowerCase());
          const matchesSet = filterSet === 'all' || card.set === filterSet;
          return matchesName && matchesSet;
        })
        .sort((a, b) => {
          if (sortBy === 'expensive') return (Number(b.marketValue) || 0) - (Number(a.marketValue) || 0);
          if (sortBy === 'cheapest') return (Number(a.marketValue) || 0) - (Number(b.marketValue) || 0);
          if (sortBy === 'recent') return (b.timestamp || 0) - (a.timestamp || 0);
          return 0;
        })
    : [];

  const uniqueSets = pokemonCards ? [...new Set(pokemonCards.map(c => c.set).filter(Boolean))] : [];
  // === FIM DA LÓGICA ===

   {/* Renderização da Aba Setup */}
    return (
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        minHeight: '100vh', background: 'linear-gradient(180deg, #F8F9FB 0%, #E9ECEF 100%)', 
        padding: '20px', fontFamily: '-apple-system, sans-serif', boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontWeight: '900', fontSize: 'clamp(40px, 10vw, 52px)', letterSpacing: '-2px', margin: '0', color: '#1C1C1E' }}>Aligna</h1>
          <p style={{ color: '#8E8E93', fontWeight: '600', marginTop: '5px' }}>Finanças sob controlo</p>
        </div>

        {loginMode === 'profiles' && (
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
              {knownProfiles.map(u => allUsers[u] && (
                <div key={u} onClick={() => setSelectingUser(u)} style={{ 
                  backgroundColor: 'white', padding: '20px 10px', borderRadius: '25px', cursor: 'pointer', 
                  textAlign: 'center', transition: 'all 0.2s ease',
                  boxShadow: selectingUser === u ? '0 0 0 3px #007AFF' : '0 10px 20px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '5px' }}>{allUsers[u].settings?.avatar || '👤'}</div>
                  <div style={{ fontWeight: '800', fontSize: '12px', color: '#1C1C1E', textOverflow: 'ellipsis', overflow: 'hidden' }}>{u.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {selectingUser && (
              <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
                <input type="password" placeholder="Password" autoFocus value={loginPass} onChange={e => setLoginPass(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #F2F2F7', boxSizing: 'border-box', marginBottom: '10px', backgroundColor: '#F8F9FB', fontSize: '16px' }} />
                <button 
  onClick={handleLogin} 
  style={{ 
    width: '100%', 
    padding: '18px', 
    backgroundColor: '#007AFF', 
    color: 'white', 
    borderRadius: '18px', 
    border: 'none', 
    fontSize: '16px', 
    fontWeight: '900', 
    marginTop: '10px',
    cursor: 'pointer'
  }}
>
  Entrar
</button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '25px', alignItems: 'center' }}>
              <button onClick={() => setLoginMode('manual')} style={{ background: 'none', border: 'none', color: '#007AFF', fontWeight: '800', fontSize: '14px' }}>Entrar em conta existente</button>
              <button onClick={() => setLoginMode('register')} style={{ background: 'none', border: 'none', color: '#34C759', fontWeight: '800', fontSize: '14px' }}>Criar Novo Perfil</button>
            </div>
          </div>
        )}

        {(loginMode === 'manual' || loginMode === 'register') && (
          <div style={{ width: '100%', maxWidth: '380px', backgroundColor: 'white', padding: '25px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, fontWeight: '900' }}>{loginMode === 'manual' ? 'Entrar' : 'Novo Perfil'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input placeholder="Nome" value={loginMode === 'manual' ? loginName : regName} onChange={e => loginMode === 'manual' ? setLoginName(e.target.value) : setRegName(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', boxSizing: 'border-box', fontSize: '16px' }} />
              {loginMode === 'register' && <input placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', boxSizing: 'border-box', fontSize: '16px' }} />}
              <input type="password" placeholder="Password" value={loginMode === 'manual' ? loginPass : regPass} onChange={e => loginMode === 'manual' ? setLoginPass(e.target.value) : setRegPass(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', boxSizing: 'border-box', fontSize: '16px' }} />
              <button onClick={() => loginMode === 'manual' ? handleEntry() : handleRegister()} style={{ width: '100%', padding: '15px', backgroundColor: loginMode === 'manual' ? '#007AFF' : '#34C759', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '800', marginTop: '10px' }}>
                {loginMode === 'manual' ? 'Entrar' : 'Criar Perfil'}
              </button>
              <button onClick={() => setLoginMode('profiles')} style={{ width: '100%', background: 'none', border: 'none', color: '#8E8E93', fontSize: '14px' }}>Voltar</button>
              </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '15px', maxWidth: '100%', margin: '0 auto', backgroundColor: '#F8F9FB', minHeight: '100vh', fontFamily: '-apple-system, sans-serif', boxSizing: 'border-box', overflowX: 'hidden' }}>
                  
      {/* Header Mobile Premium */}
<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
  {/* Avatar com Sombra Suave */}
  <div style={{ 
    width: '52px', 
    height: '52px', 
    borderRadius: '16px', 
    backgroundColor: 'white', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '28px', 
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
    border: '1px solid rgba(0,0,0,0.02)'
  }}>
    {settings.avatar}
  </div>

  <div>
    {/* NOME COM GRADIENTE METÁLICO */}
    <h2 style={{ 
      fontSize: '20px', 
      margin: 0, 
      fontWeight: '900',
      letterSpacing: '-0.5px',
      background: 'linear-gradient(to right, #1C1C1E 30%, #8E8E93 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>
      {user ? user.toUpperCase() : 'UTILIZADOR'}
    </h2>

    {/* STATUS COM EFEITO GLOW (DINÂMICO) */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
      <div style={{ 
        width: '7px', 
        height: '7px', 
        borderRadius: '50%', 
        backgroundColor: totalBalance < settings.lowBalanceLimit ? '#FF3B30' : '#34C759',
        boxShadow: totalBalance < settings.lowBalanceLimit 
          ? '0 0 8px rgba(255, 59, 48, 0.8)' 
          : '0 0 8px rgba(52, 199, 89, 0.8)' 
      }}></div>
      <span style={{ 
        margin: 0, 
        fontSize: '10px', 
        color: totalBalance < settings.lowBalanceLimit ? '#FF3B30' : '#34C759', 
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {totalBalance < settings.lowBalanceLimit ? 'Saldo Baixo!' : 'Online'}
      </span>
    </div>
  </div>
</div>

      {activeTab === 'home' && (
        <>
          <div style={{ 
  background: isLowBalance 
    ? 'linear-gradient(135deg, #2C0B0E 0%, #FF3B30 100%)' // Cor avermelhada se estiver baixo
    : 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)', 
  color: 'white', 
  padding: '30px 20px', 
  borderRadius: '30px', 
  marginBottom: '20px', 
  boxShadow: isLowBalance ? '0 10px 25px rgba(255,59,48,0.2)' : '0 10px 25px rgba(0,0,0,0.15)',
  position: 'relative',
  border: isLowBalance ? '1px solid rgba(255,255,255,0.2)' : 'none'
}}>
  <p style={{ margin: 0, opacity: 0.6, fontSize: '11px', fontWeight: '700' }}>
    SALDO CONSOLIDADO {isLowBalance && '⚠️'}
  </p>
  <h1 style={{ 
    fontSize: 'clamp(32px, 8vw, 42px)', 
    margin: '8px 0', 
    fontWeight: '900', 
    wordBreak: 'break-all',
    color: isLowBalance ? '#FFD6D6' : 'white' // Texto ligeiramente rosado se baixo
  }}>
    {formatValue(totalBalance)}
  </h1>
</div>

{/* O BLOCO DAS CONTAS (CARTEIRA) MANTÉM-SE IGUAL ABAIXO: */}
<div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px', WebkitOverflowScrolling: 'touch' }}>
  {Object.keys(settings.accounts || {}).map(k => (
    <div key={k} style={{ minWidth: '120px', backgroundColor: 'white', padding: '15px', borderRadius: '22px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
      <div style={{fontSize: '28px', marginBottom: '5px'}}>{settings.accounts[k].icon}</div>
      <div style={{fontSize: '10px', color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase'}}>{settings.accounts[k].label}</div>
      <strong style={{fontSize: '15px'}}>{formatValue(getAccountBalance(k))}</strong>
    </div>
  ))}
</div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '30px', marginBottom: '25px', border: editingId ? '2px solid #007AFF' : 'none' }}>
            <h4 style={{margin: '0 0 15px 0', fontWeight: '800', fontSize: '15px'}}>{editingId ? '📝 Editar Registo' : '➕ Novo Registo'}</h4>
            <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', backgroundColor: '#F2F2F7', borderRadius: '15px', padding: '4px', overflowX: 'auto' }}>
                {['expense', 'income', 'investimento', 'transfer'].map(t => (
                  <button key={t} type="button" onClick={() => setTransType(t)} style={{ flex: 1, padding: '10px 5px', border: 'none', borderRadius: '12px', backgroundColor: transType === t ? 'white' : 'transparent', fontWeight: '800', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {t === 'expense' ? 'Despesa' : t === 'income' ? 'Receita' : t === 'investimento' ? 'Inv.' : 'Troca'}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#F8F9FB', padding: '2px 12px', borderRadius: '15px' }}>
                <span style={{fontSize: '11px', fontWeight: 'bold', color: '#8E8E93'}}>DATA:</span>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ border: 'none', background: 'none', padding: '12px 0', flex: 1, fontWeight: 'bold', fontSize: '14px', color: '#1C1C1E' }} />
              </div>

              <input value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder={content.placeholder} required style={{ width: '100%', boxSizing: 'border-box', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', fontSize: '15px' }} />
              
              {transType === 'investimento' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select value={formData.assetType} onChange={e => setFormData({...formData, assetType: e.target.value})} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', fontSize: '14px' }}>{ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  <input value={formData.perf} onChange={e => setFormData({...formData, perf: e.target.value})} placeholder="%" style={{ width: '60px', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', textAlign: 'center', fontSize: '14px' }} />
                </div>
              )}

              <input value={formData.val} onChange={e => setFormData({...formData, val: e.target.value})} type="number" step="0.01" placeholder="0.00" required style={{ width: '100%', boxSizing: 'border-box', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', fontSize: '20px', fontWeight: '900' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select value={formData.acc} onChange={e => setFormData({...formData, acc: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', fontSize: '14px' }}>{Object.keys(settings.accounts || {}).map(k => <option key={k} value={k}>De: {settings.accounts[k].label}</option>)}</select>
                <select 
  value={transType === 'transfer' ? formData.toAcc : formData.cat} 
  onChange={(e) => {
    const selectedCat = e.target.value;
    // Se for receita e o utilizador não escolheu nada, garantimos que não fica 'luz'
    setFormData({ ...formData, cat: selectedCat });
  }}
  style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', fontSize: '14px' }}
>
  {transType === 'transfer' 
    ? Object.keys(settings.accounts || {}).map(k => <option key={k} value={k}>Para: {settings.accounts[k].label}</option>) 
    : content.categories.map(k => (
        <option key={k} value={k}>
          {CATEGORIES[k]?.icon} {CATEGORIES[k]?.label}
        </option>
      ))
  }
</select>
              </div>

              <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                <button type="submit" style={{ flex: 2, padding: '15px', backgroundColor: editingId ? '#007AFF' : content.color, color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', fontSize: '15px' }}>{editingId ? 'Confirmar' : 'Adicionar'}</button>
                {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({...formData, desc: '', val: ''})}} style={{ flex: 1, backgroundColor: '#E5E5EA', borderRadius: '15px', border: 'none', fontWeight: 'bold', fontSize: '14px'}}>Sair</button>}
              </div>
            </form>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <h3 style={{fontWeight: '900', margin: 0, fontSize: '16px'}}>Atividade</h3>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', color: '#007AFF', fontSize: '10px'}}>
              <option value="entry">MAIS RECENTES</option>
              <option value="date">DATA DO GASTO</option>
            </select>
          </div>

          {getSortedList().map(t => {
            const isGain = t.type === 'income' || t.type === 'investimento';
            const isLoss = t.type === 'expense';
            return (
              <div key={t.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: 'white', 
                padding: '14px 16px', 
                borderRadius: '24px', 
                marginBottom: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.01)'
              }}>
                {/* Ícone com Fundo Suave */}
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '14px', 
                  backgroundColor: '#F8F9FB', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '22px', 
                  marginRight: '14px',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)'
                }}>
                  {t.type === 'investimento' ? '📈' : (CATEGORIES[t.category]?.icon || '💰')}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: '800', 
                    fontSize: '13px', 
                    color: '#1C1C1E',
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {t.description}
                  </p>
                  <p style={{ margin: 0, color: '#AEAEB2', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                    {t.date} • {settings.accounts[t.account]?.label}
                  </p>
                </div>

                <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: '900', 
                    fontSize: '15px', 
                    color: isGain ? '#34C759' : isLoss ? '#FF3B30' : '#1C1C1E' 
                  }}>
                    {isGain ? '+' : isLoss ? '-' : ''}{formatValue(t.amount)}
                  </p>
                  
                  {/* Botões de Ação Estilizados */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                     <button 
                       onClick={() => handleEdit(t)} 
                       style={{ 
                         border: 'none', 
                         background: '#F2F2F7', 
                         width: '28px', 
                         height: '28px', 
                         borderRadius: '8px', 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center', 
                         fontSize: '12px',
                         cursor: 'pointer' 
                       }}
                     >
                       ✏️
                     </button>
                     <button 
                       onClick={() => { if(window.confirm('Eliminar registo?')) remove(ref(db, `users/${user}/transactions/${t.id}`)); }} 
                       style={{ 
                         border: 'none', 
                         background: '#FFF5F5', 
                         width: '28px', 
                         height: '28px', 
                         borderRadius: '8px', 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center', 
                         fontSize: '11px',
                         cursor: 'pointer' 
                       }}
                     >
                       🗑️
                     </button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

{activeTab === 'reports' && (
  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
    <h3 style={{ fontWeight: '900', marginBottom: '20px', fontSize: '20px', letterSpacing: '-0.5px' }}>Análise Mensal</h3>
    
    <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
      <select 
        value={reportMonth} 
        onChange={e => setReportMonth(parseInt(e.target.value))} 
        style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: '#F2F2F7', fontWeight: '800', fontSize: '12px', color: '#1C1C1E' }}
      >
        <option value={0}>ANO COMPLETO</option>
        {Array.from({length: 12}, (_, i) => (
          <option key={i+1} value={i+1}>
            {new Date(0, i).toLocaleString('pt', {month: 'long'}).toUpperCase()}
          </option>
        ))}
      </select>

      <select 
        value={reportYear} 
        onChange={e => setReportYear(parseInt(e.target.value))} 
        style={{ width: '100px', padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: '#F2F2F7', fontWeight: '800', fontSize: '12px', color: '#1C1C1E', textAlign: 'center' }}
      >
        {[...new Set([...list.map(t => Number(t.year || new Date(t.date).getFullYear())), new Date().getFullYear()])]
          .sort((a, b) => b - a)
          .map(y => <option key={y} value={y}>{y}</option>)
        }
      </select>
    </div>

    {/* BOTÃO PDF INSERIDO AQUI */}
    <button 
      onClick={() => gerarRelatorioMensal()}
      style={{
        width: '100%',
        padding: '16px',
        backgroundColor: '#007AFF',
        color: 'white',
        borderRadius: '16px',
        border: 'none',
        fontWeight: '900',
        fontSize: '13px',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 8px 20px rgba(0,122,255,0.15)',
        cursor: 'pointer'
      }}
    >
      <span style={{ fontSize: '18px' }}>📄</span> EXPORTAR ANÁLISE PDF
    </button>

    {!selectedDetail ? (
      // ... resto do teu código continua aqui ...
      <>
        {/* CARDS DE RESUMO (KPIs) */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
          <div style={{ flex: 1, backgroundColor: '#F2F7F2', padding: '15px', borderRadius: '20px', border: '1px solid rgba(52, 199, 89, 0.1)' }}>
            <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#34C759', opacity: 0.8 }}>RECEITAS</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '900', color: '#1C1C1E' }}>+{monthlyIncome.toFixed(0)}€</p>
          </div>
          <div style={{ flex: 1, backgroundColor: '#FFF5F5', padding: '15px', borderRadius: '20px', border: '1px solid rgba(255, 59, 48, 0.1)' }}>
            <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#FF3B30', opacity: 0.8 }}>GASTOS</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '900', color: '#1C1C1E' }}>-{monthlyExpenses.toFixed(0)}€</p>
          </div>
        </div>

        {/* GRÁFICO DONUT COM SOMBRA */}
        {monthlyExpenses > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '35px', position: 'relative' }}>
            <svg viewBox="0 0 36 36" style={{ width: '170px', height: '170px', transform: 'rotate(-90deg)', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.06))' }}>
              {getDonutData().map((slice, i) => (
                <circle
                  key={i}
                  cx="18" cy="18" r="15.915"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="3.8"
                  strokeDasharray={`${slice.percentage} ${100 - slice.percentage}`}
                  strokeDashoffset={-slice.offset}
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
              ))}
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: '800', color: '#AEAEB2', letterSpacing: '1px' }}>DESPESA</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1C1C1E' }}>{monthlyExpenses.toFixed(0)}€</p>
            </div>
          </div>
        )}

        {/* LISTA DE GASTOS COM BARRAS DINÂMICAS */}
        {Object.keys(totalsByCat).length > 0 && (
          <p style={{ fontSize: '11px', fontWeight: '900', color: '#8E8E93', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distribuição de Custos</p>
        )}
        {Object.keys(totalsByCat).sort((a, b) => totalsByCat[b] - totalsByCat[a]).map(cat => (
          <div key={cat} onClick={() => setSelectedDetail(cat)} style={{ marginBottom: '20px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px', backgroundColor: '#F8F9FB', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {CATEGORIES[cat]?.icon}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#1C1C1E' }}>{CATEGORIES[cat]?.label}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: '900', color: '#1C1C1E' }}>{totalsByCat[cat].toFixed(2)}€</span>
              </div>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#F2F2F7', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min((totalsByCat[cat] / (maxCategoryValue || 1)) * 100, 100)}%`, 
                height: '100%', 
                backgroundColor: CATEGORIES[cat]?.color, 
                borderRadius: '10px',
                transition: 'width 1s ease-in-out'
              }}></div>
            </div>
          </div>
        ))}

        {/* RENDIMENTOS COM NOVO DESIGN */}
        {Object.keys(totalsByCatIncome).length > 0 && (
          <>
            <p style={{ fontSize: '11px', fontWeight: '900', color: '#8E8E93', marginTop: '30px', marginBottom: '15px', textTransform: 'uppercase' }}>Fontes de Rendimento</p>
            {Object.keys(totalsByCatIncome).map(cat => (
              <div key={cat} style={{ padding: '16px', backgroundColor: '#F2F7F2', borderRadius: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', border: '1px solid rgba(52, 199, 89, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '22px' }}>{CATEGORIES[cat]?.icon}</span>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#1C1C1E' }}>{CATEGORIES[cat]?.label}</span>
                </div>
                <strong style={{ fontSize: '16px', color: '#34C759', fontWeight: '900' }}>
                  +{totalsByCatIncome[cat].toFixed(0)}€
                </strong>
              </div>
            ))}
          </>
        )}
      </>
    ) : (
      /* VISTA DE DETALHE (HISTÓRICO) */
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
          <button onClick={() => setSelectedDetail(null)} style={{ background: '#F2F2F7', border: 'none', width: '40px', height: '40px', borderRadius: '14px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>←</button>
          <div>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{CATEGORIES[selectedDetail]?.label}</h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#AEAEB2', fontWeight: '800', textTransform: 'uppercase' }}>Evolução Mensal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '25px 20px 15px 20px', backgroundColor: '#F8F9FB', borderRadius: '28px', gap: '12px', marginBottom: '30px' }}>
          {getCategoryHistory(selectedDetail).map((data, idx) => {
            const maxVal = Math.max(...getCategoryHistory(selectedDetail).map(d => d.val), 1);
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <span style={{ fontSize: '9px', fontWeight: '900', color: CATEGORIES[selectedDetail]?.color, marginBottom: '6px' }}>
                  {data.val.toFixed(0)}€
                </span>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ 
                    width: '100%', 
                    maxWidth: '32px', 
                    height: `${(data.val / maxVal) * 100}%`, 
                    backgroundColor: CATEGORIES[selectedDetail]?.color, 
                    borderRadius: '8px 8px 4px 4px',
                    transition: 'height 0.8s ease'
                  }}></div>
                </div>
                <span style={{ fontSize: '8px', fontWeight: '800', marginTop: '10px', color: '#AEAEB2' }}>{data.date}</span>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: '11px', fontWeight: '900', color: '#8E8E93', marginBottom: '15px', textTransform: 'uppercase' }}>Movimentos de {new Date(0, reportMonth-1).toLocaleString('pt', {month: 'long'}).toUpperCase()}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredList
            .filter(t => t.category === selectedDetail && t.type === 'expense')
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F8F9FB', borderRadius: '20px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: '800', fontSize: '13px', color: '#1C1C1E' }}>{t.description}</p>
                  <p style={{ margin: 0, color: '#AEAEB2', fontSize: '10px', fontWeight: '600' }}>{t.date} • {settings.accounts[t.account]?.label}</p>
                </div>
                <strong style={{ fontSize: '15px', fontWeight: '900', color: '#FF3B30' }}>-{t.amount.toFixed(2)}€</strong>
              </div>
            ))
          }
        </div>
      </div>
    )}
  </div>
)}

      {activeTab === 'settings' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '30px', boxSizing: 'border-box', overflowX: 'hidden' }}>
          <h3 style={{ fontWeight: '900', marginTop: 0, fontSize: '18px' }}>Definições</h3>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '10px', WebkitOverflowScrolling: 'touch' }}>
            {AVATARS.map(a => <div key={a} onClick={() => updateSettings({avatar: a})} style={{ minWidth: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', backgroundColor: settings.avatar === a ? '#007AFF' : '#F2F2F7', borderRadius: '12px', color: settings.avatar === a ? 'white' : 'inherit' }}>{a}</div>)}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <input value={settings.email} onChange={e => updateSettings({email: e.target.value})} placeholder="Email" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#F2F2F7', boxSizing: 'border-box', fontSize: '14px' }} />
            <input value={settings.password} type="password" onChange={e => updateSettings({password: e.target.value})} placeholder="Senha App" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#F2F2F7', boxSizing: 'border-box', fontSize: '14px' }} />
            
            <div style={{ display: 'flex', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ flex: 1 }}>
                <label style={{fontSize: '9px', fontWeight: '700', color: '#8E8E93', marginLeft: '5px'}}>LIMITE SALDO</label>
                <input type="number" value={settings.lowBalanceLimit} onChange={e => updateSettings({lowBalanceLimit: parseFloat(e.target.value)})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#F2F2F7', boxSizing: 'border-box', fontSize: '14px' }} />
              </div>
              <button onClick={() => updateSettings({privacyMode: !settings.privacyMode})} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: settings.privacyMode ? '#FF9500' : '#E5E5EA', color: settings.privacyMode ? 'white' : '#1C1C1E', fontWeight: '800', alignSelf: 'flex-end', height: '46px', fontSize: '12px' }}>
                {settings.privacyMode ? '🕶️ Privado' : '👁️ Público'}
              </button>
            </div>
          </div>

          <h4 style={{ fontWeight: '800', fontSize: '14px', marginTop: '20px' }}>Minhas Contas</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {Object.keys(settings.accounts || {}).map(k => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F8F9FB', borderRadius: '12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{settings.accounts[k].icon} {settings.accounts[k].label}</span>
                <button onClick={() => { if(Object.keys(settings.accounts).length > 1) { const na = {...settings.accounts}; delete na[k]; updateSettings({accounts: na}); } }} style={{ border: 'none', color: '#FF3B30', background: 'none', fontWeight: 'bold', fontSize: '11px', flexShrink: 0 }}>Apagar</button>
              </div>
            ))}
          </div>

          {!showAddAccount ? (
            <button onClick={() => setShowAddAccount(true)} style={{ width: '100%', padding: '14px', border: '2px dashed #D1D1D6', borderRadius: '15px', background: 'none', color: '#8E8E93', fontWeight: '800', fontSize: '13px', marginTop: '10px' }}>+ Adicionar Conta</button>
          ) : (
            <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#F2F2F7', borderRadius: '20px', width: '100%', boxSizing: 'border-box' }}>
              <input placeholder="Nome da Conta" value={newAccName} onChange={e => setNewAccName(e.target.value)} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
                {ACC_ICONS.map(i => (
                  <button key={i} onClick={() => setNewAccIcon(i)} style={{ width: '38px', height: '38px', border: 'none', borderRadius: '10px', background: newAccIcon === i ? '#007AFF' : 'white', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i}</button>
                ))}
              </div>
              <button onClick={() => { if(newAccName) { updateSettings({ accounts: { ...settings.accounts, [newAccName.toLowerCase()]: { label: newAccName, icon: newAccIcon } } }); setNewAccName(''); setShowAddAccount(false); } }} style={{ width: '100%', padding: '14px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>Salvar</button>
            </div>
          )}
          <button onClick={() => { localStorage.removeItem('f_user'); window.location.reload(); }} style={{ width: '100%', padding: '15px', color: '#FF3B30', border: 'none', background: 'none', fontWeight: '800', marginTop: '15px', fontSize: '14px' }}>Sair da Conta</button>
        </div>
      )}
      {activeTab === 'inventory' && (
  <div style={{ 
    paddingBottom: '20px',
    minHeight: '100vh',
    position: 'relative',
    // Configuração do Fundo com a imagem da pasta public
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.10)), url('/bg_inv.png')`,
    backgroundSize: '500px', // Ajusta o tamanho dos logos ao teu gosto
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'repeat',
    margin: '-20px -20px 0 -20px',
    padding: '20px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
      <h3 style={{ fontWeight: '900', margin: 0, fontSize: '18px' }}>📦 Inventário</h3>
      <button 
        onClick={() => setShowAddInventory(!showAddInventory)} 
        style={{ 
          backgroundColor: '#007AFF', 
          color: 'white', 
          border: 'none', 
          borderRadius: '12px', 
          padding: '8px 15px', 
          fontWeight: '800', 
          fontSize: '12px',
          boxShadow: '0 4px 12px rgba(0,122,255,0.3)'
        }}
      >
        {showAddInventory ? 'Fechar' : '+ Novo Item'}
      </button>
    </div>

    {/* --- RESUMO DE VALOR (DESIGN PREMIUM) --- */}
    <div style={{ 
  position: 'relative', padding: '20px', marginBottom: '30px', zIndex: 1,
  background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)',
  borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0 20px 50px rgba(0,0,0,0.15)', overflow: 'hidden'
}}>
  {/* Estrela Decorativa (Estilo Super Mario) */}
  <div style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)', fontSize: '30px', filter: 'drop-shadow(0 0 10px gold)' }}>⭐</div>
  
  <div style={{ display: 'flex', gap: '15px', position: 'relative', zIndex: 2 }}>
    {/* Card Investimento */}
    <div style={{ 
      flex: 1, background: 'linear-gradient(145deg, #2c2c2e, #1c1c1e)', 
      padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
    }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: '#8E8E93', letterSpacing: '1px' }}>INVESTIMENTO</p>
      <h2 style={{ margin: '5px 0 0 0', fontSize: '24px', color: '#fff' }}>
        {inventory.reduce((acc, item) => acc + (Number(item.buyPrice) || 0), 0).toFixed(2)}<span style={{fontSize: '14px', opacity: 0.6}}>€</span>
      </h2>
    </div>

    {/* Card Revenda */}
    <div style={{ 
      flex: 1, background: 'linear-gradient(145deg, #1c1c1e, #2c2c2e)', 
      padding: '20px', borderRadius: '20px', border: '1px solid rgba(50, 215, 75, 0.3)',
      textAlign: 'center', boxShadow: '0 0 20px rgba(50, 215, 75, 0.1)'
    }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: '#32D74B', letterSpacing: '1px' }}>VALOR REVENDA</p>
      <h2 style={{ margin: '5px 0 0 0', fontSize: '24px', color: '#32D74B', textShadow: '0 0 10px rgba(50,215,75,0.4)' }}>
        {inventory.reduce((acc, item) => acc + (Number(item.resellValue) || 0), 0).toFixed(2)}<span style={{fontSize: '14px'}}>€</span>
      </h2>
    </div>
  </div>

  {/* Moedas de Ouro (Decoração no fundo) */}
  <div style={{ position: 'absolute', right: '10px', bottom: '-5px', fontSize: '24px', opacity: 0.8 }}>🪙🪙</div>
</div>

    {/* --- BARRA DE PESQUISA ESTILO APPLE --- */}
    <div style={{ position: 'relative', marginBottom: '25px', zIndex: 1 }}>
      <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.5 }}>🔍</div>
      <input
        type="text"
        placeholder="Procurar na coleção... (Exemplo: Game Boy Advance)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '16px 16px 16px 48px',
          borderRadius: '18px',
          border: '1px solid rgba(0,0,0,0.05)',
          backgroundColor: '#FFF',
          fontSize: '15px',
          fontWeight: '600',
          outline: 'none',
          boxSizing: 'border-box',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
          color: '#1C1C1E',
          transition: 'all 0.2s ease'
        }}
      />
    </div>{/* Este é o fecho do Resumo de Valor */}
      <div style={{ position: 'relative', marginBottom: '20px', zIndex: 1 }}>
  
</div>

{/* --- PASSO 2: BARRA DE FILTROS --- */}
<div style={{ 
  display: 'flex', 
  gap: '10px', 
  overflowX: 'auto', 
  paddingBottom: '15px', 
  marginBottom: '10px',
  WebkitOverflowScrolling: 'touch',
  position: 'relative',
  zIndex: 1
}}>
  {['TODOS', 'NINTENDO', 'SEGA', 'PLAYSTATION', 'GAMEBOY', 'OUTROS'].map(tag => (
    <button
      key={tag}
      onClick={() => setInvFilter(tag)}
      style={{
        padding: '8px 16px',
        borderRadius: '12px',
        border: 'none',
        backgroundColor: invFilter === tag ? '#007AFF' : 'white',
        color: invFilter === tag ? 'white' : '#8E8E93',
        fontWeight: '900',
        fontSize: '10px',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
        boxShadow: invFilter === tag ? '0 4px 10px rgba(0,122,255,0.3)' : '0 2px 5px rgba(0,0,0,0.05)',
        transition: '0.2s'
      }}
    >
      {tag}
    </button>
  ))}
</div>
{/* --- FIM DA BARRA DE FILTROS --- */}

{/* O resto do teu código (formulário e grid de itens) continua aqui abaixo... */}

{showAddInventory && (
            <form onSubmit={handleInventorySubmit} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '28px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
              <h4 style={{ margin: '0 0 5px 0', fontWeight: '800', fontSize: '15px' }}>✨ Detalhes do Item</h4>
              
              <input 
                placeholder="Nome do Item (ex: GameBoy DMG-01)" 
                value={invData.name} 
                onChange={e => setInvData({...invData, name: e.target.value})} 
                required 
                style={{ padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '14px' }} 
              />

              {/* Seletor de Categoria/Tag */}
              <select 
                value={invData.category || 'OUTROS'} 
                onChange={e => setInvData({...invData, category: e.target.value})} 
                style={{ padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '14px', fontWeight: '800', color: '#1C1C1E', appearance: 'none' }}
              >
                <option value="OUTROS">SELECIONAR TAG (MARCA)</option>
                <option value="NINTENDO">NINTENDO</option>
                <option value="SEGA">SEGA</option>
                <option value="PLAYSTATION">PLAYSTATION</option>
                <option value="GAMEBOY">GAMEBOY</option>
                <option value="OUTROS">OUTROS</option>
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" placeholder="Compra €" value={invData.buyPrice} onChange={e => setInvData({...invData, buyPrice: e.target.value})} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '14px' }} />
                <input type="number" placeholder="Revenda €" value={invData.resellValue} onChange={e => setInvData({...invData, resellValue: e.target.value})} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '14px' }} />
              </div>

              <label style={{ backgroundColor: '#F2F2F7', padding: '14px', borderRadius: '14px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: '800', color: invData.photo ? '#34C759' : '#007AFF', transition: '0.2s' }}>
                {invData.photo ? '✅ Foto Pronta' : '📷 Tirar / Carregar Foto'}
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>

              <button type="submit" style={{ backgroundColor: '#007AFF', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: '900', fontSize: '15px', marginTop: '5px' }}>
                {invData.id ? 'Atualizar Item' : 'Guardar no Inventário'}
              </button>
            </form>
          )}

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
  {inventory
    .filter(item => {
      // 1. Filtro de Categoria (Nintendo, Sega, etc)
      const matchesFilter = !invFilter || invFilter === 'TODOS' || item.category === invFilter;
      
      // 2. Filtro de Pesquisa por Texto (searchTerm)
      const matchesSearch = item.name.toLowerCase().includes((searchTerm || '').toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
    // 1. Adicionamos o 'index' aqui para contar os cards
.map((item, index) => ( 
  <div 
    key={item.id} 
    className="card-animado" // 2. Chamamos a regra que criaste no index.css
    style={{ 
      // 3. Criamos o efeito dominó (cada card espera um pouco mais que o anterior)
      animationDelay: `${index * 0.1}s`, 
      
      backgroundColor: 'rgba(255, 255, 255, 0.75)', 
      backdropFilter: 'blur(12px)', 
      WebkitBackdropFilter: 'blur(12px)', 
      borderRadius: '24px', 
      overflow: 'hidden', 
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)', 
      display: 'flex', 
      flexDirection: 'column', 
      border: '1px solid rgba(255, 255, 255, 0.4)'
    }}
  >
    <div style={{ 
      height: '140px', 
      backgroundColor: 'rgba(248, 249, 251, 0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
                  {item.photo && activeTab === 'inventory' ? (
  <img 
    src={item.photo} 
    alt={item.name}
    /* Aqui está o Passo 3 */
    onClick={() => setViewPhoto(item.photo)} 
    style={{ 
      width: '100%', 
      height: '100%', 
      objectFit: 'contain', 
      padding: '10px', 
      cursor: 'pointer' // Mostra a "mãozinha" ao passar o rato
    }} 
  />
) : (
  <span style={{ fontSize: '40px' }}>📦</span>
)}
                  {/* Badge de Lucro Potencial */}
                  {item.resellValue > item.buyPrice && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px', 
                      backgroundColor: '#34C759', 
                      color: 'white', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '10px', 
                      fontWeight: '900',
                      zIndex: 1,
                      // --- ADICIONA ESTAS 2 LINHAS PARA O POLIMENTO ---
                      boxShadow: '0 0 12px rgba(52, 199, 89, 0.6)', 
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      {/* Aqui deve estar a tua lógica de cálculo, algo como: */}
                      +{ (Number(item.resellValue) - Number(item.buyPrice)).toFixed(0) }€
                    </div>
                  )}
                </div>

                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '800', fontSize: '13px', lineHeight: '1.2', color: '#1C1C1E', height: '32px', overflow: 'hidden' }}>
                    {item.name}
                  </p>
                  
                  <p style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '8px', 
                    color: formatDateInfo(item.lastUpdate || item.timestamp).color, 
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    {item.lastUpdate ? 'Modificado: ' : 'Criado: '}
                    {formatDateInfo(item.lastUpdate || item.timestamp).text}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div 
  onClick={() => {
    // ESTA É A PARTE QUE SUBSTITUI A JANELA BRANCA:
    setEditingPrice(item); 
    setTempPrice(item.resellValue); 
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
  }}
  style={{ 
    cursor: 'pointer', 
    padding: '4px 8px', 
    backgroundColor: 'rgba(52, 199, 89, 0.05)', 
    borderRadius: '8px',
    marginLeft: '-8px' 
  }}
>
  <span style={{ display: 'block', fontSize: '8px', fontWeight: '800', color: '#AEAEB2', marginBottom: '2px' }}>
    VALOR REVENDA ✎
  </span>
  <span style={{ fontSize: '16px', fontWeight: '900', color: '#34C759' }}>
    {Number(item.resellValue).toFixed(2)}€
  </span>
</div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditInventory(item)} style={{ border: 'none', background: '#F2F2F7', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✏️</button>
                      <button onClick={() => { if(window.confirm('Apagar item?')) remove(ref(db, `users/${user}/inventory/${item.id}`)); }} style={{ border: 'none', background: '#FFF5F5', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
</div>
)}
{/* --- ABA POKÉMON TOTAL: INTEGRAÇÃO API + DASHBOARD ELITE + MODAIS --- */}
{activeTab === 'pokemon' && (
  <div style={{ 
    paddingBottom: '120px', 
    minHeight: '100vh', 
    padding: '20px',
    backgroundColor: '#fdfdfd',
    backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    position: 'relative'
  }}>

    <style>{`
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulseText { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
      @keyframes shine { from { left: -100%; } to { left: 100%; } }
    `}</style>
    
    {/* CABEÇALHO */}
    <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px',
      background: 'white', padding: '15px 25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f1f1'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ 
          width: '40px', height: '40px', borderRadius: '50%', 
          background: 'linear-gradient(180deg, #ee1515 50%, white 50%)', 
          border: '3px solid #1c1c1e', position: 'relative', boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.1)'
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '0', width: '100%', height: '3px', backgroundColor: '#1c1c1e', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white', border: '3px solid #1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', border: '1px solid #1c1c1e' }} />
          </div>
        </div>
        <h3 style={{ fontWeight: '900', margin: 0, fontSize: '22px', color: '#1c1c1e', letterSpacing: '-1px', textTransform: 'uppercase' }}>POKÉDEX</h3>
      </div>
      <button onClick={() => setShowAddPokemon(!showAddPokemon)} style={{ backgroundColor: '#ee1515', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 0 #b10f0f', cursor: 'pointer' }}>
        {showAddPokemon ? 'FECHAR' : 'ADICIONAR CARTA'}
      </button>
    </div>

    {/* PESQUISA DE RESULTADOS API */}
    {searchResults.length > 0 && (
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0', marginBottom: '15px' }}>
        {searchResults.map((result) => (
          <div key={result.id} onClick={() => { setPokemonData({...pokemonData, id: result.id, name: result.name, set: result.set.name, setLogo: result.set.images.logo, photo: result.images.small, marketValue: result.tcgplayer?.prices?.holofoil?.market || result.tcgplayer?.prices?.normal?.market || 0, avg7Day: result.tcgplayer?.prices?.holofoil?.low || 0}); setSearchResults([]); }} style={{ cursor: 'pointer', textAlign: 'center', minWidth: '80px' }}>
            <img src={result.images.small} style={{ width: '60px', borderRadius: '4px' }} alt={result.name} />
            <p style={{ fontSize: '8px', fontWeight: 'bold', margin: '5px 0' }}>{result.set.name}</p>
          </div>
        ))}
      </div>
    )}

    {/* FORMULÁRIO ADICIONAR COM BACKGROUND CHARIZARD E POKÉBOLA HD */}
    {showAddPokemon && (
      <div style={{ 
        backgroundImage: `url('/charizard.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '8px', 
        borderRadius: '28px', 
        marginBottom: '25px', 
        boxShadow: '0 12px 30px rgba(238, 21, 21, 0.3)', 
        border: '4px solid white', 
        position: 'relative', 
        overflow: 'hidden', 
        boxSizing: 'border-box' 
      }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(8px)', padding: '14px', borderRadius: '22px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
            <input placeholder="Nome da Carta..." value={pokemonData.name || ''} onChange={e => setPokemonData({...pokemonData, name: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(242, 242, 247, 0.9)', fontSize: '14px', fontWeight: '800', outline: 'none' }} />
            
            {/* POKÉBOLA HD NO MENU */}
            <div style={{ 
                width: '45px', height: '45px', borderRadius: '50%', 
                background: 'linear-gradient(180deg, #ee1515 45%, #1c1c1e 45%, #1c1c1e 55%, white 55%)', 
                border: '3px solid #1c1c1e', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                animation: 'spin 3s linear infinite'
            }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '14px', height: '14px', borderRadius: '50%', background: 'white', border: '3px solid #1c1c1e', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1c1c1e', opacity: 0.3 }} />
                </div>
                <div style={{ position: 'absolute', top: '5px', left: '8px', width: '10px', height: '5px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%', transform: 'rotate(-20deg)' }} />
            </div>
          </div>
          
          <input placeholder="URL da Imagem da Carta..." value={pokemonData.photo || ''} onChange={e => setPokemonData({...pokemonData, photo: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(242, 242, 247, 0.9)', fontSize: '13px', fontWeight: '700', marginBottom: '10px', boxSizing: 'border-box' }} />

          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input placeholder="Set" value={pokemonData.set || ''} onChange={e => setPokemonData({...pokemonData, set: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(242, 242, 247, 0.9)', fontSize: '13px', fontWeight: '700' }} />
            <select value={pokemonData.rarity || ''} onChange={e => setPokemonData({...pokemonData, rarity: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(242, 242, 247, 0.9)', fontSize: '11px', fontWeight: '800' }}>
              <option value="">Raridade</option>
              <option value="Secret Rare">Secret Rare</option>
              <option value="Special Illustration Rare">Spec. Illus. Rare</option>
              <option value="Illustration Rare">Illus. Rare</option>
              <option value="Ultra Rare">Ultra Rare</option>
              <option value="Hyper Rare">Hyper Rare</option>
              <option value="Double Rare">Double Rare</option>
              <option value="Rare Holo">Rare Holo</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            <input placeholder="Market €" type="number" value={pokemonData.marketValue || ''} onChange={e => setPokemonData({...pokemonData, marketValue: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(242, 242, 247, 0.9)', fontSize: '13px', fontWeight: '700' }} />
            <input placeholder="7D Avg €" type="number" value={pokemonData.avg7Day || ''} onChange={e => setPokemonData({...pokemonData, avg7Day: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(242, 242, 247, 0.9)', fontSize: '13px', fontWeight: '700' }} />
          </div>
          <button onClick={() => { if (!pokemonData.name) return; setSavingPokemon(true); setTimeout(() => { handlePokemonSubmit(pokemonData); setSavingPokemon(false); setShowAddPokemon(false); }, 1500); }} style={{ width: '100%', padding: '16px', backgroundColor: '#ee1515', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '1000', textTransform: 'uppercase', boxShadow: '0 6px 0 #b10f0f' }}>ADICIONAR À POKÉDEX</button>
        </div>
      </div>
    )}

    {/* DASHBOARD COM BARRA DE EXP PREMIUM */}
    <div style={{ marginBottom: '30px', position: 'relative' }}>
      <div style={{ backgroundImage: `url('/charizard.png')`, backgroundSize: 'cover', backgroundPosition: 'center 35%', borderRadius: '35px', padding: '3px', position: 'relative', zIndex: 1, overflow: 'hidden', border: '2px solid rgba(255,215,0,0.6)', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg" style={{ position: 'absolute', right: '20px', top: '20px', height: '25px', zIndex: 10 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 20%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.7) 100%)', backdropFilter: 'blur(4px)', zIndex: 2 }} />
        <div style={{ position: 'relative', zIndex: 10, padding: '25px 20px' }}>
          <div style={{ background: 'rgba(255, 59, 48, 0.9)', padding: '4px 12px', borderRadius: '50px', border: '1px solid white', width: 'fit-content', marginBottom: '15px' }}>
            <span style={{ fontSize: '12px', fontWeight: '1000', color: 'white' }}>POKEDEX VALUE</span>
          </div>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', padding: '10px 25px', borderRadius: '25px', width: 'fit-content', marginBottom: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: 0, fontSize: '38px', fontWeight: '1000', color: '#fff', letterSpacing: '-2px' }}>
              {pokemonCards.reduce((acc, card) => acc + (parseFloat(card.marketValue) || 0), 0).toFixed(2)}€
            </h4>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '18px' }}>
             <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '10px 22px', borderRadius: '16px 4px 16px 4px', border: '2px solid #FFCC00', flex: 1 }}>
               <p style={{ margin: 0, fontSize: '11px', color: '#FF9500', fontWeight: '1000' }}>MASTER TRAINER RANK</p>
               <p style={{ margin: 0, fontSize: '18px', color: '#1c1c1e', fontWeight: '1000' }}>PRO TRAINER ALPHA</p>
             </div>
             <div style={{ background: 'linear-gradient(180deg, #FFCC00, #FF9500)', padding: '12px 24px', borderRadius: '15px', fontSize: '18px', fontWeight: '1000', textAlign: 'center', minWidth: '80px', boxShadow: '0 4px 12px rgba(255, 153, 0, 0.3)' }}>LVL {Math.floor(pokemonCards.length / 5)}</div>
          </div>

          {/* BARRA DE EXP MELHORADA */}
          <div style={{ position: 'relative', width: '100%', height: '14px', background: 'rgba(0,0,0,0.4)', borderRadius: '20px', padding: '2px', border: '1px solid rgba(255,255,255,0.4)', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div style={{ 
                width: `${(pokemonCards.length % 5) * 20}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)', 
                borderRadius: '20px',
                position: 'relative',
                transition: 'width 0.5s ease-out'
            }}>
                {/* Efeito de Brilho animado na barra */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, width: '30px', background: 'rgba(255,255,255,0.4)', filter: 'blur(5px)', animation: 'shine 2s infinite linear' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: 'white', fontWeight: '900', opacity: 0.8 }}>EXP: {pokemonCards.length % 5} / 5</span>
          </div>
        </div>
      </div>
    </div>

    {/* BARRA DE PESQUISA E FILTROS */}
    <div style={{ marginBottom: '25px' }}>
      <input type="text" placeholder="Pesquisar carta pelo nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '14px 15px', borderRadius: '18px', border: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '700', outline: 'none', boxSizing: 'border-box' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '12px', borderRadius: '15px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '12px', fontWeight: '800' }}>
          <option value="recent">🕒 MAIS RECENTES</option>
          <option value="expensive">💰 MAIS CARAS</option>
        </select>
        <select value={filterSet} onChange={(e) => setFilterSet(e.target.value)} style={{ padding: '12px', borderRadius: '15px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '12px', fontWeight: '800' }}>
          <option value="all">📦 TODOS OS SETS</option>
          {uniqueSets.map(set => <option key={set} value={set}>{set.toUpperCase()}</option>)}
        </select>
      </div>
    </div>

   {/* GRELHA DE CARTAS */}
   <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', position: 'relative', zIndex: 5 }}>
      {filteredCards.map((card, index) => {
        const setName = card.setName || card.set || "Unknown Set";
        return (
          <div key={card.id || index} style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '30px 10px 30px 10px', 
            padding: '20px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)', 
            position: 'relative', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column', 
            animation: `fadeIn 0.6s forwards ${index * 0.1}s`, 
            opacity: 0, 
            zIndex: 2,
            /* BORDA MUITO MAIS GROSSA (8px) EM AMARELO POKÉMON */
            border: '12px solid #ffcb05' 
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${card.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.9, filter: 'blur(5px)', zIndex: 0 }} />
            
            <div style={{ background: 'linear-gradient(180deg, #475569 0%, #1e293b 100%)', color: '#fff', padding: '12px', borderRadius: '16px 4px 16px 4px', zIndex: 3, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'center', fontSize: '13px', fontWeight: '1000' }}>{card.name}</span>
            </div>

            <div onClick={() => setSelectedCard(card)} style={{ position: 'relative', height: '280px', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(8px)', borderRadius: '20px 8px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', zIndex: 2, border: '1px solid #fff' }}>
              <img src={card.photo} style={{ width: '90%', height: '95%', objectFit: 'contain' }} />
            </div>

            <div style={{ zIndex: 3, position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                
                <div style={{ 
                  background: '#1e293b', 
                  color: '#fff', 
                  fontSize: '10px', 
                  fontWeight: '1000', 
                  padding: '8px 15px', 
                  borderRadius: '8px', 
                  borderLeft: '4px solid #ffcb05', 
                  width: 'fit-content',
                  boxShadow: '0 0 0 1px white' 
                }}>
                  ★ {card.rarity ? card.rarity.toUpperCase() : 'RARE'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', borderRadius: '12px', overflow: 'hidden', border: '2px solid #1c1c1e', background: '#fff', height: '42px' }}>
                  <div style={{ width: '45px', height: '100%', background: '#ee1515', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', border: '2.5px solid #1c1c1e', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2.5px', background: '#1c1c1e', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '0 12px', fontSize: '11px', fontWeight: '1000' }}>{setName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', background: '#1c1c1e', padding: '15px 20px', borderRadius: '25px', marginBottom: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ color: '#8E8E93', fontSize: '9px', fontWeight: '800' }}>MARKET</span>
                  <div style={{ fontSize: '22px', fontWeight: '1000', color: '#fff' }}>{Number(card.marketValue).toFixed(2)}€</div>
                </div>
                <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 15px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
                  <span style={{ color: '#8E8E93', fontSize: '9px', fontWeight: '800' }}>7D AVG</span>
                  <div style={{ fontSize: '16px', fontWeight: '1000', color: '#ff4b4b' }}>{Number(card.avg7Day).toFixed(2)}€</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {/* BOTÃO EDIT COM BORDA AMARELA ADICIONADA */}
                <button onClick={() => setEditingCard(card)} style={{ flex: 1, background: '#1e293b', border: '2px solid #ffcb05', padding: '15px', borderRadius: '18px', color: '#fff', fontSize: '12px', fontWeight: '1000' }}>EDIT</button>
                <button onClick={() => setPokemonToDelete(card)} style={{ flex: 1, background: '#fff', border: '2px solid #ff4b4b', padding: '15px', borderRadius: '18px', color: '#ff4b4b', fontSize: '12px', fontWeight: '1000' }}>DISCARD</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* ANIMAÇÃO POKÉBOLA AO ADICIONAR (FULL HD) */}
    {savingPokemon && (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', zIndex: 20000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(180deg, #ee1515 48%, #1c1c1e 48%, #1c1c1e 52%, white 52%)', border: '5px solid #1c1c1e', position: 'relative', animation: 'spin 0.8s linear infinite, float 2s ease-in-out infinite', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '28px', height: '28px', borderRadius: '50%', background: 'white', border: '5px solid #1c1c1e', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)', zIndex: 2 }} />
            <div style={{ position: 'absolute', top: '10px', left: '15px', width: '25px', height: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', transform: 'rotate(-25deg)' }} />
         </div>
         <p style={{ marginTop: '25px', fontWeight: '1000', color: '#ee1515', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>A ADICIONAR À POKÉDEX...</p>
      </div>
    )}

    {/* MODAIS (EDIT / DISCARD / ZOOM) - MANTIDOS IGUAIS */}
    {editingCard && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '30px', padding: '25px', width: '100%', maxWidth: '350px', border: '4px solid #ee1515' }}>
          <h3 style={{ textAlign: 'center', fontWeight: '900', color: '#2c3e50', margin: '0 0 5px 0' }}>ATUALIZAR PREÇOS</h3>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginBottom: '20px' }}>{editingCard.name}</p>
          <input type="number" value={editingCard.marketValue} onChange={e => setEditingCard({...editingCard, marketValue: e.target.value})} style={{ width: '100%', padding: '15px', background: '#F2F2F7', border: 'none', borderRadius: '15px', marginBottom: '15px', fontSize: '18px', fontWeight: '900', boxSizing: 'border-box' }} />
          <input type="number" value={editingCard.avg7Day} onChange={e => setEditingCard({...editingCard, avg7Day: e.target.value})} style={{ width: '100%', padding: '15px', background: '#F2F2F7', border: 'none', borderRadius: '15px', marginBottom: '25px', fontSize: '18px', fontWeight: '900', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setEditingCard(null)} style={{ flex: 1, padding: '15px', background: '#E5E5EA', borderRadius: '15px', border: 'none', fontWeight: '900' }}>CANCELAR</button>
            <button onClick={() => { update(ref(db, `users/${user}/pokemonCollection/${editingCard.id}`), { marketValue: editingCard.marketValue, avg7Day: editingCard.avg7Day }); setEditingCard(null); }} style={{ flex: 1, padding: '15px', background: '#ee1515', color: 'white', borderRadius: '15px', border: 'none', fontWeight: '900' }}>GUARDAR</button>
          </div>
        </div>
      </div>
    )}

    {pokemonToDelete && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '30px', padding: '30px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
          <h3 style={{ fontWeight: '900', fontSize: '20px', color: '#2c3e50', marginBottom: '10px' }}>Eliminar Carta?</h3>
          <p style={{ color: '#888', marginBottom: '25px' }}>Remover {pokemonToDelete.name} da coleção?</p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setPokemonToDelete(null)} style={{ flex: 1, padding: '12px', background: '#F2F2F7', borderRadius: '15px', border: 'none', fontWeight: '900' }}>Não</button>
            <button onClick={() => { remove(ref(db, `users/${user}/pokemonCollection/${pokemonToDelete.id}`)); setPokemonToDelete(null); }} style={{ flex: 1, padding: '12px', background: '#ee1515', color: 'white', borderRadius: '15px', border: 'none', fontWeight: '900' }}>Sim</button>
          </div>
        </div>
      </div>
    )}

    {selectedCard && (
      <div onClick={() => setSelectedCard(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
        <p style={{ color: 'white', fontWeight: '900', marginBottom: '20px', fontSize: '14px', letterSpacing: '2px', animation: 'pulseText 2s infinite' }}>TOQUE PARA FECHAR</p>
        <img src={selectedCard.photo} style={{ maxWidth: '92%', maxHeight: '75vh', borderRadius: '15px' }} />
      </div>
    )}

  </div>
    )}

{activeTab === 'setup' && (
  <div style={{ paddingBottom: '100px' }}>
    {renderSetupTab()}
  </div>
)}

{/* Menu Inferior Dinâmico */}
<div style={{ 
  position: 'fixed', 
  bottom: '25px', 
  left: '0', 
  right: '0', 
  zIndex: 10000, 
  display: 'flex', 
  justifyContent: 'center' 
}}>
  <div style={{ 
    // Largura automática para os ícones não fugirem
    display: 'inline-flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '60px',
    background: 'rgba(255,255,255,0.96)', 
    backdropFilter: 'blur(20px)', 
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '30px', 
    padding: '0 15px', // Reduzi o padding lateral
    gap: '10px', // Gap reduzido para comprimir os 6 botões no centro
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.4)',
    boxSizing: 'border-box'
  }}>
    <button onClick={() => { triggerHaptic('light'); setActiveTab('pokemon'); setSelectedDetail(null); }} style={{ background: 'none', border: 'none', padding: '0 5px', opacity: activeTab === 'pokemon' ? 1 : 0.3, display: 'flex' }}><img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" style={{ width: '20px' }} alt="pk" /></button>
    <button onClick={() => { triggerHaptic('light'); setActiveTab('inventory'); setSelectedDetail(null); }} style={{ background: 'none', border: 'none', fontSize: '20px', padding: '0 5px', opacity: activeTab === 'inventory' ? 1 : 0.3 }}>📦</button>
    <button onClick={() => { triggerHaptic('medium'); setActiveTab('home'); setSelectedDetail(null); }} style={{ background: 'none', border: 'none', fontSize: '24px', padding: '0 5px', opacity: activeTab === 'home' ? 1 : 0.3, transform: activeTab === 'home' ? 'scale(1.1)' : 'scale(1)', transition: '0.2s' }}>💰</button>
    <button onClick={() => { triggerHaptic('light'); setActiveTab('setup'); setSelectedDetail(null); }} style={{ background: 'none', border: 'none', fontSize: '20px', padding: '0 5px', opacity: activeTab === 'setup' ? 1 : 0.3 }}>🖥️</button>
    <button onClick={() => { triggerHaptic('light'); setActiveTab('reports'); setSelectedDetail(null); }} style={{ background: 'none', border: 'none', fontSize: '20px', padding: '0 5px', opacity: activeTab === 'reports' ? 1 : 0.3 }}>📊</button>
    <button onClick={() => { triggerHaptic('light'); setActiveTab('settings'); setSelectedDetail(null); }} style={{ background: 'none', border: 'none', fontSize: '20px', padding: '0 5px', opacity: activeTab === 'settings' ? 1 : 0.3 }}>⚙️</button>
  </div>
</div>

<footer style={{ textAlign: 'center', padding: '40px 0 120px 0', opacity: 0.5 }}>
  <p style={{ fontSize: '9px', color: '#AEAEB2', letterSpacing: '2px', fontWeight: '800' }}>© 2026 ALIGNA — HUGO BARROS</p>
</footer>
    </div>
  );
}