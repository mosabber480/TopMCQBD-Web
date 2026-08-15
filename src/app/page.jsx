export default function Home() {
  return (
    <main className="hero-container">
      {/* Background ambient glowing orbs */}
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />

      <div className="card">
        <div className="badge">
          <span className="badge-dot" />
          Coming Soon
        </div>

        <h1 className="title">TopMCQBD</h1>

        <p className="description">
          TopMCQ হলো একটি বিশ্বস্ত অনলাইন কুইজ প্ল্যাটফর্ম, যেখানে বিসিএস, ব্যাংক, প্রাইমারি সহ সকল চাকরির প্রস্তুতি সহজ ও ব্যাখ্যামূলকভাবে নিশ্চিত করা হয়।
        </p>

        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">📚</span>
            <span>বিসিএস ও ব্যাংক প্রস্তুতি</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⏱️</span>
            <span>লাইভ মডেল টেস্ট</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>ব্যাখ্যামূলক সমাধান</span>
          </div>
        </div>

        <div className="footer-note" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span>© {new Date().getFullYear()} TopMCQBD. All Rights Reserved.</span>
          <a href="/db-connection-check" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>🔌</span> DB Connection Check
          </a>
        </div>
      </div>
    </main>
  );
}

