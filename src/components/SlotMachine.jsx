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
  const MIN_BET = 20;
  const MAX_BET = 100000;
  const winAudioRef = useRef(null);
  const lastMultiplierRef = useRef(1);

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
    if (!isFreeSpins) setCredits(c => c - currentBet);
    playSound(spinSound);

    let newReels = Array.from({ length: COLS }, () => makeReelSymbols());
    let flat = newReels.flat();
    // --- WAYS PAYS LOGIC WITH MULTIPLIER ---
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
      const { totalPayout: tumblePayout, winSyms: tumbleSyms, multiplier: tumbleMultiplier } = calculateWaysPayoutWithMultiplier(flatTumble, currentBet);
      if (tumbleSyms.length === 0) break;
      tumbleCount++;
      tumbleTotal += tumblePayout;
      tumbleWinSyms = tumbleSyms;
      // Animate the tumble
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

    // Update credits with winnings
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

    setIsSpinning(false);
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
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      position: "relative",
      background: "linear-gradient(180deg, #888 0%, #444 100%)"
    }}>
      <div className="slot-bg" />
      <div style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(0,0,0,0.5)",
        borderRadius: 24,
        boxShadow: "0 0 32px #000a",
        padding: 24,
        zIndex: 2,
        minWidth: 1100
      }}>
        {/* Left Panel */}
        <div style={{
          width: 200,
          marginRight: 24,
          background: "rgba(40,0,40,0.7)",
          borderRadius: 16,
          padding: 16,
          color: "#ffd700",
          fontWeight: "bold",
          minHeight: 500,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
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
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", minWidth: 500}}>
          <div style={{
            background: "linear-gradient(90deg, #ffd700 60%, #ff9800 100%)",
            color: "#4b2e00",
            fontSize: "2rem",
            fontWeight: "bold",
            padding: "8px 40px",
            borderRadius: "0 0 18px 18px",
            boxShadow: "0 4px 16px #ffd70044",
            letterSpacing: "2px",
            marginBottom: 12
          }}>
            SPIN TO WIN!
          </div>
          {/* Animated Win Display */}
          {displayWin > 0 && (
            <div style={{
              position: "absolute",
              top: 80,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#ffd700",
              color: "#4b2e00",
              fontWeight: "bold",
              fontSize: 38,
              padding: "10px 60px",
              borderRadius: 18,
              zIndex: 30,
              boxShadow: "0 0 24px #ffd70088",
              animation: "win-pop 0.7s cubic-bezier(.68,-0.55,.27,1.55)"
            }}>
              WIN Rp{displayWin.toLocaleString()}
              {displayMultiplier > 1 && (
                <span style={{ fontSize: 30, color: '#0a0', marginLeft: 18, fontWeight: 900 }}>
                  × {displayMultiplier}
                </span>
              )}
            </div>
          )}
          <div style={{display: "flex", flexDirection: "row", gap: 18, marginTop: 24}}>
            {reels.map((symbols, colIdx) => (
              <div key={colIdx} style={{
                border: "4px solid gold",
                borderRadius: 16,
                boxShadow: "0 0 16px gold, 0 0 8px #fff4",
                background: "rgba(40,0,40,0.7)",
                padding: "4px 2px",
                minWidth: 76,
                minHeight: 432,
                maxHeight: 432,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
                <Reel symbols={symbols} spinning={spinning[colIdx]} winSymbols={winSymbols} />
              </div>
            ))}
          </div>
        </div>
        {/* Right Panel */}
        <div style={{
          width: 200,
          marginLeft: 24,
          background: "rgba(40,0,40,0.7)",
          borderRadius: 16,
          padding: 16,
          color: "#ffd700",
          fontWeight: "bold",
          minHeight: 500,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
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
      {/* Credit Bar - move to bottom center and style */}
      <div className="credit-bar" style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.7)",
        color: "#fff",
        fontWeight: "bold",
        fontSize: 22,
        padding: "10px 40px",
        borderRadius: 16,
        zIndex: 20,
        boxShadow: "0 0 16px #000a"
      }}>
        CREDIT Rp{credits.toLocaleString()} &nbsp; | &nbsp; BET Rp{currentBet.toLocaleString()}
      </div>
      {isFreeSpins && (
        <div style={{
          position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "#00eaff", color: "#fff", fontWeight: "bold", fontSize: 28,
          padding: "10px 40px", borderRadius: 16, zIndex: 20, boxShadow: "0 0 16px #00eaff88"
        }}>
          FREE SPINS! {freeSpinsLeft} LEFT
        </div>
      )}
    </div>
  );
}
