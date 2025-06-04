// src/components/SlotMachine.jsx
import React, { useState, useEffect, useRef } from "react";
import Reel from "./Reel";
import { PAYTABLE, EIGHT_PLUS_MULTIPLIERS, BET_MULTIPLIERS } from "../game/paytable";

// Import your images and sounds
import yellowGem from "../assets/items/yellow_gem.png";
import ring from "../assets/items/gold_ring_with_red_gem.png";
import blueGem from "../assets/items/blue_diamoon.png";
import greenTriangle from "../assets/items/green_triangle.png";
import purpleTriangle from "../assets/items/purple_triangle.png";
import hourglass from "../assets/items/house_glass.png";
import scatter from "../assets/items/scatter.png";
import winSound from "../assets/sounds/sensational-win-music.mp3";
import spinSound from "../assets/sounds/noti.wav";
import freeSpinsSound from "../assets/sounds/noti.wav";
import tumbleSound from "../assets/sounds/noti.wav";
import twoXGreenWingedBadge from "../assets/items/2X_GreenWingedBadge.png";
import fiveXGreenWingedBadge from "../assets/items/5X_GreenWingedBadge.png";
import twentyFiveXWingedBlueBadge from "../assets/items/25X_WingedBlueBadge.png";
import fivexGreenWingedBadge from "../assets/items/5x_green_winged_badge.png";
import roundRedCrownBonus from "../assets/items/round_red_crown_bonus.png";
import greenGlassGoldFrameBlueGems from "../assets/items/green_glass_gold_frame_blue_gems.png";
import redHexagonGem from "../assets/items/RedHexagonGem.png";
import crownBonus from "../assets/items/crown_bonus.png";

// Symbol weights for weighted random selection
const SYMBOL_WEIGHTS = {
  yellowGem: 20,
  ring: 15,
  blueGem: 15,
  greenTriangle: 10,
  purpleTriangle: 10,
  hourglass: 8,
  scatter: 2,
  twoXGreenWingedBadge: 1,
  fiveXGreenWingedBadge: 1,
  twentyFiveXWingedBlueBadge: 1,
  fivexGreenWingedBadge: 1,
  roundRedCrownBonus: 5,
  greenGlassGoldFrameBlueGems: 8,
  redHexagonGem: 9,
  crownBonus: 4
};

const SYMBOLS_MAP = {
  yellowGem,
  ring,
  blueGem,
  greenTriangle,
  purpleTriangle,
  hourglass,
  scatter,
  twoXGreenWingedBadge,
  fiveXGreenWingedBadge,
  twentyFiveXWingedBlueBadge,
  fivexGreenWingedBadge,
  roundRedCrownBonus,
  greenGlassGoldFrameBlueGems,
  redHexagonGem,
  crownBonus
};

function getRandomSymbol() {
  const weighted = [];
  Object.entries(SYMBOL_WEIGHTS).forEach(([key, weight]) => {
    for (let i = 0; i < weight; i++) weighted.push(SYMBOLS_MAP[key]);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

const SYMBOLS = Object.values(SYMBOLS_MAP); // for reference, not used in getRandomSymbol

const ROWS = 6;
const COLS = 5;

// Symbol to paytable key mapping
const SYMBOL_TO_KEY = {
  [yellowGem]: "yellowGem",
  [ring]: "ring",
  [blueGem]: "blueGem",
  [greenTriangle]: "greenTriangle",
  [purpleTriangle]: "purpleTriangle",
  [hourglass]: "hourseglass",
  [scatter]: "scatter",
  [twoXGreenWingedBadge]: "twoXGreenWingedBadge",
  [fiveXGreenWingedBadge]: "fiveXGreenWingedBadge",
  [twentyFiveXWingedBlueBadge]: "twentyFiveXWingedBlueBadge",
  [fivexGreenWingedBadge]: "fivexGreenWingedBadge",
  [roundRedCrownBonus]: "roundRedCrownBonus",
  [greenGlassGoldFrameBlueGems]: "greenGlassGoldFrameBlueGems",
  [redHexagonGem]: "redHexagonGem",
  [crownBonus]: "crownBonus"
};

// Multiplier symbol mapping
const MULTIPLIER_SYMBOLS = {
  [twoXGreenWingedBadge]: 2,
  [fiveXGreenWingedBadge]: 5,
  [fivexGreenWingedBadge]: 5,
  [twentyFiveXWingedBlueBadge]: 25
};

function makeReelSymbols(rows = ROWS) {
  return Array.from({ length: rows }, getRandomSymbol);
}

function countSymbols(flatReels) {
  const counts = {};
  flatReels.forEach(sym => {
    counts[sym] = (counts[sym] || 0) + 1;
  });
  return counts;
}

function calculateWaysPayout(flatReels, betAmount) {
  let totalPayout = 0;
  let winSyms = [];
  const counts = countSymbols(flatReels);
  Object.entries(counts).forEach(([sym, count]) => {
    const paytableKey = SYMBOL_TO_KEY[sym];
    if (!paytableKey) return;
    if (PAYTABLE[paytableKey] && count >= 8 && PAYTABLE[paytableKey][count]) {
      totalPayout += PAYTABLE[paytableKey][count] * betAmount;
      winSyms.push(sym);
    }
  });
  return { totalPayout, winSyms };
}

function calculateWaysPayoutWithMultiplier(flatReels, betAmount) {
  let totalPayout = 0;
  let winSyms = [];
  const counts = countSymbols(flatReels);
  Object.entries(counts).forEach(([sym, count]) => {
    const paytableKey = SYMBOL_TO_KEY[sym];
    if (!paytableKey) return;
    if (PAYTABLE[paytableKey] && count >= 8 && PAYTABLE[paytableKey][count]) {
      totalPayout += PAYTABLE[paytableKey][count] * betAmount;
      winSyms.push(sym);
    }
  });
  // Calculate multiplier sum (not product)
  let multiplier = 0;
  Object.entries(counts).forEach(([sym, count]) => {
    if (MULTIPLIER_SYMBOLS[sym]) {
      multiplier += MULTIPLIER_SYMBOLS[sym] * count;
    }
  });
  if (multiplier === 0) multiplier = 1;
  return { totalPayout: totalPayout * multiplier, winSyms, multiplier };
}

function getTumbleResult(reels) {
  // Find all symbols that appear 8+ times (excluding scatter)
  const flat = reels.flat();
  const counts = countSymbols(flat);
  const toRemove = new Set();
  Object.entries(counts).forEach(([sym, count]) => {
    const paytableKey = SYMBOL_TO_KEY[sym];
    if (paytableKey && paytableKey !== "scatter" && count >= 8) {
      // Mark all positions of this symbol for removal
      reels.forEach((col, colIdx) => {
        col.forEach((s, rowIdx) => {
          if (s === sym) toRemove.add(`${colIdx},${rowIdx}`);
        });
      });
    }
  });
  if (toRemove.size === 0) return null; // No more tumbles

  // Remove marked symbols and drop others down
  const newReels = reels.map((col, colIdx) => {
    // Remove marked
    let filtered = col.filter((s, rowIdx) => !toRemove.has(`${colIdx},${rowIdx}`));
    // Add new randoms at the top
    while (filtered.length < ROWS) {
      filtered.unshift(getRandomSymbol());
    }
    return filtered;
  });
  return { newReels, toRemove };
}

function getTumbleWin(reels, betAmount) {
  // Calculate win for 8+ symbols only (excluding scatter)
  const flat = reels.flat();
  const counts = countSymbols(flat);
  let win = 0;
  Object.entries(counts).forEach(([sym, count]) => {
    const paytableKey = SYMBOL_TO_KEY[sym];
    if (paytableKey && paytableKey !== "scatter" && count >= 8) {
      win += calculateWaysPayout(reels, betAmount).totalPayout;
    }
  });
  return win;
}

export default function SlotMachine() {
  const [reels, setReels] = useState(Array.from({ length: COLS }, () => makeReelSymbols()));
  const [spinning, setSpinning] = useState(Array(COLS).fill(false));
  const [credits, setCredits] = useState(10000);
  const [winSymbols, setWinSymbols] = useState([]);
  const [isFreeSpins, setIsFreeSpins] = useState(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [currentBet, setCurrentBet] = useState(200); // Default bet amount
  const [lastWin, setLastWin] = useState(0); // Track last win amount
  const [displayWin, setDisplayWin] = useState(0); // For win animation
  const [displayMultiplier, setDisplayMultiplier] = useState(1); // For multiplier animation
  const [isSpinning, setIsSpinning] = useState(false); // For disabling spin btn
  const [autoplayCount, setAutoplayCount] = useState(0); // Number of spins left in autoplay
  const [autoplaySetting, setAutoplaySetting] = useState(10); // User-selected value
  const MIN_BET = 20;
  const MAX_BET = 100000;
  const winAudioRef = useRef(null);
  const lastMultiplierRef = useRef(1);
  const autoplayRef = useRef(false);

  // Animate win amount
  useEffect(() => {
    if (lastWin > 0) {
      let start = 0;
      const duration = 900; // ms
      const startTime = performance.now();
      function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setDisplayWin(Math.floor(progress * lastWin));
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayWin(lastWin);
        }
      }
      requestAnimationFrame(animate);
    } else {
      setDisplayWin(0);
    }
  }, [lastWin]);

  // Autoplay effect
  useEffect(() => {
    if (autoplayCount > 0 && !isSpinning && credits >= currentBet) {
      autoplayRef.current = true;
      handleSpin();
    } else if (autoplayCount === 0) {
      autoplayRef.current = false;
    }
  }, [autoplayCount, isSpinning, credits]);

  // Stop autoplay if credits run out
  useEffect(() => {
    if (credits < currentBet && autoplayCount > 0) {
      setAutoplayCount(0);
      autoplayRef.current = false;
    }
  }, [credits, currentBet, autoplayCount]);

  function playSound(src, isWin = false) {
    if (isWin) {
      if (winAudioRef.current) {
        winAudioRef.current.pause();
        winAudioRef.current.currentTime = 0;
      }
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.play();
      winAudioRef.current = audio;
    } else {
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.play();
    }
  }

  

  async function handleSpin() {
    // Stop win sound if playing
    if (winAudioRef.current) {
      winAudioRef.current.pause();
      winAudioRef.current.currentTime = 0;
      winAudioRef.current = null;
    }
    if (isSpinning) return; // Prevent double spin
  
    setIsSpinning(true);
    const spinStart = Date.now();
  
    if (!isFreeSpins) setCredits(c => c - currentBet);
    playSound(spinSound);
  
    // -- Core Spin Logic (same as yours) --
    let newReels = Array.from({ length: COLS }, () => makeReelSymbols());
    let flat = newReels.flat();
    const { totalPayout, winSyms, multiplier } = calculateWaysPayoutWithMultiplier(flat, currentBet);
    lastMultiplierRef.current = multiplier;
  
    // Waterfall/tumble effect for 8+ symbols
    let tumbleReels = newReels.map(col => [...col]);
    let tumbleTotal = totalPayout;
    let tumbleWinSyms = [...winSyms];
    let tumbleCount = 0;
    let tumbleDelay = 1100;
    let tumbleTotalDuration = 0;
    const maxTumbleDuration = 5000;
    while (tumbleTotalDuration < maxTumbleDuration) {
      const flatTumble = tumbleReels.flat();
      const { totalPayout: tumblePayout, winSyms: tumbleSyms, multiplier: tumbleMultiplier } =
        calculateWaysPayoutWithMultiplier(flatTumble, currentBet);
      if (tumbleSyms.length === 0) break;
      tumbleCount++;
      tumbleTotal += tumblePayout;
      tumbleWinSyms = tumbleSyms;
      setWinSymbols(tumbleSyms);
      playSound(tumbleSound);
      setReels(tumbleReels.map(col => [...col]));
      setSpinning(Array(COLS).fill(true));
      await new Promise(res => setTimeout(res, tumbleDelay));
      setSpinning(Array(COLS).fill(false));
      setWinSymbols([]);
      // Remove winning symbols and drop
      const toRemove = new Set();
      tumbleReels.forEach((col, colIdx) => {
        col.forEach((s, rowIdx) => {
          if (tumbleSyms.includes(s)) toRemove.add(`${colIdx},${rowIdx}`);
        });
      });
      tumbleReels = tumbleReels.map((col, colIdx) => {
        let filtered = col.filter((s, rowIdx) => !toRemove.has(`${colIdx},${rowIdx}`));
        while (filtered.length < ROWS) {
          filtered.unshift(getRandomSymbol());
        }
        return filtered;
      });
      await new Promise(res => setTimeout(res, 450));
      tumbleTotalDuration += tumbleDelay + 450;
    }
    // Final update
    setReels(tumbleReels.map(col => [...col]));
    setWinSymbols(tumbleWinSyms);
  
    if (tumbleTotal > 0) {
      setCredits(c => c + tumbleTotal);
      setLastWin(tumbleTotal);
      setDisplayMultiplier(lastMultiplierRef.current);
      playSound(winSound, true);
    }
  
    // Waterfall effect for initial spin (for visual consistency)
    for (let i = 0; i < COLS; i++) {
      setTimeout(() => {
        setSpinning(prev => {
          const arr = [...prev];
          arr[i] = true;
          return arr;
        });
        setReels(prev =>
          prev.map((r, idx) => (idx === i ? newReels[idx] : r))
        );
        setTimeout(() => {
          setSpinning(prev => {
            const arr = [...prev];
            arr[i] = false;
            return arr;
          });
        }, 800);
      }, i * 400);
    }
  
    // *** Delay if needed to make the total spin at least 7 seconds ***
    const elapsed = Date.now() - spinStart;
    const minSpinTime = 7000; // ms (7 seconds)
    if (elapsed < minSpinTime) {
      await new Promise(res => setTimeout(res, minSpinTime - elapsed));
    }
  
    setIsSpinning(false);
  
    // For autoplay: decrement count after the delay
    if (autoplayRef.current && autoplayCount > 0) {
      setAutoplayCount(c => c - 1);
    }
  }
  

  function handleBetChange(amount) {
    setCurrentBet(bet => {
      let newBet = bet + amount;
      if (newBet < MIN_BET) newBet = MIN_BET;
      if (newBet > MAX_BET) newBet = MAX_BET;
      return newBet;
    });
  }

  function handleBetInput(e) {
    let value = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || MIN_BET;
    if (value < MIN_BET) value = MIN_BET;
    if (value > MAX_BET) value = MAX_BET;
    setCurrentBet(value);
  }

  return (
    <div className="slot-machine-outer">
      <div className="slot-machine-main">
        {/* Left Panel */}
        <div className="slot-panel">
          <button style={{
            background: 'linear-gradient(90deg,#00eaff,#00bfff)',
            color: '#fff', fontWeight: 'bold', borderRadius: 8, border: 'none',
            fontSize: 18, padding: '10px 18px', marginBottom: 10
          }}>BUY FREE SPINS<br /><span style={{fontSize: 14}}>Rp20,000.00</span></button>
          <div style={{margin: "30px 0 0 0", textAlign: "center", width: '100%'}}>
            <div style={{fontSize: 22, color: '#ffd700'}}>BET</div>
            <div style={{fontSize: 20, color: "#fff", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
              <button onClick={() => handleBetChange(-20)} style={{fontSize: 18, width: 32, height: 32, borderRadius: 8, border: 'none', background: '#333', color: '#fff', fontWeight: 'bold', cursor: 'pointer'}}>-</button>
              <input type="text" value={currentBet} onChange={handleBetInput} style={{width: 80, textAlign: 'center', fontSize: 18, borderRadius: 6, border: '1px solid #ffd700', background: '#222', color: '#ffd700', fontWeight: 'bold'}} />
              <button onClick={() => handleBetChange(20)} style={{fontSize: 18, width: 32, height: 32, borderRadius: 8, border: 'none', background: '#333', color: '#fff', fontWeight: 'bold', cursor: 'pointer'}}>+</button>
            </div>
            <div style={{fontSize: 13, marginTop: 8, color: "#fff"}}>DOUBLE CHANCE TO WIN FEATURE</div>
            <div style={{marginTop: 4}}>
              <span style={{
                background: '#222', color: '#fff', borderRadius: 8, padding: '2px 12px', fontWeight: 'bold'
              }}>OFF</span>
            </div>
          </div>
          {/* Autoplay Controls */}
          <div style={{ marginTop: 24, width: '100%', textAlign: 'center' }}>
            <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>AUTOPLAY</div>
            <select
              value={autoplaySetting}
              onChange={e => setAutoplaySetting(Number(e.target.value))}
              style={{ fontSize: 16, borderRadius: 6, padding: '4px 12px', marginBottom: 6 }}
              disabled={isSpinning || autoplayCount > 0}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <button
              onClick={() => {
                if (autoplayCount > 0) {
                  setAutoplayCount(0); // Stop autoplay
                } else {
                  setAutoplayCount(autoplaySetting); // Start autoplay
                }
              }}
              style={{
                marginLeft: 8,
                fontSize: 16,
                borderRadius: 6,
                padding: '4px 16px',
                background: autoplayCount > 0 ? '#e74c3c' : '#ffd700',
                color: autoplayCount > 0 ? '#fff' : '#4b2e00',
                fontWeight: 'bold',
                border: 'none',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                marginTop: 4
              }}
              disabled={isSpinning}
            >
              {autoplayCount > 0 ? 'STOP' : 'START'}
            </button>
            {autoplayCount > 0 && (
              <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: 14, marginTop: 4 }}>
                {autoplayCount} left
              </div>
            )}
          </div>
          {/* Spin Button - now inside left panel */}
          <button
            className="spin-btn"
            onClick={handleSpin}
            disabled={isSpinning}
            style={{
              marginTop: 32,
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: isSpinning ? "radial-gradient(circle, #bbb 60%, #888 100%)" : "radial-gradient(circle, #ffd700 60%, #ff9800 100%)",
              boxShadow: "0 0 24px #ffd70088",
              fontSize: "2.5rem",
              fontWeight: "bold",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s",
              zIndex: 10,
              cursor: isSpinning ? "not-allowed" : "pointer"
            }}
          >
            <span style={{
              display: "inline-block",
              animation: isSpinning ? "spin-rotate 1s linear infinite" : "none"
            }}>
              ⟳
            </span>
          </button>
        </div>
        {/* Center Reels and Banner */}
        <div className="slot-center">
          <div className="spin-banner">SPIN TO WIN!</div>
          {/* Animated Win Display */}
          {displayWin > 0 && (
            <div className="win-display">
              WIN Rp{displayWin.toLocaleString()}
              {displayMultiplier > 1 && (
                <span style={{ fontSize: 30, color: '#0a0', marginLeft: 18, fontWeight: 900 }}>
                  × {displayMultiplier}
                </span>
              )}
            </div>
          )}
          <div className="reels-row">
            {reels.map((symbols, colIdx) => (
              <div key={colIdx} className="reel-border">
                <Reel symbols={symbols} spinning={spinning[colIdx]} winSymbols={winSymbols} />
              </div>
            ))}
          </div>
        </div>
        {/* Right Panel */}
        <div className="slot-panel">
          <div style={{
            fontSize: 28,
            color: '#ffd700',
            textAlign: 'center',
            marginBottom: 30
          }}>
            Gates of<br />OLYMPUS<br /><span style={{fontSize: 18}}>1000</span>
          </div>
          <div style={{
            width: 120, height: 220, background: 'rgba(255,255,255,0.05)', borderRadius: 16,
            margin: '0 auto', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {/* Placeholder for Zeus image */}
            <span role="img" aria-label="zeus" style={{fontSize: 90}}>⚡</span>
          </div>
        </div>
      </div>
      {/* Credit Bar - always bottom, full width */}
      <div className="credit-bar">
        CREDIT Rp{credits.toLocaleString()} &nbsp; | &nbsp; BET Rp{currentBet.toLocaleString()}
      </div>
      {isFreeSpins && (
        <div style={{
          position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "#00eaff", color: "#fff", fontWeight: "bold", fontSize: 20,
          padding: "8px 20px", borderRadius: 16, zIndex: 20, boxShadow: "0 0 16px #00eaff88"
        }}>
          FREE SPINS! {freeSpinsLeft} LEFT
        </div>
      )}
      {/* Responsive CSS from user */}
      <style>{`
/* Desktop: >900px (default) */
.slot-machine-main {
  display: flex;
  flex-direction: row;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 0;
  justify-content: center;
  align-items: flex-start;
  gap: 18px;
}
.slot-panel {
  width: 210px;
  min-width: 170px;
  background: rgba(40,0,40,0.7);
  border-radius: 16px;
  padding: 14px 10px;
  box-sizing: border-box;
  color: #ffd700;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.slot-center {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.reels-row {
  display: flex;
  flex-direction: row;
  gap: 14px;
  margin: 30px 0 0 0;
}
.reel-border {
  border: 4px solid gold;
  border-radius: 16px;
  box-shadow: 0 0 16px gold, 0 0 8px #fff4;
  background: rgba(40,0,40,0.7);
  padding: 4px 2px;
  min-width: 62px;
  max-width: 70px;
  min-height: 252px;
  max-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}
.symbol-img {
  width: 46px;
  height: 46px;
  object-fit: contain;
  margin: 2px 0;
  border-radius: 10px;
}
.spin-btn {
  position: fixed;
  right: 60px;
  bottom: 60px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffd700 60%, #ff9800 100%);
  box-shadow: 0 0 24px #ffd70088;
  font-size: 2.5rem;
  font-weight: bold;
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  z-index: 10;
}
.spin-btn:active { transform: scale(0.95); }
.credit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(40,0,40,0.92);
  color: #ffd700;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
  padding: 9px 0 4px 0;
  letter-spacing: 1px;
  z-index: 99;
  box-shadow: 0 -2px 12px #000a;
}

/* Tablet: 600–900px */
@media (max-width: 900px) {
  .slot-machine-main {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 6px 0;
    max-width: 100vw;
  }
  .slot-panel {
    width: 100%;
    min-width: 0;
    margin: 0 0 10px 0;
    min-height: unset;
    padding: 10px 6px;
    font-size: 16px;
  }
  .slot-center {
    min-width: 0;
    width: 100%;
    padding: 0;
    font-size: 14px;
  }
  .reels-row {
    gap: 6px;
    justify-content: center;
  }
  .reel-border {
    min-width: 36px;
    max-width: 50px;
    min-height: 120px;
    max-height: 180px;
    padding: 2px 0;
    border-radius: 10px;
  }
  .symbol-img {
    width: 24px;
    height: 24px;
    border-radius: 5px;
  }
  .spin-btn {
    left: 50%;
    right: unset;
    bottom: 60px;
    transform: translateX(-50%);
    width: 52px;
    height: 52px;
    font-size: 1.3rem;
  }
  .credit-bar {
    font-size: 14px;
    padding: 5px 0 2px 0;
  }
}

/* Small: 480–600px */
@media (max-width: 600px) {
  .slot-machine-main {
    gap: 4px;
    padding: 2px 0;
  }
  .slot-panel {
    font-size: 14px;
    padding: 6px 2px;
  }
  .reels-row {
    gap: 2px;
    margin: 10px 0 0 0;
  }
  .reel-border {
    min-width: 28px;
    max-width: 34px;
    min-height: 80px;
    max-height: 120px;
    padding: 1px 0;
    border-radius: 7px;
  }
  .symbol-img {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    margin: 1px 0;
  }
  .spin-btn {
    width: 36px;
    height: 36px;
    font-size: 1.2rem;
    bottom: 48px !important;
  }
  .credit-bar {
    font-size: 11px;
    padding: 3px 0 1px 0;
  }
}

/* Ultra Small: <360px */
@media (max-width: 360px) {
  .slot-panel {
    display: none;
  }
  .reels-row {
    margin-top: 3px;
  }
}

/* Always allow vertical scroll on tiny screens */
.slot-machine-outer {
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}
      `}</style>
    </div>
  );
}
