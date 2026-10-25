import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Helper to convert oklch(L C H) or oklch(L% C H / A) to rgb()/rgba()
function oklchToRgbCss(match, inner) {
  try {
    const parts = inner.split('/');
    const lchPart = parts[0].trim().split(/\s+/);
    if (lchPart.length < 3) return match;

    let L = parseFloat(lchPart[0]);
    if (lchPart[0].includes('%')) {
      L = L / 100;
    }
    const C = parseFloat(lchPart[1]);
    const H = parseFloat(lchPart[2]) * (Math.PI / 180);
    const alpha = parts[1] ? parts[1].trim() : null;

    const a = C * Math.cos(H);
    const b = C * Math.sin(H);

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    const toSrgb = (c) => {
      const clamped = Math.max(0, Math.min(1, c));
      const v = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
      return Math.round(Math.max(0, Math.min(255, v * 255)));
    };

    const R = toSrgb(r);
    const G = toSrgb(g);
    const B = toSrgb(bl);

    if (alpha) {
      return `rgba(${R}, ${G}, ${B}, ${alpha})`;
    }
    return `rgb(${R}, ${G}, ${B})`;
  } catch {
    return '#d97706';
  }
}

// Helper to remove or unwrap balanced @-blocks
function unwrapAtBlocks(css, headerRegex, mode = 'unwrap') {
  let result = css;
  let match;
  while ((match = headerRegex.exec(result)) !== null) {
    const startIdx = match.index;
    const openBraceIdx = startIdx + match[0].length - 1;
    let depth = 1;
    let i = openBraceIdx + 1;
    while (i < result.length && depth > 0) {
      if (result[i] === '{') depth++;
      else if (result[i] === '}') depth--;
      i++;
    }
    if (depth === 0) {
      const inner = result.slice(openBraceIdx + 1, i - 1);
      if (mode === 'unwrap') {
        result = result.slice(0, startIdx) + inner + result.slice(i);
      } else {
        result = result.slice(0, startIdx) + result.slice(i);
      }
      headerRegex.lastIndex = 0;
    } else {
      break;
    }
  }
  return result;
}

async function main() {
  const outDir = path.resolve('dist-legacy');

  // Ensure a placeholder public/legacy-bundle.css exists so Vite doesn't warn
  const targetCss = path.resolve('public/legacy-bundle.css');
  if (!fs.existsSync(targetCss)) {
    fs.writeFileSync(targetCss, '/* legacy-bundle.css */', 'utf8');
  }

  // 1. Build Chrome 49 IIFE JS bundle
  await build({
    configFile: false,
    plugins: [react(), tailwindcss()],
    publicDir: false,
    build: {
      target: 'chrome49',
      cssTarget: 'chrome49',
      outDir,
      emptyOutDir: true,
      rolldownOptions: {
        input: path.resolve('src/main.tsx'),
        output: {
          format: 'iife',
          entryFileNames: 'legacy-bundle.js',
          assetFileNames: 'legacy-bundle.[ext]',
        },
      },
    },
  });

  const builtJs = path.join(outDir, 'legacy-bundle.js');
  const targetJs = path.resolve('public/legacy-bundle.js');
  fs.copyFileSync(builtJs, targetJs);

  // 2. Post-process CSS to flatten @layer, remove color-mix @supports, and convert any oklch() -> rgb()
  const cssFiles = fs.readdirSync(outDir).filter((f) => f.endsWith('.css'));
  let css = '';
  if (cssFiles.length > 0) {
    css = fs.readFileSync(path.join(outDir, cssFiles[0]), 'utf8');
  } else {
    const distAssets = path.resolve('dist/assets');
    const distCss = fs.readdirSync(distAssets).filter((f) => f.endsWith('.css'));
    css = fs.readFileSync(path.join(distAssets, distCss[0]), 'utf8');
  }

  css = css.replace(/@layer\s+[^{;]+;/g, '');
  css = unwrapAtBlocks(css, /@supports\s*\([^{]*color-mix[^{]*\)\s*\{/g, 'remove');
  css = unwrapAtBlocks(css, /@supports\s*\([^{]*-moz-orient[^{]*\)\s*\{/g, 'remove');
  css = unwrapAtBlocks(css, /@layer\s+[^{]+\{/g, 'unwrap');
  css = css.replace(/oklch\(([^)]+)\)/g, oklchToRgbCss);
  css = css.replace(/inset:\s*0(px)?([;}])/g, 'top:0;right:0;bottom:0;left:0$2');

  fs.writeFileSync(targetCss, css, 'utf8');
  fs.rmSync(outDir, { recursive: true, force: true });

  console.log(
    '[build-legacy] Ready:',
    'public/legacy-bundle.js =',
    fs.statSync(targetJs).size,
    'bytes, public/legacy-bundle.css =',
    fs.statSync(targetCss).size,
    'bytes'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
