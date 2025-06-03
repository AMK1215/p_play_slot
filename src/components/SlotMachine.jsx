// src/components/SlotMachine.jsx
import React, { useState } from "react";
import Reel from "./Reel";

// Import your images and sounds
import yellowGem from "../assets/items/yellow_gem.png";
import ring from "../assets/items/gold_ring_with_red_gem.png";
import blueGem from "../assets/items/blue_diamoon.png";
import greenTriangle from "../assets/items/green_triangle.png";
import purpleTriangle from "../assets/items/purple_triangle.png";
import hourglass from "../assets/items/house_glass.png";
import scatter from "../assets/items/scatter.png";
import winSound from "../assets/sounds/noti.wav";
import spinSound from "../assets/sounds/noti.wav";
import freeSpinsSound from "../assets/sounds/noti.wav";

const SYMBOLS = [
  yellowGem, ring, blueGem, greenTriangle, purpleTriangle, hourglass, scatter
];

const ROWS = 6;
const COLS = 5;

function getRandomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}
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

export default function SlotMachine() {
  const [reels, setReels] = useState(Array.from({ length: COLS }, () => makeReelSymbols()));
  const [spinning, setSpinning] = useState(Array(COLS).fill(false));
  const [credits, setCredits] = useState(10000);
  const [winSymbols, setWinSymbols] = useState([]);
  const [isFreeSpins, setIsFreeSpins] = useState(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);

  function playSound(src) {
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play();
  }

  function handleSpin() {
    if (!isFreeSpins) setCredits(c => c - 200);
    playSound(spinSound);

    let newReels = Array.from({ length: COLS }, () => makeReelSymbols());
    let flat = newReels.flat();
    let counts = countSymbols(flat);

    // Win detection: 8+ of the same symbol
    let winSyms = [];
    Object.entries(counts).forEach(([sym, count]) => {
      if (count >= 8 && sym !== scatter) {
        winSyms.push(sym);
      }
    });

    // Free spins detection: 4+ scatters
    let scatterCount = counts[scatter] || 0;
    if (scatterCount >= 4) {
      setIsFreeSpins(true);
      setFreeSpinsLeft(10); // e.g., 10 free spins
      playSound(freeSpinsSound);
    }

    setWinSymbols(winSyms);
    if (winSyms.length > 0) playSound(winSound);

    // Waterfall effect
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
        }, 400);
      }, i * 180);
    }

    // Free spins logic
    if (isFreeSpins && freeSpinsLeft > 1) {
      setTimeout(() => {
        setFreeSpinsLeft(freeSpinsLeft - 1);
        handleSpin();
      }, 2000);
    } else if (isFreeSpins && freeSpinsLeft === 1) {
      setTimeout(() => {
        setIsFreeSpins(false);
        setFreeSpinsLeft(0);
      }, 2000);
    }
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      position: "relative"
    }}>
      <div className="slot-bg" />
      <div style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(0,0,0,0.5)",
        borderRadius: 24,
        boxShadow: "0 0 32px #000a",
        padding: 24,
        zIndex: 2
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
          <div style={{margin: "30px 0 0 0", textAlign: "center"}}>
            <div style={{fontSize: 22, color: '#ffd700'}}>BET</div>
            <div style={{fontSize: 20, color: "#fff"}}>Rp200.00</div>
            <div style={{fontSize: 13, marginTop: 8, color: "#fff"}}>DOUBLE CHANCE TO WIN FEATURE</div>
            <div style={{marginTop: 4}}>
              <span style={{
                background: '#222', color: '#fff', borderRadius: 8, padding: '2px 12px', fontWeight: 'bold'
              }}>OFF</span>
            </div>
          </div>
        </div>
        {/* Center Reels and Banner */}
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
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
          <div style={{display: "flex", flexDirection: "row", gap: 18}}>
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
      {/* Spin Button */}
      <button
        className="spin-btn"
        onClick={handleSpin}
        style={{
          position: "fixed",
          right: 60,
          bottom: 60,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "radial-gradient(circle, #ffd700 60%, #ff9800 100%)",
          boxShadow: "0 0 24px #ffd70088",
          fontSize: "2.5rem",
          fontWeight: "bold",
          border: "none",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
          zIndex: 10
        }}
      >⟳</button>
      {/* Credit Bar */}
      <div className="credit-bar">
        CREDIT Rp{credits.toLocaleString()} &nbsp; | &nbsp; BET Rp200.00
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
