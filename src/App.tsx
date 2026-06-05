import React, { useState, useEffect } from 'react';
import { Truck, Package, Globe, ShoppingCart, ChevronRight, Mail, Phone, MapPin, Menu, X, Video, ArrowRight, ArrowLeft, Box, Container, Plane, Home, Shield, Search, Star, Building, Layout, Heart, Users } from 'lucide-react';
import { FloatingBackground } from './components/FloatingBackground';
import { db, auth } from './firebase';

const LogoSVG = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M 25 75 A 35 35 0 1 1 75 75" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    <path d="M 25 75 C 25 30, 45 35, 60 45" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    <polygon points="50,30 70,45 50,60" fill="currentColor" />
    <path d="M 35 25 L 55 25 C 75 25, 75 55, 55 55 L 45 55" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 50 55 L 75 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
  </svg>
);

export default function App() {
  const [imgError, setImgError] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'notice' | 'rhea-stay'>('home');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [flyDistance, setFlyDistance] = useState({ x: 0, y: 0 });
  const logoRef = React.useRef<HTMLDivElement>(null);
  const homeRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const calculateDistance = () => {
      if (logoRef.current) {
        const logoRect = logoRef.current.getBoundingClientRect();
        // Default target is near the right edge of the screen (hamburger menu area)
        let endX = window.innerWidth - 80;
        
        if (homeRef.current) {
          const homeRect = homeRef.current.getBoundingClientRect();
          // If the desktop home button is visible, fly to it
          if (homeRect.width > 0 && homeRect.left > 0) {
            endX = homeRect.left - 24;
          }
        }
        
        const startX = logoRect.right + 8;
        const x = Math.max(50, endX - startX); // Ensure at least some movement
        const y = 0; 
        
        setFlyDistance({ x, y });
      }
    };

    calculateDistance();
    window.addEventListener('resize', calculateDistance);
    return () => window.removeEventListener('resize', calculateDistance);
  }, []);

  const handleNavClick = (view: 'home' | 'notice' | 'rhea-stay', hash?: string) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      <FloatingBackground view={currentView} />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-white/10 z-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer relative" onClick={() => handleNavClick('home')} ref={logoRef}>
          {(!imgError && currentView !== 'rhea-stay') ? (
            <img 
              src="/logo.png" 
              alt="Rhea Logo" 
              className="h-8 sm:h-10 md:h-12 object-contain bg-white/90 rounded p-1" 
              onError={() => setImgError(true)} 
            />
          ) : (
            <LogoSVG className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          )}
          <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">RHEA {currentView === 'rhea-stay' ? 'STAY' : 'LOGIS'}</span>
          
          {/* Flying Product Icon */}
          <div 
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 animate-logo-fly"
            style={{ 
              '--fly-x': `${flyDistance.x}px`, 
              '--fly-y': `${flyDistance.y}px` 
            } as React.CSSProperties}
          >
            {currentView === 'rhea-stay' ? (
              <Home className="text-white" size={18} />
            ) : (
              <Package className="text-white" size={18} />
            )}
          </div>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex gap-8 text-sm font-medium text-gray-300">
            <li><button ref={homeRef} onClick={() => handleNavClick('home', 'home')} className="hover:text-[#8a2be2] transition-colors">Home</button></li>
            <li><button onClick={() => handleNavClick('home', 'about')} className="hover:text-[#8a2be2] transition-colors">About</button></li>
            <li><button onClick={() => handleNavClick('home', 'business')} className="hover:text-[#8a2be2] transition-colors">Business</button></li>
            <li><button onClick={() => handleNavClick('notice')} className="hover:text-[#8a2be2] transition-colors">Notice</button></li>
            <li><button onClick={() => handleNavClick('home', 'contact')} className="hover:text-[#8a2be2] transition-colors">Contact</button></li>
            <li><button onClick={() => handleNavClick('rhea-stay')} className="hover:text-[#8a2be2] font-bold transition-colors">RHEA STAY</button></li>
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-300 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] sm:top-[73px] bg-black/95 z-40 md:hidden overflow-y-auto">
          <nav className="flex flex-col items-center justify-start min-h-full py-10 gap-8 text-xl font-bold text-white">
            <button onClick={() => handleNavClick('home', 'home')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5">Home</button>
            <button onClick={() => handleNavClick('home', 'about')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5">About</button>
            <button onClick={() => handleNavClick('home', 'business')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5">Business</button>
            <button onClick={() => handleNavClick('notice')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5">Notice</button>
            <button onClick={() => handleNavClick('home', 'contact')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5">Contact</button>
            <button onClick={() => handleNavClick('rhea-stay')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5 font-bold">RHEA STAY</button>
          </nav>
        </div>
      )}

      {currentView === 'home' ? (
        <>
          {/* Hero Section */}
          <section id="home" className="relative min-h-[60vh] sm:h-screen flex flex-col justify-center items-center text-center px-4 pt-12 landscape:pt-24 sm:pt-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0d0d0d]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto mt-4 landscape:mt-16 sm:mt-20">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-6 leading-tight">
            Selling Beyond Borders <br />
            <span className="text-[#8a2be2]">Global E-commerce & Product Sales</span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-10 max-w-3xl mx-auto px-4">
            전자상거래를 통해 다양한 상품을 전 세계 고객에게 판매합니다.
          </p>
          <a href="#business" className="inline-flex items-center gap-2 bg-[#8a2be2] hover:bg-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-medium transition-all transform hover:scale-105 text-sm sm:text-base">
            Our Business <ChevronRight size={20} />
          </a>
        </div>
      </section>

      {/* Business Section */}
      <section id="business" className="py-8 landscape:py-20 sm:py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-6 landscape:mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Business Areas</h2>
          <p className="text-gray-400 text-sm sm:text-base">레아 로지스의 핵심 사업 영역을 소개합니다.</p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Card 1 */}
          <div className="bg-[#1a1a1a] rounded-2xl border-b-4 border-transparent hover:border-[#8a2be2] hover:-translate-y-2 transition-all duration-300 group overflow-hidden shadow-xl shadow-purple-950/20">
            <div className="h-48 overflow-hidden">
              <img 
                src="https://picsum.photos/seed/luxury-shopping-mall/600/400" 
                alt="E-Commerce" 
                className="w-full h-full object-cover animate-slow-zoom group-hover:animate-none group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <ShoppingCart className="text-[#8a2be2] animate-slow-spin group-hover:animate-fast-spin" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">E-Commerce</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                전자 상거래를 통해 국내 및 해외의 고객에게 세계 각국의 다양하고 우수한 상품을 신속하게 공급합니다. 5가지 AI를 활용한 상품 소싱과 제품에 대한 정확하고 자세한 정보를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Stats Section */}
      <section id="about" className="py-6 landscape:py-20 sm:py-20 border-y border-white/5 bg-[#111]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 landscape:gap-10 sm:gap-12 text-center">
          <div>
            <div className="text-3xl sm:text-5xl font-bold text-[#8a2be2] mb-1">1st</div>
            <div className="text-gray-400 text-xs sm:text-base">Pioneering Innovation:<br/>Aiming to be the Leader in AI-Driven Business Automation.</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#8a2be2] mb-2">5+</div>
            <div className="text-gray-400">Scaling our Global Reach:<br/>Targeting Expansion into 5+ Strategic Markets.</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#8a2be2] mb-2">99%</div>
            <div className="text-gray-400">Driving Excellence:<br/>Targeting a 99% Customer Satisfaction Rate.</div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 landscape:py-24 sm:py-32 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          
          {/* Global Sales Flow Diagram */}
          <div className="mb-12 bg-[#1a1a1a] rounded-3xl p-6 sm:p-10 border border-white/5 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8a2be2]/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Globe className="text-[#8a2be2] animate-pulse" size={24} />
                <h3 className="text-xl font-bold tracking-tight">GLOBAL SALES FLOW</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                {/* Vertical Divider */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2"></div>
                
                {/* Left Side: Korea HQ */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <img src="https://flagcdn.com/w80/kr.png" alt="South Korea" className="w-6 h-auto opacity-80" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="text-xs text-[#8a2be2] font-bold uppercase tracking-wider">South Korea</div>
                      <div className="font-bold">KOREA HQ</div>
                      <div className="text-[10px] opacity-0 mt-0.5 select-none" aria-hidden="true">&nbsp;</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { target: 'JP', label: 'Sales to Japan', icon: <ArrowRight className="text-cyan-400" size={16} /> },
                      { target: 'US', label: 'Sales to USA', icon: <ArrowRight className="text-[#8a2be2]" size={16} /> },
                      { target: 'EU', label: 'Sales to Europe', icon: <ArrowRight className="text-emerald-400" size={16} /> }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group/item">
                        <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                            {item.icon}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-400 group-hover/item:text-white transition-colors">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right Side: Japan Branch & Markets */}
                <div className="space-y-8">
                  <div className="flex items-center justify-end gap-4">
                    <div className="text-right">
                      <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Japan</div>
                      <div className="font-bold">JAPAN BRANCH</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Scheduled to open at the end of 2027</div>
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <img src="https://flagcdn.com/w80/jp.png" alt="Japan" className="w-6 h-auto opacity-80" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { target: 'SK', label: 'Sales to South Korea', icon: <ArrowLeft className="text-[#8a2be2]" size={16} /> },
                      { target: 'US', label: 'Sales to USA', icon: <ArrowLeft className="text-orange-400" size={16} /> },
                      { target: 'EU', label: 'Sales to Europe', icon: <ArrowLeft className="text-emerald-400" size={16} /> }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group/item justify-end text-right">
                        <div className="text-sm font-medium text-gray-400 group-hover/item:text-white transition-colors">
                          {item.label}
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-l from-white/20 to-transparent relative">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                            {item.icon}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          
          <div id="contact" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-[#8a2be2]/30 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <MapPin className="text-[#8a2be2] animate-slow-spin group-hover:animate-fast-spin" size={24} />
              </div>
              <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">Address</div>
              <div className="text-gray-200 leading-relaxed">경기도 파주시 경의로 1092,<br/>808-A143</div>
            </div>

            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-[#8a2be2]/30 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <Phone className="text-[#8a2be2] animate-slow-spin group-hover:animate-fast-spin" size={24} />
              </div>
              <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">Customer Service</div>
              <div className="text-gray-200">82-10-2624-9489</div>
            </div>

            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-[#8a2be2]/30 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <Mail className="text-[#8a2be2] animate-slow-spin group-hover:animate-fast-spin" size={24} />
              </div>
              <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">Email</div>
              <div className="text-gray-200">rhealogis@gmail.com</div>
            </div>
          </div>
        </div>
      </section>
      </>
      ) : currentView === 'rhea-stay' ? (
        <div className="pt-20">
          {/* Rhea Stay Hero */}
          <section className="relative min-h-[70vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity scale-110 animate-slow-zoom"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#0d0d0d]/40 to-[#0d0d0d]"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-purple-400 mb-8 uppercase tracking-[0.2em] animate-fade-in">
                <Star size={14} className="fill-purple-400" />
                Seoul & Tokyo Premium Housing
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic">
                THE START OF <br />
                YOUR <span className="text-[#8a2be2] not-italic">URBAN LIFE</span> <br />
                AS YOURSELF
              </h1>
              <div className="text-sm sm:text-base text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                레아 스테이는 한국과 일본 도심에서 젊은 세대를 위한 편리한 주택 관리 서비스를 제공합니다.
              </div>
            </div>
          </section>

          {/* Why Rhea Stay */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight uppercase">Why RHEA STAY?</h2>
              <p className="text-gray-500 font-medium">우리가 추구하는 세 가지 핵심 가치</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl shadow-purple-900/40 hover:scale-110 transition-transform">
                  <MapPin className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold mb-4">Prime Location</h3>
                <div className="text-purple-400 text-xs font-bold mb-4 uppercase tracking-widest">(중심지 역세권)</div>
                <p className="text-gray-400 text-sm leading-relaxed">대학가, 오피스 타운과 인접한 중심부 주택관리 서비스를 제공합니다.</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl shadow-purple-900/40 hover:scale-110 transition-transform">
                  <Shield className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold mb-4">Safety & Clean</h3>
                <div className="text-purple-400 text-xs font-bold mb-4 uppercase tracking-widest">(안전과 청결)</div>
                <p className="text-gray-400 text-sm leading-relaxed">보안 및 시설 관리가 양호한 환경을 제공합니다.</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl shadow-purple-900/40 hover:scale-110 transition-transform">
                  <Heart className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold mb-4">For single-person households</h3>
                <div className="text-purple-400 text-xs font-bold mb-4 uppercase tracking-widest">(젊은 감각의 공간)</div>
                <p className="text-gray-400 text-sm leading-relaxed">1인 가구에게 편리한 관리 서비스를 제공합니다</p>
              </div>
            </div>
          </section>

          <div className="py-24 text-center">
            <button 
              onClick={() => handleNavClick('home')}
              className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 mx-auto uppercase text-xs font-bold tracking-[0.3em]"
            >
              <ArrowLeft size={16} /> Back to RHEA LOGIS
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-[60vh] flex flex-col justify-center">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-3xl sm:text-4xl font-bold mb-10 border-b border-white/10 pb-6">공지사항 (Notice)</h2>
            <div className="bg-[#1a1a1a] rounded-2xl p-8 sm:p-12 border border-white/10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#8a2be2]"></div>
              <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#8a2be2] font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">회사설립 공지</h3>
                    <p className="text-gray-400">2026년 4월 30일(레아 로지스), 2010년 6월(레아 스테이)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#8a2be2] font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">영업 개시일</h3>
                    <p className="text-gray-400">2026년 5월 30일(레아 로지스)</p>
                  </div>
                </div>
              </div>
              
              {/* Background Decoration */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#8a2be2]/5 rounded-full blur-3xl group-hover:bg-[#8a2be2]/10 transition-colors"></div>
            </div>
            
            <div className="mt-12 text-center">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 mx-auto"
              >
                <ChevronRight className="rotate-180" size={18} />
                <span>홈으로 돌아가기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPrivacyModal(false)}></div>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl p-8 relative z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Privacy Policy</h2>
              <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
              <section>
                <h3 className="text-white font-bold mb-2">1. 수집하는 개인정보 항목</h3>
                <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집할 수 있습니다: 성명, 연락처, 이메일 주소, 회사명 등.</p>
              </section>
              <section>
                <h3 className="text-white font-bold mb-2">2. 개인정보의 수집 및 이용 목적</h3>
                <p>수집된 개인정보는 고객 문의 응대, 서비스 제공, 계약 이행 및 안내 메일 발송 등의 목적으로 이용됩니다.</p>
              </section>
              <section>
                <h3 className="text-white font-bold mb-2">3. 개인정보의 보유 및 이용 기간</h3>
                <p>개인정보는 수집 및 이용 목적이 달성된 후에는 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 동안 보관합니다.</p>
              </section>
              <section>
                <h3 className="text-white font-bold mb-2">4. 개인정보의 파기 절차 및 방법</h3>
                <p>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이 문서에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</p>
              </section>
              <section>
                <h3 className="text-white font-bold mb-2">5. 이용자의 권리와 그 행사 방법</h3>
                <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입 해지를 요청할 수도 있습니다.</p>
              </section>
              <section>
                <h3 className="text-white font-bold mb-2">6. 개인정보 보호를 위한 기술적/관리적 대책</h3>
                <p>회사는 이용자의 개인정보를 취급함에 있어 개인정보가 분실, 도난, 누출, 변조 또는 훼손되지 않도록 안전성 확보를 위하여 최선을 다하고 있습니다.</p>
              </section>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setShowPrivacyModal(false)} 
                className="bg-[#8a2be2] hover:bg-purple-600 px-6 py-2 rounded-lg text-white transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTermsModal(false)}></div>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl p-8 relative z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Terms of Service</h2>
              <button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
              <section>
                <h3 className="text-white font-bold mb-2">제 1 조 (목적)</h3>
                <p>본 약관은 레아 로지스(이하 "회사")가 제공하는 웹사이트 및 관련 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
              </section>
              <section>
                <h3 className="text-white font-bold mb-2">제 2 조 (용어의 정의)</h3>
                <p>1. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.<br/>2. "서비스"란 회사가 웹사이트를 통해 제공하는 모든 정보 및 기능을 의미합니다.</p>
              </section>
              <section>
                <h3 className="text-white font-bold mb-2">제 3 조 (약관의 효력 및 변경)</h3>
                <p>회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
              </section>
              <section>
                <h3 className="text-white font-bold mb-2">제 4 조 (서비스의 제공 및 변경)</h3>
                <p>회사는 이용자에게 전자상거래, 구매대행, 물류 등의 서비스를 제공합니다. 서비스의 내용이 변경될 경우 회사는 이를 공지사항 등을 통해 알립니다.</p>
              </section>
              <section>
                <h3 className="text-white font-bold mb-2">제 5 조 (이용자의 의무)</h3>
                <p>이용자는 다음 행위를 하여서는 안 됩니다: 신청 또는 변경 시 허위 내용의 등록, 타인의 정보 도용, 회사가 게시한 정보의 변경, 회사가 정한 정보 이외의 정보 송신 또는 게시 등.</p>
              </section>
              <section>
                <h3 className="text-white font-bold mb-2">제 6 조 (면책 조항)</h3>
                <p>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
              </section>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setShowTermsModal(false)} 
                className="bg-[#8a2be2] hover:bg-purple-600 px-6 py-2 rounded-lg text-white transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12 text-center text-gray-500 text-sm overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-30 pointer-events-none"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-86a5d8727436?auto=format&fit=crop&q=80&w=1920")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            {(!imgError && currentView !== 'rhea-stay') ? (
              <img 
                src="/logo.png" 
                alt="Rhea Logo" 
                className="h-8 object-contain bg-white/90 rounded p-1" 
                onError={() => setImgError(true)} 
              />
            ) : (
              <LogoSVG className="w-6 h-6 text-white" />
            )}
            <span className="font-bold text-white">RHEA {currentView === 'rhea-stay' ? 'STAY' : 'LOGIS'}</span>
          </div>
          <p>&copy; {new Date().getFullYear()} {currentView === 'rhea-stay' ? 'Rhea Stay' : 'Rhea Logis Co.,Ltd.'}. All rights reserved.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowPrivacyModal(true)} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setShowTermsModal(true)} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
