'use client';
import { useState } from 'react';
import { seasons, records, hofRequirements } from '../data/seasons';

const AWARD_LABELS = {
  MVP: 'MVP',
  OPOTY: 'Off. Player of the Year',
  DPOTY: 'Def. Player of the Year',
  PMOTY: 'Play-Making of the Year',
  ROTY: 'Rookie of the Year',
  MIP: 'Most Improved Player',
  CPOTY: 'Clutch Player of the Year',
  '4MOTY': '4th Man of the Year',
  '5MOTY': '5th Man of the Year',
  BMOTY: 'Best Man of the Year',
  DEVOTY: 'Development of the Year',
  COTY: 'Coach of the Year',
};

const TEAM_COLORS = {
  'Boston Celtics': '#007a33',
  'Chicago Bulls': '#ce1141',
  'Golden State Warriors': '#1d428a',
  'San Antonio Spurs': '#c4ced4',
  'Los Angeles Lakers': '#552583',
  'Charlotte Hornets': '#00788c',
  'Oklahoma City Thunder': '#007ac1',
  'Houston Rockets': '#ce1141',
  'Miami Heat': '#98002e',
  'Philadelphia 76ers': '#006bb6',
  'Denver Nuggets': '#0e2240',
  'Dallas Mavericks': '#00538c',
  'Toronto Raptors': '#ce1141',
  'Atlanta Hawks': '#e03a3e',
  'Cleveland Cavaliers': '#860038',
};

function ChevronIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SeasonCard({ season }) {
  const [expanded, setExpanded] = useState(false);
  const [activeAllRPL, setActiveAllRPL] = useState('first');

  const teamKeys = Object.keys(season.allRPL);

  return (
    <div className={`season-card ${expanded ? 'expanded' : ''}`}>
      <div className="season-header" onClick={() => setExpanded(!expanded)}>
        <div className="season-num">S{season.id}</div>
        <div className="season-champ-info">
          <h3>🏆 {season.champion}</h3>
          <div className="meta">
            def. {season.defeated} — {season.seriesResult}
          </div>
          <div className="toty-badge" style={{ display: expanded ? 'inline-flex' : 'none' }}>
            🏅 Team of the Year: <strong>{season.toty}</strong>
          </div>
          {season.owners && expanded && (
            <div className="roster-list" style={{ marginTop: '0.6rem' }}>
              {season.owners.map((o) => (
                <span key={o} className="roster-chip">{o}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <div className="season-badge">
            <span className="versus">Champion Record</span>
            {season.record}
          </div>
          <ChevronIcon className="chevron" />
        </div>
      </div>

      <div className="season-body">
        <div className="season-body-grid">
          {/* Awards */}
          <div className="sb-block">
            <div className="sb-block-title">⭐ Season Awards</div>
            <div className="award-list">
              {Object.entries(season.awards).map(([key, val]) => (
                <div className="award-row" key={key}>
                  <span className="award-label">{AWARD_LABELS[key] || key}</span>
                  <span className="award-winner">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* All-RPL Teams */}
          <div className="sb-block">
            <div className="sb-block-title">📋 All-RPL Teams</div>
            <div style={{ marginBottom: '0.75rem' }}>
              {teamKeys.map((key) => (
                <span
                  key={key}
                  className={`team-tab ${activeAllRPL === key ? 'active' : ''}`}
                  onClick={() => setActiveAllRPL(key)}
                >
                  {key === 'first' ? '1st' : key === 'second' ? '2nd' : key === 'third' ? '3rd' : key === 'defensive' ? 'Def' : key}
                </span>
              ))}
            </div>
            {season.allRPL[activeAllRPL] && (
              <table className="allrpl-table">
                <tbody>
                  {season.allRPL[activeAllRPL].map((p, i) => (
                    <tr key={i}>
                      <td>{p.pos}</td>
                      <td>{p.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Stat Leaders */}
          {season.statLeaders && (
            <div className="sb-block" style={{ gridColumn: '1 / -1' }}>
              <div className="sb-block-title">📊 Stat Leaders</div>
              <div className="stat-leaders-grid">
                {Object.entries(season.statLeaders).map(([k, v]) => (
                  <div className="stat-leader-item" key={k}>
                    <span className="stat-leader-label">{k}</span>
                    <span className="stat-leader-name">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecordCard({ type, data }) {
  const icons = { points: '🔥', assists: '🎯', rebounds: '💪', steals: '⚡', blocks: '🛡️', turnovers: '💀' };
  const labels = { points: 'Points', assists: 'Assists', rebounds: 'Rebounds', steals: 'Steals', blocks: 'Blocks', turnovers: 'Turnovers' };

  return (
    <div className={`record-card ${type}`}>
      <div className="record-stat">{icons[type]} {labels[type]}</div>
      <div className="record-value">{data.value}</div>
      <div className="record-holder">
        {Array.isArray(data.holders) ? data.holders.join(' & ') : data.holder}
      </div>
      <div className="record-team">{data.team}</div>
    </div>
  );
}

// Admin modal for adding a season
function AdminModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    id: '',
    champion: '',
    record: '',
    defeated: '',
    defeatedRecord: '',
    seriesResult: '',
    owners: '',
    toty: '',
    MVP: '', OPOTY: '', DPOTY: '', PMOTY: '', ROTY: '', MIP: '', CPOTY: '',
    '4MOTY': '',
    statLeaders: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    const newSeason = {
      id: parseInt(form.id) || seasons.length + 1,
      champion: form.champion,
      record: form.record,
      defeated: form.defeated,
      defeatedRecord: form.defeatedRecord,
      seriesResult: form.seriesResult,
      owners: form.owners.split(',').map((s) => s.trim()).filter(Boolean),
      toty: form.toty,
      awards: {
        MVP: form.MVP,
        OPOTY: form.OPOTY,
        DPOTY: form.DPOTY,
        PMOTY: form.PMOTY,
        ROTY: form.ROTY,
        MIP: form.MIP,
        CPOTY: form.CPOTY,
        '4MOTY': form['4MOTY'],
      },
      allRPL: { first: [] },
    };
    onSave(newSeason);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Add New Season</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Season #</label>
            <input className="form-input" value={form.id} onChange={set('id')} placeholder="11" />
          </div>
          <div className="form-group">
            <label className="form-label">Champion</label>
            <input className="form-input" value={form.champion} onChange={set('champion')} placeholder="Team Name" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Champ Record</label>
            <input className="form-input" value={form.record} onChange={set('record')} placeholder="18-2" />
          </div>
          <div className="form-group">
            <label className="form-label">Defeated</label>
            <input className="form-input" value={form.defeated} onChange={set('defeated')} placeholder="Team Name" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Opponent Record</label>
            <input className="form-input" value={form.defeatedRecord} onChange={set('defeatedRecord')} placeholder="10-4" />
          </div>
          <div className="form-group">
            <label className="form-label">Series Result</label>
            <input className="form-input" value={form.seriesResult} onChange={set('seriesResult')} placeholder="2-0 (2 Games)" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Owners (comma-separated)</label>
          <input className="form-input" value={form.owners} onChange={set('owners')} placeholder="Tom, Zpud, Minis" />
        </div>
        <div className="form-group">
          <label className="form-label">Team of the Year</label>
          <input className="form-input" value={form.toty} onChange={set('toty')} placeholder="Team Name" />
        </div>
        <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div className="sb-block-title" style={{ marginBottom: '0.75rem' }}>Awards</div>
          <div className="form-row">
            {['MVP', 'OPOTY', 'DPOTY', 'PMOTY', 'ROTY', 'MIP', 'CPOTY', '4MOTY'].map((award) => (
              <div className="form-group" key={award}>
                <label className="form-label">{award}</label>
                <input className="form-input" value={form[award]} onChange={set(award)} placeholder="Player name" />
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="admin-btn" onClick={handleSave}>Save Season</button>
        </div>
      </div>
    </div>
  );
}

function LoginModal({ onClose, onSuccess }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError('Incorrect password.');
      }
    } catch {
      setError('Connection error. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Admin Access</div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Enter the admin password to unlock editing.
        </p>
        {error && <div className="login-error">{error}</div>}
        <div className="login-form">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="admin-btn" onClick={handleLogin} disabled={loading}>
              {loading ? 'Checking...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('seasons');
  const [expandedSeason, setExpandedSeason] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAddSeason, setShowAddSeason] = useState(false);
  const [localSeasons, setLocalSeasons] = useState(seasons);

  const tabs = [
    { id: 'seasons', label: '🏀 Seasons' },
    { id: 'records', label: '📈 Records' },
    { id: 'hof', label: '🏛️ Hall of Fame' },
  ];

  const handleAddSeason = (newSeason) => {
    setLocalSeasons((prev) => [...prev, newSeason]);
  };

  return (
    <>
      {/* Nav */}
      <nav className="nav">
        <a className="nav-logo" href="#">RPL <span>History Book</span></a>
        <ul className="nav-links">
          {tabs.map((t) => (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                className={activeTab === t.id ? 'active' : ''}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label.split(' ')[1]}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); isAdmin ? setIsAdmin(false) : setShowLogin(true); }}
              style={{ color: isAdmin ? 'var(--green)' : 'var(--text-muted)' }}
            >
              {isAdmin ? '✓ Admin' : 'Admin'}
            </a>
          </li>
        </ul>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">Official RPL Archive</div>
        <h1 className="hero-title">
          HISTORY<br />
          <span className="line2">BOOK</span>
        </h1>
        <p className="hero-sub">Every season. Every award. Every record. Documented.</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">{localSeasons.length}</span>
            <span className="hero-stat-label">Seasons</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">{localSeasons.reduce((a, s) => a + (s.owners?.length || 0), 0)}</span>
            <span className="hero-stat-label">Total Owners</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">{Object.keys(records).length}</span>
            <span className="hero-stat-label">Record Categories</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container">
        {/* Tabs */}
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Admin bar */}
        {isAdmin && (
          <div className="admin-bar">
            <span className="admin-badge">⚙ Admin Mode Active</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="admin-btn" onClick={() => setShowAddSeason(true)}>+ Add Season</button>
              <button className="admin-btn danger" onClick={() => setIsAdmin(false)}>Logout</button>
            </div>
          </div>
        )}

        {/* Seasons */}
        {activeTab === 'seasons' && (
          <section className="section" id="seasons">
            <div className="section-header">
              <h2 className="section-title">Seasons</h2>
              <span className="section-tag">S1 – S{localSeasons.length}</span>
            </div>
            <div className="seasons-grid">
              {[...localSeasons].reverse().map((s) => (
                <SeasonCard key={s.id} season={s} />
              ))}
            </div>
          </section>
        )}

        {/* Records */}
        {activeTab === 'records' && (
          <section className="section" id="records">
            <div className="section-header">
              <h2 className="section-title">All-Time Records</h2>
              <span className="section-tag">Single Game</span>
            </div>
            <div className="records-grid">
              {Object.entries(records).map(([type, data]) => (
                <RecordCard key={type} type={type} data={data} />
              ))}
            </div>
          </section>
        )}

        {/* HOF */}
        {activeTab === 'hof' && (
          <section className="section" id="hof">
            <div className="section-header">
              <h2 className="section-title">Hall of Fame</h2>
              <span className="section-tag">Requirements</span>
            </div>
            <div className="hof-grid">
              <div className="hof-card">
                <div className="hof-card-header">
                  <span className="hof-icon">🏀</span>
                  <div>
                    <div className="hof-card-title">Players HOF</div>
                    <div className="hof-card-sub">Player eligibility criteria</div>
                  </div>
                </div>
                <div className="hof-reqs">
                  {hofRequirements.players.map((req, i) => (
                    <div className="hof-req-item" key={i}>{req}</div>
                  ))}
                </div>
              </div>
              <div className="hof-card">
                <div className="hof-card-header">
                  <span className="hof-icon">📋</span>
                  <div>
                    <div className="hof-card-title">Coaches HOF</div>
                    <div className="hof-card-sub">Coach / Owner eligibility criteria</div>
                  </div>
                </div>
                <div className="hof-reqs">
                  {hofRequirements.coaches.map((req, i) => (
                    <div className="hof-req-item" key={i}>{req}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        RPL HISTORY BOOK — ALL SEASONS DOCUMENTED — © {new Date().getFullYear()}
      </footer>

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => setIsAdmin(true)}
        />
      )}
      {showAddSeason && isAdmin && (
        <AdminModal
          onClose={() => setShowAddSeason(false)}
          onSave={handleAddSeason}
        />
      )}
    </>
  );
}
