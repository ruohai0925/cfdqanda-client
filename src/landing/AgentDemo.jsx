import { useEffect, useMemo, useState } from 'react';
import { useInView } from './useInView';

// Scripted (not live) replay of a Foam-Agent run: the prompt types out, the
// agent nodes light up in the order the real workflow runs them, the solver's
// residuals draw, and one scenario shows the reviewer repairing a failed run.

const SCENARIOS = {
  zh: [
    { label: '顶盖驱动方腔', prompt: '二维顶盖驱动方腔，顶盖速度 1 m/s，ν = 0.01，用 icoFoam 算到 t = 0.5 s', solver: 'icoFoam', mesh: 'blockMesh · 400 cells', fail: null },
    { label: '圆柱绕流 Re=100', prompt: '圆柱绕流，Re = 100，pimpleFoam，观察卡门涡街并输出升力系数', solver: 'pimpleFoam', mesh: 'blockMesh · 12,800 cells', fail: '时间步 0.012 s 发散：Courant 数 4.7 > 1', fix: '把 deltaT 改为 0.002 s，开启 adjustTimeStep，maxCo 0.9' },
    { label: '后台阶 k-ε', prompt: '后台阶流动，入口 10 m/s，k-epsilon 湍流模型，simpleFoam 稳态求解', solver: 'simpleFoam', mesh: 'blockMesh · 12,225 cells', fail: 'keyword div(phi,epsilon) is undefined in fvSchemes', fix: '在 fvSchemes 补上 div(phi,k) 与 div(phi,epsilon) 的格式' },
  ],
  en: [
    { label: 'Lid-driven cavity', prompt: '2D lid-driven cavity, lid at 1 m/s, nu = 0.01, icoFoam to t = 0.5 s', solver: 'icoFoam', mesh: 'blockMesh · 400 cells', fail: null },
    { label: 'Cylinder, Re=100', prompt: 'Flow past a cylinder at Re = 100 with pimpleFoam; capture the vortex street and report the lift coefficient', solver: 'pimpleFoam', mesh: 'blockMesh · 12,800 cells', fail: 'Diverged at deltaT 0.012 s: Courant number 4.7 > 1', fix: 'deltaT 0.002 s, adjustTimeStep on, maxCo 0.9' },
    { label: 'Backward step k-ε', prompt: 'Backward-facing step, 10 m/s inlet, k-epsilon turbulence, steady simpleFoam', solver: 'simpleFoam', mesh: 'blockMesh · 12,225 cells', fail: 'keyword div(phi,epsilon) is undefined in fvSchemes', fix: 'add div(phi,k) and div(phi,epsilon) schemes to fvSchemes' },
  ],
};

const T = {
  zh: {
    demo: '演示动画', title: 'foam-agent · 新任务',
    plan: '规划算例', planD: (s) => `求解器 ${s.solver}，0/ constant/ system/ 共 9 个文件`,
    mesh: '生成网格', write: '编写算例文件', writeD: 'U · p · fvSchemes · fvSolution · controlDict …',
    review: '运行前检查', reviewD: '量纲、边界条件与求解器设置一致',
    run: '运行求解器', repair: '诊断并修复', rerun: '重新运行',
    viz: '生成可视化', vizD: '速度云图 · 流线 · 残差曲线',
    done: '完成，可下载算例与结果', residual: '残差', try: '换个例子：',
  },
  en: {
    demo: 'Demo', title: 'foam-agent · new run',
    plan: 'Plan the case', planD: (s) => `${s.solver}; 9 files across 0/ constant/ system/`,
    mesh: 'Mesh', write: 'Write case files', writeD: 'U · p · fvSchemes · fvSolution · controlDict …',
    review: 'Pre-run review', reviewD: 'units, boundary conditions and solver settings agree',
    run: 'Run the solver', repair: 'Diagnose and repair', rerun: 'Run again',
    viz: 'Visualize', vizD: 'velocity contour · streamlines · residuals',
    done: 'Done: case and results ready to download', residual: 'Residuals', try: 'Try another:',
  },
};

function buildSteps(s, t) {
  const steps = [
    { key: 'plan', name: t.plan, detail: t.planD(s), ms: 1300 },
    { key: 'mesh', name: t.mesh, detail: s.mesh, ms: 1100 },
    { key: 'write', name: t.write, detail: t.writeD, ms: 1500 },
    { key: 'review', name: t.review, detail: t.reviewD, ms: 900 },
  ];
  if (s.fail) {
    steps.push({ key: 'run', name: t.run, detail: s.fail, ms: 1800, run: 'diverge', error: true });
    steps.push({ key: 'repair', name: t.repair, detail: s.fix, ms: 1600 });
    steps.push({ key: 'rerun', name: t.rerun, detail: `${s.solver} · End`, ms: 2600, run: 'converge' });
  } else {
    steps.push({ key: 'run', name: t.run, detail: `${s.solver} · End`, ms: 2600, run: 'converge' });
  }
  steps.push({ key: 'viz', name: t.viz, detail: t.vizD, ms: 1200 });
  return steps;
}

// Deterministic residual history for the chart (log10 scale, 3 fields).
function residuals(mode, seed) {
  const out = [[], [], []];
  const N = 60;
  for (let i = 0; i < N; i++) {
    const k = i / (N - 1);
    for (let f = 0; f < 3; f++) {
      const wobble = 0.25 * Math.sin(i * (0.9 + f * 0.37) + seed + f);
      const y = mode === 'diverge'
        ? -1 - f * 0.4 - 2.2 * k + (k > 0.45 ? Math.pow((k - 0.45) * 5, 2.2) : 0) + wobble
        : -0.8 - f * 0.5 - 5.2 * Math.pow(k, 0.8) + wobble * (1 - k);
      out[f].push(y);
    }
  }
  return out;
}

function ResidualChart({ mode, progress, seed, label }) {
  const data = useMemo(() => residuals(mode, seed), [mode, seed]);
  const W = 640, H = 110, lo = -7, hi = 1;
  const n = Math.max(2, Math.round(progress * data[0].length));
  const colors = ['var(--lp-accent)', 'var(--lp-accent-2)', 'var(--lp-accent-3)'];
  return (
    <svg className="lp-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {[-6, -4, -2, 0].map((g) => {
        const y = H - ((g - lo) / (hi - lo)) * H;
        return <g key={g}><line x1="0" x2={W} y1={y} y2={y} className="lp-chart-grid" /><text x="2" y={y - 2} className="lp-chart-tick">1e{g}</text></g>;
      })}
      {data.map((series, f) => (
        <polyline key={f} fill="none" stroke={colors[f]} strokeWidth="1.6" strokeLinejoin="round"
          points={series.slice(0, n).map((v, i) => `${(i / (series.length - 1)) * W},${H - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * H}`).join(' ')} />
      ))}
    </svg>
  );
}

export default function AgentDemo({ language }) {
  const t = T[language] || T.en;
  const scenarios = SCENARIOS[language] || SCENARIOS.en;
  const [which, setWhich] = useState(0);
  const [typed, setTyped] = useState(0);
  const [stepIdx, setStepIdx] = useState(-1);   // -1 = typing
  const [runProgress, setRunProgress] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [ref, seen] = useInView(0.3);
  const s = scenarios[which];
  const steps = useMemo(() => buildSteps(s, t), [s, t]);
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // restart when scenario or language changes
  useEffect(() => { setTyped(0); setStepIdx(-1); setRunProgress(0); }, [which, language, cycle]);

  useEffect(() => {
    if (!seen) return undefined;
    if (reduced) { setTyped(s.prompt.length); setStepIdx(steps.length); setRunProgress(1); return undefined; }
    if (stepIdx === -1) {
      if (typed < s.prompt.length) {
        const id = setTimeout(() => setTyped((n) => n + 1), language === 'zh' ? 55 : 22);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setStepIdx(0), 500);
      return () => clearTimeout(id);
    }
    if (stepIdx < steps.length) {
      const st = steps[stepIdx];
      if (st.run) {
        if (runProgress < 1) {
          const id = setTimeout(() => setRunProgress((p) => Math.min(1, p + 50 / st.ms)), 50);
          return () => clearTimeout(id);
        }
      }
      const id = setTimeout(() => { setStepIdx((i) => i + 1); setRunProgress(0); }, st.run ? 400 : st.ms);
      return () => clearTimeout(id);
    }
    // finished: loop to the next scenario after a pause
    const id = setTimeout(() => setWhich((w) => (w + 1) % scenarios.length), 4200);
    return () => clearTimeout(id);
  }, [seen, reduced, typed, stepIdx, runProgress, steps, s, language, scenarios.length]);

  const current = steps[stepIdx];
  const lastRun = [...steps.slice(0, Math.min(stepIdx + 1, steps.length))].reverse().find((x) => x.run);
  const chartMode = lastRun?.run;
  const chartProgress = current?.run ? runProgress : (lastRun ? 1 : 0);
  const finished = stepIdx >= steps.length;

  return (
    <div className="lp-demo" ref={ref}>
      <div className="lp-demo-bar">
        <span className="lp-dots"><i /><i /><i /></span>
        <span className="lp-demo-title">{t.title}</span>
        <span className="lp-demo-badge">{t.demo}</span>
      </div>
      <div className="lp-demo-prompt">
        <span className="lp-caret-sign">›</span>
        <span>{s.prompt.slice(0, typed)}</span>
        {stepIdx === -1 && <span className="lp-caret" />}
      </div>
      <ol className="lp-steps">
        {steps.map((st, i) => {
          const state = i < stepIdx ? (st.error ? 'error' : 'done') : i === stepIdx ? 'active' : 'pending';
          return (
            <li key={st.key} className={`lp-step is-${state}`}>
              <span className="lp-step-icon" aria-hidden="true" />
              <span className="lp-step-name">{st.name}</span>
              {state !== 'pending' && <span className="lp-step-detail">{st.detail}</span>}
            </li>
          );
        })}
      </ol>
      <div className={`lp-demo-chart ${chartMode ? 'is-on' : ''}`}>
        <div className="lp-demo-chart-head">
          <span>{t.residual}</span>
          <span className="lp-legend"><i className="c1" />Ux <i className="c2" />Uy <i className="c3" />p</span>
        </div>
        {chartMode && <ResidualChart mode={chartMode} progress={chartProgress} seed={which * 3 + (chartMode === 'diverge' ? 1 : 0)} label={t.residual} />}
      </div>
      <div className={`lp-demo-done ${finished ? 'is-on' : ''}`}>✓ {t.done}</div>
      <div className="lp-demo-try">
        <span>{t.try}</span>
        {scenarios.map((sc, i) => (
          <button key={sc.label} type="button" aria-pressed={i === which}
            onClick={() => { if (i === which) setCycle((c) => c + 1); else setWhich(i); }}>
            {sc.label}
          </button>
        ))}
      </div>
    </div>
  );
}
