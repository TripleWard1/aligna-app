import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { ref, push, onValue, set, remove, update, get } from "firebase/database";

const TWELVE_DATA_KEY = "49563e179ee146c5a53279200c654f29";

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
      });
    }
  }, [user]);

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

  // --- COLA ESTE BLOCO ABAIXO EXATAMENTE AQUI ---

  const getCategoryHistory = (catKey) => {
    const history = {};
    list.filter(t => t.category === catKey).forEach(t => {
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

  // Se reportMonth for 0, significa "Ano Completo"
  const filteredList = list.filter(t => {
    // 1. O ano tem de ser IGUAL ao selecionado no dropdown
    const yearMatch = Number(t.year) === Number(reportYear);
    
    // 2. Se for 0 (Ano Completo), mostra tudo desse ano. Se não, filtra o mês.
    const monthMatch = reportMonth === 0 ? true : Number(t.month) === Number(reportMonth);
    
    return yearMatch && monthMatch;
  });

  const monthlyIncome = filteredList
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const monthlyExpenses = filteredList
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const totalsByCat = filteredList.reduce((acc, t) => {
    if (t.type === 'expense' || t.type === 'income') {
      const catName = t.category || 'outros';
      acc[catName] = (acc[catName] || 0) + (Number(t.amount) || 0);
    }
    return acc;
  }, {});

  const maxCategoryValue = Math.max(...Object.values(totalsByCat).map(Number), 0);

  // --- FIM DO BLOCO ---

  if (!user) {
    // ... resto do código do login
    const knownProfiles = JSON.parse(localStorage.getItem('known_profiles') || '[]');

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
                <button onClick={() => handleEntry(selectingUser)} style={{ width: '100%', padding: '15px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '800' }}>Entrar</button>
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
      
      {/* Header Mobile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '15px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>{settings.avatar}</div>
        <div>
          <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '900' }}>{user.toUpperCase()}</h2>
          <p style={{margin: 0, fontSize: '11px', color: (totalBalance < settings.lowBalanceLimit ? '#FF3B30' : '#34C759'), fontWeight: '700'}}>
            ● {totalBalance < settings.lowBalanceLimit ? 'Saldo Baixo!' : 'Online'}
          </p>
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
                <select value={transType === 'transfer' ? formData.toAcc : formData.cat} onChange={e => setFormData({...formData, [transType === 'transfer' ? 'toAcc' : 'cat']: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#F8F9FB', fontSize: '14px' }}>
                  {transType === 'transfer' ? Object.keys(settings.accounts || {}).map(k => <option key={k} value={k}>Para: {settings.accounts[k].label}</option>) : content.categories.map(k => <option key={k} value={k}>{CATEGORIES[k].icon} {CATEGORIES[k].label}</option>)}
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
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '12px 15px', borderRadius: '22px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginRight: '12px' }}>{t.type === 'investimento' ? '📈' : (CATEGORIES[t.category]?.icon || '💰')}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</p>
                  <p style={{ margin: 0, color: '#AEAEB2', fontSize: '10px' }}>{t.date} • {settings.accounts[t.account]?.label}</p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '10px' }}>
                  <p style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: isGain ? '#34C759' : isLoss ? '#FF3B30' : '#1C1C1E' }}>
                    {isGain ? '+' : isLoss ? '-' : ''}{formatValue(t.amount)}
                  </p>
                  <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px'}}>
                     <button onClick={() => handleEdit(t)} style={{ border: 'none', background: 'none', fontSize: '12px', padding: 0 }}>✏️</button>
                     <button onClick={() => { if(window.confirm('Eliminar?')) remove(ref(db, `users/${user}/transactions/${t.id}`)); }} style={{ border: 'none', background: 'none', fontSize: '12px', padding: 0 }}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

{activeTab === 'reports' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '30px', boxSizing: 'border-box' }}>
          <h3 style={{ fontWeight: '900', marginBottom: '20px', fontSize: '18px' }}>Análise Mensal</h3>
          
          {/* Seletores de Mês e Ano */}
<div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
  {/* Seletor de Mês */}
  <select 
    value={reportMonth} 
    onChange={e => setReportMonth(parseInt(e.target.value))} 
    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E5EA', fontWeight: 'bold', fontSize: '12px' }}
  >
    <option value={0}>ANO COMPLETO</option>
    {Array.from({length: 12}, (_, i) => (
      <option key={i+1} value={i+1}>
        {new Date(0, i).toLocaleString('pt', {month: 'long'}).toUpperCase()}
      </option>
    ))}
  </select>

  {/* SELETOR DE ANO (O Menu Dropdown que pediste) */}
  <select 
    value={reportYear} 
    onChange={e => setReportYear(parseInt(e.target.value))} 
    style={{ width: '100px', padding: '12px', borderRadius: '12px', border: '1px solid #E5E5EA', fontWeight: 'bold', fontSize: '12px' }}
  >
    {/* Esta linha impede duplicados e mostra os anos que têm dados + o ano atual */}
    {[...new Set([...list.map(t => Number(t.year)), new Date().getFullYear()])]
      .sort((a, b) => b - a)
      .map(y => <option key={y} value={y}>{y}</option>)
    }
  </select>
</div>

          {/* Novos Cartões de Resumo */}
          {!selectedDetail && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
              <div style={{ flex: 1, backgroundColor: '#F2F2F7', padding: '15px', borderRadius: '20px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#8E8E93' }}>RECEITAS</p>
                <strong style={{ color: '#34C759', fontSize: '16px' }}>+{monthlyIncome.toFixed(2)}{settings.currency}</strong>
              </div>
              <div style={{ flex: 1, backgroundColor: '#F2F2F7', padding: '15px', borderRadius: '20px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#8E8E93' }}>DESPESAS</p>
                <strong style={{ color: '#FF3B30', fontSize: '16px' }}>-{monthlyExpenses.toFixed(2)}{settings.currency}</strong>
              </div>
            </div>
          )}

{selectedDetail ? (
            <div>
              {/* Cabeçalho com botão voltar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <button onClick={() => setSelectedDetail(null)} style={{ background: '#F2F2F7', border: 'none', width: '35px', height: '35px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>{CATEGORIES[selectedDetail]?.label}</h4>
                  <p style={{ margin: 0, fontSize: '11px', color: '#8E8E93', fontWeight: 'bold' }}>EVOLUÇÃO DOS GASTOS</p>
                </div>
              </div>

              {/* GRÁFICO DE BARRAS EVOLUTIVO */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', padding: '15px', backgroundColor: '#F8F9FB', borderRadius: '24px', marginBottom: '25px', gap: '10px' }}>
                {getCategoryHistory(selectedDetail).length > 0 ? getCategoryHistory(selectedDetail).map((data, idx) => {
                  const maxVal = Math.max(...getCategoryHistory(selectedDetail).map(d => d.val));
                  const heightPct = (data.val / (maxVal || 1)) * 100;
                  
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <div style={{ 
                          width: '100%', 
                          maxWidth: '35px',
                          height: `${heightPct}%`, 
                          backgroundColor: CATEGORIES[selectedDetail]?.color || '#007AFF', 
                          borderRadius: '8px 8px 4px 4px',
                          transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          minHeight: '2px'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: '900', color: '#AEAEB2', marginTop: '10px' }}>{data.date}</span>
                      <span style={{ fontSize: '9px', fontWeight: '900', color: '#1C1C1E' }}>{data.val.toFixed(0)}{settings.currency}</span>
                    </div>
                  );
                }) : <p style={{ width: '100%', textAlign: 'center', color: '#AEAEB2', fontSize: '12px' }}>Sem dados históricos</p>}
              </div>

              {/* LISTA DE ÚLTIMOS REGISTOS */}
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#8E8E93', marginBottom: '12px', marginLeft: '5px' }}>ÚLTIMOS MOVIMENTOS</p>
              {list.filter(t => t.category === selectedDetail).slice(-5).reverse().map(t => (
                <div key={t.id} style={{ padding: '15px', backgroundColor: '#F8F9FB', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span style={{ fontSize: '13px', fontWeight: '700' }}>{t.description}</span>
                     <span style={{ fontSize: '10px', color: '#AEAEB2' }}>{t.date}</span>
                   </div>
                   <strong style={{ fontSize: '14px', color: t.type === 'income' ? '#34C759' : '#1C1C1E' }}>
                     {t.type === 'income' ? '+' : ''}{t.amount.toFixed(2)}{settings.currency}
                   </strong>
                </div>
              ))}
            </div>
          ) : (
            /* Lista de categorias agora ordenada por valor (do maior para o menor) */
            Object.keys(totalsByCat)
              .sort((a, b) => totalsByCat[b] - totalsByCat[a])
              .map(cat => (
                <div key={cat} onClick={() => setSelectedDetail(cat)} style={{ marginBottom: '18px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '800' }}>
                    <span>{CATEGORIES[cat]?.icon} {CATEGORIES[cat]?.label}</span>
                    <span>{totalsByCat[cat].toFixed(2)}{settings.currency}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#F2F2F7', borderRadius: '10px', overflow: 'hidden' }}>
  <div style={{ 
    // Calcula a largura com base no total de receitas do mês para dar noção real de impacto
    width: `${Math.min((totalsByCat[cat] / (maxCategoryValue || 1)) * 100, 100)}%`, 
    height: '100%', 
    backgroundColor: CATEGORIES[cat]?.color, 
    borderRadius: '10px',
    transition: 'width 0.8s ease'
  }}></div>
</div>
                </div>
              ))
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

      {/* Menu Inferior */}
      <div style={{ position: 'fixed', bottom: '15px', left: '50%', transform: 'translateX(-50%)', width: '92%', maxWidth: '400px', backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderRadius: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.4)', zIndex: 1000 }}>
        <button onClick={() => {setActiveTab('home'); setSelectedDetail(null);}} style={{ background: 'none', border: 'none', fontSize: '24px', opacity: activeTab === 'home' ? 1 : 0.2, transition: 'opacity 0.2s' }}>🏠</button>
        <button onClick={() => {setActiveTab('reports'); setSelectedDetail(null);}} style={{ background: 'none', border: 'none', fontSize: '24px', opacity: activeTab === 'reports' ? 1 : 0.2, transition: 'opacity 0.2s' }}>📊</button>
        <button onClick={() => {setActiveTab('settings'); setSelectedDetail(null);}} style={{ background: 'none', border: 'none', fontSize: '24px', opacity: activeTab === 'settings' ? 1 : 0.2, transition: 'opacity 0.2s' }}>⚙️</button>
      </div>

      <div style={{ height: '90px' }}></div>
      <footer style={{ textAlign: 'center', paddingBottom: '30px' }}>
        <p style={{ fontSize: '9px', color: '#AEAEB2', letterSpacing: '1px' }}>© 2026 ALIGNA — HUGO BARROS</p>
      </footer>
    </div>
  );
}