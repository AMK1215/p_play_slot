// src/components/Symbol.jsx
import React from 'react';

export default function Symbol({ imgSrc, alt = '' }) {
  return (
    <div
      style={{
        width: 60,
        height: 60,
        margin: '0 auto 10px',
        background: '#222',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #fff1',
        boxShadow: '0 1px 8px #0002',
      }}
    >
      <img
        src={imgSrc}
        alt={alt}
        style={{ width: 44, height: 44, objectFit: 'contain' }}
      />
    </div>
  );
}
