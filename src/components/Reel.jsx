import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SYMBOL_SIZE = 70; // px
const ROWS = 6;

export default function Reel({ symbols, spinning, winSymbols }) {
  const [displayed, setDisplayed] = useState(symbols);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (spinning) {
      setRolling(true);
      setTimeout(() => {
        setDisplayed(symbols);
        setRolling(false);
      }, 400); // Animation duration
    } else if (symbols.join() !== displayed.join()) {
      setDisplayed(symbols);
    }
    // eslint-disable-next-line
  }, [symbols, spinning]);

  return (
    <div
      style={{
        height: SYMBOL_SIZE * ROWS,
        width: SYMBOL_SIZE + 8,
        overflow: "hidden",
        position: "relative",
        background: "rgba(0,0,0,0.2)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <motion.div
        key={rolling ? "rolling" : "static"}
        initial={{ y: rolling ? -SYMBOL_SIZE : 0 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.17, 0.67, 0.83, 0.67] }}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {displayed.map((imgSrc, i) => (
          <motion.img
            src={imgSrc}
            alt=""
            className="symbol-img"
            key={i}
            style={{
              width: SYMBOL_SIZE,
              height: SYMBOL_SIZE,
              objectFit: "contain",
              margin: "0 auto",
              display: "block",
              filter: winSymbols && winSymbols.includes(imgSrc) ? "drop-shadow(0 0 16px #ffd700) brightness(1.3)" : undefined,
            }}
            animate={winSymbols && winSymbols.includes(imgSrc) ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={winSymbols && winSymbols.includes(imgSrc) ? { repeat: Infinity, duration: 0.6 } : {}}
          />
        ))}
      </motion.div>
    </div>
  );
}