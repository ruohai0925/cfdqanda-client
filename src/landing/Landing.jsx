import { useEffect, useState } from 'react';
import FlowField from './FlowField';
import AgentDemo from './AgentDemo';
import Traction from './Traction';
import { USERS, INSTITUTIONS, TASKS_FLOOR } from './traction';
import { CountUp, LangToggle, Reveal } from './parts';
import './landing.css';

const GITHUB = 'https://github.com/csml-rpi/Foam-Agent';
const PAPER = 'https://www.sciencedirect.com/science/article/abs/pii/S004578252600544X';
const PAPER_LABEL = 'Computer Methods in Applied Mechanics and Engineering, 2026';

const S = {
  zh: {
    guide: '用户指南', github: 'GitHub', paper: '论文', login: '登录',
    pill: 'FoamBench 2026-11 · 基础集执行成功率 93.6%',
    h1a: '一句话，跑出', h1em: '收敛', h1b: '的 OpenFOAM 算例',
    sub: 'Foam-Agent 用多个智能体完成规划、网格、边界条件、求解和出错修复。在浏览器里描述你的流动问题，几分钟后拿到能下载、能复现的完整算例和结果。',
    ctaStart: '免费注册', ctaDemo: '看它怎么工作',
    trust: (u, i, n) => `${u} 位用户 · ${i} 家机构 · ${n}+ 次仿真`,
    models: '可选模型', modelsList: ['GPT-5.6-sol（默认）', 'Claude Opus 5.5 (high) / Sonnet', '自带 API Key'],
    authTitle: '登录 Foam-Agent', authSub: '与 cfdqanda.com 通用同一账号',
    statsTitle: '公开基准上的成绩',
    stats: [
      { v: 93.64, d: 2, s: '%', k: '执行成功率', n: 'FoamBench 基础集 · 110 个算例' },
      { v: 72.73, d: 2, s: '%', k: '物理正确率', n: '基础集 · NMSE < 0.1' },
      { v: 75, d: 0, s: '%', k: '执行成功率', n: 'FoamBench 进阶集 · 16 个算例' },
      { v: 5.5, d: 1, s: ' 分钟', k: '一句话到求解完成', n: '顶盖驱动方腔，本平台生产环境实测' },
    ],
    statsNote: '基准数据来自 Foam-Agent 官方 README（2026-11-12，commit 8b34029，失败算例计入分母）；本平台默认模型与基准所用模型不同，成绩仅供参考。',
    featTitle: '你描述问题，剩下的交给它',
    feats: [
      { i: '◎', h: '自然语言建模', p: '中文或英文描述几何、物性、边界和求解目标，自动选求解器、写全 0/ constant/ system/。' },
      { i: '⟲', h: '自动诊断修复', p: '运行出错时读日志、定位原因、改文件再跑，多轮循环直到收敛或给出明确停止原因。' },
      { i: '⏸', h: '受控模式', p: '在规划、文件、预运行三个检查点暂停，你确认或修改后再继续，适合教学和严肃工程。' },
      { i: '⇪', h: '导入算例与网格', p: '上传已有 OpenFOAM 算例（.zip）或 Gmsh 网格（.msh），在你的基础上继续。' },
      { i: '◷', h: '实时阶段', p: '任务卡片实时显示：生成网格、编写文件、求解、修复第几轮、可视化。' },
      { i: '⇩', h: '结果全部可下载', p: '完整算例、日志、云图和执行报告都能下载，本地 OpenFOAM v10 直接复跑。' },
    ],
    archTitle: '背后的多智能体架构', archCap: '规划、网格、文件编写、运行、审查、可视化各由专门的智能体负责，并按教程库分层检索参考算例。点击放大。', archAlt: 'Foam-Agent 系统架构图',
    howTitle: '四步拿到结果',
    how: [
      { h: '描述问题', p: '写下流动问题，或上传已有算例 / 网格。' },
      { h: '智能体建模', p: '规划 → 网格 → 编写文件 → 运行前检查。' },
      { h: '求解与修复', p: '在云端 OpenFOAM v10 上运行，出错自动修复。' },
      { h: '查看与下载', p: '在线浏览文件与云图，下载完整算例。' },
    ],
    endTitle: '现在就把你的第一个算例交给它', endBtn: '免费注册',
    footDiag: '算例已经跑过但结果可疑？', footDiagLink: '在 cfdqanda.com 申请专家诊断', privacy: '隐私政策', guideFull: '用户指南（含视频）',
    close: '关闭',
  },
  en: {
    guide: 'Guide', github: 'GitHub', paper: 'Paper', login: 'Log in',
    pill: 'FoamBench 2026-11 · 93.6% execution success (Basic)',
    h1a: 'From one sentence to a', h1em: 'converged', h1b: 'OpenFOAM case',
    sub: 'Foam-Agent’s agents plan the case, build the mesh, set boundary conditions, run the solver and repair what breaks. Describe your flow in the browser and get a complete, reproducible case with results in minutes.',
    ctaStart: 'Sign up free', ctaDemo: 'See how it works',
    trust: (u, i, n) => `${u} users · ${i} institutions · ${n}+ simulations`,
    models: 'Models', modelsList: ['GPT-5.6-sol (default)', 'Claude Opus 5.5 (high) / Sonnet', 'Bring your own key'],
    authTitle: 'Log in to Foam-Agent', authSub: 'One account for foam-agent.com and cfdqanda.com',
    statsTitle: 'On a public benchmark',
    stats: [
      { v: 93.64, d: 2, s: '%', k: 'execution success', n: 'FoamBench Basic · 110 cases' },
      { v: 72.73, d: 2, s: '%', k: 'physically correct', n: 'Basic · NMSE < 0.1' },
      { v: 75, d: 0, s: '%', k: 'execution success', n: 'FoamBench Advanced · 16 cases' },
      { v: 5.5, d: 1, s: ' min', k: 'sentence to solved case', n: 'lid-driven cavity, measured on this site' },
    ],
    statsNote: 'Benchmark figures are from the Foam-Agent README (2026-11-12, commit 8b34029; failures stay in the denominator). This site’s default model differs from the benchmark run, so treat them as indicative.',
    featTitle: 'You describe the problem. It does the rest.',
    feats: [
      { i: '◎', h: 'Natural-language setup', p: 'Describe geometry, properties, boundaries and goals in English or Chinese; it picks a solver and writes 0/, constant/ and system/.' },
      { i: '⟲', h: 'Self-repair', p: 'When a run fails it reads the log, finds the cause, edits the files and reruns, until it converges or stops with a clear reason.' },
      { i: '⏸', h: 'Controlled mode', p: 'Pause at plan, files and pre-run checkpoints to approve or change things before it continues.' },
      { i: '⇪', h: 'Import cases and meshes', p: 'Upload an existing OpenFOAM case (.zip) or a Gmsh mesh (.msh) and build on your own work.' },
      { i: '◷', h: 'Live stages', p: 'Each job shows where it is: meshing, writing files, solving, repair round n, visualizing.' },
      { i: '⇩', h: 'Everything downloadable', p: 'The full case, logs, plots and the workflow report; rerun it locally on OpenFOAM v10.' },
    ],
    archTitle: 'The multi-agent architecture', archCap: 'Dedicated agents plan, mesh, write inputs, run, review and visualize, with hierarchical retrieval over the tutorial library. Click to enlarge.', archAlt: 'Foam-Agent system architecture',
    howTitle: 'Four steps to results',
    how: [
      { h: 'Describe', p: 'Write the flow problem, or upload a case or mesh.' },
      { h: 'Agents set it up', p: 'Plan → mesh → write files → pre-run review.' },
      { h: 'Solve and repair', p: 'Runs on OpenFOAM v10 in the cloud; failures are repaired.' },
      { h: 'Inspect and download', p: 'Browse files and plots online; download the whole case.' },
    ],
    endTitle: 'Hand it your first case today', endBtn: 'Sign up free',
    footDiag: 'Already ran a case and the result looks wrong?', footDiagLink: 'Get an expert diagnosis at cfdqanda.com', privacy: 'Privacy Policy', guideFull: 'User Guide (incl. video)',
    close: 'Close',
  },
};

export default function Landing({ language, setLanguage, onSignup, onGuide, onPrivacy, children }) {
  const t = S[language] || S.en;
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!zoom) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setZoom(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  const toAuth = () => document.getElementById('lp-auth')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const signup = () => { onSignup?.(); setTimeout(toAuth, 50); };
  const toDemo = () => document.getElementById('lp-demo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="lp">
      <FlowField />
      <div className="lp-vignette" aria-hidden="true" />

      <header className="lp-nav">
        <a className="lp-brand" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="lp-logo" aria-hidden="true" />Foam-Agent
        </a>
        <nav className="lp-links">
          <a href="#guide" onClick={onGuide}>{t.guide}</a>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer">{t.github}</a>
          <a href={PAPER} target="_blank" rel="noopener noreferrer">{t.paper}</a>
        </nav>
        <LangToggle language={language} setLanguage={setLanguage} />
        <button type="button" className="lp-nav-login" onClick={toAuth}>{t.login}</button>
      </header>

      <main className="lp-hero">
        <div className="lp-hero-copy">
          <Reveal as="a" className="lp-pill" href={`${GITHUB}#reported-benchmark-results`} target="_blank" rel="noopener noreferrer">
            <span className="lp-pill-dot" />{t.pill}<span aria-hidden="true">→</span>
          </Reveal>
          <Reveal as="h1" className="lp-h1" delay={80}>
            {t.h1a} <em>{t.h1em}</em> {t.h1b}
          </Reveal>
          <Reveal as="p" className="lp-sub" delay={160}>{t.sub}</Reveal>
          <Reveal className="lp-cta-row" delay={240}>
            <button type="button" className="lp-btn lp-btn-primary" onClick={signup}>{t.ctaStart}</button>
            <button type="button" className="lp-btn lp-btn-ghost" onClick={toDemo}>{t.ctaDemo} ↓</button>
          </Reveal>
          <Reveal className="lp-trust" delay={280}>
            <span className="lp-trust-dot" />{t.trust(USERS, INSTITUTIONS, TASKS_FLOOR)}
          </Reveal>
          <Reveal className="lp-models" delay={320}>
            <span>{t.models}</span>
            {t.modelsList.map((m) => <span key={m} className="lp-chip">{m}</span>)}
          </Reveal>
          <Reveal id="lp-demo" className="lp-demo-wrap" delay={200}>
            <AgentDemo language={language} />
          </Reveal>
        </div>

        <aside className="lp-auth" id="lp-auth">
          <div className="lp-auth-card">
            <div className="lp-auth-head">
              <h2>{t.authTitle}</h2>
              <p>{t.authSub}</p>
            </div>
            {children}
          </div>
        </aside>
      </main>

      <Traction language={language} />

      <section className="lp-section">
        <Reveal as="h2" className="lp-h2">{t.statsTitle}</Reveal>
        <div className="lp-stats">
          {t.stats.map((s, i) => (
            <Reveal key={s.n} className="lp-stat" delay={i * 90}>
              <div className="lp-stat-v"><CountUp value={s.v} decimals={s.d} suffix={s.s} /></div>
              <div className="lp-stat-k">{s.k}</div>
              <div className="lp-stat-n">{s.n}</div>
            </Reveal>
          ))}
        </div>
        <p className="lp-note">{t.statsNote}</p>
      </section>

      <section className="lp-section">
        <Reveal as="h2" className="lp-h2">{t.featTitle}</Reveal>
        <div className="lp-feats">
          {t.feats.map((f, i) => (
            <Reveal key={f.h} className="lp-feat" delay={(i % 3) * 90}>
              <span className="lp-feat-i" aria-hidden="true">{f.i}</span>
              <h3>{f.h}</h3>
              <p>{f.p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="lp-section">
        <Reveal as="h2" className="lp-h2">{t.archTitle}</Reveal>
        <Reveal as="figure" className="lp-figure">
          <button type="button" className="lp-figure-btn" onClick={() => setZoom(true)} aria-label={t.archAlt}>
            <img src="/foam-agent-overview.webp" alt={t.archAlt} loading="lazy" width="1800" height="1065" />
          </button>
          <figcaption>{t.archCap} <a href={PAPER} target="_blank" rel="noopener noreferrer">{PAPER_LABEL}</a></figcaption>
        </Reveal>
      </section>

      <section className="lp-section">
        <Reveal as="h2" className="lp-h2">{t.howTitle}</Reveal>
        <ol className="lp-how">
          {t.how.map((h, i) => (
            <Reveal as="li" key={h.h} delay={i * 110}>
              <span className="lp-how-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{h.h}</h3>
              <p>{h.p}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="lp-section lp-end">
        <Reveal as="h2" className="lp-h2">{t.endTitle}</Reveal>
        <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={signup}>{t.endBtn}</button>
      </section>

      <footer className="lp-foot">
        <div>{t.footDiag} <a href="https://cfdqanda.com" target="_blank" rel="noopener noreferrer">{t.footDiagLink} ↗</a></div>
        <div className="lp-foot-links">
          <a href="#guide" onClick={onGuide}>{t.guideFull}</a>
          <a href="#privacy" onClick={onPrivacy}>{t.privacy}</a>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={PAPER} target="_blank" rel="noopener noreferrer">{t.paper}</a>
        </div>
      </footer>

      {zoom && (
        <div className="lp-lightbox" role="dialog" aria-modal="true" aria-label={t.archAlt} onClick={() => setZoom(false)}>
          <img src="/foam-agent-overview.webp" alt={t.archAlt} />
          <button type="button" className="lp-lightbox-close" onClick={() => setZoom(false)}>{t.close} ✕</button>
        </div>
      )}
    </div>
  );
}
