import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { ref, push, onValue, set, remove, update, get } from "firebase/database";
// Adiciona isto logo no início do teu ficheiro, fora da função principal
import { jsPDF } from "jspdf";
import "jspdf-autotable";


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
  // --- SISTEMA DE FEEDBACK (SOM E VIBRAÇÃO) ---
  const [audio] = useState(new Audio('https://www.myinstants.com/media/sounds/coin.mp3'));

  const triggerHaptic = (style = 'medium') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      if (style === 'light') window.navigator.vibrate(10);
      else if (style === 'medium') window.navigator.vibrate(30);
      else if (style === 'error') window.navigator.vibrate([50, 30, 50]);
    }
  };

  // --- ESTADOS DO INVENTÁRIO ---
  const [invFilter, setInvFilter] = useState('TODOS'); 
  const [viewPhoto, setViewPhoto] = useState(null); 
  const [inventory, setInventory] = useState([]);
  // --- ESTADOS POKÉMON (Versão Limpa) ---
  const [pokemonCards, setPokemonCards] = useState([]);
  const [displayValue, setDisplayValue] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
    const [pokemonData, setPokemonData] = useState({ 
    name: '', number: '', set: '', rarity: '', buyPrice: '', marketValue: '', photo: '', condition: 'Near Mint' 
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
  
  const [editingPrice, setEditingPrice] = useState(null); // Guarda o item para edição rápida
const [tempPrice, setTempPrice] = useState(''); // Guarda o valor que estás a digitar
  const [searchTerm, setSearchTerm] = useState(''); // Estado para a barra de pesquisa
  const [searchResults, setSearchResults] = useState([]);
const [isSearching, setIsSearching] = useState(false);
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

    {/* ESTILO DA ANIMAÇÃO (COLOQUEI AQUI PARA FUNCIONAR O SPIN) */}
    <style>{`
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
    
    {/* CABEÇALHO COM POKÉBOLA REAL */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '30px',
      background: 'white',
      padding: '15px 25px',
      borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      border: '1px solid #f1f1f1'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ 
          width: '40px', height: '40px', borderRadius: '50%', 
          background: 'linear-gradient(180deg, #ee1515 50%, white 50%)', 
          border: '3px solid #1c1c1e', position: 'relative',
          boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.1)'
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '0', width: '100%', height: '3px', backgroundColor: '#1c1c1e', transform: 'translateY(-50%)' }} />
          <div style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white', border: '3px solid #1c1c1e',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', border: '1px solid #1c1c1e' }} />
          </div>
        </div>
        <h3 style={{ fontWeight: '900', margin: 0, fontSize: '22px', color: '#1c1c1e', letterSpacing: '-1px', textTransform: 'uppercase' }}>
          POKÉDEX
        </h3>
      </div>
      
      <button 
        onClick={() => setShowAddPokemon(!showAddPokemon)} 
        style={{ 
          backgroundColor: '#ee1515', color: 'white', border: 'none', borderRadius: '12px', 
          padding: '12px 20px', fontWeight: '900', fontSize: '12px',
          textTransform: 'uppercase', letterSpacing: '1px',
          boxShadow: '0 4px 0 #b10f0f', cursor: 'pointer'
        }}
      >
        {showAddPokemon ? 'FECHAR' : 'ADICIONAR CARTA'}
      </button>
    </div>

    {/* PESQUISA E SELEÇÃO DE RESULTADOS */}
    {isSearching && (
      <div style={{ textAlign: 'center', padding: '10px', color: '#FF3B30', fontWeight: '800', fontSize: '12px' }}>
        🔎 A procurar na Pokédex...
      </div>
    )}

    {searchResults.length > 0 && (
      <div style={{ 
        display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0', 
        marginBottom: '15px', borderBottom: '1px solid #eee' 
      }}>
        {searchResults.map((result) => (
          <div 
            key={result.id}
            onClick={() => {
              setPokemonData({
                name: result.name,
                number: result.number,
                set: result.set.name,
                rarity: result.rarity || 'Common',
                buyPrice: '', 
                marketValue: result.tcgplayer?.prices?.holofoil?.market || result.tcgplayer?.prices?.normal?.market || 0,
                photo: result.images.small,
                condition: 'Near Mint'
              });
              setSearchResults([]); 
            }}
            style={{ cursor: 'pointer', textAlign: 'center', minWidth: '80px' }}
          >
            <img src={result.images.small} style={{ width: '60px', borderRadius: '4px' }} alt={result.name} />
            <p style={{ fontSize: '8px', fontWeight: 'bold', margin: '5px 0' }}>{result.set.name}</p>
          </div>
        ))}
      </div>
    )}

   {/* FORMULÁRIO POKÉDEX - LIMPO E CORRIGIDO */}
{showAddPokemon && (
  <div style={{ 
    backgroundColor: '#FF3B30', padding: '20px', borderRadius: '32px', 
    marginBottom: '25px', boxShadow: '0 12px 30px rgba(255, 59, 48, 0.3)', border: '4px solid white'
  }}>
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px' }}>
      
      {/* NOME E PESQUISA */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <input 
          placeholder="Nome da Carta (ex: Houndoom 191)" 
          value={pokemonData.name || ''}
          onChange={e => setPokemonData({...pokemonData, name: e.target.value})}
          style={{ flex: 1, padding: '15px', borderRadius: '14px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '14px', fontWeight: '700', outline: 'none' }}
        />
        <button type="button" onClick={() => searchPokemonCard(pokemonData.name)} style={{ backgroundColor: '#1C1C1E', color: 'white', border: 'none', borderRadius: '14px', width: '50px', cursor: 'pointer' }}>🔍</button>
      </div>

      {/* SET E RARIDADE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <input placeholder="Set (ex: 151)" value={pokemonData.set || ''} onChange={e => setPokemonData({...pokemonData, set: e.target.value})} style={{ padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '13px', fontWeight: '600' }} />
        <select value={pokemonData.rarity || ''} onChange={e => setPokemonData({...pokemonData, rarity: e.target.value})} style={{ padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '13px', fontWeight: '700', color: '#FF3B30', outline: 'none' }}>
          <option value="">Raridade (Badge)</option>
          <option value="Special Illustration Rare">Special Illustration Rare</option>
          <option value="Illustration Rare">Illustration Rare</option>
          <option value="Ultra Rare">Ultra Rare</option>
          <option value="Hyper Rare">Hyper Rare</option>
          <option value="ACE SPEC">ACE SPEC</option>
          <option value="Holo Rare">Holo Rare</option>
          <option value="Promo">Promo</option>
        </select>
      </div>

      {/* VALORES TÉCNICOS - APENAS O NECESSÁRIO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '900', color: '#8E8E93', marginLeft: '5px' }}>7 DAY AVERAGE €</label>
          <input 
            type="number" 
            placeholder="0.00"
            value={pokemonData.avg7Day || ''} 
            onChange={e => setPokemonData({...pokemonData, avg7Day: e.target.value})} 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '13px', fontWeight: '800' }} 
          />
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '900', color: '#8E8E93', marginLeft: '5px' }}>MARKET VALUE €</label>
          <input 
            type="number" 
            placeholder="0.00"
            value={pokemonData.marketValue || ''} 
            onChange={e => setPokemonData({...pokemonData, marketValue: e.target.value})} 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '13px', fontWeight: '800' }} 
          />
        </div>
      </div>
      
      <input 
        placeholder="URL da Imagem" 
        value={pokemonData.photo || ''} 
        onChange={e => setPokemonData({...pokemonData, photo: e.target.value})} 
        style={{ width: '100%', padding: '15px', borderRadius: '14px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '13px', marginBottom: '20px' }} 
      />

      <button 
        type="button"
        onClick={() => {
          if (!pokemonData.name) return alert("Nome é obrigatório");
          setIsSyncing(true);
          setTimeout(() => {
            // CONVERSÃO DE SEGURANÇA PARA EVITAR NaN
            const valorLimpo = String(pokemonData.marketValue).replace(',', '.');
            const finalData = {
              ...pokemonData,
              marketValue: parseFloat(valorLimpo) || 0,
              avg7Day: parseFloat(String(pokemonData.avg7Day).replace(',', '.')) || 0
            };
            handlePokemonSubmit(finalData); 
            setIsSyncing(false);
            setPokemonData({}); 
            setShowAddPokemon(false);
          }, 1000);
        }} 
        style={{ 
          width: '100%', padding: '20px', backgroundColor: '#FF3B30', color: 'white', 
          border: 'none', borderRadius: '20px', fontSize: '18px', fontWeight: '900',
          textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(255, 59, 48, 0.3)'
        }}
      >
        ADICIONAR À POKÉDEX
      </button>
    </div>
  </div>
)}

    {/* DASHBOARD ULTRA CHARIZARD EDITION */}
    <div style={{ marginBottom: '30px', position: 'relative' }}>
      
      {/* ANIMAÇÃO DE SYNC (POKÉBOLA) INTEGRADA */}
      {isSyncing && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: 'linear-gradient(180deg, #ee1515 50%, white 50%)', 
              border: '4px solid #1c1c1e', position: 'relative',
              animation: 'spin 0.8s linear infinite',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '4px', backgroundColor: '#1c1c1e', transform: 'translateY(-50%)' }} />
              <div style={{ 
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', border: '4px solid #1c1c1e'
              }} />
            </div>
            <p style={{ marginTop: '20px', fontWeight: '900', color: '#ee1515', letterSpacing: '2px' }}>A GUARDAR...</p>
          </div>
        </div>
      )}

      <div style={{ 
        backgroundImage: `url('/charizard.png')`, backgroundSize: 'cover', backgroundPosition: 'center 35%',
        borderRadius: '35px', margin: '10px', padding: '3px', position: 'relative', zIndex: 1, overflow: 'hidden', 
        border: '2px solid rgba(255,215,0,0.6)', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', minHeight: '280px'
      }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg" style={{ position: 'absolute', right: '35px', top: '30px', height: '42px', zIndex: 10 }} alt="logo" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 20%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.7) 100%)', backdropFilter: 'blur(4px)', zIndex: 2 }} />

        <div style={{ position: 'relative', zIndex: 10, padding: '15px 20px' }}>
          <div style={{ background: 'rgba(255, 59, 48, 0.9)', padding: '8px 20px', borderRadius: '50px', border: '1px solid white', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', width: 'fit-content' }}>
            <span style={{ fontSize: '12px', fontWeight: '1000', color: 'white' }}>POKEDEX VALUE</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)', padding: '20px 30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'inline-block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '60px', fontWeight: '1000', color: '#fff', letterSpacing: '-4px', textShadow: '0 0 20px rgba(0, 122, 255, 0.4)' }}>
                {pokemonCards && pokemonCards.length > 0 ? pokemonCards.reduce((acc, card) => acc + (parseFloat(card.marketValue) || 0), 0).toFixed(2) : "0.00"}€
              </h4>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
             <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px 22px', borderRadius: '16px', borderLeft: '4px solid #007AFF' }}>
               <p style={{ margin: 0, fontSize: '11px', color: '#fff', fontWeight: '1000' }}>MASTER TRAINER RANK</p>
               <p style={{ margin: 0, fontSize: '20px', color: '#007AFF', fontWeight: '1000' }}>PRO TRAINER ALPHA</p>
             </div>
             <div style={{ background: 'linear-gradient(180deg, #FFCC00, #FF9500)', padding: '8px 24px', borderRadius: '15px', fontSize: '16px', fontWeight: '1000', color: '#1C1C1E' }}>
               LVL {Math.floor(pokemonCards.length / 5)}
             </div>
          </div>

          <div style={{ height: '18px', background: 'rgba(255,255,255,0.2)', borderRadius: '25px', overflow: 'hidden', padding: '4px', marginTop: '15px' }}>
            <div style={{ width: `${Math.min(((pokemonCards.length % 5) / 5) * 100, 100)}%`, background: 'linear-gradient(90deg, #007AFF, #00C7BE, #34C759)', height: '100%', borderRadius: '20px', transition: 'width 2s' }} />
          </div>
        </div>
      </div>
    </div>

{/* --- BARRA DE PESQUISA E ORDENAÇÃO (ADICIONADO) --- */}
<div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 10px' }}>
      <div style={{ position: 'relative' }}>
        <input 
          type="text"
          placeholder="Pesquisar carta pelo nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '16px 20px', borderRadius: '18px', border: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '700', outline: 'none', backgroundColor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
        />
        <span style={{ position: 'absolute', right: '20px', top: '16px', fontSize: '18px' }}>🔍</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '14px', borderRadius: '15px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '12px', fontWeight: '800', color: '#1c1c1e', outline: 'none' }}
        >
          <option value="recent">🕒 MAIS RECENTES</option>
          <option value="expensive">💰 MAIS CARAS</option>
          <option value="cheapest">🏷️ MAIS BARATAS</option>
        </select>

        <select 
          value={filterSet} 
          onChange={(e) => setFilterSet(e.target.value)}
          style={{ padding: '14px', borderRadius: '15px', border: 'none', backgroundColor: '#F2F2F7', fontSize: '12px', fontWeight: '800', color: '#1c1c1e', outline: 'none' }}
        >
          <option value="all">📦 TODOS OS SETS</option>
          {uniqueSets.map(set => <option key={set} value={set}>{set.toUpperCase()}</option>)}
        </select>
      </div>
    </div>

    {/* GRELHA DE CARTAS GUARDADAS - CORRIGIDA */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', position: 'relative', zIndex: 5 }}>
{filteredCards.map((card) => (
    <div key={card.id} style={{ backgroundColor: '#ffffff', borderRadius: '24px 4px 24px 4px', padding: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Fundo Artístico */}
      <div style={{ position: 'absolute', top: '-5%', left: '-5%', right: '-5%', bottom: '-5%', backgroundImage: `url(${card.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, filter: 'blur(4px)', zIndex: 0 }} />
      
      <div style={{ position: 'relative', height: '160px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', borderRadius: '16px 4px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', zIndex: 2 }}>
        <img src={card.photo} style={{ width: '85%', height: '85%', objectFit: 'contain', filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))' }} alt={card.name} onClick={() => setViewPhoto(card.photo)} />
      </div>

      <div style={{ padding: '0 4px', zIndex: 3, position: 'relative' }}>
      <p style={{ 
  margin: 0, 
  fontWeight: '900', 
  fontSize: '11px', // Ligeiramente menor
  color: '#000', 
  textTransform: 'uppercase', 
  minHeight: '34px', // Mudado de 'height' para 'minHeight'
  lineHeight: '1.2',
  display: '-webkit-box',
  WebkitLineClamp: '2',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden' 
}}>
  {card.name}
</p>
        
        {/* CORREÇÃO DA BADGE: Usando card.rarity que vem do formulário */}
        {card.rarity && (
          <span style={{ fontSize: '8px', fontWeight: '900', color: '#ee1515', background: '#fff', padding: '3px 8px', borderRadius: '6px', marginTop: '6px', display: 'inline-block', border: '1px solid #eee', textTransform: 'uppercase' }}>
            {card.rarity}
          </span>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '15px' }}>
          <div>
            <span style={{ fontSize: '8px', fontWeight: '900', color: '#636366', display: 'block', textTransform: 'uppercase' }}>Market Value</span>
            {/* CORREÇÃO DO PREÇO: Garantindo que é número para evitar NaN */}
            <span style={{ fontSize: '17px', fontWeight: '900', color: '#1c1c1e' }}>
              {card.marketValue ? Number(card.marketValue).toFixed(2) : "0.00"}€
            </span>
          </div>
          <button 
  onClick={() => setPokemonToDelete(card)} 
  style={{ 
    background: '#000', 
    border: 'none', 
    padding: '6px 8px', // Menor para não empurrar o layout
    borderRadius: '8px', 
    color: '#fff', 
    fontSize: '7px', // Fonte mais fina para telemóvel
    fontWeight: '900' 
  }}
>
  DISCARD
</button>
        </div>
      </div>
    </div>
  ))}
</div>

    {/* MODAIS (GALERIA, DELETE, EDIÇÃO) */}
    {viewPhoto && (
      <div onClick={() => setViewPhoto(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={viewPhoto} style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '24px' }} alt="Full" />
      </div>
    )}

    {pokemonToDelete && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '30px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
          <h3 style={{ fontWeight: '900' }}>Eliminar Carta?</h3>
          <p style={{ color: '#8E8E93' }}>Remover {pokemonToDelete.name} da coleção?</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => setPokemonToDelete(null)} style={{ flex: 1, padding: '15px', borderRadius: '16px', border: 'none', backgroundColor: '#F2F2F7', fontWeight: '800' }}>Não</button>
            <button onClick={() => { remove(ref(db, `users/${user}/pokemonCollection/${pokemonToDelete.id}`)); setPokemonToDelete(null); }} style={{ flex: 1, padding: '15px', borderRadius: '16px', border: 'none', backgroundColor: '#FF3B30', color: 'white', fontWeight: '800' }}>Sim</button>
          </div>
        </div>
      </div>
    )}

    
  </div>
)}
{/* Menu Inferior Dinâmico */}
<div style={{ 
  position: 'fixed', 
  bottom: '15px', 
  left: '50%', 
  transform: 'translateX(-50%)', 
  width: '92%', 
  maxWidth: '400px', 
  backgroundColor: 'rgba(255,255,255,0.92)', 
  backdropFilter: 'blur(15px)', 
  WebkitBackdropFilter: 'blur(15px)', 
  display: 'flex', 
  justifyContent: 'space-around', 
  padding: '12px 0', 
  borderRadius: '25px', 
  boxShadow: '0 8px 25px rgba(0,0,0,0.1)', 
  border: '1px solid rgba(255,255,255,0.4)', 
  zIndex: 1000,
  transition: 'all 0.4s ease'
}}>
  
  {/* Botão HOME */}
  <button onClick={() => { triggerHaptic('light'); setActiveTab('home'); setSelectedDetail(null); }} 
    style={{ 
      background: 'none', border: 'none', fontSize: '24px', transition: '0.3s',
      transform: activeTab === 'home' ? 'scale(1.2)' : 'scale(1)',
      opacity: activeTab === 'home' ? 1 : 0.3,
      filter: activeTab === 'home' ? 'drop-shadow(0 0 8px rgba(0,122,255,0.5))' : 'none'
    }}>🏠</button>

  {/* Botão RELATÓRIOS */}
  <button onClick={() => { triggerHaptic('light'); setActiveTab('reports'); setSelectedDetail(null); }} 
    style={{ 
      background: 'none', border: 'none', fontSize: '24px', transition: '0.3s',
      transform: activeTab === 'reports' ? 'scale(1.2)' : 'scale(1)',
      opacity: activeTab === 'reports' ? 1 : 0.3,
      filter: activeTab === 'reports' ? 'drop-shadow(0 0 8px rgba(175,82,222,0.5))' : 'none'
    }}>📊</button>

  {/* Botão INVENTÁRIO */}
  <button onClick={() => { triggerHaptic('light'); setActiveTab('inventory'); setSelectedDetail(null); }} 
    style={{ 
      background: 'none', border: 'none', fontSize: '24px', transition: '0.3s',
      transform: activeTab === 'inventory' ? 'scale(1.2)' : 'scale(1)',
      opacity: activeTab === 'inventory' ? 1 : 0.3,
      filter: activeTab === 'inventory' ? 'drop-shadow(0 0 8px rgba(52,199,89,0.5))' : 'none'
    }}>📦</button>
{/* Botão POKÉMON (Pokébola Real) */}
<button onClick={() => { triggerHaptic('light'); setActiveTab('pokemon'); setSelectedDetail(null); }} 
    style={{ 
      background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: '0.3s',
      transform: activeTab === 'pokemon' ? 'scale(1.2)' : 'scale(1)',
      filter: activeTab === 'pokemon' ? 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.6))' : 'grayscale(1) opacity(0.4)'
    }}>
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" 
      alt="Pokémon"
      style={{ width: '26px', height: '26px', display: 'block' }}
    />
  </button>

  {/* Botão DEFINIÇÕES */}
  <button onClick={() => { triggerHaptic('light'); setActiveTab('settings'); setSelectedDetail(null); }} 
    style={{ 
      background: 'none', border: 'none', fontSize: '24px', transition: '0.3s',
      transform: activeTab === 'settings' ? 'scale(1.2)' : 'scale(1)',
      opacity: activeTab === 'settings' ? 1 : 0.3,
      filter: activeTab === 'settings' ? 'drop-shadow(0 0 8px rgba(142,142,147,0.5))' : 'none'
    }}>⚙️</button>
</div>

      <div style={{ height: '90px' }}></div>
      <footer style={{ 
  textAlign: 'center', 
  padding: '40px 0 120px 0', // Aumentamos o espaço em baixo para o menu não tapar o texto
  opacity: 0.5 
}}>
  <p style={{ 
    fontSize: '9px', 
    color: '#AEAEB2', 
    letterSpacing: '2px', 
    fontWeight: '800',
    textTransform: 'uppercase'
  }}>
    © 2026 ALIGNA — HUGO BARROS
  </p>
  <div style={{ 
    width: '40px', 
    height: '4px', 
    backgroundColor: '#000', 
    borderRadius: '2px', 
    margin: '15px auto 0', 
    opacity: 0.1 
  }}></div> {/* Pequena barra estilo iPhone no fundo */}
</footer>
    </div>
  );
}