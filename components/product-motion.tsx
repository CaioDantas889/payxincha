'use client';
import { useState } from 'react';

export function ProductMotion() {
  const [paused, setPaused] = useState(false);
  return <div className={`sale-product-photo product-motion${paused ? ' is-paused' : ''}`}>
    <span className="product-word" aria-hidden="true">É SUA.</span>
    <img src="/assets/terminal-payxincha.png" alt="Maquininha Payxincha amarela com tela e teclado" width="1149" height="1369" loading="lazy" />
    <span className="product-sticker">NÃO É PEGADINHA.<br /><strong>90% OFF</strong></span>
    <button className="motion-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '▶ Reproduzir animação' : 'Ⅱ Pausar animação'}</button>
    <span className="product-caption">IMAGEM ILUSTRATIVA · PAYXINCHA</span>
  </div>;
}
