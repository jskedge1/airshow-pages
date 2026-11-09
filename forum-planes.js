/* Airshow Forum aircraft drawings (9 Nov 2026).
   Flat top-down outlines drawn for the guide, nose pointing right, in a 100 x 100 box.
   Only aircraft flown by the RAF, the USA, Sweden, France and other European air arms.
   ForumPlanes.svg(kind, opts) returns a full <svg>; ForumPlanes.g(kind) returns just the shapes. */
(function () {
  "use strict";

  var roundelRAF = function (x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#1F3F8F"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.62) + '" fill="#fff"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.32) + '" fill="#C8102E"/>';
  };
  var roundelFR = function (x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#C8102E"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.62) + '" fill="#fff"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.32) + '" fill="#1F3F8F"/>';
  };
  var roundelSE = function (x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#1F5FA8"/><circle cx="' + x + '" cy="' + (y - r * 0.32) + '" r="' + (r * 0.2) + '" fill="#F2C230"/><circle cx="' + (x - r * 0.3) + '" cy="' + (y + r * 0.22) + '" r="' + (r * 0.2) + '" fill="#F2C230"/><circle cx="' + (x + r * 0.3) + '" cy="' + (y + r * 0.22) + '" r="' + (r * 0.2) + '" fill="#F2C230"/>';
  };
  var starUS = function (x, y, r) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
      pts.push((x + rr * Math.cos(a)).toFixed(2) + "," + (y + rr * Math.sin(a)).toFixed(2));
    }
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.15) + '" fill="#2B3138"/><polygon points="' + pts.join(" ") + '" fill="#C9CED3"/>';
  };
  /* mirror a path drawn on the left wing (y below 50) onto the right wing */
  var both = function (d, fill, extra) {
    extra = extra === undefined ? ' stroke="#0B1620" stroke-opacity=".18" stroke-width=".45" stroke-linejoin="round"' : extra;
    return '<path d="' + d + '" fill="' + fill + '"' + (extra || "") + '/><path d="' + d + '" fill="' + fill + '"' + (extra || "") + ' transform="matrix(1 0 0 -1 0 100)"/>';
  };
  var canopy = function (cx, rx, ry, tint) {
    return '<ellipse cx="' + cx + '" cy="50" rx="' + rx + '" ry="' + ry + '" fill="' + (tint || "#1B2A36") + '"/><ellipse cx="' + (cx + rx * 0.25) + '" cy="49.2" rx="' + (rx * 0.45) + '" ry="' + (ry * 0.35) + '" fill="#fff" fill-opacity=".35"/>';
  };
  /* fuselages are drawn slim, then widened a touch so they read well at small sizes */
  var body = function (d, fill) {
    return '<path d="' + d + '" fill="' + fill + '" stroke="#0B1620" stroke-opacity=".22" stroke-width=".5" transform="translate(0 50) scale(1 1.45) translate(0 -50)"/>' +
      '<path d="M88 49.5 L16 49.1 L16 50.9 L88 50.5 Z" fill="#fff" fill-opacity=".14"/>';
  };
  var intakes = function (x1, x2, y, fill) {
    return both("M" + x1 + " " + y + " L" + x2 + " " + (y - 3.2) + " L" + (x2 - 14) + " " + (y - 3.4) + " L" + (x1 - 16) + " " + y + " Z", fill, ' stroke="#0B1620" stroke-opacity=".2" stroke-width=".4"');
  };
  var line = function (d, c, w) { return '<path d="' + d + '" stroke="' + c + '" stroke-width="' + (w || 0.6) + '" fill="none" stroke-linecap="round"/>'; };

  var PLANES = {
    /* Eurofighter Typhoon, RAF grey: canards, cranked delta, single fin, twin engines */
    typhoon: {
      name: "Eurofighter Typhoon",
      g: function () {
        var c = "#8D979F", d = "#6F7A83";
        return both("M57 46 L19 16 L13 16 L11 46 Z", c) +
          both("M19 16 L13 16 L13.3 22 L20.5 22 Z", d) +
          both("M80 46.6 L72.5 37 L69.5 37 L71 46.6 Z", c) +
          body("M100 50 C96.5 47.6 89 46.2 80 45.7 L24 45 L8 45.6 L5 47 L5 53 L8 54.4 L24 55 L80 54.3 C89 53.8 96.5 52.4 100 50 Z", c) +
          '<rect x="2.5" y="45.8" width="3.4" height="3.4" fill="#3C454D"/><rect x="2.5" y="50.8" width="3.4" height="3.4" fill="#3C454D"/>' +
          '<path d="M9 49.2 L30 49.4 L30 50.6 L9 50.8 Z" fill="' + d + '"/>' +
          line("M14 33 L40 38", d, 0.5) + line("M14 67 L40 62", d, 0.5) +
          canopy(80, 7.5, 2.4) + roundelRAF(30, 33, 3.4) + roundelRAF(30, 67, 3.4);
      }
    },
    /* BAE Hawk T1, Red Arrows: red with white flashes */
    hawk: {
      name: "BAE Hawk T1",
      g: function () {
        var c = "#C8102E", w = "#F4F4F4";
        return both("M58 46.4 L43 17 L36.5 17 L41 46.4 Z", c) +
          both("M43 17 L36.5 17 L37.4 22 L45.4 22 Z", w) +
          both("M15 47.2 L7.5 36 L3.8 36 L6.5 47.2 Z", c) +
          body("M100 50 C97 47.9 90 46.7 82 46.3 L22 46.4 L7 47.2 L3 49 L3 51 L7 52.8 L22 53.6 L82 53.7 C90 53.3 97 52.1 100 50 Z", c) +
          '<path d="M66 46.6 L26 47.6 L26 52.4 L66 53.4 Z" fill="' + w + '"/>' +
          '<path d="M7 49.4 L24 49.5 L24 50.5 L7 50.6 Z" fill="#8E0B20"/>' +
          canopy(77, 9, 2.5) + line("M48 30 L45 26", w, 0.9) + line("M48 70 L45 74", w, 0.9);
      }
    },
    /* Saab JAS 39 Gripen, Swedish grey: close canards, delta, single engine */
    gripen: {
      name: "Saab JAS 39 Gripen",
      g: function () {
        var c = "#9AA3AA", d = "#7B858D";
        return both("M54 46 L23 16.5 L17 16.5 L15 46 Z", c) +
          both("M68 46.5 L58.5 33 L54.5 33 L56 46.5 Z", c) + intakes(74, 70, 45.2, d) +
          both("M23 16.5 L17 16.5 L17.4 21 L25 21 Z", d) +
          body("M100 50 C96 47.8 88 46.6 79 46.2 L22 46 L8 46.8 L5 48.4 L5 51.6 L8 53.2 L22 54 L79 53.8 C88 53.4 96 52.2 100 50 Z", c) +
          '<rect x="2.6" y="47.6" width="3.6" height="4.8" fill="#3C454D"/>' +
          '<path d="M9 49.3 L28 49.4 L28 50.6 L9 50.7 Z" fill="' + d + '"/>' +
          canopy(80, 7, 2.2) + roundelSE(30, 30, 3.4) + roundelSE(30, 70, 3.4);
      }
    },
    /* Dassault Rafale, French Air and Space Force: close canards, delta, twin engines */
    rafale: {
      name: "Dassault Rafale",
      g: function () {
        var c = "#7F8B94", d = "#66717A";
        return both("M57 45.4 L22 12.5 L15.5 12.5 L12 45.4 Z", c) +
          both("M67 45.8 L60 35.5 L56.5 35.5 L57.5 45.8 Z", c) + intakes(74, 70, 44.6, d) +
          both("M22 12.5 L15.5 12.5 L16 17 L24.5 17 Z", d) +
          body("M100 50 C96 47.8 88 46.3 78 45.4 L24 44.6 L8 45.4 L5 46.8 L5 53.2 L8 54.6 L24 55.4 L78 54.6 C88 53.7 96 52.2 100 50 Z", c) +
          '<rect x="2.6" y="45.8" width="3.4" height="3.6" fill="#3C454D"/><rect x="2.6" y="50.6" width="3.4" height="3.6" fill="#3C454D"/>' +
          '<path d="M9 49.2 L27 49.4 L27 50.6 L9 50.8 Z" fill="' + d + '"/>' +
          canopy(82, 7, 2.3) + roundelFR(29, 31, 3.3) + roundelFR(29, 69, 3.3);
      }
    },
    /* Lockheed Martin F-35, USAF and RAF: trapezoid wings, canted twin tails */
    f35: {
      name: "F-35 Lightning II",
      g: function () {
        var c = "#626C75", d = "#4E5760";
        return both("M57 44 L37 16 L28.5 16 L27 44 Z", c) +
          both("M21 45 L11 29.5 L5 29.5 L6 45 Z", c) +
          both("M26 44.5 L19 39 L16.5 39 L17 44.5 Z", d) + intakes(72, 68, 43.6, d) +
          body("M100 50 C96 47.4 88 45 78 43.6 L60 42.8 L22 43.4 L8 45 L4 47.4 L4 52.6 L8 55 L22 56.6 L60 57.2 L78 56.4 C88 55 96 52.6 100 50 Z", c) +
          '<rect x="1.8" y="47.2" width="3.4" height="5.6" fill="#2F363C"/>' +
          line("M66 44.2 L30 44.4", d, 0.4) + line("M66 55.8 L30 55.6", d, 0.4) +
          canopy(82, 8, 2.6, "#5B4A2E") + starUS(36, 30, 2.6) + starUS(36, 70, 2.6);
      }
    },
    /* General Dynamics F-16, USAF: cropped delta wing, single fin, chin intake */
    f16: {
      name: "F-16 Fighting Falcon",
      g: function () {
        var c = "#8E979E", d = "#717B83";
        return both("M58 46 L33 19 L27 19 L26 46 Z", c) +
          both("M20 46.5 L10.5 34 L5.5 34 L6.5 46.5 Z", c) +
          both("M70 46.4 L58 45.2 L58 46.4 Z", d) +
          body("M100 50 C96 47.8 88 46.6 78 46.1 L24 45.8 L8 46.6 L4 48.2 L4 51.8 L8 53.4 L24 54.2 L78 53.9 C88 53.4 96 52.2 100 50 Z", c) +
          '<rect x="1.8" y="47.8" width="3.4" height="4.4" fill="#3C454D"/>' +
          line("M33 19 L27 19", "#C9CED3", 1) + line("M33 81 L27 81", "#C9CED3", 1) +
          '<path d="M8 49.3 L30 49.4 L30 50.6 L8 50.7 Z" fill="' + d + '"/>' +
          canopy(80, 9, 2.3, "#5B4A2E") + starUS(34, 33, 2.4) + starUS(34, 67, 2.4);
      }
    },
    /* Supermarine Spitfire, RAF: elliptical wing, camouflage */
    spitfire: {
      name: "Supermarine Spitfire",
      g: function () {
        var g = "#5E6B45", b = "#8A6F48";
        return both("M70 46 C70 22 63 6.5 55.5 6.5 C49.5 6.5 46.5 20 47 46 Z", g) +
          both("M63 15 C59.5 11 56 10 54 13 C56 21 60 30 66 34 C66.5 27 65.5 20 63 15 Z", b) +
          both("M20 47 C20 39.5 16.5 34 13 34 C10 34 9 40 9.5 47 Z", g) +
          body("M95 50 C94 47.2 90 46 84 45.5 L30 46.2 L12 47.6 L7 49 L7 51 L12 52.4 L30 53.8 L84 54.5 C90 54 94 52.8 95 50 Z", g) +
          '<path d="M82 46 L56 46.4 L56 53.6 L82 54 Z" fill="' + b + '"/>' +
          '<path d="M95 50 L98 50" stroke="#2B2B2B" stroke-width="2.2"/>' +
          '<path d="M98.6 30 L98.6 70" stroke="#2B2B2B" stroke-opacity=".28" stroke-width="1.2"/>' +
          '<path d="M6 49.4 L22 49.5 L22 50.5 L6 50.6 Z" fill="#46512F"/>' +
          canopy(63, 6, 2.2) + roundelRAF(56, 22, 4.2) + roundelRAF(56, 78, 4.2);
      }
    }
  };

  function g(kind) { var p = PLANES[kind] || PLANES.typhoon; return p.g(); }
  function svg(kind, opts) {
    opts = opts || {};
    var p = PLANES[kind] || PLANES.typhoon;
    return '<svg viewBox="0 0 100 100" ' + (opts.cls ? 'class="' + opts.cls + '" ' : "") + (opts.title ? 'role="img" aria-label="' + p.name + '"' : 'aria-hidden="true"') + ">" + p.g() + "</svg>";
  }
  /* the same member always gets the same aircraft */
  function pick(seed) {
    var keys = ["typhoon", "gripen", "rafale", "spitfire", "hawk", "f35", "f16"], h = 0, s = String(seed || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return keys[h % keys.length];
  }
  window.ForumPlanes = { svg: svg, g: g, pick: pick, list: Object.keys(PLANES), name: function (k) { return (PLANES[k] || PLANES.typhoon).name; } };
})();
