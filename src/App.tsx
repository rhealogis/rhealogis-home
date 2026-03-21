import React, { useState, useEffect } from 'react';
import { Truck, Package, Globe, ShoppingCart, ChevronRight, Mail, Phone, MapPin, Menu, X, Video } from 'lucide-react';
import { FloatingBackground } from './components/FloatingBackground';
import { db, auth, googleProvider, signInWithPopup, onAuthStateChanged } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  setDoc,
  getDoc,
  getDocFromServer
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

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
  const [currentView, setCurrentView] = useState<'home' | 'notice'>('home');
  const [notices, setNotices] = useState<any[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });
  
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const handleFirestoreError = (error: any, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    console.error('Firestore Error Details:', JSON.stringify(errInfo, null, 2));
    return errInfo;
  };

  useEffect(() => {
    // Real-time notices
    const q = query(collection(db, 'notices'));
    const unsubscribeNotices = onSnapshot(q, (snapshot) => {
      const noticesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => {
        // Sort by createdAt if available, otherwise by date
        const timeA = a.createdAt?.toMillis?.() || new Date(a.date).getTime() || 0;
        const timeB = b.createdAt?.toMillis?.() || new Date(b.date).getTime() || 0;
        return timeB - timeA;
      });
      setNotices(noticesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notices');
    });

    return () => {
      unsubscribeNotices();
    };
  }, []);

  const handleEditClick = (notice: any) => {
    setNewNotice({ title: notice.title, content: notice.content });
    setEditingId(notice.id);
    setIsWriting(true);
  };

  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) return;
    
    try {
      if (editingId !== null) {
        const path = `notices/${editingId}`;
        try {
          await updateDoc(doc(db, 'notices', editingId), {
            title: newNotice.title,
            content: newNotice.content
          });
        } catch (error) {
          const err = handleFirestoreError(error, OperationType.UPDATE, path);
          throw new Error(err.error);
        }
        setEditingId(null);
      } else {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const path = 'notices';
        try {
          await addDoc(collection(db, 'notices'), {
            title: newNotice.title,
            content: newNotice.content,
            author: '작성자',
            date: dateStr,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          const err = handleFirestoreError(error, OperationType.CREATE, path);
          throw new Error(err.error);
        }
      }
      setNewNotice({ title: '', content: '' });
      setIsWriting(false);
      setSelectedNoticeId(null);
    } catch (error: any) {
      console.error('Submit error:', error);
      alert('저장 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'notices', id));
      setSelectedNoticeId(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleNavClick = (view: 'home' | 'notice', hash?: string) => {
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
      <FloatingBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-white/10 z-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer relative" onClick={() => handleNavClick('home')} ref={logoRef}>
          {!imgError ? (
            <img 
              src="/logo.png" 
              alt="Rhea Logis Logo" 
              className="h-8 sm:h-10 md:h-12 object-contain bg-white/90 rounded p-1" 
              onError={() => setImgError(true)} 
            />
          ) : (
            <LogoSVG className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          )}
          <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">RHEA LOGIS</span>
          
          {/* Flying Product Icon */}
          <div 
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 animate-logo-fly"
            style={{ 
              '--fly-x': `${flyDistance.x}px`, 
              '--fly-y': `${flyDistance.y}px` 
            } as React.CSSProperties}
          >
            <Package className="text-white" size={18} />
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
          <nav className="flex flex-col items-center justify-start min-h-full py-20 gap-8 text-xl font-bold text-white">
            <button onClick={() => handleNavClick('home', 'home')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5">Home</button>
            <button onClick={() => handleNavClick('home', 'about')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5">About</button>
            <button onClick={() => handleNavClick('home', 'business')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5">Business</button>
            <button onClick={() => handleNavClick('notice')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5">Notice</button>
            <button onClick={() => handleNavClick('home', 'contact')} className="hover:text-[#8a2be2] transition-colors py-2 px-8 rounded-full hover:bg-white/5">Contact</button>
          </nav>
        </div>
      )}

      {currentView === 'home' ? (
        <>
          {/* Hero Section */}
          <section id="home" className="relative min-h-[80vh] sm:h-screen flex flex-col justify-center items-center text-center px-4 pt-16 landscape:pt-24 sm:pt-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0d0d0d]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto mt-8 landscape:mt-16 sm:mt-20">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-6 leading-tight">
            Beyond Logistics, <br />
            <span className="text-[#8a2be2]">Connecting the World</span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-10 max-w-3xl mx-auto px-4">
            E-commerce 및 Digital Content Marketing의 기준을 제시합니다.<br />
            글로벌 비즈니스 파트너 레아 로지스와 함께 하세요.
          </p>
          <a href="#business" className="inline-flex items-center gap-2 bg-[#8a2be2] hover:bg-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-medium transition-all transform hover:scale-105 text-sm sm:text-base">
            Our Business <ChevronRight size={20} />
          </a>
        </div>
      </section>

      {/* Business Section */}
      <section id="business" className="py-10 landscape:py-20 sm:py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-8 landscape:mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Business Areas</h2>
          <p className="text-gray-400 text-sm sm:text-base">레아 로지스의 핵심 사업 영역을 소개합니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#1a1a1a] rounded-2xl border-b-4 border-transparent hover:border-[#8a2be2] hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
            <div className="h-40 overflow-hidden">
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

          {/* Card 2 */}
          <div className="bg-[#1a1a1a] rounded-2xl border-b-4 border-transparent hover:border-[#8a2be2] hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600&h=400" 
                alt="All-in-One E-commerce Fulfillment & Logistics Solutions" 
                className="w-full h-full object-cover animate-slow-zoom group-hover:animate-none group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Package className="text-[#8a2be2] animate-slow-spin group-hover:animate-fast-spin" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">All-in-One E-commerce Fulfillment & Logistics Solutions</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                구매, 보관, 배송에 대한 전략적 조달 솔루션을 통해 국내외 파트너의 성장을 지원합니다.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1a1a1a] rounded-2xl border-b-4 border-transparent hover:border-[#8a2be2] hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600&h=400" 
                alt="Omnichannel Content Production and Marketing" 
                className="w-full h-full object-cover animate-slow-zoom group-hover:animate-none group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Video className="text-[#8a2be2] animate-slow-spin group-hover:animate-fast-spin" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">Omnichannel Content Production and Marketing</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                창의적인 콘텐츠 제작 및 고객이 머무는 플랫폼 접점의 유기적 연결을 통한 디지털 마케팅 사업을 수행합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Stats Section */}
      <section id="about" className="py-10 landscape:py-20 sm:py-20 border-y border-white/5 bg-[#111]">
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
      <section id="contact" className="py-12 landscape:py-24 sm:py-32 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-4xl font-bold mb-6 landscape:mb-10 sm:mb-12">Growing together, your reliable e-commerce partner.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-[#8a2be2]/30 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <MapPin className="text-[#8a2be2] animate-slow-spin group-hover:animate-fast-spin" size={24} />
              </div>
              <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">Address</div>
              <div className="text-gray-200 leading-relaxed">서울특별시 동작구 상도로53,<br/>주식회사 레아 로지스</div>
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
      ) : (
        <div className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
          {selectedNoticeId !== null && !isWriting ? (
            <div className="bg-[#1a1a1a] rounded-2xl p-5 sm:p-8 border border-white/10">
              {(() => {
                const notice = notices.find(n => n.id === selectedNoticeId);
                if (!notice) return null;
                return (
                  <>
                    <div className="border-b border-white/10 pb-6 mb-6">
                      <h2 className="text-2xl font-bold mb-4">{notice.title}</h2>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>작성자: {notice.author}</span>
                        <span>등록일: {notice.date}</span>
                      </div>
                    </div>
                    <div className="text-gray-200 whitespace-pre-wrap min-h-[200px] leading-relaxed">
                      {notice.content}
                    </div>
                    <div className="mt-8 flex justify-between border-t border-white/10 pt-6">
                      <div className="flex gap-3">
                        <button onClick={() => setSelectedNoticeId(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">목록으로</button>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleDeleteNotice(notice.id)} className="px-6 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg transition-colors">삭제</button>
                        <button onClick={() => handleEditClick(notice)} className="px-6 py-2 bg-[#8a2be2] hover:bg-purple-600 rounded-lg transition-colors">수정</button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : !isWriting ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 border-b border-white/10 pb-6 gap-4">
                <h2 className="text-3xl sm:text-4xl font-bold">공지사항 (Notice)</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={() => { setIsWriting(true); setEditingId(null); setNewNotice({title: '', content: ''}); }} className="w-full sm:w-auto bg-[#8a2be2] hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium">
                    글쓰기
                  </button>
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden overflow-x-auto border border-white/5">
                <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-[600px]">
                  <thead>
                    <tr className="bg-black/50 text-gray-400 text-xs border-b border-white/10">
                      <th className="py-4 px-4 sm:px-6 font-medium w-12 sm:w-16 text-center">No</th>
                      <th className="py-4 px-4 sm:px-6 font-medium">제목</th>
                      <th className="py-4 px-4 sm:px-6 font-medium w-24 sm:w-32 text-center">작성자</th>
                      <th className="py-4 px-4 sm:px-6 font-medium w-24 sm:w-32 text-center">등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((notice, index) => (
                      <tr key={notice.id} onClick={() => setSelectedNoticeId(notice.id)} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                        <td className="py-4 px-4 sm:px-6 text-center text-gray-500 text-xs sm:text-sm">{notices.length - index}</td>
                        <td className="py-4 px-4 sm:px-6 text-gray-200 hover:text-[#8a2be2] transition-colors text-sm sm:text-base">{notice.title}</td>
                        <td className="py-4 px-4 sm:px-6 text-center text-gray-400 text-xs sm:text-sm">{notice.author}</td>
                        <td className="py-4 px-4 sm:px-6 text-center text-gray-400 text-xs sm:text-sm">{notice.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-[#1a1a1a] rounded-2xl p-5 sm:p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">{editingId !== null ? '공지사항 수정' : '공지사항 작성'}</h2>
              <form onSubmit={handleWriteSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">제목</label>
                  <input 
                    type="text" 
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8a2be2] transition-colors" 
                    placeholder="공지사항 제목을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">내용</label>
                  <textarea 
                    rows={10} 
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8a2be2] transition-colors resize-none" 
                    placeholder="공지사항 내용을 입력하세요"
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-4">
                  <button 
                    type="button" 
                    onClick={() => { setIsWriting(false); setEditingId(null); setNewNotice({title: '', content: ''}); }}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="bg-[#8a2be2] hover:bg-purple-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                  >
                    {editingId !== null ? '수정' : '등록'}
                  </button>
                </div>
              </form>
            </div>
          )}
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
            {!imgError ? (
              <img 
                src="/logo.png" 
                alt="Rhea Logis Logo" 
                className="h-8 object-contain bg-white/90 rounded p-1" 
                onError={() => setImgError(true)} 
              />
            ) : (
              <LogoSVG className="w-6 h-6 text-white" />
            )}
            <span className="font-bold text-white">RHEA LOGIS</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Rhea Logis Co.,Ltd. All rights reserved.</p>
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
