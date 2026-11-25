import { useEffect, useMemo, useRef, useState } from 'react';
import { CountUp, Reveal } from './parts';
import { useInView } from './useInView';
import {
  AS_OF, USERS, INSTITUTIONS, INSTITUTIONS_SUFFIX, ACADEMIC_SHARE, TASKS_FLOOR, RETURNED, RETAINED_30D, SUCCESS,
  GROWTH, AREA_TOTAL, AREAS, SOLVERS, MESH_TOOLS,
} from './traction';

const S = {
  zh: {
    title: '真实用户，真实工况',
    sub: '不是演示用的玩具算例：下面是平台上真实用户提交的问题。',
    tiles: [
      { v: USERS, k: '注册用户' },
      { v: INSTITUTIONS, s: INSTITUTIONS_SUFFIX, k: '家机构', n: '用户自填，合并别名后计数' },
      { v: Math.round(ACADEMIC_SHARE * 100), s: '%', k: '来自高校与科研院所' },
      { v: TASKS_FLOOR, s: '+', k: '次仿真', n: '含平台内部验证' },
    ],
    growthTitle: '注册用户（累计）', growthSub: '2026 年，按月',
    month: (m) => `${+m.slice(5)}月`, monthLong: (m) => `${m.slice(0, 4)} 年 ${+m.slice(5)} 月`,
    users: (n) => `累计 ${n} 位用户`,
    areasTitle: '用户在仿真什么', areasSub: `占 ${AREA_TOTAL} 个已分类用户任务的比例；一个任务可属多个领域`,
    areaTip: (n) => `${n} / ${AREA_TOTAL} 个任务`,
    solversTitle: '用户跑过的 OpenFOAM 求解器', solversSub: `至少 ${SOLVERS.length} 种，另有网格与前处理工具`,
    retention: [
      { v: RETURNED, k: '位用户首日之后又回来' },
      { v: RETAINED_30D, k: '位一个月后仍在跑算例' },
      { v: SUCCESS.rate * 100, d: 1, s: '%', k: '的用户任务无人干预、端到端完成', n: `${SUCCESS.from} 至 ${SUCCESS.to} 复盘，${SUCCESS.tasks} 个任务` },
    ],
    table: '查看数据表', tGrowth: ['月份', '累计注册用户'], tAreas: ['领域', '任务数', '占比'],
    note: `平台数据截至 ${AS_OF}。注册数为完整统计；机构为用户自填、合并别名后计数，只公布数量；任务总数包含平台内部验证；领域按需求文本关键词分类。`,
  },
  en: {
    title: 'Real users, real engineering',
    sub: 'Not toy demos: this is what people actually submit to the platform.',
    tiles: [
      { v: USERS, k: 'registered users' },
      { v: INSTITUTIONS, s: INSTITUTIONS_SUFFIX, k: 'institutions', n: 'self-reported, aliases merged' },
      { v: Math.round(ACADEMIC_SHARE * 100), s: '%', k: 'from universities and research institutes' },
      { v: TASKS_FLOOR, s: '+', k: 'simulations run', n: 'incl. internal validation' },
    ],
    growthTitle: 'Registered users (cumulative)', growthSub: '2026, by month',
    month: (m) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m.slice(5) - 1],
    monthLong: (m) => `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][+m.slice(5) - 1]} ${m.slice(0, 4)}`,
    users: (n) => `${n} users in total`,
    areasTitle: 'What users simulate', areasSub: `Share of ${AREA_TOTAL} classified user tasks; a task can span several areas`,
    areaTip: (n) => `${n} of ${AREA_TOTAL} tasks`,
    solversTitle: 'OpenFOAM solvers users have driven', solversSub: `At least ${SOLVERS.length}, plus meshing and pre-processing tools`,
    retention: [
      { v: RETURNED, k: 'users came back after their first day' },
      { v: RETAINED_30D, k: 'were still running cases a month later' },
      { v: SUCCESS.rate * 100, d: 1, s: '%', k: 'of user tasks finished end to end, no human in the loop', n: `review of ${SUCCESS.from} to ${SUCCESS.to}, ${SUCCESS.tasks} tasks` },
    ],
    table: 'Show the data', tGrowth: ['Month', 'Registered users (cumulative)'], tAreas: ['Area', 'Tasks', 'Share'],
    note: `Platform data as of ${AS_OF}. The user count is complete; institutions are self-reported with aliases merged, and only the count is published. The task total includes internal validation. Areas are keyword-classified from the request text.`,
  },
};

const pct = (n) => `${Math.round((n / AREA_TOTAL) * 100)}%`;

function GrowthChart({ t }) {
  const [ref, seen] = useInView(0.35);
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const boxRef = useRef(null);
  // Draw in CSS pixels at the container's width so axis text keeps its size.
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 480 ? 220 : 300, L = 40, R = 18, T = 26, B = 26;
  const every = W < 480 ? 2 : 1;
  const yMax = Math.ceil(Math.max(...GROWTH.map((g) => g[1])) / 100) * 100;
  const pts = useMemo(() => GROWTH.map(([m, v], i) => ({
    m, v,
    x: L + (i / (GROWTH.length - 1)) * (W - L - R),
    y: T + (1 - v / yMax) * (H - T - B),
  })), [yMax, W, H]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
  const area = `${line}L${pts.at(-1).x},${H - B}L${pts[0].x},${H - B}Z`;
  const last = pts.at(-1);
  const h = hover == null ? null : pts[hover];

  const onMove = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    pts.forEach((p, i) => { if (Math.abs(p.x - x) < Math.abs(pts[best].x - x)) best = i; });
    setHover(best);
  };

  return (
    <div className="lp-chart-card" ref={ref}>
      <div className="lp-chart-title"><b>{t.growthTitle}</b><span>{t.growthSub}</span></div>
      <div className="lp-growth" ref={boxRef}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t.growthTitle}: ${GROWTH.map(([m, v]) => `${t.month(m)} ${v}`).join(', ')}`}
          onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="lp-growth-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--lp-accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--lp-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: yMax / 100 + 1 }, (_, i) => i * 100).map((g) => {
            const y = T + (1 - g / yMax) * (H - T - B);
            return (
              <g key={g}>
                <line x1={L} x2={W - R} y1={y} y2={y} className="lp-axis-grid" />
                <text x={L - 8} y={y + 4} textAnchor="end" className="lp-axis-label">{g}</text>
              </g>
            );
          })}
          {pts.map((p, i) => (
            (i % every === 0 || i === pts.length - 1) && <text key={p.m} x={p.x} y={H - 6} textAnchor="middle" className="lp-axis-label">{t.month(p.m)}</text>
          ))}
          <path d={area} fill="url(#lp-growth-fill)" className={`lp-growth-area ${seen ? 'is-in' : ''}`} />
          <path d={line} pathLength="1" fill="none" stroke="var(--lp-accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
            className={`lp-growth-line ${seen ? 'is-in' : ''}`} />
          <circle cx={last.x} cy={last.y} r="4.5" fill="var(--lp-accent)" stroke="var(--lp-card-solid)" strokeWidth="2" className={`lp-growth-end ${seen ? 'is-in' : ''}`} />
          <text x={last.x - 10} y={last.y - 10} textAnchor="end" className={`lp-growth-endlabel ${seen ? 'is-in' : ''}`}>{last.v}</text>
          {h && (
            <g pointerEvents="none">
              <line x1={h.x} x2={h.x} y1={T} y2={H - B} className="lp-crosshair" />
              <circle cx={h.x} cy={h.y} r="5" fill="var(--lp-accent)" stroke="var(--lp-card-solid)" strokeWidth="2" />
            </g>
          )}
          <rect x={L} y={0} width={W - L - R} height={H} fill="transparent" />
        </svg>
        {h && (
          <div className="lp-tooltip" style={{ left: `${(h.x / W) * 100}%`, top: `${(h.y / H) * 100}%` }}>
            <b>{t.users(h.v)}</b><span>{t.monthLong(h.m)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AreaBars({ t, language }) {
  const [ref, seen] = useInView(0.3);
  const [hover, setHover] = useState(null);
  const max = Math.max(...AREAS.map((a) => a.n));
  return (
    <div className="lp-chart-card" ref={ref}>
      <div className="lp-chart-title"><b>{t.areasTitle}</b><span>{t.areasSub}</span></div>
      <ul className="lp-bars">
        {AREAS.map((a, i) => (
          <li key={a.en} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}
            className={hover === i ? 'is-hover' : ''}>
            <span className="lp-bar-label">{a[language] || a.en}</span>
            <span className="lp-bar-track">
              <span className="lp-bar" style={{ width: seen ? `${(a.n / max) * 100}%` : 0, transitionDelay: `${i * 70}ms` }} />
              {hover === i && <span className="lp-bar-tip">{t.areaTip(a.n)}</span>}
            </span>
            <span className="lp-bar-value">{pct(a.n)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Traction({ language }) {
  const t = S[language] || S.en;
  return (
    <section className="lp-section">
      <Reveal as="h2" className="lp-h2">{t.title}</Reveal>
      <Reveal as="p" className="lp-section-sub">{t.sub}</Reveal>

      <div className="lp-stats">
        {t.tiles.map((s, i) => (
          <Reveal key={s.k} className="lp-stat" delay={i * 90}>
            <div className="lp-stat-v"><CountUp value={s.v} suffix={s.s || ''} /></div>
            <div className="lp-stat-k">{s.k}</div>
            {s.n && <div className="lp-stat-n">{s.n}</div>}
          </Reveal>
        ))}
      </div>

      <div className="lp-charts">
        <Reveal><GrowthChart t={t} /></Reveal>
        <Reveal delay={120}><AreaBars t={t} language={language} /></Reveal>
      </div>

      <div className="lp-charts lp-charts-2">
        <Reveal className="lp-chart-card">
          <div className="lp-chart-title"><b>{t.solversTitle}</b><span>{t.solversSub}</span></div>
          <div className="lp-solver-chips">
            {SOLVERS.map((s) => <span key={s} className="lp-chip lp-chip-solver">{s}</span>)}
            {MESH_TOOLS.map((s) => <span key={s} className="lp-chip">{s}</span>)}
          </div>
        </Reveal>
        <Reveal className="lp-chart-card lp-retention" delay={120}>
          {t.retention.map((r) => (
            <div key={r.k} className="lp-ret">
              <span className="lp-ret-v"><CountUp value={r.v} decimals={r.d || 0} suffix={r.s || ''} /></span>
              <span className="lp-ret-k">{r.k}{r.n && <small>{r.n}</small>}</span>
            </div>
          ))}
        </Reveal>
      </div>

      <details className="lp-datatable">
        <summary>{t.table}</summary>
        <div className="lp-datatable-grid">
          <table>
            <thead><tr><th>{t.tGrowth[0]}</th><th>{t.tGrowth[1]}</th></tr></thead>
            <tbody>{GROWTH.map(([m, v]) => <tr key={m}><td>{t.monthLong(m)}</td><td>{v}</td></tr>)}</tbody>
          </table>
          <table>
            <thead><tr><th>{t.tAreas[0]}</th><th>{t.tAreas[1]}</th><th>{t.tAreas[2]}</th></tr></thead>
            <tbody>{AREAS.map((a) => <tr key={a.en}><td>{a[language] || a.en}</td><td>{a.n}</td><td>{pct(a.n)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
      <p className="lp-note">{t.note}</p>
    </section>
  );
}
