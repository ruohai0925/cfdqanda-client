import { useEffect, useRef } from 'react';

// Animated background: tracer particles in flow past a cylinder (potential
// flow + doublet) with a shed von Karman vortex street. The pointer drags a
// weak vortex; a click sheds a vortex pair. Pauses when hidden or off-screen;
// with prefers-reduced-motion it draws one settled frame and stops.

const TAU = Math.PI * 2;
const BLUE = ['#1f6feb', '#388bfd', '#58a6ff', '#79c0ff', '#a5d6ff'];

export default function FlowField({
  palette = BLUE,
  background = '13,17,23',
  className = 'lp-flow',
}) {
  const ref = useRef(null);
  const paletteKey = palette.join(',');

  useEffect(() => {
    const palette = paletteKey.split(',');
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, dpr = 1, raf = 0, running = false, visible = true;
    let cyl = { x: 0, y: 0, r: 30 };
    const U = 90;                 // free-stream speed, px/s
    let particles = [];
    let vortices = [];
    let shedTimer = 0, shedSign = 1;
    const pointer = { x: -1e4, y: -1e4, strength: 0, lastX: 0, lastY: 0 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const r = Math.max(18, Math.min(44, Math.min(W, H) * 0.045));
      // keep the cylinder in the side margin on wide screens, low on narrow ones
      cyl = W >= 1100
        ? { x: Math.max(r + 12, (W - 1240) / 2 - r * 0.6), y: H * 0.62, r }
        : { x: W * 0.12, y: H * 0.9, r };
      const n = Math.round(Math.min(1600, Math.max(350, (W * H) / 900)));
      particles = Array.from({ length: n }, () => spawn(true));
      vortices = [];
      ctx.fillStyle = `rgb(${background})`;
      ctx.fillRect(0, 0, W, H);
    }

    function spawn(anywhere) {
      return {
        x: anywhere ? Math.random() * W : -Math.random() * 40,
        y: Math.random() * H,
        age: 0,
        life: 4 + Math.random() * 8,
      };
    }

    function velocity(x, y) {
      // uniform stream + doublet (cylinder)
      const dx = x - cyl.x, dy = y - cyl.y;
      const r2 = dx * dx + dy * dy, R2 = cyl.r * cyl.r;
      let u = U, v = 0;
      if (r2 > 1) {
        const r4 = r2 * r2;
        u = U * (1 - (R2 * (dx * dx - dy * dy)) / r4);
        v = -U * (2 * R2 * dx * dy) / r4;
      }
      // shed vortices (Lamb-Oseen-like core)
      for (const k of vortices) {
        const ex = x - k.x, ey = y - k.y;
        const q = k.g / (TAU * (ex * ex + ey * ey + k.c * k.c));
        u -= q * ey; v += q * ex;
      }
      if (pointer.strength > 0.01) {
        const ex = x - pointer.x, ey = y - pointer.y;
        const q = (pointer.strength * 9000) / (TAU * (ex * ex + ey * ey + 900));
        u -= q * ey; v += q * ex;
      }
      return [u, v];
    }

    function step(dt) {
      // shed alternating vortices behind the cylinder
      shedTimer += dt;
      if (shedTimer > 1.15) {
        shedTimer = 0; shedSign = -shedSign;
        vortices.push({
          x: cyl.x + cyl.r * 1.4, y: cyl.y + shedSign * cyl.r * 0.55,
          g: -shedSign * U * cyl.r * 3.2, c: cyl.r * 0.7,
        });
      }
      for (const k of vortices) { k.x += U * 0.82 * dt; k.g *= 1 - 0.04 * dt; k.c += 3 * dt; }
      vortices = vortices.filter((k) => k.x < W + 200);
      pointer.strength *= Math.pow(0.25, dt);

      const buckets = palette.map(() => []);
      const n = palette.length;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const [u, v] = velocity(p.x, p.y);
        const nx = p.x + u * dt, ny = p.y + v * dt;
        const dx = nx - cyl.x, dy = ny - cyl.y;
        p.age += dt;
        if (nx > W + 5 || ny < -5 || ny > H + 5 || p.age > p.life || dx * dx + dy * dy < cyl.r * cyl.r) {
          particles[i] = spawn(Math.random() < 0.35);
          continue;
        }
        const speed = Math.hypot(u, v) / U;      // ~0..2
        const b = Math.min(n - 1, Math.floor(Math.max(0, speed - 0.35) * n * 0.75));
        buckets[b].push(p.x, p.y, nx, ny);
        p.x = nx; p.y = ny;
      }
      return buckets;
    }

    function draw(buckets) {
      ctx.fillStyle = `rgba(${background},0.045)`;
      ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 1.1;
      ctx.lineCap = 'round';
      buckets.forEach((seg, b) => {
        if (!seg.length) return;
        ctx.strokeStyle = palette[b];
        ctx.globalAlpha = 0.55 + 0.1 * b;
        ctx.beginPath();
        for (let j = 0; j < seg.length; j += 4) { ctx.moveTo(seg[j], seg[j + 1]); ctx.lineTo(seg[j + 2], seg[j + 3]); }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      // the cylinder
      ctx.beginPath();
      ctx.arc(cyl.x, cyl.y, cyl.r, 0, TAU);
      ctx.fillStyle = `rgb(${background})`;
      ctx.fill();
      ctx.strokeStyle = palette[Math.min(2, palette.length - 1)];
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    let last = 0;
    function frame(t) {
      if (!running) return;
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
      last = t;
      draw(step(dt));
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running || reduced || !visible || document.hidden) return;
      running = true; last = 0; raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const moved = Math.hypot(x - pointer.lastX, y - pointer.lastY);
      pointer.lastX = x; pointer.lastY = y;
      pointer.x = x; pointer.y = y;
      pointer.strength = Math.min(1.2, pointer.strength + moved / 120);
    }
    function onClick(e) {
      if (e.target.closest('a,button,input,textarea,select,label,iframe')) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      vortices.push({ x, y: y - 14, g: U * 90, c: 16 }, { x, y: y + 14, g: -U * 90, c: 16 });
    }
    function onVisibility() { document.hidden ? stop() : start(); }

    resize();
    if (reduced) {
      for (let i = 0; i < 240; i++) draw(step(1 / 60));
    }
    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); });
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop(); ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [paletteKey, background]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
