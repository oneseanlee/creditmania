import React, { useState, useEffect } from 'react';

// Game Data
const avatars = [
  { id: 'super-social', name: 'Super Social', emoji: '🤝', coins: 100, debt: 1, cp: 1, income: 25, ability: 'Discard 1 life card per turn', gradient: 'from-purple-500 to-purple-700' },
  { id: 'street-wise', name: 'Street Wise', emoji: '🎯', coins: 100, debt: 1, cp: 1, income: 20, ability: 'Reduce debt by 1 per round', gradient: 'from-cyan-500 to-cyan-700' },
  { id: 'educated', name: 'Educated', emoji: '🎓', coins: 100, debt: 2, cp: 1, income: 30, ability: '4x coins from work dice', gradient: 'from-pink-500 to-pink-700' },
  { id: 'investor', name: 'Investor', emoji: '📈', coins: 100, debt: 3, cp: 1, income: 25, ability: 'Draw extra asset, buy for -10', gradient: 'from-green-500 to-green-700' },
  { id: 'hustler', name: 'Hustler', emoji: '💪', coins: 100, debt: 3, cp: 1, income: 30, ability: '-10 coins on any asset purchase', gradient: 'from-amber-600 to-amber-800' },
  { id: 'entrepreneur', name: 'Entrepreneur', emoji: '🚀', coins: 100, debt: 2, cp: 1, income: 25, ability: 'Double CP from one 1★/2★ asset', gradient: 'from-orange-500 to-orange-700' },
];

const assets = {
  1: [
    { name: 'Bank Stocks', cost: 10, cp: 5 }, { name: 'Music App', cost: 35, cp: 15 }, { name: 'Vending Machine', cost: 25, cp: 15 },
    { name: 'T-Shirt Shop', cost: 20, cp: 10 }, { name: 'Fast Food Shop', cost: 40, cp: 10 }, { name: 'Forex Trading', cost: 40, cp: 20 },
  ],
  2: [
    { name: 'Insurance Stocks', cost: 60, cp: 20, coins: 1 }, { name: 'High Tech Stocks', cost: 80, cp: 25 }, 
    { name: 'Art Gallery', cost: 75, cp: 15, coins: 2 }, { name: 'Clothing Brand', cost: 110, cp: 50, debt: 1 },
  ],
  3: [
    { name: 'Apartment', cost: 160, cp: 30, coins: 4, debt: 1 }, { name: 'House', cost: 220, cp: 45, coins: 6, debt: 2 },
    { name: 'Villa', cost: 250, cp: 0, coins: 8, debt: 1 }, { name: 'Sport Center', cost: 210, cp: 30, coins: 5, debt: 1 },
  ],
};

const phases = [
  { id: 1, name: 'EVENT', icon: '🌍', color: '#E74C3C' },
  { id: 2, name: 'INCOME', icon: '💰', color: '#F39C12' },
  { id: 3, name: 'LIFE', icon: '🎴', color: '#9B59B6' },
  { id: 4, name: 'MARKET', icon: '🏪', color: '#27AE60' },
  { id: 5, name: 'SCORING', icon: '⭐', color: '#3498DB' },
];

const Stars = ({ n }) => <span className="text-yellow-400">{'★'.repeat(n)}{'☆'.repeat(3-n)}</span>;

export default function CreditMania() {
  const [screen, setScreen] = useState('menu');
  const [avatar, setAvatar] = useState(null);
  const [game, setGame] = useState(null);
  const [modal, setModal] = useState(null);
  const [note, setNote] = useState(null);
  const [dice, setDice] = useState(null);

  const notify = (msg, type='info') => { setNote({msg, type}); setTimeout(() => setNote(null), 2500); };
  
  const startGame = () => {
    if (!avatar) return;
    setGame({ cp: avatar.cp, coins: avatar.coins, debt: avatar.debt, phase: 1, round: 1, portfolio: [], avatar });
    setScreen('game');
    setDice(null);
  };

  const getDice = () => game?.cp >= 45 ? 3 : game?.cp >= 20 ? 2 : 1;
  
  const rollDice = () => {
    const n = getDice();
    const mult = game.avatar.id === 'educated' ? 4 : 2;
    const rolls = Array(n).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    const total = rolls.reduce((a, b) => a + b, 0) * mult + game.avatar.income;
    const assetIncome = game.portfolio.reduce((s, a) => s + (a.coins || 0), 0);
    setDice({ rolls, total: total + assetIncome });
    setGame(g => ({ ...g, coins: g.coins + total + assetIncome }));
    notify(`+${total + assetIncome} coins!`, 'success');
  };

  const nextPhase = () => {
    if (game.phase === 5) {
      const cpGain = game.portfolio.reduce((s, a) => s + a.cp, 0);
      const debtGain = game.portfolio.reduce((s, a) => s + (a.debt || 0), 0);
      setGame(g => ({ ...g, cp: g.cp + cpGain, debt: Math.min(12, g.debt + debtGain), phase: 1, round: g.round + 1 }));
      setDice(null);
      if (cpGain > 0) notify(`+${cpGain} CP from assets!`, 'success');
    } else {
      setGame(g => ({ ...g, phase: g.phase + 1 }));
    }
  };

  const buyAsset = (asset, tier) => {
    if (game.coins < asset.cost) return notify('Not enough coins!', 'error');
    if (tier === 2 && game.cp < 20) return notify('Need 20+ CP!', 'error');
    if (tier === 3 && game.cp < 45) return notify('Need 45+ CP!', 'error');
    setGame(g => ({ ...g, coins: g.coins - asset.cost, portfolio: [...g.portfolio, { ...asset, tier }] }));
    notify(`Bought ${asset.name}!`, 'success');
    setModal(null);
  };

  useEffect(() => {
    if (game?.cp >= 100) notify('🎉 VICTORY! 100 CP!', 'success');
    if (game?.debt >= 12) notify('💀 BANKRUPTCY!', 'error');
  }, [game?.cp, game?.debt]);

  // MENU
  if (screen === 'menu') return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-400 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block bg-gradient-to-b from-amber-600 to-amber-800 p-1 rounded-2xl shadow-2xl mb-6">
          <div className="bg-gradient-to-b from-sky-400 to-sky-600 px-8 py-6 rounded-xl">
            <h1 className="text-6xl font-black text-amber-400" style={{textShadow: '3px 3px 0 #92400e'}}>Credit</h1>
            <h2 className="text-5xl font-black text-amber-300 -mt-2" style={{textShadow: '2px 2px 0 #92400e'}}>Mania</h2>
          </div>
        </div>
        <p className="text-amber-900 text-lg mb-8 font-semibold">A race to the good life by building your credit!</p>
        <div className="flex justify-center gap-4 mb-8">
          {[['👥','2-5'],['⏱️','45m'],['🎂','10+']].map(([i,t]) => (
            <div key={t} className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold">{i} {t}</div>
          ))}
        </div>
        <button onClick={() => setScreen('select')} className="w-64 py-4 bg-gradient-to-r from-sky-500 to-sky-600 rounded-xl text-white font-bold text-xl border-4 border-sky-700 hover:scale-105 transition-transform">
          🎮 NEW GAME
        </button>
        <div className="mt-8 text-amber-800 font-semibold">☀️ R&L Advising</div>
      </div>
    </div>
  );

  // AVATAR SELECT
  if (screen === 'select') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => setScreen('menu')} className="text-purple-300 hover:text-white mb-4">← Back</button>
        <h1 className="text-3xl font-bold text-white text-center mb-6">Choose Your Avatar</h1>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {avatars.map(a => (
            <button key={a.id} onClick={() => setAvatar(a)}
              className={`p-4 rounded-xl border-4 text-left transition-all ${avatar?.id === a.id ? 'border-yellow-400 bg-purple-800/50 scale-105' : 'border-purple-700 bg-purple-900/30 hover:border-purple-500'}`}>
              <div className={`bg-gradient-to-r ${a.gradient} -mx-4 -mt-4 px-4 py-2 rounded-t-lg mb-3 flex justify-between items-center`}>
                <span className="text-white font-bold text-sm uppercase">{a.name}</span>
                <span className="text-3xl">{a.emoji}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2 text-center text-sm">
                <div className="bg-purple-900/50 rounded p-1"><div className="text-yellow-400 font-bold">{a.coins}</div><div className="text-purple-400 text-xs">Coins</div></div>
                <div className="bg-purple-900/50 rounded p-1"><div className="text-red-400 font-bold">{a.debt}</div><div className="text-purple-400 text-xs">Debt</div></div>
                <div className="bg-purple-900/50 rounded p-1"><div className="text-green-400 font-bold">{a.cp}</div><div className="text-purple-400 text-xs">CP</div></div>
              </div>
              <div className="text-purple-200 text-xs">{a.ability}</div>
              {avatar?.id === a.id && <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-purple-900 font-bold text-sm">✓</div>}
            </button>
          ))}
        </div>
        <div className="text-center">
          <button onClick={startGame} disabled={!avatar}
            className={`py-4 px-12 rounded-xl font-bold text-xl ${avatar ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-900 hover:scale-105' : 'bg-purple-800 text-purple-500 cursor-not-allowed'}`}>
            START GAME →
          </button>
        </div>
      </div>
    </div>
  );

  // GAME
  if (screen === 'game' && game) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 p-3">
      {note && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-bold shadow-xl animate-bounce ${note.type === 'success' ? 'bg-green-500' : note.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>{note.msg}</div>}
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-amber-500 border-4 border-amber-700 rounded-xl p-3 mb-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.avatar.gradient} flex items-center justify-center text-2xl border-2 border-white/30`}>{game.avatar.emoji}</div>
            <div><div className="text-amber-900 font-bold">{game.avatar.name}</div><div className="text-amber-800 text-xs">{game.avatar.ability}</div></div>
          </div>
          <div className="text-right"><div className="text-2xl font-black text-amber-900">ROUND {game.round}</div></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-gradient-to-b from-slate-700 to-slate-800 border-4 border-amber-500 rounded-xl p-4 text-center">
            <div className="text-amber-400 font-bold text-xs mb-1">CREDIT POINTS</div>
            <div className="text-4xl font-black text-white">{game.cp}<span className="text-lg text-amber-400/60">/100</span></div>
            <div className="h-2 bg-slate-900 rounded-full mt-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{width: `${Math.min(100, game.cp)}%`}}/></div>
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span className={game.cp >= 20 ? 'text-yellow-400' : ''}>20★★</span><span className={game.cp >= 45 ? 'text-yellow-400' : ''}>45★★★</span></div>
          </div>
          <div className="bg-gradient-to-b from-slate-700 to-slate-800 border-4 border-amber-500 rounded-xl p-4 text-center">
            <div className="text-amber-400 font-bold text-xs mb-1">COINS</div>
            <div className="text-4xl font-black text-amber-400">{game.coins}</div>
            <div className="text-slate-400 text-sm">+{game.avatar.income + game.portfolio.reduce((s,a) => s + (a.coins||0), 0)}/round</div>
          </div>
          <div className="bg-gradient-to-b from-slate-700 to-slate-800 border-4 border-amber-500 rounded-xl p-4 text-center">
            <div className="text-amber-400 font-bold text-xs mb-1">DEBT</div>
            <div className={`text-4xl font-black ${game.debt >= 8 ? 'text-red-500' : game.debt >= 4 ? 'text-orange-400' : 'text-green-400'}`}>{game.debt}<span className="text-lg text-slate-400">/12</span></div>
            <div className="text-slate-400 text-sm">{game.debt >= 8 ? '⚠️ DANGER' : game.debt >= 4 ? '⚡ CAUTION' : '✓ SAFE'}</div>
          </div>
        </div>

        {/* Phase Tracker */}
        <div className="bg-slate-800 border-4 border-amber-500 rounded-xl p-3 mb-3">
          <div className="flex justify-between">
            {phases.map((p, i) => (
              <div key={p.id} className="flex items-center">
                <div className={`py-2 px-3 rounded-lg text-center ${game.phase === p.id ? 'scale-110' : game.phase > p.id ? 'opacity-40' : 'opacity-60'}`} style={{backgroundColor: game.phase === p.id ? p.color : '#334155'}}>
                  <div className="text-xl">{p.icon}</div>
                  <div className="text-white text-xs font-bold">{p.name}</div>
                </div>
                {i < 4 && <div className={`w-6 h-1 mx-1 ${game.phase > p.id ? 'bg-green-500' : 'bg-slate-600'}`}/>}
              </div>
            ))}
          </div>
        </div>

        {/* Phase Actions */}
        <div className="bg-slate-800/90 border-4 border-amber-500 rounded-xl p-6 mb-3 text-center">
          {game.phase === 1 && <div>
            <div className="text-5xl mb-3">🌍</div>
            <h3 className="text-xl font-bold text-white mb-2">Event Phase</h3>
            <p className="text-slate-400 mb-4">A global event affects all players!</p>
            <button onClick={nextPhase} className="py-3 px-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white font-bold hover:scale-105 transition-transform">Continue →</button>
          </div>}
          
          {game.phase === 2 && <div>
            <div className="text-5xl mb-3">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">Income Phase</h3>
            <p className="text-slate-400 mb-4">Roll {getDice()} dice for work income!</p>
            {!dice ? (
              <button onClick={rollDice} className="py-3 px-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-white font-bold hover:scale-105 transition-transform">🎲 Roll Dice</button>
            ) : (
              <div>
                <div className="flex justify-center gap-3 mb-3">{dice.rolls.map((r, i) => <div key={i} className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-2xl font-black text-white border-4 border-red-800">{r}</div>)}</div>
                <p className="text-green-400 font-bold text-xl mb-4">+{dice.total} coins!</p>
                <button onClick={nextPhase} className="py-3 px-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white font-bold hover:scale-105 transition-transform">Continue →</button>
              </div>
            )}
          </div>}
          
          {game.phase === 3 && <div>
            <div className="text-5xl mb-3">🎴</div>
            <h3 className="text-xl font-bold text-white mb-2">Life Cards Phase</h3>
            <p className="text-slate-400 mb-4">Life events affect your journey!</p>
            <button onClick={nextPhase} className="py-3 px-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white font-bold hover:scale-105 transition-transform">Continue →</button>
          </div>}
          
          {game.phase === 4 && <div>
            <div className="text-5xl mb-3">🏪</div>
            <h3 className="text-xl font-bold text-white mb-2">Market Phase</h3>
            <p className="text-slate-400 mb-4">Purchase assets to build wealth!</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setModal('market')} className="py-3 px-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white font-bold hover:scale-105 transition-transform">🛒 Marketplace</button>
              <button onClick={nextPhase} className="py-3 px-8 bg-slate-600 rounded-xl text-white font-bold hover:bg-slate-500">Skip →</button>
            </div>
          </div>}
          
          {game.phase === 5 && <div>
            <div className="text-5xl mb-3">⭐</div>
            <h3 className="text-xl font-bold text-white mb-2">Scoring Phase</h3>
            <p className="text-green-400 font-bold text-xl mb-4">+{game.portfolio.reduce((s, a) => s + a.cp, 0)} CP from assets!</p>
            <button onClick={nextPhase} className="py-3 px-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-bold hover:scale-105 transition-transform">Next Round →</button>
          </div>}
        </div>

        {/* Portfolio */}
        <div className="bg-slate-800/90 border-4 border-amber-500 rounded-xl p-4">
          <h3 className="text-amber-400 font-bold mb-2">📁 Portfolio ({game.portfolio.length})</h3>
          {game.portfolio.length === 0 ? <p className="text-slate-500 text-center py-4">No assets yet!</p> : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {game.portfolio.map((a, i) => (
                <div key={i} className="bg-sky-600 rounded-lg p-2 border-2 border-sky-400">
                  <Stars n={a.tier}/><div className="text-white font-bold text-xs truncate">{a.name}</div><div className="text-green-300 text-xs">+{a.cp} CP</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Marketplace Modal */}
      {modal === 'market' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-4 border-amber-500 rounded-xl p-4 max-w-3xl w-full max-h-[85vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">🏪 Marketplace</h2>
              <button onClick={() => setModal(null)} className="text-3xl text-slate-400 hover:text-white">×</button>
            </div>
            {[[1, 'sky', true], [2, 'purple', game.cp >= 20], [3, 'amber', game.cp >= 45]].map(([tier, color, unlocked]) => (
              <div key={tier} className="mb-4">
                <h3 className={`font-bold mb-2 ${unlocked ? 'text-white' : 'text-slate-500'}`}><Stars n={tier}/> {tier}-Star {!unlocked && '🔒'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {assets[tier].map((a, i) => (
                    <button key={i} onClick={() => unlocked && buyAsset(a, tier)} disabled={!unlocked || game.coins < a.cost}
                      className={`p-3 rounded-xl border-2 text-left ${unlocked && game.coins >= a.cost ? `bg-${color}-600/30 border-${color}-500 hover:scale-105` : 'bg-slate-800 border-slate-700 opacity-50'} transition-transform`}>
                      <div className="text-white font-bold text-sm">{a.name}</div>
                      <div className="text-green-400 text-xs">+{a.cp} CP/round</div>
                      {a.coins && <div className="text-amber-400 text-xs">+{a.coins} 💰/round</div>}
                      <div className="text-yellow-300 font-bold mt-1">${a.cost}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-between text-sm text-slate-400 mt-4">
              <span>Your coins: <span className="text-amber-400 font-bold">{game.coins}</span></span>
              <span>Your CP: <span className="text-green-400 font-bold">{game.cp}</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return null;
}
