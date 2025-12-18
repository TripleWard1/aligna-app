import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { ref, push, onValue, set, remove, update, get } from "firebase/database";

const TWELVE_DATA_KEY = "49563e179ee146c5a53279200c654f29";

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
  const [activeTab, setActiveTab] = useState('home'); 
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [transType, setTransType] = useState('expense');
  const [newAccName, setNewAccName] = useState('');
  const [newAccIcon, setNewAccIcon] = useState('🏦');
  
  const [editingId, setEditingId] = useState(null);
  const [sortOrder, setSortOrder] = useState('entry'); 

  const [formData, setFormData] = useState({
    desc: '', val: '', cat: 'alimentacao', acc: 'carteira', toAcc: 'carteira', assetType: 'ETF', perf: '', date: new Date().toISOString().split('T')[0]
  });
  
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Estados de Login/Registo
  const [loginMode, setLoginMode] = useState('profiles'); // 'profiles', 'manual', 'register'
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
      });
    }
  }, [user]);

  const updateSettings = (newSet) => {
    const updated = { ...settings, ...newSet };
    setSettings(updated);
    if (user) set(ref(db, `users/${user}/settings`), updated);
  };

  // Função para entrar (quer seja perfil clicado ou nome escrito)
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

    // Guardar no localStorage para este dispositivo o reconhecer no futuro
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
  const formatValue = (val) => settings.privacyMode ? "••••" : val.toFixed(2) + settings.currency;

  const getDynamicContent = () => {
    switch(transType) {
      case 'investimento': return { placeholder: "Ticker (ex: QQQ, AAPL, BTC/USD)", categories: ['investimento'], color: '#5AC8FA' };
      case 'income': return { placeholder: "Origem (ex: Salário)", categories: ['salario', 'outros'], color: '#34C759' };
      case 'transfer': return { placeholder: "Motivo da troca", categories: ['transferencia'], color: '#5856D6' };
      default: return { placeholder: "Onde gastou?", categories: ['alimentacao', 'lazer', 'transporte', 'saude', 'casa', 'luz', 'gas', 'servicos', 'internet', 'outros'], color: '#007AFF' };
    }
  };

  const content = getDynamicContent();

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
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const getSortedList = () => {
    let sorted = [...list];
    if (sortOrder === 'entry') return sorted.reverse().slice(0, 15);
    return sorted.sort((a, b) => new Date(b.isoDate || 0) - new Date(a.isoDate || 0)).slice(0, 15);
  };

  const filteredList = list.filter(t => t.month === reportMonth && t.year === reportYear);
  const totalsByCat = filteredList.reduce((acc, t) => {
    if (t.type === 'expense' || t.type === 'income') {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {});

  if (!user) {
    const knownProfiles = JSON.parse(localStorage.getItem('known_profiles') || '[]');

    return (
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        minHeight: '100vh', background: 'linear-gradient(180deg, #F8F9FB 0%, #E9ECEF 100%)', 
        padding: '30px', fontFamily: '-apple-system, sans-serif' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontWeight: '900', fontSize: '52px', letterSpacing: '-3px', margin: '0', color: '#1C1C1E' }}>Aligna</h1>
          <p style={{ color: '#8E8E93', fontWeight: '600', marginTop: '5px' }}>Finanças sob controlo</p>
        </div>

        {loginMode === 'profiles' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', width: '100%', maxWidth: '400px' }}>
              {knownProfiles.map(u => allUsers[u] && (
                <div key={u} onClick={() => setSelectingUser(u)} style={{ 
                  backgroundColor: 'white', padding: '25px 15px', borderRadius: '30px', cursor: 'pointer', 
                  textAlign: 'center', transition: 'all 0.2s ease',
                  boxShadow: selectingUser === u ? '0 0 0 3px #007AFF' : '0 10px 20px rgba(0,0,0,0.04)',
                  transform: selectingUser === u ? 'scale(1.05)' : 'scale(1)'
                }}>
                  <div style={{ fontSize: '44px', marginBottom: '10px' }}>{allUsers[u].settings?.avatar || '👤'}</div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#1C1C1E', textTransform: 'uppercase' }}>{u}</div>
                </div>
              ))}
            </div>

            {selectingUser && (
              <div style={{ marginTop: '20px', width: '100%', maxWidth: '380px', backgroundColor: 'white', padding: '25px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
                <input type="password" placeholder="Password" autoFocus value={loginPass} onChange={e => setLoginPass(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '18px', border: '1px solid #F2F2F7', boxSizing: 'border-box', marginBottom: '15px', backgroundColor: '#F8F9FB' }} />
                <button onClick={() => handleEntry(selectingUser)} style={{ width: '100%', padding: '18px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '18px', fontWeight: '800' }}>Entrar</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
              <button onClick={() => setLoginMode('manual')} style={{ background: 'none', border: 'none', color: '#007AFF', fontWeight: '800', cursor: 'pointer' }}>Entrar em conta existente</button>
              <button onClick={() => setLoginMode('register')} style={{ background: 'none', border: 'none', color: '#34C759', fontWeight: '800', cursor: 'pointer' }}>Criar Novo Perfil</button>
            </div>
          </>
        )}

        {loginMode === 'manual' && (
          <div style={{ width: '100%', maxWidth: '380px', backgroundColor: 'white', padding: '30px', borderRadius: '35px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginTop: 0, fontWeight: '900' }}>Entrar</h3>
            <input placeholder="Nome de Utilizador" value={loginName} onChange={e => setLoginName(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#F8F9FB' }} />
            <input type="password" placeholder="Password" value={loginPass} onChange={e => setLoginPass(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', marginBottom: '20px', boxSizing: 'border-box', backgroundColor: '#F8F9FB' }} />
            <button onClick={() => handleEntry()} style={{ width: '100%', padding: '18px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '18px', fontWeight: '800' }}>Entrar</button>
            <button onClick={() => setLoginMode('profiles')} style={{ width: '100%', background: 'none', border: 'none', color: '#8E8E93', marginTop: '15px' }}>Voltar</button>
          </div>
        )}

        {loginMode === 'register' && (
          <div style={{ width: '100%', maxWidth: '380px', backgroundColor: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginTop: 0, fontWeight: '900' }}>Novo Perfil</h3>
            <input placeholder="Nome" value={regName} onChange={e => setRegName(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#F8F9FB' }} />
            <input placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#F8F9FB' }} />
            <input type="password" placeholder="Password" value={regPass} onChange={e => setRegPass(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', marginBottom: '25px', boxSizing: 'border-box', backgroundColor: '#F8F9FB' }} />
            <button onClick={handleRegister} style={{ width: '100%', padding: '18px', backgroundColor: '#34C759', color: 'white', border: 'none', borderRadius: '18px', fontWeight: '800' }}>Criar Perfil</button>
            <button onClick={() => setLoginMode('profiles')} style={{ width: '100%', background: 'none', border: 'none', color: '#8E8E93', marginTop: '15px' }}>Voltar</button>
          </div>
        )}
      </div>
    );
  }

  // O resto do código (Menu Principal, Transações, etc.) permanece o mesmo...
  return (
    <div style={{ padding: '20px', maxWidth: '480px', margin: '0 auto', backgroundColor: '#F8F9FB', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '20px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>{settings.avatar}</div>
        <div>
          <h2 style={{ fontSize: '22px', margin: 0, fontWeight: '900' }}>{user.toUpperCase()}</h2>
          <p style={{margin: 0, fontSize: '13px', color: (totalBalance < settings.lowBalanceLimit ? '#FF3B30' : '#34C759'), fontWeight: '700'}}>
            ● {totalBalance < settings.lowBalanceLimit ? 'Saldo Baixo!' : 'Online'}
          </p>
        </div>
      </div>

      {activeTab === 'home' && (
        <>
          <div style={{ background: 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)', color: 'white', padding: '40px 30px', borderRadius: '35px', marginBottom: '30px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)' }}>
            <p style={{ margin: 0, opacity: 0.6, fontSize: '13px', fontWeight: '700' }}>SALDO CONSOLIDADO</p>
            <h1 style={{ fontSize: '52px', margin: '12px 0', fontWeight: '900' }}>{formatValue(totalBalance)}</h1>
          </div>

          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '30px' }}>
            {Object.keys(settings.accounts || {}).map(k => (
              <div key={k} style={{ minWidth: '130px', backgroundColor: 'white', padding: '22px 15px', borderRadius: '28px', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
                <div style={{fontSize: '32px', marginBottom: '10px'}}>{settings.accounts[k].icon}</div>
                <div style={{fontSize: '12px', color: '#8E8E93', fontWeight: '600'}}>{settings.accounts[k].label}</div>
                <strong style={{fontSize: '17px'}}>{formatValue(getAccountBalance(k))}</strong>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '35px', marginBottom: '35px', border: editingId ? '2px solid #007AFF' : 'none' }}>
            <h4 style={{margin: '0 0 15px 0', fontWeight: '800'}}>{editingId ? '📝 Editar Registo' : '➕ Novo Registo'}</h4>
            <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', backgroundColor: '#F2F2F7', borderRadius: '18px', padding: '6px' }}>
                {['expense', 'income', 'investimento', 'transfer'].map(t => (
                  <button key={t} type="button" onClick={() => setTransType(t)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '14px', backgroundColor: transType === t ? 'white' : 'transparent', fontWeight: '800', fontSize: '13px' }}>
                    {t === 'expense' ? 'Despesa' : t === 'income' ? 'Receita' : t === 'investimento' ? 'Investir' : 'Troca'}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#F8F9FB', padding: '5px 15px', borderRadius: '18px' }}>
                <span style={{fontSize: '13px', fontWeight: 'bold', color: '#8E8E93'}}>DATA:</span>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ border: 'none', background: 'none', padding: '12px', flex: 1, fontWeight: 'bold' }} />
              </div>

              <input value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder={content.placeholder} required style={{ width: '100%', boxSizing: 'border-box', padding: '18px', borderRadius: '18px', border: 'none', backgroundColor: '#F8F9FB' }} />
              
              {transType === 'investimento' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select value={formData.assetType} onChange={e => setFormData({...formData, assetType: e.target.value})} style={{ flex: 1, padding: '16px', borderRadius: '18px', border: 'none', backgroundColor: '#F8F9FB' }}>{ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  <input value={formData.perf} onChange={e => setFormData({...formData, perf: e.target.value})} placeholder="Auto %" style={{ width: '80px', padding: '16px', borderRadius: '18px', border: 'none', backgroundColor: '#F8F9FB', textAlign: 'center' }} />
                </div>
              )}

              <input value={formData.val} onChange={e => setFormData({...formData, val: e.target.value})} type="number" step="0.01" placeholder="0.00" required style={{ width: '100%', boxSizing: 'border-box', padding: '18px', borderRadius: '18px', border: 'none', backgroundColor: '#F8F9FB', fontSize: '22px', fontWeight: '900' }} />
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <select value={formData.acc} onChange={e => setFormData({...formData, acc: e.target.value})} style={{ flex: 1, padding: '16px', borderRadius: '18px', border: 'none', backgroundColor: '#F8F9FB' }}>{Object.keys(settings.accounts || {}).map(k => <option key={k} value={k}>{settings.accounts[k].label}</option>)}</select>
                <select value={transType === 'transfer' ? formData.toAcc : formData.cat} onChange={e => setFormData({...formData, [transType === 'transfer' ? 'toAcc' : 'cat']: e.target.value})} style={{ flex: 1, padding: '16px', borderRadius: '18px', border: 'none', backgroundColor: '#F8F9FB' }}>
                  {transType === 'transfer' ? Object.keys(settings.accounts || {}).map(k => <option key={k} value={k}>Para: {settings.accounts[k].label}</option>) : content.categories.map(k => <option key={k} value={k}>{CATEGORIES[k].icon} {CATEGORIES[k].label}</option>)}
                </select>
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" style={{ flex: 2, padding: '20px', backgroundColor: editingId ? '#007AFF' : content.color, color: 'white', border: 'none', borderRadius: '20px', fontWeight: '900' }}>{editingId ? 'Guardar Alteração' : 'Adicionar'}</button>
                {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({...formData, desc: '', val: ''})}} style={{ flex: 1, backgroundColor: '#E5E5EA', borderRadius: '20px', border: 'none', fontWeight: 'bold'}}>Cancelar</button>}
              </div>
            </form>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 style={{fontWeight: '900', margin: 0}}>Atividade</h3>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', color: '#007AFF', fontSize: '12px'}}>
              <option value="entry">ORDEM: MAIS RECENTES</option>
              <option value="date">ORDEM: DATA DO GASTO</option>
            </select>
          </div>

          {getSortedList().map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '18px 20px', borderRadius: '28px', marginBottom: '12px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', backgroundColor: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginRight: '15px' }}>{t.type === 'investimento' ? '📈' : (CATEGORIES[t.category]?.icon || '💰')}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>{t.description} {t.assetDetails && <small style={{color: '#007AFF'}}>({t.assetDetails.type})</small>}</p>
                <p style={{ margin: 0, color: '#AEAEB2', fontSize: '12px' }}>{t.date} • {settings.accounts[t.account]?.label} {t.assetDetails?.performance && `• ${t.assetDetails.performance}%`}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: '800', color: (t.type === 'income' || t.type === 'investimento') ? '#34C759' : t.type === 'expense' ? '#FF3B30' : '#1C1C1E' }}>
                  {(t.type === 'income' || t.type === 'investimento') ? '+' : t.type === 'expense' ? '-' : ''}{formatValue(t.amount)}
                </p>
                <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '5px'}}>
                   <button onClick={() => handleEdit(t)} style={{ border: 'none', background: 'none', fontSize: '14px', cursor: 'pointer' }}>✏️</button>
                   <button onClick={() => { if(window.confirm('Eliminar?')) remove(ref(db, `users/${user}/transactions/${t.id}`)); }} style={{ border: 'none', background: 'none', fontSize: '14px', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === 'reports' && (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '35px' }}>
          <h3 style={{ fontWeight: '900', marginBottom: '25px' }}>Análise Mensal</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <select value={reportMonth} onChange={e => setReportMonth(parseInt(e.target.value))} style={{ flex: 1, padding: '12px', borderRadius: '15px', border: '1px solid #E5E5EA', fontWeight: 'bold' }}>
              {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('pt', {month: 'long'}).toUpperCase()}</option>)}
            </select>
            <select value={reportYear} onChange={e => setReportYear(parseInt(e.target.value))} style={{ width: '100px', padding: '12px', borderRadius: '15px', border: '1px solid #E5E5EA', fontWeight: 'bold' }}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {selectedDetail ? (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => setSelectedDetail(null)} style={{ background: 'none', border: 'none', fontSize: '20px' }}>⬅️</button>
                <h4 style={{ margin: 0 }}>Histórico: {CATEGORIES[selectedDetail]?.label}</h4>
              </div>
              {list.filter(t => t.category === selectedDetail).slice(-10).reverse().map(t => (
                <div key={t.id} style={{ padding: '15px', borderBottom: '1px solid #F2F2F7', display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '13px' }}>{t.date} - {t.description}</span>
                   <strong style={{ color: t.type === 'income' ? '#34C759' : '#FF3B30' }}>{t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}{settings.currency}</strong>
                </div>
              ))}
            </div>
          ) : (
            Object.keys(totalsByCat).map(cat => (
              <div key={cat} onClick={() => setSelectedDetail(cat)} style={{ marginBottom: '20px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '800' }}>
                  <span>{CATEGORIES[cat]?.icon} {CATEGORIES[cat]?.label}</span>
                  <span>{totalsByCat[cat].toFixed(2)}{settings.currency}</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#F2F2F7', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((totalsByCat[cat] / (totalBalance || 1)) * 100, 100)}%`, height: '100%', backgroundColor: CATEGORIES[cat]?.color }}></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '35px' }}>
          <h3 style={{ fontWeight: '900', marginTop: 0 }}>Definições</h3>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px' }}>
            {AVATARS.map(a => <div key={a} onClick={() => updateSettings({avatar: a})} style={{ minWidth: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '24px', backgroundColor: settings.avatar === a ? '#007AFF' : '#F2F2F7', borderRadius: '14px', color: settings.avatar === a ? 'white' : 'inherit' }}>{a}</div>)}
          </div>
          <input value={settings.email} onChange={e => updateSettings({email: e.target.value})} placeholder="Email" style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#F2F2F7', marginBottom: '10px', boxSizing: 'border-box' }} />
          <input value={settings.password} type="password" onChange={e => updateSettings({password: e.target.value})} placeholder="Senha" style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#F2F2F7', boxSizing: 'border-box', marginBottom: '20px' }} />
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <div style={{ flex: 1 }}>
              <label style={{fontSize: '11px', fontWeight: '700', color: '#8E8E93'}}>LIMITE SALDO</label>
              <input type="number" value={settings.lowBalanceLimit} onChange={e => updateSettings({lowBalanceLimit: parseFloat(e.target.value)})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#F2F2F7', boxSizing: 'border-box' }} />
            </div>
            <button onClick={() => updateSettings({privacyMode: !settings.privacyMode})} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: settings.privacyMode ? '#FF9500' : '#E5E5EA', color: settings.privacyMode ? 'white' : '#1C1C1E', fontWeight: '800', marginTop: '18px' }}>
              {settings.privacyMode ? '🕶️ Privado' : '👁️ Público'}
            </button>
          </div>

          <h4 style={{ fontWeight: '800' }}>Minhas Contas</h4>
          {Object.keys(settings.accounts || {}).map(k => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#F8F9FB', borderRadius: '15px', marginBottom: '8px' }}>
              <span>{settings.accounts[k].icon} {settings.accounts[k].label}</span>
              <button onClick={() => { if(Object.keys(settings.accounts).length > 1) { const na = {...settings.accounts}; delete na[k]; updateSettings({accounts: na}); } }} style={{ border: 'none', color: '#FF3B30', background: 'none', fontWeight: 'bold' }}>Apagar</button>
            </div>
          ))}
          {!showAddAccount ? (
            <button onClick={() => setShowAddAccount(true)} style={{ width: '100%', padding: '16px', border: '2px dashed #D1D1D6', borderRadius: '18px', background: 'none', color: '#8E8E93', fontWeight: '800' }}>+ Adicionar Conta</button>
          ) : (
            <div style={{ marginTop: '15px', padding: '20px', backgroundColor: '#F2F2F7', borderRadius: '25px' }}>
              <input placeholder="Nome" value={newAccName} onChange={e => setNewAccName(e.target.value)} style={{ width: '100%', padding: '15px', border: 'none', borderRadius: '15px', marginBottom: '15px', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '15px' }}>
                {ACC_ICONS.map(i => (
                  <button key={i} onClick={() => setNewAccIcon(i)} style={{ width: '45px', height: '45px', border: 'none', borderRadius: '10px', background: newAccIcon === i ? '#007AFF' : 'white', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    {i}
                  </button>
                ))}
              </div>
              <button onClick={() => { if(newAccName) { updateSettings({ accounts: { ...settings.accounts, [newAccName.toLowerCase()]: { label: newAccName, icon: newAccIcon } } }); setNewAccName(''); setShowAddAccount(false); } }} style={{ width: '100%', padding: '16px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}>Salvar</button>
            </div>
          )}
          <button onClick={() => { localStorage.removeItem('f_user'); window.location.reload(); }} style={{ width: '100%', padding: '15px', color: '#FF3B30', border: 'none', background: 'none', fontWeight: '800', marginTop: '20px' }}>Sair</button>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '15px 0', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.3)', zIndex: 1000 }}>
        <button onClick={() => {setActiveTab('home'); setSelectedDetail(null);}} style={{ background: 'none', border: 'none', fontSize: '26px', opacity: activeTab === 'home' ? 1 : 0.2 }}>🏠</button>
        <button onClick={() => {setActiveTab('reports'); setSelectedDetail(null);}} style={{ background: 'none', border: 'none', fontSize: '26px', opacity: activeTab === 'reports' ? 1 : 0.2 }}>📊</button>
        <button onClick={() => {setActiveTab('settings'); setSelectedDetail(null);}} style={{ background: 'none', border: 'none', fontSize: '26px', opacity: activeTab === 'settings' ? 1 : 0.2 }}>⚙️</button>
      </div>

      <div style={{ height: '100px' }}></div>
      <footer style={{ textAlign: 'center', paddingBottom: '40px' }}>
        <p style={{ fontSize: '10px', color: '#AEAEB2' }}>© 2026 ALIGNA — HUGO BARROS</p>
      </footer>
    </div>
  );
}