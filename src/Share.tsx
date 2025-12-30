import React, { useState, useEffect } from 'react';

// Link direto para o teu setup sem passar pelo login da Aligna
const PublicPage = () => {
  const [activeTab, setActiveTab] = useState('setup');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'pokemon') setActiveTab('pokemon');
  }, []);

  const renderPokemonTab = () => (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontWeight: '900' }}>THE VAULT</h2>
      <p>A tua coleção de cartas seladas Pokémon.</p>
      {/* Aqui usaremos o código da Pokébola Real que guardámos */}
      <div style={{ fontSize: '50px', marginTop: '20px' }}>⭐</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      {activeTab === 'setup' ? (
        <div style={{ padding: '20px' }}>
          {/* Aqui colas apenas a parte visual do teu setup */}
          <h1 style={{ textAlign: 'center' }}>Meu Setup Interativo</h1>
          <p style={{ textAlign: 'center' }}>Vê os componentes abaixo:</p>
        </div>
      ) : renderPokemonTab()}

      {/* Menu Inferior Público */}
      <nav style={{
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        background: 'white', padding: '15px 30px', borderRadius: '40px',
        display: 'flex', gap: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <button onClick={() => setActiveTab('pokemon')} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', opacity: activeTab === 'pokemon' ? 1 : 0.3 }}>
           <img src="/pokebola-icon.png" width="24" alt="Pokébola" />
        </button>
        <button onClick={() => setActiveTab('setup')} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', opacity: activeTab === 'setup' ? 1 : 0.3 }}>
           🖥️
        </button>
      </nav>
    </div>
  );
};

export default PublicPage;