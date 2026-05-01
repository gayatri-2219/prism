import { NAV_LINKS } from '../data/constants';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useEffect, useState } from 'react';

interface Props {
  page: string;
  setPage: (p: string) => void;
  onWalletClick?: () => void;
  connected?: boolean;
  username?: string;
}

export function PrismNavbar({ page, setPage, onWalletClick, connected, username }: Props) {
  const { data: network } = useNetworkStatus();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <nav style={{ background: "rgba(248,250,252,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0", padding: isMobile ? "0 14px" : "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: isMobile ? 58 : 64, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 32, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
          <img
            src="/prism-logo.svg"
            alt="Prism"
            style={{ width: isMobile ? 34 : 46, height: isMobile ? 34 : 46, objectFit: 'contain' }}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src.includes('prism-logo.svg')) {
                img.src = '/prism-logo.png';
              } else if (img.src.includes('prism-logo.png')) {
                img.src = '/logo.png';
              } else {
                img.style.display = 'none';
              }
            }}
          />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: isMobile ? 17 : 20, letterSpacing: 2, color: "#1E2749", textTransform: 'uppercase' }}>PRISM</span>
        </div>
        <div style={{ display: isMobile ? "none" : "flex", gap: 28, marginLeft: 24 }}>
          {NAV_LINKS.map(l => (
            <span key={l} onClick={() => setPage(l.toLowerCase())} style={{ cursor: "pointer", fontSize: 14, fontWeight: 600, color: page === l.toLowerCase() ? "#2B8C96" : "#64748b", transition: "all .2s", textTransform: 'uppercase', letterSpacing: 0.5 }}>{l}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Live network indicator */}
        <div style={{ display: isMobile ? "none" : "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b", background: "#f8fafc", borderRadius: 20, padding: "4px 12px", border: "1px solid #e2e8f0" }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: network?.online ? "#22c55e" : "#ef4444", display: "inline-block" }} />
          {network?.online ? `Block #${network.latestBlock.toLocaleString()}` : 'Offline'}
        </div>
        <button onClick={onWalletClick} style={{ background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 8, padding: isMobile ? "7px 12px" : "8px 20px", fontSize: isMobile ? 11 : 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: "0 4px 12px rgba(43, 140, 150, 0.2)", transition: "transform 0.2s", maxWidth: isMobile ? 120 : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          {connected ? `${username || 'Wallet'}` : (isMobile ? 'Connect' : 'Connect Wallet')}
        </button>
      </div>
    </nav>
  );
}
