/* UK Airshow Guide mascot ("Pip", working name).
   One function draws every pose as inline SVG, so the same character can sit in a tip box,
   a loading state, a section header or an animation without a folder of separate drawings.

     UKAGMascot.svg('hello')                      a ready-made pose
     UKAGMascot.svg({ eyes:'wink', right:-40 })   or your own mix
     <span data-pip="tip"></span>                 filled in automatically on page load

   Options: left / right (wing angle in degrees, minus is raised), eyes (open, happy, wink, wide,
   worried), look [x, y], mouth (smile, grin, o, flat, frown), spin (propeller turning),
   prop (blade angle), hat, ears (ear defenders), camera, holdL / holdR (paddle, map, umbrella),
   fly (wheels up, trails), ground (shadow), size (px), title (text for screen readers). */
(function (root) {
  var C = {
    ink: '#10202F', blue: '#1F4E8C', blueLt: '#2C63AB', teal: '#32B4AF', tealDk: '#23908C',
    red: '#D74949', redDk: '#B23535', cream: '#F8F4EA', yellow: '#FFC23A', amber: '#E39A1F',
    glass: '#BFE6F2', grey: '#3A4450', tyre: '#2C2C2C', mouth: '#7A1F2B', white: '#FFFFFF'
  };
  var SW = 'stroke="' + C.ink + '" stroke-linejoin="round" stroke-linecap="round"';

  var POSES = {
    rest:    {},
    hello:   { right: -52, eyes: 'happy', mouth: 'grin' },
    tip:     { right: -28, left: 20, eyes: 'wink', look: [5, -2] },
    point:   { right: -8, left: 22, look: [7, 0], mouth: 'grin' },
    headsup: { left: -30, right: -30, eyes: 'worried', mouth: 'o', holdL: 'paddle', holdR: 'paddle' },
    marshal: { left: -62, right: -62, mouth: 'grin', holdL: 'paddle', holdR: 'paddle', look: [0, -4] },
    loud:    { ears: true, eyes: 'happy', mouth: 'grin', left: -12, right: -12, spin: true },
    sun:     { hat: true, eyes: 'happy', left: 16, right: -34 },
    rain:    { right: -56, left: 24, holdR: 'umbrella', look: [3, -6], mouth: 'flat', box: '0 -80 430 430' },
    photo:   { camera: true, eyes: 'wink', left: 22, right: 22 },
    map:     { left: -24, right: 20, holdL: 'map', look: [-7, -3], box: '-45 5 445 390' },
    cheer:   { left: -58, right: -58, eyes: 'happy', mouth: 'grin' },
    loading: { spin: true, look: [0, -6], left: 6, right: 6 },
    oops:    { eyes: 'wide', mouth: 'o', left: 34, right: 34 },
    fly:     { fly: true, spin: true, eyes: 'happy', mouth: 'grin', left: -6, right: -6, ground: false, box: '-40 0 480 400' }
  };

  function item(kind) {
    if (kind === 'paddle') {
      return '<path d="M0 8V-26" ' + SW + ' stroke-width="9" fill="none"/>' +
        '<circle cx="0" cy="-48" r="25" fill="' + C.amber + '" ' + SW + ' stroke-width="5"/>' +
        '<circle cx="0" cy="-48" r="12" fill="' + C.yellow + '"/>';
    }
    if (kind === 'map') {
      return '<g transform="rotate(-8)"><path d="M-34 -58l22 6 24-6 22 6v48l-22-6-24 6-22-6z" fill="' + C.cream + '" ' + SW + ' stroke-width="5"/>' +
        '<path d="M-12 -52v48M12 -58v48" stroke="' + C.ink + '" stroke-opacity=".25" stroke-width="3" fill="none"/>' +
        '<path d="M-26 -22q10 -14 20 -4t22 -10" stroke="' + C.teal + '" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="1 7"/>' +
        '<circle cx="20" cy="-38" r="6" fill="' + C.red + '"/></g>';
    }
    if (kind === 'umbrella') {
      return '<g transform="rotate(-40)"><path d="M0 12V-120" ' + SW + ' stroke-width="7" fill="none"/>' +
        '<path d="M-100 -118q4 -84 100 -88q96 4 100 88q-17 -20 -34 0q-16 -20 -33 0q-17 -20 -33 0q-17 -20 -33 0q-16 -20 -33 0q-17 -20 -34 0z" fill="' + C.red + '" ' + SW + ' stroke-width="5"/>' +
        '<path d="M-33 -118q2 -60 33 -88q31 28 33 88" fill="' + C.cream + '" ' + SW + ' stroke-width="4"/>' +
        '<path d="M0 -206v-12" ' + SW + ' stroke-width="6" fill="none"/></g>';
    }
    return '';
  }

  function wing(side, angle, hold) {
    var right = side === 'r';
    var s = '<g transform="translate(' + (right ? 265 : 135) + ' 215)' + (right ? '' : ' scale(-1 1)') + '">' +
      '<g class="pip-wing pip-wing-' + side + '" transform="rotate(' + angle + ')">' +
      '<path d="M0 -27L104 -19q20 2 20 19t-20 19L0 27z" fill="' + C.teal + '" ' + SW + ' stroke-width="6"/>' +
      '<path d="M76 -21l16 1v40l-16 1z" fill="' + C.cream + '"/>' +
      '<path d="M0 -27L104 -19q20 2 20 19t-20 19L0 27" fill="none" ' + SW + ' stroke-width="6"/>';
    if (hold) s += '<g transform="translate(108 0) rotate(' + (-angle) + ')' + (right ? '' : ' scale(-1 1)') + '">' + item(hold) + '</g>';
    return s + '</g></g>';
  }

  function eye(cx, kind, look) {
    var cy = 184;
    if (kind === 'happy') return '<path d="M' + (cx - 17) + ' ' + (cy + 6) + 'q17 -26 34 0" fill="none" ' + SW + ' stroke-width="7"/>';
    var wide = kind === 'wide';
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (wide ? 22 : 20) + '" ry="' + (wide ? 28 : 25) + '" fill="' + C.white + '" ' + SW + ' stroke-width="4.5"/>' +
      '<circle cx="' + (cx + look[0]) + '" cy="' + (cy + 2 + look[1]) + '" r="' + (wide ? 8 : 11.5) + '" fill="' + C.ink + '"/>' +
      '<circle cx="' + (cx + look[0] - 4) + '" cy="' + (cy - 3 + look[1]) + '" r="' + (wide ? 2.5 : 4) + '" fill="' + C.white + '"/>';
  }

  function mouth(kind) {
    if (kind === 'grin') return '<path d="M176 254q24 40 48 0z" fill="' + C.mouth + '" ' + SW + ' stroke-width="4.5"/><ellipse cx="200" cy="268" rx="9" ry="4" fill="' + C.red + '"/>';
    if (kind === 'o') return '<ellipse cx="200" cy="266" rx="9" ry="11" fill="' + C.mouth + '" ' + SW + ' stroke-width="4.5"/>';
    if (kind === 'flat') return '<path d="M184 264h32" fill="none" ' + SW + ' stroke-width="5.5"/>';
    if (kind === 'frown') return '<path d="M182 270q18 -14 36 0" fill="none" ' + SW + ' stroke-width="5.5"/>';
    return '<path d="M178 257q22 22 44 0" fill="none" ' + SW + ' stroke-width="5.5"/>';
  }

  function svg(opts) {
    var o = {}, k, p = typeof opts === 'string' ? { pose: opts } : (opts || {});
    var base = POSES[p.pose] || {};
    for (k in base) o[k] = base[k];
    for (k in p) o[k] = p[k];
    var left = o.left == null ? 12 : o.left, right = o.right == null ? 12 : o.right;
    var look = o.look || [0, 0], eyes = o.eyes || 'open';
    var ground = o.ground == null ? true : o.ground;
    var box = o.box || '0 20 400 350';
    var size = o.size ? ' width="' + o.size + '" height="' + o.size + '"' : '';
    var title = o.title == null ? 'Pip, the UK Airshow Guide mascot' : o.title;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" class="pip" viewBox="' + box + '"' + size +
      (title ? ' role="img" aria-label="' + title + '"' : ' aria-hidden="true"') + '>';

    if (o.fly) {
      s += '<path d="M-30 372q150 10 300 -62" fill="none" stroke="' + C.red + '" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M-20 392q170 4 330 -70" fill="none" stroke="' + C.teal + '" stroke-width="9" stroke-linecap="round"/>';
    } else if (ground) {
      s += '<ellipse cx="200" cy="352" rx="92" ry="9" fill="' + C.ink + '" fill-opacity=".13"/>';
    }
    s += '<g class="pip-body"' + (o.fly ? ' transform="rotate(-9 200 210)"' : '') + '>';

    // tail
    s += '<rect x="122" y="98" width="156" height="24" rx="12" fill="' + C.teal + '" ' + SW + ' stroke-width="6"/>';
    if (!o.hat) {
      s += '<path d="M184 126l5 -62q11 -14 22 0l5 62z" fill="' + C.blue + '" ' + SW + ' stroke-width="6"/>' +
        '<path d="M188.300 74q11.700 -14 23.400 0l1.300 16h-26z" fill="' + C.red + '"/>' +
        '<path d="M184 126l5 -62q11 -14 22 0l5 62" fill="none" ' + SW + ' stroke-width="6"/>';
    }
    // wings
    s += wing('l', left, o.holdL) + wing('r', right, o.holdR);
    // wheels
    if (!o.fly) {
      s += '<path d="M168 292l-6 30M232 292l6 30" fill="none" ' + SW + ' stroke-width="9"/>' +
        '<ellipse cx="160" cy="330" rx="12" ry="18" fill="' + C.tyre + '" ' + SW + ' stroke-width="5"/><ellipse cx="160" cy="330" rx="4" ry="7" fill="' + C.red + '"/>' +
        '<ellipse cx="240" cy="330" rx="12" ry="18" fill="' + C.tyre + '" ' + SW + ' stroke-width="5"/><ellipse cx="240" cy="330" rx="4" ry="7" fill="' + C.red + '"/>';
    }
    // canopy, body, muzzle
    s += '<path d="M158 132q42 -84 84 0z" fill="' + C.glass + '" ' + SW + ' stroke-width="6"/>' +
      '<path d="M180 112q8 -14 20 -18" fill="none" stroke="' + C.white + '" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="200" cy="210" r="95" fill="' + C.blue + '" ' + SW + ' stroke-width="6"/>' +
      '<path d="M122 190a80 80 0 0 1 52 -58" fill="none" stroke="' + C.blueLt + '" stroke-width="9" stroke-linecap="round"/>' +
      '<ellipse cx="200" cy="256" rx="60" ry="40" fill="' + C.cream + '"/>';
    // propeller disc, behind the face so the eyes stay clear
    if (o.spin) {
      s += '<g transform="translate(200 228)">';
      s += '<g class="pip-disc"><circle r="64" fill="' + C.white + '" fill-opacity=".3" stroke="' + C.ink + '" stroke-opacity=".3" stroke-width="3"/>' +
        '<circle r="56" fill="none" stroke="' + C.yellow + '" stroke-opacity=".75" stroke-width="5"/>' +
        '<path d="M-44 -22a50 50 0 0 1 30 -26M44 22a50 50 0 0 1 -30 26" fill="none" stroke="' + C.white + '" stroke-opacity=".8" stroke-width="5" stroke-linecap="round"/></g>';
      s += '</g>';
    }
    // face
    s += '<g class="pip-eyes">' + eye(168, eyes === 'wink' ? 'open' : eyes, look) + eye(232, eyes === 'wink' ? 'happy' : eyes, look) + '</g>';
    if (eyes === 'worried') s += '<path d="M148 152l32 -10M252 152l-32 -10" fill="none" ' + SW + ' stroke-width="6"/>';
    s += mouth(o.mouth);
    // ear defenders
    if (o.ears) {
      s += '<path d="M104 176a96 96 0 0 1 192 0" fill="none" ' + SW + ' stroke-width="17"/>' +
        '<path d="M104 176a96 96 0 0 1 192 0" fill="none" stroke="' + C.grey + '" stroke-width="8" stroke-linecap="round"/>' +
        '<rect x="84" y="158" width="36" height="62" rx="16" fill="' + C.yellow + '" ' + SW + ' stroke-width="6"/>' +
        '<rect x="280" y="158" width="36" height="62" rx="16" fill="' + C.yellow + '" ' + SW + ' stroke-width="6"/>';
    }
    // sun hat
    if (o.hat) {
      s += '<path d="M146 126q4 -62 54 -62t54 62z" fill="' + C.cream + '" ' + SW + ' stroke-width="6"/>' +
        '<path d="M147.500 108h105l1.500 18h-108z" fill="' + C.red + '"/>' +
        '<ellipse cx="200" cy="128" rx="112" ry="20" fill="' + C.cream + '" ' + SW + ' stroke-width="6"/>' +
        '<path d="M150 124q50 12 100 0" fill="none" stroke="' + C.ink + '" stroke-opacity=".2" stroke-width="5" stroke-linecap="round"/>';
    }
    // propeller and spinner
    s += '<g transform="translate(200 228)">';
    if (!o.spin) {
      var blade = '<ellipse cx="36" cy="0" rx="30" ry="9.500" fill="' + C.grey + '"/><ellipse cx="57" cy="0" rx="7" ry="5.500" fill="' + C.yellow + '"/>' +
        '<ellipse cx="36" cy="0" rx="30" ry="9.500" fill="none" ' + SW + ' stroke-width="4"/>';
      s += '<g class="pip-prop" transform="rotate(' + (o.prop == null ? -10 : o.prop) + ')">' + blade + '<g transform="rotate(180)">' + blade + '</g></g>';
    }
    s += '<circle r="22" fill="' + C.red + '" ' + SW + ' stroke-width="5.500"/><circle cx="-7" cy="-8" r="6" fill="' + C.white + '" fill-opacity=".55"/></g>';
    // camera on a strap
    if (o.camera) {
      s += '<path d="M118 232q30 50 56 62M282 232q-30 50 -56 62" fill="none" stroke="' + C.ink + '" stroke-width="6" stroke-linecap="round"/>' +
        '<rect x="180" y="278" width="26" height="14" rx="4" fill="' + C.tyre + '" ' + SW + ' stroke-width="5"/>' +
        '<rect x="160" y="286" width="80" height="50" rx="10" fill="' + C.grey + '" ' + SW + ' stroke-width="6"/>' +
        '<circle cx="204" cy="311" r="18" fill="' + C.tyre + '" ' + SW + ' stroke-width="5"/><circle cx="204" cy="311" r="10" fill="' + C.teal + '"/>' +
        '<circle cx="200" cy="307" r="3.500" fill="' + C.white + '"/><rect x="168" y="294" width="12" height="7" rx="2" fill="' + C.yellow + '"/>';
    }
    return s + '</g></svg>';
  }

  var api = { svg: svg, poses: Object.keys(POSES), colours: C };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.UKAGMascot = api;
  if (typeof document !== 'undefined') {
    var fill = function () {
      var els = document.querySelectorAll('[data-pip]');
      for (var i = 0; i < els.length; i++) {
        if (els[i].firstChild) continue;
        var t = els[i].getAttribute('data-pip-title');
        els[i].innerHTML = svg({ pose: els[i].getAttribute('data-pip') || 'rest', title: t == null ? undefined : t });
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
  }
})(typeof window !== 'undefined' ? window : globalThis);
