import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { ref, push, onValue, set, remove } from "firebase/database";

const TWELVE_DATA_KEY = "49563e179ee146c5a53279200c654f29";

const CATEGORIES = {
  alimentacao: { label: 'Alimentação', icon: '🍔', color: '#FF9500' },
  lazer: { label: 'Lazer', icon: '🎬', color: '#AF52DE' },
  transporte: { label: 'Transporte', icon: '🚗', color: '#5856D6' },
  saude: { label: 'Saúde', icon: '💊', color: '#FF3B30' },
  casa: { label: 'Casa', icon: '🏠', color: '#FFCC00' },
  luz: { label: 'Eletricidade', icon: '⚡', color: '#FFD60A' },
  gas: { label: 'Gás', icon: '🔥', color: '#5AC8FA' },
  servicos: { label: 'Serviços Casa', icon: '🛠️', color: '#8E8E93' },
  internet: { label: 'Internet/TV', icon: '🌐', color: '#007AFF' },
  salario: { label: 'Salário', icon: '💰', color: '#34C759' },
  investimento: { label: 'Investimento', icon: '📈', color: '#5AC8FA' },
  transferencia: { label: 'Transferência', icon: '🔄', color: '#007AFF' },
  outros: { label: 'Outros', icon: '📦', color: '#8E8E93' }
};

const ASSET_TYPES = ['ETF', 'Ações', 'Crypto', 'Bonds', 'PPR', 'Outro'];
const AVATARS = ['👤', '👨‍💻', '👩‍💼', '🧥', '🎨', '🚀', '🐱', '🦁', '⭐'];
const ACC_ICONS = ['👛', '🏦', '🐖', '💳', '💎', '📊', '💰'];

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('f_user') || null);
  const [list, setList] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'reports', 'settings'
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [transType, setTransType] = useState('expense');
  const [newAccName, setNewAccName] = useState('');
  const [newAccIcon, setNewAccIcon] = useState('🏦');
  
  // Filtros de Relatório
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const [selectingUser, setSelectingUser] = useState(null);
  const [loginPass, setLoginPass] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  const [settings, setSettings] = useState({ 
    lowBalanceLimit: 50, currency: '€', privacyMode: false, avatar: AVATARS[0], 
    email: '', password: '', accounts: { 'carteira': { label: 'Carteira', icon: '👛' } } 
  });

  useEffect(() => {
    onValue(ref(db, `users`), (snap) => setAllUsers(snap.val() || {}));
    if (user) {
      onValue(ref(db, `users/${user}/settings`), (snap) => {
        if (snap.val()) setSettings(prev => ({ ...prev, ...snap.val() }));
      });
      onValue(ref(db, `users/${user}/transactions`), (snap) => {
        const data = snap.val();
        setList(data ? Object.keys(data).map(id => ({ ...data[id], id })) : []);
      });
    }
  }, [user]);

  const updateSettings = (newSet) => {
    const updated = { ...settings, ...newSet };
    setSettings(updated);
    if (user) set(ref(db, `users/${user}/settings`), updated);
  };

  const handleEntry = () => {
    const savedPass = allUsers[selectingUser]?.settings?.password || "";
    if (savedPass && loginPass !== savedPass) {
      alert("⚠️ Password Incorreta!");
      return;
    }
    localStorage.setItem('f_user', selectingUser);
    const known = JSON.parse(localStorage.getItem('known_profiles') || '[]');
    if(!known.includes(selectingUser)) {
        known.push(selectingUser);
        localStorage.setItem('known_profiles', JSON.stringify(known));
    }
    setUser(selectingUser);
    setSelectingUser(null);
    setLoginPass('');
  };

  const handleRegister = () => {
    if (!regName || !regEmail || !regPass) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    const userId = regName.toLowerCase().trim();
    if (allUsers[userId]) {
      alert("Este nome de utilizador já existe.");
      return;
    }
    const initialSettings = { ...settings, email: regEmail, password: regPass, avatar: AVATARS[0] };
    set(ref(db, `users/${userId}/settings`), initialSettings).then(() => {
      localStorage.setItem('f_user', userId);
      const known = JSON.parse(localStorage.getItem('known_profiles') || '[]');
      known.push(userId);
      localStorage.setItem('known_profiles', JSON.stringify(known));
      setUser(userId);
      setIsRegistering(false);
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
  const formatValue = (val) => settings.privacyMode ? "••••" : val.toFixed(2) + settings.currency;

  const getDynamicContent = () => {
    switch(transType) {
      case 'investimento': return { placeholder: "Ticker (ex: AAPL)", categories: ['investimento'], color: '#5AC8FA' };
      case 'income': return { placeholder: "Origem (ex: Salário)", categories: ['salario', 'outros'], color: '#34C759' };
      case 'transfer': return { placeholder: "Motivo (ex: Poupança)", categories: ['transferencia'], color: '#5856D6' };
      default: return { placeholder: "Onde gastou?", categories: ['alimentacao', 'lazer', 'transporte', 'saude', 'casa', 'luz', 'gas', 'servicos', 'internet', 'outros'], color: '#007AFF' };
    }
  };

  const content = getDynamicContent();

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const { desc, val, cat, acc, toAcc, assetType, perf } = form.elements;
    let amountValue = parseFloat(val.value);
    if (isNaN(amountValue)) return;
    let autoPerformance = perf ? perf.value : "0";

    if (transType === 'investimento' && desc.value) {
      try {
        const response = await fetch(`https://api.twelvedata.com/quote?symbol=${desc.value.toUpperCase()}&apikey=${TWELVE_DATA_KEY}`);
        const data = await response.json();
        if (data && data.percent_change) autoPerformance = parseFloat(data.percent_change).toFixed(2);
      } catch (err) { console.error(err); }
    }

    const transactionData = { 
      description: desc.value.toUpperCase(), 
      amount: Math.abs(amountValue), 
      type: transType, 
      category: transType === 'transfer' ? 'transferencia' : (cat ? cat.value : 'investimento'),
      assetDetails: transType === 'investimento' ? { type: assetType.value, performance: autoPerformance } : null,
      account: acc.value, 
      toAccount: transType === 'transfer' ? toAcc.value : null, 
      date: new Date().toLocaleDateString('pt-PT'),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      timestamp: Date.now() 
    };

    await push(ref(db, `users/${user}/transactions`), transactionData);
    form.reset();
    setTransType('expense');
  };

  // --- LÓGICA DE RELATÓRIOS ---
  const filteredList = list.filter(t => t.month === reportMonth && t.year === reportYear);
  const totalsByCategory = filteredList.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {});

  if (!user) {
    const knownProfiles = JSON.parse(localStorage.getItem('known_profiles') || '[]');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F2F4F7', padding: '20px', fontFamily: '-apple-system, sans-serif' }}>
        <h1 style={{ fontWeight: '900', fontSize: '46px', letterSpacing: '-2px' }}>Aligna</h1>
        {!isRegistering ? (
          <>
            {knownProfiles.map(u => allUsers[u] && (
              <div key={u} onClick={() => setSelectingUser(u)} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '25px', marginBottom: '10px', width: '200px', textAlign: 'center', cursor: 'pointer' }}>
                {allUsers[u].settings?.avatar} {u.toUpperCase()}
              </div>
            ))}
            {selectingUser && (
              <div style={{ marginTop: '20px' }}>
                <input type="password" placeholder="Password" value={loginPass} onChange={e => setLoginPass(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <button onClick={handleEntry} style={{ marginLeft: '10px', padding: '10px', borderRadius: '10px', background: '#1C1C1E', color: 'white' }}>Entrar</button>
              </div>
            )}
            <button onClick={() => setIsRegistering(true)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#007AFF' }}>+ Criar Perfil</button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input placeholder="Nome" value={regName} onChange={e => setRegName(e.target.value)} style={{ padding: '15px', borderRadius: '15px', border: 'none' }} />
            <input placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} style={{ padding: '15px', borderRadius: '15px', border: 'none' }} />
            <input type="password" placeholder="Password" value={regPass} onChange={e => setRegPass(e.target.value)} style={{ padding: '15px', borderRadius: '15px', border: 'none' }} />
            <button onClick={handleRegister} style={{ padding: '15px', borderRadius: '15px', background: '#34C759', color: 'white', fontWeight: 'bold' }}>Registar</button>
            <button onClick={() => setIsRegistering(false)} style={{ background: 'none', border: 'none', color: '#8E8E93' }}>Cancelar</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', pb: '100px', maxWidth: '480px', margin: '0 auto', backgroundColor: '#F8F9FB', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', margin: 0, fontWeight: '900' }}>{user.toUpperCase()}</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#34C759' }}>{activeTab === 'home' ? 'Atividade' : activeTab === 'reports' ? 'Relatórios' : 'Definições'}</p>
        </div>
        <div style={{ fontSize: '30px', background: 'white', padding: '10px', borderRadius: '15px' }}>{settings.avatar}</div>
      </div>

      {/* CONTEÚDO POR PÁGINA */}
      {activeTab === 'home' && (
        <>
          <div style={{ background: 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)', color: 'white', padding: '30px', borderRadius: '30px', marginBottom: '20px' }}>
            <p style={{ margin: 0, opacity: 0.6, fontSize: '12px', fontWeight: 'bold' }}>SALDO TOTAL</p>
            <h1 style={{ fontSize: '42px', margin: '10px 0', fontWeight: '900' }}>{formatValue(totalBalance)}</h1>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '30px', marginBottom: '20px' }}>
            <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', backgroundColor: '#F2F2F7', borderRadius: '12px', padding: '4px' }}>
                {['expense', 'income', 'investimento', 'transfer'].map(t => (
                  <button key={t} type="button" onClick={() => setTransType(t)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '10px', backgroundColor: transType === t ? 'white' : 'transparent', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                    {t === 'expense' ? 'Gasto' : t === 'income' ? 'Ganho' : t === 'investimento' ? 'Inv.' : 'Troca'}
                  </button>
                ))}
              </div>
              <input name="desc" placeholder={content.placeholder} required style={{ padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB' }} />
              <input name="val" type="number" step="0.01" placeholder="0.00" required style={{ padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', fontSize: '20px', fontWeight: '900' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <select name="acc" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#F8F9FB' }}>
                  {Object.keys(settings.accounts || {}).map(k => <option key={k} value={k}>{settings.accounts[k].label}</option>)}
                </select>
                <select name={transType === 'transfer' ? "toAcc" : "cat"} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#F8F9FB' }}>
                  {transType === 'transfer' ? Object.keys(settings.accounts || {}).map(k => <option key={k} value={k}>Para: {settings.accounts[k].label}</option>) : content.categories.map(k => <option key={k} value={k}>{CATEGORIES[k].icon} {CATEGORIES[k].label}</option>)}
                </select>
              </div>
              <button type="submit" style={{ padding: '15px', backgroundColor: content.color, color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900' }}>Adicionar</button>
            </form>
          </div>

          <h3 style={{ fontWeight: '900' }}>Recentes</h3>
          {list.slice(-5).reverse().map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '15px', borderRadius: '20px', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginRight: '15px' }}>{CATEGORIES[t.category]?.icon || '💰'}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{t.description}</p>
                <p style={{ margin: 0, color: '#AEAEB2', fontSize: '11px' }}>{t.date}</p>
              </div>
              <p style={{ fontWeight: '900', color: t.type === 'expense' ? '#FF3B30' : '#34C759' }}>{t.type === 'expense' ? '-' : '+'}{formatValue(t.amount)}</p>
            </div>
          ))}
        </>
      )}

      {activeTab === 'reports' && (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '30px' }}>
          <h3 style={{ fontWeight: '900', marginTop: 0 }}>Análise de Gastos</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <select value={reportMonth} onChange={e => setReportMonth(parseInt(e.target.value))} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #eee' }}>
              {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('pt', {month: 'long'})}</option>)}
            </select>
            <select value={reportYear} onChange={e => setReportYear(parseInt(e.target.value))} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #eee' }}>
              <option value="2025">2025</option><option value="2026">2026</option>
            </select>
          </div>

          {Object.keys(totalsByCategory).length > 0 ? Object.keys(totalsByCategory).map(cat => (
            <div key={cat} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                <span>{CATEGORIES[cat].icon} {CATEGORIES[cat].label}</span>
                <span>{totalsByCategory[cat].toFixed(2)}{settings.currency}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#F2F2F7', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((totalsByCategory[cat] / totalBalance) * 100, 100)}%`, height: '100%', backgroundColor: CATEGORIES[cat].color }}></div>
              </div>
            </div>
          )) : <p style={{ textAlign: 'center', color: '#8E8E93' }}>Sem despesas este mês.</p>}
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '30px' }}>
          <h3 style={{ fontWeight: '900', marginTop: 0 }}>Perfil e Contas</h3>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', mb: '20px' }}>
            {AVATARS.map(a => <button key={a} onClick={() => updateSettings({avatar: a})} style={{ fontSize: '20px', padding: '10px', borderRadius: '10px', border: settings.avatar === a ? '2px solid #007AFF' : 'none', background: '#F2F2F7' }}>{a}</button>)}
          </div>
          <button onClick={() => updateSettings({privacyMode: !settings.privacyMode})} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: settings.privacyMode ? '#FF9500' : '#E5E5EA', fontWeight: 'bold', margin: '20px 0' }}>
            {settings.privacyMode ? '🕶️ Modo Privado Ativo' : '👁️ Modo Público'}
          </button>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ width: '100%', padding: '15px', color: '#FF3B30', border: 'none', background: 'none', fontWeight: 'bold' }}>Sair da Conta</button>
        </div>
      )}

      {/* NAVBAR FIXA NO FUNDO */}
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '15px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', fontSize: '24px', opacity: activeTab === 'home' ? 1 : 0.3 }}>🏠</button>
        <button onClick={() => setActiveTab('reports')} style={{ background: 'none', border: 'none', fontSize: '24px', opacity: activeTab === 'reports' ? 1 : 0.3 }}>📊</button>
        <button onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', fontSize: '24px', opacity: activeTab === 'settings' ? 1 : 0.3 }}>⚙️</button>
      </div>

      <div style={{ height: '80px' }}></div> {/* Espaçador para a Navbar */}
    </div>
  );
}