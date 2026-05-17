import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

const TRADES = ['All Services','Plumber','Electrician','Barber','Carpenter','Painter','Mechanic','Cleaner'];

const CATEGORIES = [
  { label: 'Plumbing',    cat: 'plumbing',   bg: '#EFF6FF', stroke: '#1447F5',
    icon: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/> },
  { label: 'Electrical',  cat: 'electrical', bg: '#FFF7ED', stroke: '#D97706',
    icon: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/> },
  { label: 'Barbering',   cat: 'barbering',  bg: '#F0FDF4', stroke: '#059669',
    icon: <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></> },
  { label: 'Carpentry',   cat: 'carpentry',  bg: '#F5F3FF', stroke: '#7C3AED',
    icon: <><path d="M3 22l7-7"/><path d="M4.33 15.67 9 11l.33.33L14 6l-.33-.33L18 2l4 4-4 4-.33-.33L13 14l.33.33L9 18z"/></> },
  { label: 'Painting',    cat: 'painting',   bg: '#FFF1F2', stroke: '#DC2626',
    icon: <><path d="M19 11V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v7a5 5 0 0 0 10 0"/><line x1="5" y1="3" x2="5" y2="11"/><path d="M17 21a1 1 0 0 1-2 0c0-2 2-4 2-4s2 2 2 4a1 1 0 0 1-2 0"/></> },
  { label: 'Auto Repair', cat: 'auto',       bg: '#ECFEFF', stroke: '#0891B2',
    icon: <><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/></> },
  { label: 'Cleaning',    cat: 'cleaning',   bg: '#FDF4FF', stroke: '#9333EA',
    icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
  { label: 'Tech Repair', cat: 'tech',       bg: '#F8FAFC', stroke: '#475569',
    icon: <><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></> },
];

const HERO_TAGS = [
  { label: 'Plumbing',   cat: 'plumbing',   icon: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/> },
  { label: 'Electrical', cat: 'electrical', icon: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/> },
  { label: 'Barbering',  cat: 'barbering',  icon: <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/></> },
  { label: 'Carpentry',  cat: 'carpentry',  icon: <><path d="M3 22l7-7"/><path d="M18 2l4 4-4 4"/></> },
  { label: 'Auto Repair',cat: 'auto',       icon: <><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4"/></> },
  { label: 'Cleaning',   cat: 'cleaning',   icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></> },
];

const STEPS = [
  { num: '01', title: 'Search', desc: 'Enter the service you need and your location. Use filters to narrow down your options.',
    icon: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></> },
  { num: '02', title: 'Browse Profiles', desc: 'View provider profiles — their skills, certifications, and pricing — before choosing.',
    icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
  { num: '03', title: 'Book', desc: 'Send a request, chat with the provider, and confirm the details — all on Referro.',
    icon: <><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
  { num: '04', title: 'Review', desc: 'After the job, leave an honest review to help others find great providers.',
    icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [trade, setTrade] = useState('All Services');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.sr').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const goSearch = () => navigate(`/search?trade=${encodeURIComponent(trade)}&q=${encodeURIComponent(query)}`);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        .sr{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
        .sr.in{opacity:1;transform:none}
        .d1{transition-delay:.04s}.d2{transition-delay:.10s}.d3{transition-delay:.16s}
        .d4{transition-delay:.22s}.d5{transition-delay:.28s}.d6{transition-delay:.34s}
        .d7{transition-delay:.40s}.d8{transition-delay:.46s}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{to{background-position:-200%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        .hero-h1 em{font-style:normal;color:transparent;background:linear-gradient(95deg,#60A5FA,#A5BDFF 50%,#60A5FA);background-size:200%;-webkit-background-clip:text;background-clip:text;animation:shimmer 5s linear infinite}
        .cat-card{border:1.5px solid #E2E8F0;border-radius:14px;padding:1.6rem;background:#fff;text-decoration:none;display:flex;flex-direction:column;gap:.75rem;cursor:pointer;transition:all .22s;position:relative;overflow:hidden}
        .cat-card:hover{border-color:#1447F5;transform:translateY(-3px);box-shadow:0 12px 32px rgba(20,71,245,.09)}
        .cat-arrow{position:absolute;top:1.1rem;right:1.1rem;width:24px;height:24px;border-radius:6px;background:#1447F5;display:flex;align-items:center;justify-content:center;opacity:0;transform:translate(3px,-3px);transition:all .22s}
        .cat-card:hover .cat-arrow{opacity:1;transform:none}
        .step-card{background:#111827;padding:2.25rem 1.75rem;transition:background .2s}
        .step-card:hover{background:rgba(255,255,255,.025)}
        .hero-tag{display:flex;align-items:center;gap:.35rem;padding:.3rem .85rem;border-radius:100px;border:1px solid rgba(255,255,255,.09);color:rgba(255,255,255,.45);font-size:.74rem;font-weight:500;cursor:pointer;transition:all .18s}
        .hero-tag:hover{border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.8)}
        .sw-btn{height:48px;padding:0 1.4rem;border-radius:10px;border:none;background:#1447F5;color:#fff;font-family:'Inter',sans-serif;font-size:.84rem;font-weight:600;cursor:pointer;flex-shrink:0;transition:all .18s;box-shadow:0 3px 14px rgba(20,71,245,.45)}
        .sw-btn:hover{background:#0F3AD4;transform:translateY(-1px)}
        .btn-white-lg{display:inline-flex;align-items:center;padding:.78rem 1.8rem;border-radius:14px;background:#fff;color:#0A0F1E;font-weight:600;font-size:.94rem;text-decoration:none;transition:all .18s;border:none;cursor:pointer}
        .btn-white-lg:hover{background:#F0F5FF;transform:translateY(-1px)}
        .btn-blue-lg{display:inline-flex;align-items:center;padding:.78rem 1.8rem;border-radius:14px;background:#1447F5;color:#fff;font-weight:600;font-size:.94rem;text-decoration:none;transition:all .18s;border:none;cursor:pointer;box-shadow:0 2px 12px rgba(20,71,245,.3)}
        .btn-blue-lg:hover{background:#0F3AD4;transform:translateY(-1px)}
        .btn-outline-lg{display:inline-flex;align-items:center;padding:.78rem 1.8rem;border-radius:14px;background:transparent;color:#0A0F1E;font-weight:600;font-size:.94rem;text-decoration:none;transition:all .18s;border:1.5px solid #E2E8F0;cursor:pointer}
        .btn-outline-lg:hover{border-color:#1447F5;color:#1447F5;background:#F0F5FF}
        @media(max-width:900px){.cats-grid{grid-template-columns:repeat(2,1fr)!important}.steps-grid{grid-template-columns:repeat(2,1fr)!important}.dual-grid{grid-template-columns:1fr!important}}
        @media(max-width:580px){.search-wrap{flex-direction:column!important;padding:6px!important}.sw-sep{display:none!important}.stats-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* ── HERO ── */}
      <section style={{minHeight:'100svh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 5% 80px',background:'#0A0F1E',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse 70% 60% at 50% -10%,rgba(20,71,245,.42) 0%,transparent 60%),radial-gradient(ellipse 45% 45% at 15% 85%,rgba(20,71,245,.14) 0%,transparent 55%)'}}/>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',backgroundImage:'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)',backgroundSize:'60px 60px',maskImage:'radial-gradient(ellipse 80% 70% at 50% 50%,black 30%,transparent 100%)'}}/>
        <div style={{position:'absolute',width:700,height:700,top:-250,right:-200,borderRadius:'50%',border:'1px solid rgba(255,255,255,.04)',animation:'spin 60s linear infinite',pointerEvents:'none'}}/>
        <div style={{position:'absolute',width:1050,height:1050,top:-420,right:-370,borderRadius:'50%',border:'1px solid rgba(255,255,255,.04)',animation:'spin 90s linear infinite reverse',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:2,maxWidth:780}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'.5rem',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.65)',padding:'.35rem 1rem .35rem .45rem',borderRadius:100,fontSize:'.74rem',fontWeight:500,marginBottom:'2rem',animation:'fadeUp .5s ease both'}}>
            <span style={{background:'#1447F5',color:'#fff',padding:'.12rem .55rem',borderRadius:100,fontSize:'.65rem',fontWeight:700,letterSpacing:'.06em'}}>LAUNCHING SOON</span>
            Be among the first to join
          </div>
          <h1 className="hero-h1" style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(2.8rem,6.5vw,5.2rem)',fontWeight:800,lineHeight:1.02,letterSpacing:'-.05em',color:'#fff',marginBottom:'1.4rem',animation:'fadeUp .5s .07s ease both'}}>
            Find Skilled<br/><em>Service Providers</em><br/>Near You
          </h1>
          <p style={{fontSize:'clamp(.9rem,1.4vw,1.05rem)',lineHeight:1.85,color:'rgba(255,255,255,.42)',maxWidth:500,margin:'0 auto 2.5rem',animation:'fadeUp .5s .14s ease both'}}>
            Referro connects you with verified plumbers, electricians, barbers, and more — all in one trusted platform.
          </p>
          {/* Search bar */}
          <div className="search-wrap" style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',backdropFilter:'blur(20px)',borderRadius:14,padding:5,maxWidth:620,margin:'0 auto',boxShadow:'0 24px 60px rgba(0,0,0,.35)',animation:'fadeUp .5s .21s ease both'}}>
            <div style={{display:'flex',alignItems:'center',gap:'.4rem',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.06)',borderRadius:10,padding:'0 .9rem',height:48,minWidth:145}}>
              <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h7"/></svg>
              <select value={trade} onChange={e=>setTrade(e.target.value)} style={{background:'transparent',border:'none',outline:'none',color:'rgba(255,255,255,.82)',fontFamily:"'Inter',sans-serif",fontSize:'.82rem',fontWeight:500,cursor:'pointer',width:'100%'}}>
                {TRADES.map(t=><option key={t} value={t} style={{background:'#0F1E38'}}>{t}</option>)}
              </select>
            </div>
            <div className="sw-sep" style={{width:1,height:22,background:'rgba(255,255,255,.09)',flexShrink:0}}/>
            <div style={{flex:1,display:'flex',alignItems:'center',gap:'.5rem',padding:'0 .9rem'}}>
              <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&goSearch()} type="text" placeholder="What service do you need?" style={{border:'none',background:'transparent',outline:'none',fontFamily:"'Inter',sans-serif",fontSize:'.88rem',color:'#fff',width:'100%'}}/>
            </div>
            <button className="sw-btn" onClick={goSearch}>Search</button>
          </div>
          {/* Tags */}
          <div style={{display:'flex',gap:'.4rem',justifyContent:'center',flexWrap:'wrap',marginTop:'1.2rem',animation:'fadeUp .5s .28s ease both'}}>
            {HERO_TAGS.map(t=>(
              <span key={t.label} className="hero-tag" onClick={()=>navigate(`/search?trade=${t.cat}`)}>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{t.icon}</svg>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div style={{background:'#0A0F1E',borderTop:'1px solid rgba(255,255,255,.06)',padding:'28px 5%'}}>
        <div className="stats-grid" style={{maxWidth:860,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'rgba(255,255,255,.06)',borderRadius:12,overflow:'hidden'}}>
          {[['Launching','Platform going live soon'],['Verified','Every provider ID-checked'],['Free','No cost to browse or sign up']].map(([num,lbl])=>(
            <div key={num} style={{background:'rgba(255,255,255,.02)',padding:'1.5rem 2rem',textAlign:'center'}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.6rem',fontWeight:800,color:'#fff',letterSpacing:'-.04em'}}>{num}</div>
              <div style={{fontSize:'.76rem',color:'rgba(255,255,255,.35)',marginTop:'.25rem',letterSpacing:'.02em'}}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section style={{padding:'96px 5%'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'2.5rem',flexWrap:'wrap',gap:'1.5rem'}}>
          <div>
            <div className="sr d1" style={{fontSize:'.68rem',fontWeight:600,letterSpacing:'.16em',textTransform:'uppercase',color:'#1447F5',display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.75rem'}}>
              <span style={{width:16,height:1.5,background:'#1447F5',borderRadius:2,display:'inline-block'}}/>Browse by Category
            </div>
            <h2 className="sr d2" style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(1.9rem,3.2vw,2.75rem)',fontWeight:800,letterSpacing:'-.04em',lineHeight:1.08,color:'#0A0F1E'}}>Every service,<br/>one platform.</h2>
            <p className="sr d3" style={{fontSize:'.92rem',color:'#64748B',lineHeight:1.8,marginTop:'.65rem',maxWidth:460}}>From home repairs to personal care — find the right professional for any task.</p>
          </div>
          <button className="sr d4 btn-outline-lg" onClick={()=>navigate('/search')}>View all services →</button>
        </div>
        <div className="cats-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.85rem'}}>
          {CATEGORIES.map((c,i)=>(
            <div key={c.label} className={`cat-card sr d${i+1}`} onClick={()=>navigate(`/search?trade=${c.cat}`)}>
              <div style={{width:44,height:44,borderRadius:11,background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:1}}>
                <svg width="20" height="20" fill="none" stroke={c.stroke} strokeWidth="1.75" viewBox="0 0 24 24">{c.icon}</svg>
              </div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'.88rem',fontWeight:700,color:'#0A0F1E',position:'relative',zIndex:1,letterSpacing:'-.01em'}}>{c.label}</div>
              <div className="cat-arrow">
                <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{background:'#111827',padding:'96px 5%'}}>
        <div className="sr d1" style={{fontSize:'.68rem',fontWeight:600,letterSpacing:'.16em',textTransform:'uppercase',color:'#60A5FA',display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.75rem'}}>
          <span style={{width:16,height:1.5,background:'#60A5FA',borderRadius:2,display:'inline-block'}}/>How It Works
        </div>
        <h2 className="sr d2" style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(1.9rem,3.2vw,2.75rem)',fontWeight:800,letterSpacing:'-.04em',lineHeight:1.08,color:'#fff'}}>Up and running<br/>in minutes.</h2>
        <p className="sr d3" style={{fontSize:'.92rem',color:'rgba(255,255,255,.38)',lineHeight:1.8,marginTop:'.65rem',maxWidth:460}}>Simple steps to get skilled help fast — no stress, no guesswork.</p>
        <div className="steps-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'rgba(255,255,255,.05)',borderRadius:18,overflow:'hidden',marginTop:'3.5rem'}}>
          {STEPS.map((s,i)=>(
            <div key={s.num} className={`step-card sr d${i+1}`}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'2.8rem',fontWeight:800,color:'rgba(255,255,255,.04)',lineHeight:1,marginBottom:'1.5rem',letterSpacing:'-.05em'}}>{s.num}</div>
              <div style={{width:40,height:40,borderRadius:10,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}>
                <svg width="18" height="18" fill="none" stroke="#60A5FA" strokeWidth="1.75" viewBox="0 0 24 24">{s.icon}</svg>
              </div>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:'.94rem',fontWeight:700,color:'#fff',marginBottom:'.5rem',letterSpacing:'-.01em'}}>{s.title}</h3>
              <p style={{fontSize:'.84rem',color:'rgba(255,255,255,.35)',lineHeight:1.8}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DUAL CTA ── */}
      <section style={{padding:'96px 5%',background:'#F0F5FF'}}>
        <div className="dual-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem'}}>
          <div className="sr d1" style={{background:'#0A0F1E',borderRadius:18,padding:'2.75rem 2.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{fontSize:'.67rem',fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.28)'}}>For Customers</div>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(1.35rem,2.2vw,1.85rem)',fontWeight:800,letterSpacing:'-.03em',lineHeight:1.15,color:'#fff'}}>Need something fixed?<br/>We've got you.</h3>
            <p style={{fontSize:'.87rem',lineHeight:1.8,color:'rgba(255,255,255,.38)'}}>Browse verified professionals in your area and get the job done with confidence.</p>
            <button className="btn-white-lg" style={{alignSelf:'flex-start',marginTop:'.5rem'}} onClick={()=>navigate(isAuthenticated?'/search':'/register')}>Find a Provider</button>
          </div>
          <div className="sr d2" style={{background:'#fff',border:'1.5px solid #E2E8F0',borderRadius:18,padding:'2.75rem 2.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{fontSize:'.67rem',fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'#64748B'}}>For Providers</div>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(1.35rem,2.2vw,1.85rem)',fontWeight:800,letterSpacing:'-.03em',lineHeight:1.15,color:'#0A0F1E'}}>Offer your skills.<br/>Grow your business.</h3>
            <p style={{fontSize:'.87rem',lineHeight:1.8,color:'#64748B'}}>Join Referro and connect with customers who need exactly what you do. Get listed today.</p>
            <button className="btn-blue-lg" style={{alignSelf:'flex-start',marginTop:'.5rem'}} onClick={()=>navigate('/register')}>Join as a Provider</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:'#0A0F1E',padding:'56px 5% 28px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'2rem',paddingBottom:'2.5rem',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.25rem',fontWeight:800,color:'#fff',display:'flex',alignItems:'center',gap:'.3rem',letterSpacing:'-.04em'}}>
            <span style={{width:5,height:5,borderRadius:'50%',background:'#1447F5',marginBottom:3,display:'inline-block'}}/>Referro
          </div>
          <div style={{display:'flex',gap:'2rem',flexWrap:'wrap'}}>
            {['Home','Services','How It Works','For Providers'].map(l=>(
              <a key={l} href="#" style={{fontSize:'.83rem',color:'rgba(255,255,255,.35)',textDecoration:'none'}}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem',paddingTop:'1.5rem',fontSize:'.76rem',color:'rgba(255,255,255,.2)'}}>
          <span>© 2025 Referro Technologies Ltd.</span>
          <span style={{display:'flex',gap:'1.5rem'}}>
            <a href="#" style={{color:'inherit',textDecoration:'none'}}>Privacy Policy</a>
            <a href="#" style={{color:'inherit',textDecoration:'none'}}>Terms of Use</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
