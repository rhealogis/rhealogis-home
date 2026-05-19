import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, Package, Globe, ShoppingCart, Box, Container, Plane, Ship, Home, Shield, Search, Star, Building, Layout, Heart, Users, MapPin, Key } from 'lucide-react';

const TRADE_WORDS = [
  { en: 'Logistics', jp: '物流', icon: Truck },
  { en: 'Trade', jp: '貿易', icon: Globe },
  { en: 'Global', jp: 'グローバル', icon: Globe },
  { en: 'Shipping', jp: '船積', icon: Ship },
  { en: 'Cargo', jp: '貨物', icon: Box },
  { en: 'Export', jp: '輸出', icon: Plane },
  { en: 'Import', jp: '輸入', icon: Container },
  { en: 'Supply Chain', jp: 'サプライチェーン', icon: Truck },
  { en: 'Freight', jp: '運賃', icon: Box },
  { en: 'Customs', jp: '通関', icon: Package },
  { en: 'Forwarding', jp: 'フォワーディング', icon: Ship },
  { en: 'Warehouse', jp: '倉庫', icon: Box },
  { en: 'Air Freight', jp: '航空貨物', icon: Plane },
  { en: 'Ocean Freight', jp: '海上貨物', icon: Ship },
];

const STAY_WORDS = [
  { en: 'Housing', jp: '住宅', icon: Home },
  { en: 'Rental', jp: '賃貸', icon: Key },
  { en: 'Management', jp: '管理', icon: Layout },
  { en: 'Interior', jp: '内装', icon: Layout },
  { en: 'Security', jp: '警備', icon: Shield },
  { en: 'Stay', jp: '滞在', icon: Home },
  { en: 'Tokyo', jp: '東京', icon: MapPin },
  { en: 'Seoul', jp: 'ソウル', icon: MapPin },
  { en: 'Lifestyle', jp: '生活', icon: Heart },
  { en: 'Smart Home', jp: 'スマート', icon: Star },
  { en: 'Amenities', jp: '設備', icon: Star },
  { en: 'Modern', jp: 'モダン', icon: Layout },
  { en: 'Comfort', jp: '快適', icon: Heart },
  { en: 'Residence', jp: '住居', icon: Building },
];

const COLORS = [
  { text: 'text-cyan-400', glow: 'rgba(34, 211, 238, 1)', bg: 'bg-cyan-500/30' },
  { text: 'text-fuchsia-400', glow: 'rgba(232, 121, 249, 1)', bg: 'bg-fuchsia-500/30' },
  { text: 'text-yellow-400', glow: 'rgba(250, 204, 21, 1)', bg: 'bg-yellow-500/30' },
  { text: 'text-lime-400', glow: 'rgba(163, 230, 53, 1)', bg: 'bg-lime-500/30' },
  { text: 'text-orange-400', glow: 'rgba(251, 146, 60, 1)', bg: 'bg-orange-500/30' },
  { text: 'text-pink-400', glow: 'rgba(244, 114, 182, 1)', bg: 'bg-pink-500/30' },
  { text: 'text-blue-400', glow: 'rgba(59, 130, 246, 1)', bg: 'bg-blue-500/30' },
  { text: 'text-emerald-400', glow: 'rgba(52, 211, 153, 1)', bg: 'bg-emerald-500/30' },
];

const SHAPES = ['circle', 'square', 'triangle', 'hexagon'];

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  size: number;
  shape: string;
  word: { en: string; jp: string; icon: any };
  color: { text: string; glow: string; bg: string };
  duration: number;
  delay: number;
}

interface FloatingBackgroundProps {
  view?: 'home' | 'notice' | 'rhea-stay';
}

export const FloatingBackground: React.FC<FloatingBackgroundProps> = ({ view = 'home' }) => {
  const [shapes, setShapes] = useState<FloatingShape[]>([]);

  useEffect(() => {
    const generateShapes = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      
      // Adjust count based on device
      const count = isMobile ? 15 : isTablet ? 30 : 50;
      // Adjust size based on device
      const baseSize = isMobile ? 60 : isTablet ? 80 : 90;
      const sizeVar = isMobile ? 30 : isTablet ? 35 : 40;

      const words = view === 'rhea-stay' ? STAY_WORDS : TRADE_WORDS;

      const newShapes: FloatingShape[] = [];
      for (let i = 0; i < count; i++) {
        newShapes.push({
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * sizeVar + baseSize,
          shape: SHAPES[i % SHAPES.length],
          word: words[i % words.length],
          color: COLORS[i % COLORS.length],
          duration: Math.random() * 25 + 25,
          delay: Math.random() * -50,
        });
      }
      setShapes(newShapes);
    };

    generateShapes();
    
    // Optional: Re-generate on resize if needed, but usually mount is enough for background
    const handleResize = () => {
      // Debounce or just ignore if performance is a concern
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#020202]">
      <AnimatePresence>
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1, 1, 0.6],
              left: [`${shape.x}%`, `${(shape.x + 20) % 100}%`, `${(shape.x - 20) % 100}%`, `${shape.x}%`],
              top: [`${shape.y}%`, `${(shape.y - 25) % 100}%`, `${(shape.y + 25) % 100}%`, `${shape.y}%`],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              delay: shape.delay,
              ease: "linear",
            }}
            className="absolute flex items-center justify-center"
            style={{
              width: shape.size,
              height: shape.size,
            }}
          >
            {/* 3D-like Shape Container */}
            <div className={`relative w-full h-full flex items-center justify-center`}>
              {/* Main Shape with 3D depth effect and Strong Glow */}
              <div 
                className={`absolute inset-0 opacity-90 rounded-2xl ${shape.color.bg} border-2 border-white/50 shadow-[0_0_40px_${shape.color.glow}]`}
                style={{
                  borderRadius: shape.shape === 'circle' ? '50%' : shape.shape === 'triangle' ? '0' : '20px',
                  clipPath: shape.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : shape.shape === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : 'none',
                  transform: 'perspective(600px) rotateX(25deg) rotateY(25deg)',
                  boxShadow: `0 0 35px ${shape.color.glow}, inset 0 0 20px rgba(255,255,255,0.4)`,
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-2">
                {shape.word.icon && (
                  <shape.word.icon className={`${shape.color.text} opacity-40 mb-1`} size={18} />
                )}
                <motion.span 
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`text-[13px] md:text-[14px] font-black uppercase tracking-tighter ${shape.color.text} drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] leading-none mb-1`}
                >
                  {shape.word.en}
                </motion.span>
                <motion.span 
                  className="text-[11px] md:text-[12px] font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,1)] leading-none"
                >
                  {shape.word.jp}
                </motion.span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-[#0d0d0d] opacity-60"></div>
    </div>
  );
};
