// Dessin du tourbillon façon HUD de supervision : anneaux concentriques qui tournent
// en sens alternés. Tout ce qui bouge dépend de frame.rotation (donc du scroll) :
// rien n'anime le dessin au repos.
import { createRng } from './vortex-math.js';

const TWO_PI = Math.PI * 2;

/** « #00e5ff » → « rgb(0 229 255 / 0) » : un dégradé vers « transparent » passerait par du gris. */
export function transparentOf(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return Number.isNaN(r + g + b) ? 'transparent' : `rgb(${r} ${g} ${b} / 0)`;
}

function drawGlow(ctx, { centerX, centerY, scale, colors }, radius = 0.4, alpha = 0.22) {
  const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * radius);
  glow.addColorStop(0, colors.primary);
  glow.addColorStop(1, transparentOf(colors.primary));
  ctx.globalAlpha = alpha;
  ctx.fillStyle = glow;
  ctx.fillRect(centerX - scale, centerY - scale, scale * 2, scale * 2);
}

const LABELS = ['SRV', 'NET', 'SEC', 'BKP', 'DNS', 'VPN'];

export function createHud() {
  const rng = createRng(5);
  const rings = Array.from({ length: 7 }, (_, i) => {
    const radius = 0.2 + i * 0.13;
    // Arcs séparés par des trous, sur un tour complet au maximum.
    const segments = [];
    let angle = rng() * TWO_PI;
    const limit = angle + TWO_PI - 0.1;
    while (segments.length < 6) {
      const length = 0.2 + rng() * 1.1;
      if (angle + length > limit) break;
      segments.push([angle, angle + length]);
      angle += length + 0.15 + rng() * 0.5;
    }
    return {
      radius,
      segments,
      width: i % 3 === 0 ? 3 : 1.2,
      dashed: i % 2 === 1,
      ticks: i === 3 || i === 6 ? 60 : 0,
      direction: i % 2 === 0 ? 1 : -1,
      speed: 1.25 - radius * 0.5,
      nodes: Array.from({ length: 2 + Math.floor(rng() * 3) }, () => rng() * TWO_PI),
      alpha: 0.35 + rng() * 0.4,
    };
  });

  return {
    draw(ctx, frame) {
      const { rotation, centerX, centerY, scale, colors } = frame;
      drawGlow(ctx, frame, 0.3, 0.2);

      ctx.lineCap = 'round';
      rings.forEach((ring, index) => {
        const r = ring.radius * scale;
        const offset = rotation * ring.speed * ring.direction;
        ctx.strokeStyle = index % 3 === 2 ? colors.secondary : colors.primary;
        ctx.globalAlpha = ring.alpha;
        ctx.lineWidth = ring.width;
        ctx.setLineDash(ring.dashed ? [2, 6] : []);

        for (const [start, end] of ring.segments) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, start + offset, end + offset);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        if (ring.ticks) {
          ctx.lineWidth = 1;
          ctx.globalAlpha = ring.alpha * 0.6;
          ctx.beginPath();
          for (let k = 0; k < ring.ticks; k++) {
            const a = offset + (k * TWO_PI) / ring.ticks;
            const inner = r + 4;
            const outer = r + (k % 5 === 0 ? 12 : 7);
            ctx.moveTo(centerX + Math.cos(a) * inner, centerY + Math.sin(a) * inner);
            ctx.lineTo(centerX + Math.cos(a) * outer, centerY + Math.sin(a) * outer);
          }
          ctx.stroke();
        }

        ctx.fillStyle = colors.primary;
        ctx.globalAlpha = 0.9;
        for (const node of ring.nodes) {
          const a = node + offset;
          ctx.beginPath();
          ctx.arc(centerX + Math.cos(a) * r, centerY + Math.sin(a) * r, 2.5, 0, TWO_PI);
          ctx.fill();
        }
      });

      // Étiquettes de supervision sur l'anneau extérieur
      const outer = rings[rings.length - 1];
      const labelRadius = outer.radius * scale + 24;
      const labelOffset = rotation * outer.speed * outer.direction;
      ctx.font = '600 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = colors.primary;
      ctx.globalAlpha = 0.6;
      LABELS.forEach((label, k) => {
        const a = labelOffset + (k * TWO_PI) / LABELS.length;
        ctx.fillText(
          label,
          centerX + Math.cos(a) * labelRadius,
          centerY + Math.sin(a) * labelRadius,
        );
      });

      // Réticule central
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY);
      ctx.lineTo(centerX + 10, centerY);
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX, centerY + 10);
      ctx.stroke();
    },
  };
}
