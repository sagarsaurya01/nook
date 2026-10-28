import Link from "next/link";
import { Svg } from "@/components/icons";

export default function Shared() {
  return (
    <main className="app">
      <div className="apphead"><div className="top"><div className="wordmark" style={{ fontSize: 16 }}>Shared</div>
        <Link className="iconbtn" href="/" aria-label="Close"><Svg size={22}><path d="M6 6l12 12M18 6 6 18" /></Svg></Link></div></div>
      <div className="empty">
        <div className="circ"><Svg size={28}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><circle cx="17.5" cy="9" r="2.6" /><path d="M15 15c3 0 6 1.7 6 5" /></Svg></div>
        <h3>Shared folders — coming soon</h3>
        <p>Share a collection by link, or make a folder friends and family add to in real time. Next on the roadmap.</p>
      </div>
    </main>
  );
}
