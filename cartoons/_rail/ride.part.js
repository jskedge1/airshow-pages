// zones: [fractionStart, kind] where kind = 'sea' | 'country' | 'river' | 'city'
function zoneAt(f, zones) { let z = zones[0][1]; zones.forEach(([a, k]) => { if (f >= a) z = k; }); return z; }
function ride(ctx, u, R) {
  const { a, b, dep, arr, look, zones, stations, op } = R;
  // distance travelled: smooth start and stop
  const f = E.inOutSine(prog(u, dep, arr));
  const DIST = 26000;
  const d = f * DIST;
  const top = pick({ '16x9': 180, '9x16': 440 }), railY = pick({ '16x9': 820, '9x16': 1240 });
  T.sky(ctx, C.skyTop, C.skyLow, top, railY);
  T.clouds(ctx, u - d / 400, 6, 9, top + 60, top + 260, 6, 0.95);
  // far layer: downs / skyline by zone
  const zFar = zoneAt(f, zones);
  const farY = railY - pick({ '16x9': 170, '9x16': 230 });
  const cityK = zones.reduce((acc, [st, k], i) => {
    const en = zones[i + 1] ? zones[i + 1][0] : 1;
    return k === 'city' ? Math.max(acc, clamp(1 - Math.max(st - f, f - en) / 0.06)) : acc;
  }, 0);
  ctx.save(); ctx.globalAlpha = 1 - cityK * 0.9;
  T.hills(ctx, farY, 50, 1.6, d / 2600, '#A8D98A', 3);
  ctx.restore();
  if (cityK > 0) {
    ctx.save(); ctx.globalAlpha = cityK;
    for (let i = -2; i < 24; i++) {
      const wx = Math.floor(d * 0.25 / 120) + i;
      const x = wx * 120 - d * 0.25;
      const h = 90 + hash01(wx, 4) * 190;
      ctx.fillStyle = hash01(wx, 6) > 0.5 ? '#B9C7D3' : '#A3B4C3';
      ctx.fillRect(x, farY + 60 - h, 104, h + 200);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let r = 0; r < h / 40 - 1; r++) for (let c = 0; c < 3; c++) ctx.fillRect(x + 14 + c * 30, farY + 80 - h + r * 40, 16, 20);
    }
    ctx.restore();
  }
  // sea / river strip behind
  const seaK = zones.reduce((acc, [st, k], i) => {
    const en = zones[i + 1] ? zones[i + 1][0] : 1;
    return k === 'sea' || k === 'river' ? Math.max(acc, clamp(1 - Math.max(st - f, f - en) / 0.05)) : acc;
  }, 0);
  if (seaK > 0) {
    ctx.save(); ctx.globalAlpha = seaK; ctx.fillStyle = '#7FC7E3'; ctx.fillRect(0, farY + 10, W, 70);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4;
    for (let i = 0; i < 14; i++) { const x = ((i * 160 - d * 0.4) % (W + 160) + W + 160) % (W + 160) - 80; ctx.beginPath(); ctx.moveTo(x, farY + 40); ctx.lineTo(x + 40, farY + 40); ctx.stroke(); }
    ctx.restore();
  }
  // ground
  ctx.fillStyle = C.grass; ctx.fillRect(0, farY + 70, W, railY - farY);
  // near layer: trees / fences / buildings
  for (let i = -2; i < 14; i++) {
    const wx = Math.floor(d / 260) + i;
    const x = wx * 260 - d + 60 * hash01(wx, 2);
    const z = zoneAt(clamp(wx * 260 / DIST), zones);
    const y = railY - 40;
    if (z === 'city') {
      const h = 140 + hash01(wx, 8) * 120;
      ctx.fillStyle = ['#C96A4A', '#D9B38C', '#8C9BAA'][Math.floor(hash01(wx, 9) * 3)];
      ctx.fillRect(x, y - h, 200, h);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ctx.fillRect(x + 22 + c * 60, y - h + 24 + r * 50, 34, 30);
    } else if (z === 'sea' || z === 'river') {
      ctx.fillStyle = '#E9D8A6'; ctx.fillRect(x, y - 6, 260, 10);
      if (hash01(wx, 3) > 0.5) { ctx.fillStyle = '#7A5B3A'; ctx.fillRect(x + 80, y - 60, 8, 60); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(x + 88, y - 60); ctx.lineTo(x + 130, y - 48); ctx.lineTo(x + 88, y - 36); ctx.fill(); }
    } else {
      if (hash01(wx, 3) > 0.35) {
        ctx.fillStyle = '#6B4E35'; ctx.fillRect(x + 40, y - 70, 18, 70);
        ctx.fillStyle = hash01(wx, 5) > 0.5 ? '#4E9A3A' : '#5FB046';
        ctx.beginPath(); ctx.arc(x + 49, y - 100, 58, 0, M.TAU); ctx.arc(x + 20, y - 78, 40, 0, M.TAU); ctx.arc(x + 80, y - 76, 42, 0, M.TAU); ctx.fill();
      } else { ctx.strokeStyle = '#B08A5E'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x + 240, y - 30); ctx.stroke(); }
    }
  }
  // Gatwick: a plane climbing out mid-journey (leg 1 only)
  if (R.plane) {
    const pp = prog(f, R.plane - 0.08, R.plane + 0.08);
    if (pp > 0 && pp < 1) T.jet(ctx, lerp(W * 0.1, W * 0.9, pp), lerp(farY - 20, top + 80, pp), 0.45, -0.22, { kind: 'a400' });
  }
  // platform at the start and end
  const platK = 1 - clamp(d / 1800) + clamp((d - (DIST - 1800)) / 1800);
  ctx.fillStyle = '#9AA6B0'; ctx.fillRect(0, railY + 8, W, H - railY);
  if (platK > 0) {
    const off = d < DIST / 2 ? -d : DIST - d;
    ctx.fillStyle = '#D5DCE2'; ctx.fillRect(off - 200, railY - 60, W + 400, 60 + 4);
    ctx.fillStyle = C.amber; ctx.fillRect(off - 200, railY - 60, W + 400, 8);
    // canopy posts + name board
    ctx.fillStyle = op.d;
    for (let i = 0; i < 6; i++) ctx.fillRect(off + 100 + i * 360, top + 40, 14, railY - top - 100);
    ctx.fillRect(off, top + 30, W + 200, 30);
    const name = d < DIST / 2 ? R.from : R.to;
    const nbX = off + W * 0.5;
    ctx.font = fd(54); const nbw = Math.max(560, ctx.measureText(name).width + 80);
    ctx.fillStyle = op.c; ctx.fillRect(nbX - nbw / 2, top + 110, nbw, 90);
    M.text(ctx, name, nbX, top + 172, fd(54), op.ink || '#FFFFFF', 'center');
  }
  T.rails(ctx, railY + 4, '#5A6670', '#7C6A56', d, 1);
  // Sam on the platform boards the train (leg 1), else rides
  const tS = pick({ '16x9': 0.62, '9x16': 0.5 }), cars = pick({ '16x9': 3, '9x16': 2 });
  const frontX = pick({ '16x9': 1580, '9x16': 980 });
  const arriveK = R.arrive ? E.outCubic(prog(u, R.arrive[0], R.arrive[1])) : 1;
  const tx = frontX + (1 - arriveK) * 2600;
  if (R.board) {
    const [bA, bB] = R.board;
    const walkP = prog(u, bA, bB);
    if (walkP < 1) {
      const sx = lerp(pick({ '16x9': 400, '9x16': 220 }), tx - 444 * tS * 0.2 - 40, E.inOutCubic(walkP)) - d;
      T.person(ctx, sx, railY - 58, pick({ '16x9': 0.75, '9x16': 0.6 }), { face: 1, pack: true, walk: walkP > 0 ? 1 : 0, phase: u * Math.PI * 1.5, blink: blinkAt(u), wave: walkP <= 0 ? prog(u, a, a + 0.5) : 0, waveT: u * 0.5 });
    }
  }
  T.train(ctx, tx, railY, tS, cars, look, d / 60);
  // Sam in the window once on board
  if (!R.board || u >= R.board[1]) {
    const wx = tx - 430 * tS + 50 * tS + 92 * tS + 32 * tS, wy = railY - 170 * tS + 58 * tS;
    ctx.save(); rrect(ctx, wx - 32 * tS, wy - 24 * tS, 64 * tS, 48 * tS, 10 * tS); ctx.clip();
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(wx, wy + 8 * tS, 20 * tS, 0, M.TAU); ctx.fill();
    ctx.fillStyle = C.hair; ctx.beginPath(); ctx.arc(wx, wy + 2 * tS, 21 * tS, Math.PI, M.TAU); ctx.fill();
    ctx.restore();
  }
  // progress strip
  const py = pick({ '16x9': 960, '9x16': 1400 }), px0 = S.x + 20, px1 = W - S.x - 20;
  ctx.fillStyle = C.navy; ctx.fillRect(S.x - 20, py - pick({ '16x9': 70, '9x16': 110 }), S.w + 40, pick({ '16x9': 130, '9x16': 180 }));
  ctx.strokeStyle = op.c; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px0, py); ctx.lineTo(px1, py); ctx.stroke();
  const n = stations.length;
  const pos = f * (n - 1);
  stations.forEach((s, i) => {
    const x = lerp(px0, px1, i / (n - 1));
    const past = pos >= i - 0.02;
    ctx.fillStyle = past ? op.c : C.navy; ctx.strokeStyle = op.c; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(x, py, 14, 0, M.TAU); ctx.fill(); ctx.stroke();
  });
  const cxp = lerp(px0, px1, f);
  T.badge(ctx, cxp, py, 22, '#FFF'); T.badge(ctx, cxp, py, 12, op.c);
  const near = Math.round(pos);
  const nameK = bump(pos, near, 0.45);
  const lab = Math.abs(pos - near) < 0.45 ? stations[near] : '';
  if (lab) {
    ctx.save(); ctx.globalAlpha = clamp(nameK * 2);
    const lx = clamp(cxp, px0 + 140, px1 - 140);
    T.pill(ctx, lab, lx, py - pick({ '16x9': 0, '9x16': 0 }) - pick({ '16x9': 44, '9x16': 62 }), pick({ '16x9': 30, '9x16': 32 }), '#FFF', C.navy, 'center');
    ctx.restore();
  }
  M.text(ctx, stations[0], px0, py + pick({ '16x9': 48, '9x16': 60 }), fu(pick({ '16x9': 26, '9x16': 28 }), 700), C.soft, 'left');
  M.text(ctx, stations[n - 1], px1, py + pick({ '16x9': 48, '9x16': 60 }), fu(pick({ '16x9': 26, '9x16': 28 }), 700), C.soft, 'right');
  // fact chips
  R.chips.forEach((s, i) => {
    const k = T.pop(u, R.chipAt + i * 0.5);
    const cy = pick({ '16x9': 240 + i * 70, '9x16': 500 + i * 72 });
    T.scaled(ctx, k, S.x + 150, cy, () => T.pill(ctx, s, S.x, cy, pick({ '16x9': 34, '9x16': 34 }), i === 0 ? op.c : '#FFFFFF', i === 0 ? (op.ink || '#FFF') : C.navy));
  });
  if (R.note) {
    const k = springU(u, R.note[0], SPRING.snappy);
    if (k > 0) {
      ctx.save(); ctx.globalAlpha = clamp(k * 1.3);
      const cy = pick({ '16x9': 240 + 3 * 70, '9x16': 500 + 3 * 72 });
      T.pill(ctx, R.note[1], S.x, cy, pick({ '16x9': 34, '9x16': 30 }), C.amber, C.navy);
      ctx.restore();
    }
  }
}
