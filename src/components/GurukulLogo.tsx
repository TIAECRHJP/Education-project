/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Quote, BookOpen } from 'lucide-react';
import { UILanguage } from '../types';

export const GURUKUL_QUOTES = [
  {
    sanskrit: 'सा विद्या या विमुक्तये',
    hindi: 'सच्ची विद्या वही है जो अज्ञान और संकोच के बंधनों से मुक्ति दिलाए।',
    english: 'True knowledge is that which liberates the mind and unlocks human potential.',
    author: 'विष्णु पुराण (Vishnu Purana)'
  },
  {
    sanskrit: 'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते',
    hindi: 'इस संसार में ज्ञान के समान पवित्र और कल्याणकारी कुछ भी नहीं है।',
    english: 'In this world, there is nothing as purifying and elevating as wisdom.',
    author: 'श्रीमद्भगवद्गीता (Bhagavad Gita 4.38)'
  },
  {
    sanskrit: 'तमसो मा ज्योतिर्गमय',
    hindi: 'हमें अंधकार, भ्रम और अज्ञान से प्रकाश व ज्ञान की ओर ले चलें।',
    english: 'Lead us from darkness unto light, from ignorance to true understanding.',
    author: 'बृहदारण्यक उपनिषद् (Brihadaranyaka Upanishad)'
  },
  {
    sanskrit: 'ज्ञान की जड़ें, कल के पंख',
    hindi: 'जब बच्चों के ज्ञान की जड़ें मजबूत होंगी, तभी उनके सपनों को कल के पंख मिलेंगे।',
    english: 'Roots of knowledge, wings of tomorrow: empowering every student and teacher.',
    author: 'गुरुकुल AI ध्येय वाक्य (Gurukul AI Motto)'
  },
  {
    sanskrit: 'उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत',
    hindi: 'उठो, जागो और तब तक मत रुको जब तक लक्ष्य की प्राप्ति न हो जाए।',
    english: 'Arise, awake, and stop not until the noble goal of learning is reached.',
    author: 'कठोपनिषद् / स्वामी विवेकानंद'
  }
];

interface GurukulLogoProps {
  uiLang?: UILanguage;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const GurukulLogo: React.FC<GurukulLogoProps> = ({
  uiLang = 'en',
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconDim = isSm ? 'w-8 h-8' : isLg ? 'w-14 h-14' : 'w-11 h-11';
  const titleSize = isSm ? 'text-base' : isLg ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl';

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Books mark for learning and education */}
      <div className={`relative ${iconDim} rounded-2xl p-1.5 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 border border-amber-300/60`}>
        <BookOpen className="w-full h-full text-white drop-shadow-md" strokeWidth={2.2} aria-hidden="true" />

        {/* Glow Spark */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full animate-ping opacity-75" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span className={`font-black tracking-tight ${titleSize} bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent filter drop-shadow-sm`}>
            {uiLang === 'hi' ? 'गुरुकुल AI' : 'Gurukul AI'}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
            {uiLang === 'hi' ? 'बिहार शिक्षा' : 'Bihar Edu'}
          </span>
        </div>

        {showTagline && (
          <p className="text-[11px] font-medium text-amber-200/80 tracking-wide line-clamp-1">
            {uiLang === 'hi' ? 'ज्ञान की जड़ें, कल के पंख' : 'Roots of Knowledge, Wings of Tomorrow'}
          </p>
        )}
      </div>
    </div>
  );
};

// Rotator banner for educational quotes
export const GurukulQuotesBanner: React.FC<{ uiLang: UILanguage }> = ({ uiLang }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % GURUKUL_QUOTES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const current = GURUKUL_QUOTES[index];

  return (
    <div className="backdrop-blur-xl bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 shadow-xl text-white transition-all duration-500">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 shrink-0 mt-0.5">
          <Quote className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black font-serif tracking-wide text-amber-300">
              &ldquo;{current.sanskrit}&rdquo;
            </span>
            <span className="text-[10px] text-amber-400/70 font-mono">
              {current.author}
            </span>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {uiLang === 'hi' ? current.hindi : current.english}
          </p>
        </div>
      </div>
    </div>
  );
};
