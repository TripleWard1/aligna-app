import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, set, remove } from 'firebase/database';

const TWELVE_DATA_KEY = '49563e179ee146c5a53279200c654f29';

const CATEGORIES = {
  alimentacao: { label: 'Alimentação', icon: '🍔', color: '#FF9500' },
  lazer: { label: 'Lazer', icon: '🎬', color: '#AF52DE' },
  transporte: { label: 'Transporte', icon: '🚗', color: '#5856D6' },
  saude: { label: 'Saúde', icon: '💊', color: '#FF3B30' },
  casa: { label: 'Casa', icon: '🏠', color: '#FFCC00' },
  salario: { label: 'Salário', icon: '💰', color: '#34C759' },
  investimento: { label: 'Investimento', icon: '📈', color: '#5AC8FA' },
  transferencia: { label: 'Transferência', icon: '🔄', color: '#007AFF' },
  outros: { label: 'Outros', icon: '📦', color: '#8E8E93' },
};

const ASSET_TYPES = ['ETF', 'Ações', 'Crypto', 'Bonds', 'PPR', 'Outro'];
const AVATARS = ['👤', '👨‍💻', '👩‍💼', '🧥', '🎨', '🚀', '🐱', '🦁', '⭐'];
const ACC_ICONS = ['👛', '🏦', '🐖', '💳', '💎', '📊', '💰'];

export default function App() {

  };
  const [user, setUser] = useState(localStorage.getItem('f_user') || null);
  const [list, setList] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [transType, setTransType] = useState('expense');
  const [newAccName, setNewAccName] = useState('');
  const [newAccIcon, setNewAccIcon] = useState('🏦');

  const [selectingUser, setSelectingUser] = useState(null);
  const [loginPass, setLoginPass] = useState('');

  const [settings, setSettings] = useState({
    lowBalanceLimit: 50,
    currency: '€',
    privacyMode: false,
    avatar: AVATARS[0],
    email: '',
    password: '',
    accounts: { carteira: { label: 'Carteira', icon: '👛' } },
  });

  useEffect(() => {
    onValue(ref(db, `users`), (snap) => setAllUsers(snap.val() || {}));
    if (user) {
      onValue(ref(db, `users/${user}/settings`), (snap) => {
        if (snap.val()) setSettings((prev) => ({ ...prev, ...snap.val() }));
      });
      onValue(ref(db, `users/${user}/transactions`), (snap) => {
        const data = snap.val();
        setList(
          data ? Object.keys(data).map((id) => ({ ...data[id], id })) : []
        );
      });
    }
  }, [user]);

  const updateSettings = (newSet) => {
    const updated = { ...settings, ...newSet };
    setSettings(updated);
    if (user) set(ref(db, `users/${user}/settings`), updated);
  };

  const handleEntry = () => {
    const savedPass = allUsers[selectingUser]?.settings?.password || '';
    if (savedPass && loginPass !== savedPass) {
      alert('⚠️ Password Incorreta!');
      return;
    }
    localStorage.setItem('f_user', selectingUser);
    setUser(selectingUser);
    setSelectingUser(null);
    setLoginPass('');
  };

  const getAccountBalance = (accKey) => {
    return list.reduce((total, t) => {
      const tAcc = t.account || 'carteira';
      if ((t.type === 'income' || t.type === 'investimento') && tAcc === accKey)
        return total + t.amount;
      if (t.type === 'expense' && tAcc === accKey) return total - t.amount;
      if (t.type === 'transfer') {
        if (tAcc === accKey) return total - t.amount;
        if (t.toAccount === accKey) return total + t.amount;
      }
      return total;
    }, 0);
  };

  const totalBalance = Object.keys(settings.accounts || {}).reduce(
    (sum, key) => sum + getAccountBalance(key),
    0
  );
  const formatValue = (val) =>
    settings.privacyMode ? '••••' : val.toFixed(2) + settings.currency;

  const getDynamicContent = () => {
    switch (transType) {
      case 'investimento':
        return {
          placeholder: 'Ticker (ex: QQQ, AAPL, BTC/USD)',
          categories: ['investimento'],
          color: '#5AC8FA',
        };
      case 'income':
        return {
          placeholder: 'Origem (ex: Salário, Freelance)',
          categories: ['salario', 'outros'],
          color: '#34C759',
        };
      case 'transfer':
        return {
          placeholder: 'Motivo da troca (ex: Reforço Poupança)',
          categories: ['transferencia'],
          color: '#5856D6',
        };
      default:
        return {
          placeholder: 'Onde gastou? (ex: Jantar, Pingo Doce)',
          categories: [
            'alimentacao',
            'lazer',
            'transporte',
            'saude',
            'casa',
            'outros',
          ],
          color: '#007AFF',
        };
    }
  };

  const content = getDynamicContent();

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    const { desc, val, cat, acc, toAcc, assetType, perf } = e.target.elements;
    let autoPerformance = perf ? perf.value : '0';

    // Lógica para detetar preço via Twelve Data se for investimento
    if (transType === 'investimento' && desc.value) {
      try {
        const response = await fetch(
          `https://api.twelvedata.com/quote?symbol=${desc.value}&apikey=${TWELVE_DATA_KEY}`
        );
        const data = await response.json();
        if (data.percent_change) {
          autoPerformance = parseFloat(data.percent_change).toFixed(2);
        }
      } catch (err) {
        console.error('Erro TwelveData:', err);
      }
    }

    push(ref(db, `users/${user}/transactions`), {
      description: desc.value.toUpperCase(),
      amount: Math.abs(parseFloat(val.value)),
      type: transType,
      category:
        transType === 'transfer'
          ? 'transferencia'
          : cat
          ? cat.value
          : 'investimento',
      assetDetails:
        transType === 'investimento'
          ? { type: assetType.value, performance: autoPerformance }
          : null,
      account: acc.value,
      toAccount: transType === 'transfer' ? toAcc.value : null,
      date: new Date().toLocaleDateString('pt-PT'),
      timestamp: Date.now(),
    });
    e.target.reset();
  };

  if (!user)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#F2F4F7',
          padding: '20px',
          fontFamily: '-apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              fontWeight: '900',
              fontSize: '46px',
              color: '#1C1C1E',
              margin: 0,
              letterSpacing: '-2px',
            }}
          >
            Aligna
          </h1>
          <p style={{ color: '#8E8E93', fontSize: '15px', fontWeight: '500' }}>
            Quem está a entrar?
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '20px',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          {Object.keys(allUsers).map((u) => (
            <div
              key={u}
              onClick={() => {
                setSelectingUser(u);
                setLoginPass('');
              }}
              style={{
                backgroundColor: 'white',
                padding: '30px 20px',
                borderRadius: '35px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow:
                  selectingUser === u
                    ? '0 0 0 3px #007AFF'
                    : '0 10px 25px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.02)',
                transition: '0.3s transform',
              }}
            >
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>
                {allUsers[u].settings?.avatar || '👤'}
              </div>
              <div
                style={{
                  fontWeight: '800',
                  fontSize: '16px',
                  color: '#1C1C1E',
                }}
              >
                {u.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {selectingUser && (
          <div
            style={{
              marginTop: '30px',
              width: '100%',
              maxWidth: '380px',
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '30px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
            }}
          >
            <p
              style={{
                margin: '0 0 15px',
                fontWeight: '800',
                textAlign: 'center',
              }}
            >
              Olá, {selectingUser.toUpperCase()}!
            </p>
            <input 
  style={inputStyle}
  type="email" 
  placeholder="hugo@gmail.com" 
  /* ... resto do código que já lá está ... */
/>
              type="password"
              placeholder="Introduza a Password"
              autoFocus
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '15px',
                border: '1px solid #E5E5EA',
                backgroundColor: '#F8F9FB',
                fontSize: '16px',
                boxSizing: 'border-box',
                marginBottom: '15px',
              }}
            />
            <button
              onClick={handleEntry}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#1C1C1E',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontWeight: '800',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Entrar Agora
            </button>
          </div>
        )}

        <button
          onClick={() => {
            const n = prompt('Nome do novo perfil:');
            if (n) {
              setSelectingUser(n.toLowerCase());
            }
          }}
          style={{
            marginTop: '30px',
            background: 'none',
            border: 'none',
            color: '#007AFF',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          + Adicionar Novo Perfil
        </button>
      </div>
    );

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '480px',
        margin: '0 auto',
        backgroundColor: '#F8F9FB',
        minHeight: '100vh',
        fontFamily: '-apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '20px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
            }}
          >
            {settings.avatar}
          </div>
          <div>
            <h2
              style={{
                fontSize: '22px',
                margin: 0,
                fontWeight: '900',
                color: '#1C1C1E',
              }}
            >
              {user.toUpperCase()}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#34C759',
                fontWeight: '700',
              }}
            >
              ● Online
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: 'white',
            border: 'none',
            width: '52px',
            height: '52px',
            borderRadius: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          }}
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '35px',
            marginBottom: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          }}
        >
          <h3
            style={{
              marginTop: 0,
              fontWeight: '900',
              fontSize: '20px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Definições e Relatórios
          </h3>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '20px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {AVATARS.map((a) => (
              <div
                key={a}
                onClick={() => updateSettings({ avatar: a })}
                style={{
                  minWidth: '45px',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '24px',
                  backgroundColor:
                    settings.avatar === a ? '#007AFF' : '#F2F2F7',
                  borderRadius: '14px',
                  color: settings.avatar === a ? 'white' : 'inherit',
                }}
              >
                {a}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#8E8E93',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              E-MAIL E PASSWORD
            </label>
            <input
              value={settings.email}
              onChange={(e) => updateSettings({ email: e.target.value })}
              placeholder="Teu E-mail"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: '#F2F2F7',
                fontSize: '15px',
                marginBottom: '10px',
              }}
            />
            <input
              value={settings.password}
              type="password"
              onChange={(e) => updateSettings({ password: e.target.value })}
              placeholder="Nova Password"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: '#F2F2F7',
                fontSize: '15px',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '25px',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#8E8E93',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                LIMITE SALDO BAIXO
              </label>
              <input
                type="number"
                value={settings.lowBalanceLimit}
                onChange={(e) =>
                  updateSettings({
                    lowBalanceLimit: parseFloat(e.target.value),
                  })
                }
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: '#F2F2F7',
                  fontSize: '15px',
                  fontWeight: 'bold',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <button
                onClick={() =>
                  updateSettings({ privacyMode: !settings.privacyMode })
                }
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: settings.privacyMode ? '#FF9500' : '#E5E5EA',
                  color: settings.privacyMode ? 'white' : '#1C1C1E',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  height: '51px',
                }}
              >
                {settings.privacyMode ? '🕶️ Privado' : '👁️ Público'}
              </button>
            </div>
          </div>

          <h4
            style={{
              marginBottom: '15px',
              fontWeight: '800',
              fontSize: '16px',
            }}
          >
            Minhas Contas
          </h4>
          {Object.keys(settings.accounts || {}).map((k) => (
            <div
              key={k}
              style={{
                display: 'flex',
                justifyBetween: 'space-between',
                alignItems: 'center',
                backgroundColor: '#F8F9FB',
                padding: '15px 20px',
                borderRadius: '18px',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontWeight: '600' }}>
                {settings.accounts[k].icon} {settings.accounts[k].label}
              </span>
              <button
                onClick={() => {
                  if (Object.keys(settings.accounts).length > 1) {
                    const na = { ...settings.accounts };
                    delete na[k];
                    updateSettings({ accounts: na });
                  }
                }}
                style={{
                  border: 'none',
                  color: '#FF3B30',
                  background: 'none',
                  fontWeight: '800',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                Apagar
              </button>
            </div>
          ))}

          {!showAddAccount ? (
            <button
              onClick={() => setShowAddAccount(true)}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px dashed #D1D1D6',
                borderRadius: '18px',
                background: 'none',
                color: '#8E8E93',
                fontWeight: '800',
                marginTop: '10px',
                cursor: 'pointer',
              }}
            >
              + Adicionar Conta
            </button>
          ) : (
            <div
              style={{
                marginTop: '15px',
                padding: '20px',
                backgroundColor: '#F2F2F7',
                borderRadius: '25px',
                textAlign: 'center',
              }}
            >
              <input
                placeholder="Ex: XTB ETF, Binance..."
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '15px',
                  marginBottom: '15px',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '20px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                {ACC_ICONS.map((i) => (
                  <button
                    key={i}
                    onClick={() => setNewAccIcon(i)}
                    style={{
                      border: 'none',
                      width: '45px',
                      height: '45px',
                      background: newAccIcon === i ? '#007AFF' : 'white',
                      borderRadius: '12px',
                      fontSize: '22px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    }}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (newAccName) {
                    updateSettings({
                      accounts: {
                        ...settings.accounts,
                        [newAccName.toLowerCase()]: {
                          label: newAccName,
                          icon: newAccIcon,
                        },
                      },
                    });
                    setNewAccName('');
                    setShowAddAccount(false);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: '800',
                  cursor: 'pointer',
                }}
              >
                Confirmar Conta
              </button>
            </div>
          )}

          <button
            onClick={() => {
              localStorage.removeItem('f_user');
              window.location.reload();
            }}
            style={{
              width: '100%',
              padding: '15px',
              color: '#FF3B30',
              border: 'none',
              background: 'none',
              fontWeight: '800',
              marginTop: '15px',
              cursor: 'pointer',
            }}
          >
            Sair da Conta
          </button>
        </div>
      )}

      <div
        style={{
          background: 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)',
          color: 'white',
          padding: '40px 30px',
          borderRadius: '35px',
          marginBottom: '30px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
        }}
      >
        <p
          style={{
            margin: 0,
            opacity: 0.6,
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '1px',
          }}
        >
          SALDO CONSOLIDADO
        </p>
        <h1
          style={{
            fontSize: '52px',
            margin: '12px 0',
            fontWeight: '900',
            letterSpacing: '-2px',
          }}
        >
          {formatValue(totalBalance)}
        </h1>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '15px',
          overflowX: 'auto',
          paddingBottom: '30px',
        }}
      >
        {Object.keys(settings.accounts || {}).map((k) => (
          <div
            key={k}
            style={{
              minWidth: '130px',
              backgroundColor: 'white',
              padding: '22px 15px',
              borderRadius: '28px',
              textAlign: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>
              {settings.accounts[k].icon}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#8E8E93',
                fontWeight: '600',
                marginBottom: '4px',
              }}
            >
              {settings.accounts[k].label}
            </div>
            <strong style={{ fontSize: '17px', color: '#1C1C1E' }}>
              {formatValue(getAccountBalance(k))}
            </strong>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '35px',
          marginBottom: '35px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
        }}
      >
        <form
          onSubmit={handleTransactionSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F2F2F7',
              borderRadius: '18px',
              padding: '6px',
            }}
          >
            <button
              key="expense"
              type="button"
              onClick={() => setTransType('expense')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '14px',
                backgroundColor:
                  transType === 'expense' ? 'white' : 'transparent',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Despesa
            </button>
            <button
              key="income"
              type="button"
              onClick={() => setTransType('income')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '14px',
                backgroundColor:
                  transType === 'income' ? 'white' : 'transparent',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Receita
            </button>
            <button
              key="invest"
              type="button"
              onClick={() => setTransType('investimento')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '14px',
                backgroundColor:
                  transType === 'investimento' ? 'white' : 'transparent',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Investir
            </button>
            <button
              key="transfer"
              type="button"
              onClick={() => setTransType('transfer')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '14px',
                backgroundColor:
                  transType === 'transfer' ? 'white' : 'transparent',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Troca
            </button>
          </div>

          <input
            name="desc"
            placeholder={content.placeholder}
            required
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '18px',
              borderRadius: '18px',
              border: 'none',
              backgroundColor: '#F8F9FB',
              fontSize: '15px',
            }}
          />

          {transType === 'investimento' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                name="assetType"
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '18px',
                  border: 'none',
                  backgroundColor: '#F8F9FB',
                  fontWeight: '700',
                }}
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                name="perf"
                placeholder="Auto %"
                style={{
                  width: '80px',
                  padding: '16px',
                  borderRadius: '18px',
                  border: 'none',
                  backgroundColor: '#F8F9FB',
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontWeight: '900',
                fontSize: '22px',
                color:
                  transType === 'expense' || transType === 'transfer'
                    ? '#FF3B30'
                    : '#34C759',
              }}
            >
              {transType === 'expense' || transType === 'transfer' ? '-' : '+'}
            </span>
            <input
              name="val"
              type="number"
              step="0.01"
              placeholder="0.00€"
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '18px 18px 18px 40px',
                borderRadius: '18px',
                border: 'none',
                backgroundColor: '#F8F9FB',
                fontSize: '22px',
                fontWeight: '900',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              name="acc"
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '18px',
                border: 'none',
                backgroundColor: '#F8F9FB',
                fontWeight: '700',
              }}
            >
              {Object.keys(settings.accounts || {}).map((k) => (
                <option key={k} value={k}>
                  {settings.accounts[k].label}
                </option>
              ))}
            </select>

            <select
              name={transType === 'transfer' ? 'toAcc' : 'cat'}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '18px',
                border: 'none',
                backgroundColor: '#F8F9FB',
                fontWeight: '700',
              }}
            >
              {transType === 'transfer'
                ? Object.keys(settings.accounts || {}).map((k) => (
                    <option key={k} value={k}>
                      Para: {settings.accounts[k].label}
                    </option>
                  ))
                : content.categories.map((k) => (
                    <option key={k} value={k}>
                      {CATEGORIES[k].icon} {CATEGORIES[k].label}
                    </option>
                  ))}
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: '20px',
              backgroundColor: content.color,
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontWeight: '900',
              fontSize: '17px',
              cursor: 'pointer',
            }}
          >
            {transType === 'investimento'
              ? 'Registar Investimento'
              : transType === 'transfer'
              ? 'Confirmar Troca'
              : 'Adicionar Registo'}
          </button>
        </form>
      </div>

      <h3 style={{ fontWeight: '900', marginBottom: '20px', fontSize: '20px' }}>
        Atividade Recente
      </h3>
      {[...list]
        .reverse()
        .slice(0, 10)
        .map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              padding: '18px 20px',
              borderRadius: '28px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '16px',
                backgroundColor: '#F8F9FB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginRight: '15px',
              }}
            >
              {t.type === 'investimento'
                ? '📈'
                : CATEGORIES[t.category]?.icon || '💰'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>
                {t.description}{' '}
                {t.assetDetails && (
                  <small style={{ color: '#007AFF' }}>
                    ({t.assetDetails.type})
                  </small>
                )}
              </p>
              <p style={{ margin: 0, color: '#AEAEB2', fontSize: '12px' }}>
                {t.date} • {settings.accounts[t.account]?.label}{' '}
                {t.assetDetails?.performance &&
                  `• ${t.assetDetails.performance}%`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: '800',
                  color:
                    t.type === 'income' || t.type === 'investimento'
                      ? '#34C759'
                      : t.type === 'expense'
                      ? '#FF3B30'
                      : '#1C1C1E',
                }}
              >
                {t.type === 'income' || t.type === 'investimento'
                  ? '+'
                  : t.type === 'expense'
                  ? '-'
                  : ''}
                {formatValue(t.amount)}
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Eliminar?'))
                    remove(ref(db, `users/${user}/transactions/${t.id}`));
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

      <footer
        style={{
          marginTop: '50px',
          textAlign: 'center',
          paddingBottom: '30px',
        }}
      >
        <p style={{ fontSize: '12px', color: '#AEAEB2', fontWeight: '600' }}>
          © 2026 ALIGNA — HUGO BARROS
        </p>
      </footer>
    </div>
  );
}
