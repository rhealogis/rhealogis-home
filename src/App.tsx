import React, { useState } from 'react';
import { Truck, Package, Globe, ShoppingCart, ChevronRight, Mail, Phone, MapPin } from 'lucide-react';

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
  const [notices, setNotices] = useState([
    { id: 1, title: '레아 로지스 공식 웹사이트가 오픈되었습니다.', author: '관리자', date: '2026-03-16', content: '환영합니다.' }
  ]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actualAdminPassword, setActualAdminPassword] = useState('admin');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleLogin = () => {
    if (adminPassword === actualAdminPassword) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginError('');
      setAdminPassword('');
    } else {
      setLoginError('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleChangePassword = () => {
    if (passwordForm.current !== actualAdminPassword) {
      setPasswordError('현재 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (passwordForm.new.length < 4) {
      setPasswordError('새 비밀번호는 4자리 이상이어야 합니다.');
      return;
    }
    setActualAdminPassword(passwordForm.new);
    setShowPasswordModal(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setPasswordError('');
    alert('비밀번호가 변경되었습니다.');
  };

  const handleEditClick = (notice: any) => {
    setNewNotice({ title: notice.title, content: notice.content });
    setEditingId(notice.id);
    setIsWriting(true);
  };

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) return;
    
    if (editingId !== null) {
      setNotices(notices.map(n => n.id === editingId ? { ...n, title: newNotice.title, content: newNotice.content } : n));
      setEditingId(null);
    } else {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      setNotices([
        {
          id: notices.length > 0 ? Math.max(...notices.map(n => n.id)) + 1 : 1,
          title: newNotice.title,
          author: '관리자',
          date: dateStr,
          content: newNotice.content
        },
        ...notices
      ]);
    }
    setNewNotice({ title: '', content: '' });
    setIsWriting(false);
    setSelectedNoticeId(null);
  };

  const handleNavClick = (view: 'home' | 'notice', hash?: string) => {
    setCurrentView(view);
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-white/10 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
          {!imgError ? (
            <img 
              src="/logo.png" 
              alt="Rhea Logis Logo" 
              className="h-12 object-contain bg-white/90 rounded p-1" 
              onError={() => setImgError(true)} 
            />
          ) : (
            <LogoSVG className="w-10 h-10 text-white" />
          )}
          <span className="text-2xl font-bold tracking-tight">RHEA LOGIS</span>
        </div>
        <nav className="hidden md:block">
          <ul className="flex gap-8 text-sm font-medium text-gray-300">
            <li><button onClick={() => handleNavClick('home', 'home')} className="hover:text-[#8a2be2] transition-colors">Home</button></li>
            <li><button onClick={() => handleNavClick('home', 'about')} className="hover:text-[#8a2be2] transition-colors">About</button></li>
            <li><button onClick={() => handleNavClick('home', 'business')} className="hover:text-[#8a2be2] transition-colors">Business</button></li>
            <li><button onClick={() => handleNavClick('notice')} className="hover:text-[#8a2be2] transition-colors">Notice</button></li>
            <li><button onClick={() => handleNavClick('home', 'contact')} className="hover:text-[#8a2be2] transition-colors">Contact</button></li>
          </ul>
        </nav>
      </header>

      {currentView === 'home' ? (
        <>
          {/* Hero Section */}
          <section id="home" className="relative h-screen flex flex-col justify-center items-center text-center px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0d0d0d]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto mt-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Beyond Logistics, <br />
            <span className="text-[#8a2be2]">Connecting the World</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            E-commerce, 물류, 무역의 새로운 기준을 제시합니다.<br />
            글로벌 비즈니스 파트너 레아 로지스와 함께 하세요.
          </p>
          <a href="#business" className="inline-flex items-center gap-2 bg-[#8a2be2] hover:bg-purple-600 text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105">
            Our Business <ChevronRight size={20} />
          </a>
        </div>
      </section>

      {/* Business Section */}
      <section id="business" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">Business Areas</h2>
          <p className="text-gray-400">레아 로지스의 핵심 사업 영역을 소개합니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="bg-[#1a1a1a] rounded-2xl border-b-4 border-transparent hover:border-[#8a2be2] hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&q=80&w=600&h=400" 
                alt="해외 수출입" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-8">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Truck className="text-[#8a2be2]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">해외 수출입</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                해외 각국의 시장에 특화된 무역 솔루션. 현지 파트너십을 통한 신속하고 정확한 수출입 업무를 진행합니다.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1a1a1a] rounded-2xl border-b-4 border-transparent hover:border-[#8a2be2] hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src="https://picsum.photos/seed/luxury-shopping-mall/600/400" 
                alt="해외직구 대행" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-8">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <ShoppingCart className="text-[#8a2be2]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">해외직구 대행</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                복잡한 해외직구를 쉽고 편리하게. B2B, B2C 고객을 위한 맞춤형 구매 대행 및 배송 서비스를 제공합니다.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1a1a1a] rounded-2xl border-b-4 border-transparent hover:border-[#8a2be2] hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=600&h=400" 
                alt="유통" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-8">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Package className="text-[#8a2be2]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">유통</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                K-product의 세계화를 선도합니다. 국내외 우수 상품의 글로벌 유통을 추진합니다.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#1a1a1a] rounded-2xl border-b-4 border-transparent hover:border-[#8a2be2] hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600&h=400" 
                alt="글로벌 물류" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-8">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Globe className="text-[#8a2be2]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">글로벌 물류</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                전 세계를 연결하는 빠르고 안전한 물류 네트워크. 해상, 항공 운송을 통한 서비스를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Stats Section */}
      <section id="about" className="py-20 border-y border-white/5 bg-[#111]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-5xl font-bold text-[#8a2be2] mb-2">30+</div>
            <div className="text-gray-400">Years of Representative's experience<br/>as a large company manager</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#8a2be2] mb-2">5+</div>
            <div className="text-gray-400">Target to enter foreign countries</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#8a2be2] mb-2">99%</div>
            <div className="text-gray-400">Aiming for customer satisfaction</div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Contact Us</h2>
          <p className="text-gray-400 mb-12 leading-relaxed text-lg">
            레아 로지스는 고객의 비즈니스 성공을 위해 최선을 다합니다. <br />
            궁금하신 점이 있다면 언제든 연락 주시기 바랍니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-[#8a2be2]/30 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <MapPin className="text-[#8a2be2]" size={24} />
              </div>
              <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">Address</div>
              <div className="text-gray-200 leading-relaxed">서울특별시 동작구 상도로53,<br/>주식회사 레아 로지스</div>
            </div>

            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-[#8a2be2]/30 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <Phone className="text-[#8a2be2]" size={24} />
              </div>
              <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">Customer Service</div>
              <div className="text-gray-200">82-10-2624-9489</div>
            </div>

            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-[#8a2be2]/30 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <Mail className="text-[#8a2be2]" size={24} />
              </div>
              <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">Email</div>
              <div className="text-gray-200">rhealogis@gmail.com</div>
            </div>
          </div>
        </div>
      </section>
      </>
      ) : (
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
          {selectedNoticeId !== null && !isWriting ? (
            <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
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
                      <button onClick={() => setSelectedNoticeId(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">목록으로</button>
                      {isAdmin && (
                        <button onClick={() => handleEditClick(notice)} className="px-6 py-2 bg-[#8a2be2] hover:bg-purple-600 rounded-lg transition-colors">수정</button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : !isWriting ? (
            <>
              <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
                <h2 className="text-4xl font-bold">공지사항 (Notice)</h2>
                {isAdmin ? (
                  <div className="flex gap-3">
                    <button onClick={() => setShowPasswordModal(true)} className="text-gray-400 hover:text-white transition-colors text-sm px-4 py-2 border border-white/10 rounded-lg">
                      비밀번호 변경
                    </button>
                    <button onClick={() => { setIsWriting(true); setEditingId(null); setNewNotice({title: '', content: ''}); }} className="bg-[#8a2be2] hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                      글쓰기
                    </button>
                    <button onClick={() => setIsAdmin(false)} className="text-gray-400 hover:text-white transition-colors text-sm px-4 py-2">
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowLoginModal(true)} className="text-gray-500 hover:text-white transition-colors text-sm">
                    관리자 로그인
                  </button>
                )}
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/50 text-gray-400 text-sm border-b border-white/10">
                      <th className="py-4 px-6 font-medium w-16 text-center">No</th>
                      <th className="py-4 px-6 font-medium">제목</th>
                      <th className="py-4 px-6 font-medium w-32 text-center">작성자</th>
                      <th className="py-4 px-6 font-medium w-32 text-center">등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((notice, index) => (
                      <tr key={notice.id} onClick={() => setSelectedNoticeId(notice.id)} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                        <td className="py-4 px-6 text-center text-gray-500">{notices.length - index}</td>
                        <td className="py-4 px-6 text-gray-200 hover:text-[#8a2be2] transition-colors">{notice.title}</td>
                        <td className="py-4 px-6 text-center text-gray-400 text-sm">{notice.author}</td>
                        <td className="py-4 px-6 text-center text-gray-400 text-sm">{notice.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
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

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-4">
          <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-sm w-full border border-white/10">
            <h3 className="text-xl font-bold mb-6">관리자 로그인</h3>
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">비밀번호</label>
              <input 
                type="password" 
                value={adminPassword} 
                onChange={e => setAdminPassword(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8a2be2] transition-colors" 
                placeholder="비밀번호를 입력하세요" 
                autoFocus
              />
              {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {setShowLoginModal(false); setLoginError(''); setAdminPassword('');}} 
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleLogin} 
                className="bg-[#8a2be2] hover:bg-purple-600 px-6 py-2 rounded-lg text-white transition-colors"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-4">
          <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-sm w-full border border-white/10">
            <h3 className="text-xl font-bold mb-6">비밀번호 변경</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">현재 비밀번호</label>
                <input 
                  type="password" 
                  value={passwordForm.current} 
                  onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} 
                  className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8a2be2] transition-colors" 
                  placeholder="현재 비밀번호" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">새 비밀번호</label>
                <input 
                  type="password" 
                  value={passwordForm.new} 
                  onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} 
                  className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8a2be2] transition-colors" 
                  placeholder="새 비밀번호 (4자리 이상)" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">새 비밀번호 확인</label>
                <input 
                  type="password" 
                  value={passwordForm.confirm} 
                  onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} 
                  onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                  className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8a2be2] transition-colors" 
                  placeholder="새 비밀번호 확인" 
                />
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {setShowPasswordModal(false); setPasswordError(''); setPasswordForm({current: '', new: '', confirm: ''});}} 
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleChangePassword} 
                className="bg-[#8a2be2] hover:bg-purple-600 px-6 py-2 rounded-lg text-white transition-colors"
              >
                변경
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
  );
}
