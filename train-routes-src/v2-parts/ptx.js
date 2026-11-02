  /* ---------- Your way in, My travel plan, Pay less and Good to know: the Blackpool layout (1 Nov 2026),
     parts taken from the Public Transport page. Show and operator details come from CFG.x, CFG.pay, CFG.faq and CFG.access. ---------- */
  var ptxTab = 'j', plan = { out: null, home: null, ticks: [0, 0, 0, 0] };
  var OPSITE = X.opSites || {};
  var CHECKS = X.checks || ['Tickets booked', 'Last train home checked', 'Engineering works checked', 'Ear defenders packed for the children'];
  function esc(v){ return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var PI = {
    train: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 11h14M8 17l-2 3M16 17l2 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="14" r="1.1" fill="currentColor"/><circle cx="15" cy="14" r="1.1" fill="currentColor"/></svg>',
    walk: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="2" fill="currentColor"/><path d="M12 7v6h5l2 5M12 10h5M12 13l-3 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>',
    any: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7.8" r="1.2" fill="currentColor"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 5v14" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2"/></svg>'
  };
  var PAYICON = {"ticket": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>", "clock": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 7v5l3 2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>", "card": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M7 10h6M7 14h4\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>"};
  var QICON = "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M9.6 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.2 1-1.2 1.9M12 16.4v.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>";
  function opOf(trip, i){ return (trip.ops || [])[i] || CFG.operator; }
  function opsOf(trip){ var seen = {}, out = []; (trip.ops || [CFG.operator]).forEach(function(o){ if (!seen[o]) { seen[o] = 1; out.push(o); } }); return out; }
  function gmaps(a, b){ return 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(a) + '&destination=' + encodeURIComponent(b) + '&travelmode=walking'; }
  var WALK_FROM = X.walkFrom || X.dest + ' railway station', WALK_TO = X.walkTo || CFG.targetLabel;
  function legList(trip){
    /* the train legs of the picked journey: where each one starts and ends, and who runs it */
    var s = trip.s, cut = [0];
    for (var i = 1; i < s.length - 1; i++) if (s[i][4] & CHG) cut.push(i);
    cut.push(s.length - 1);
    var out = [];
    for (var c = 1; c < cut.length; c++) {
      var a = s[cut[c - 1]], b = s[cut[c]];
      out.push({ from: a[1], to: b[1], dep: a[0], arr: b[7] || b[0], op: opOf(trip, c - 1), stops: s.slice(cut[c - 1] + 1, cut[c]).map(function(p){ return p[1]; }) });
    }
    return out;
  }
  function ptxSteps(trip, toShow){
    var legsOf = legList(trip), ch = trip.changes, html = '';
    function step(kind, label, title, text, extra, col){
      var colour = col || (kind === 'walk' ? '#6B7C89' : kind === 'train' ? 'var(--op1)' : 'var(--navy)');
      return '<li class="' + (kind === 'walk' ? 'walk' : '') + '" style="--sc:' + colour + '"><span class="sn">' + PI[kind === 'off' ? 'stop' : kind] + '</span><div class="sx"><span>' + label + '</span><b>' + title + '</b><p>' + text + '</p>' + (extra || '') + '</div></li>';
    }
    if (!toShow) html += step('walk', X.wayBack ? X.wayBack[0] : 'Walk', X.wayBack ? esc(X.wayBack[1]) : 'Walk back to ' + esc(X.dest), esc(CFG.walkBack), '<a target="_blank" rel="noopener" href="' + gmaps(WALK_TO, WALK_FROM) + '">Open in Google Maps ↗</a>');
    legsOf.forEach(function(l, i){
      html += step('train', 'Train', esc(l.op) + ' from ' + esc(l.from) + ' to ' + esc(l.to),
        'Leaves at ' + l.dep + ' and gets to ' + esc(l.to) + ' at ' + l.arr + '. ' + (l.stops.length ? 'It calls at ' + esc(names(l.stops)) + '.' : 'It runs non stop between the two.'), '', OPC ? opLine(l.op) : '');
      if (i < ch.length) html += step('off', 'Change', 'Change at ' + esc(ch[i].at), 'You get in at ' + ch[i].arr + ' and the ' + ch[i].dep + ' to ' + esc(ch[i].to) + ' leaves ' + ch[i].wait + ' minutes later.' + (ch[i].wait <= 6 ? ' That is a quick change, so sit near the doors.' : ''));
    });
    var last = trip.s[trip.s.length - 1];
    html += step('off', 'Get off', 'Get off at ' + esc(last[1]), toShow ? (endsHere(trip) ? 'It is the last stop and the closest station to the show.' : 'It is the closest station to the show. The train carries on to ' + esc(lastTo(trip)) + ', so listen out for the announcement as you come in.') : 'You are home, or at the start of the next part of your trip.');
    if (toShow) html += step('walk', (X.wayIn || ['Walk'])[0], X.wayIn ? esc(X.wayIn[1]) : 'Walk to the ' + esc(CFG.targetLabel), esc(CFG.walkLine), '<a target="_blank" rel="noopener" href="' + gmaps(WALK_FROM, WALK_TO) + '">Open in Google Maps ↗</a>');
    return '<ol class="steps">' + html + '</ol>';
  }
  function ptxLastHome(h){
    var back = HD(h)[1].trips, l = back[back.length - 1];
    return { big: l.big, arr: l.s[l.s.length - 1][0], ch: l.changes.length, v: mm(l.big) < 240 ? mm(l.big) + 1440 : mm(l.big) };
  }
  function ptxRender(trip){
    var card = $('ptxCard'); if (!card) return;
    var h = H(), toShow = dir === 0, ch = trip.changes, first = trip.s[0], lh = ptxLastHome(h);
    var chips = DIR().trips.slice(idx, idx + 4).map(function(t, k){
      return '<button type="button" class="nchip" data-pick="' + (idx + k) + '" aria-pressed="' + (k === 0) + '"><b>' + t.big + '</b><small>arr ' + t.s[t.s.length - 1][0] + '</small></button>';
    }).join('');
    var legChips = [];
    if (!toShow) legChips.push('<span class="pleg walk">' + PI.walk + esc(X.wayBack ? X.wayBack[0] : 'Walk') + '</span>');
    legList(trip).forEach(function(l){ legChips.push('<span class="pleg" style="--lg:' + (OPC ? opLine(l.op) : 'var(--op1)') + '">' + PI.train + esc(l.op) + '</span>'); });
    if (toShow) legChips.push('<span class="pleg walk">' + PI.walk + esc(X.wayIn ? X.wayIn[0] : 'Walk') + '</span>');
    var tabs = [['j', 'Journey', PI.stop], ['t', 'Train times', PI.any], ['p', 'Tips', PI.info]].map(function(x){
      return '<button type="button" role="tab" data-tab="' + x[0] + '" aria-selected="' + (ptxTab === x[0]) + '"><span class="ti">' + x[2] + '</span><span>' + x[1] + '</span><i class="cv" aria-hidden="true">▾</i></button>';
    }).join('');
    var op0 = opOf(trip, 0);
    var picked = plan[toShow ? 'out' : 'home'], inPlan = picked && picked.day === D().label && picked.hub === h.name && picked.big === trip.big;
    var site = OPSITE[op0] || X.buyUrl;

    var journey = '<p class="lead">' + esc(toShow ? 'Here is how the ' + trip.big + ' from ' + h.name + ' gets you to the show, one step at a time.' : 'Here is how the ' + trip.big + ' from ' + X.dest + ' gets you back to ' + h.name + ', one step at a time.') + '</p>' + ptxSteps(trip, toShow)
      + '<div class="sheet sb"><div class="sb-h"><span class="sb-i" aria-hidden="true">i</span><b>Check before you go</b></div>'
      + '<div class="sb-w"><span class="sh-ic">' + PI.walk + '</span>' + esc(X.walkShort || X.dest + ' to the ' + CFG.targetLabel + ' on foot') + '</div>'
      + '<dl class="sb-rows"><div><dt>Lines</dt><dd>' + opsOf(trip).map(function(o){ return '<span class="sb-line" style="--lc:' + (OPC ? opLine(o) : 'var(--op1)') + '">' + esc(o) + '</span>'; }).join('') + '</dd></div>'
      + '<div><dt>Last train home</dt><dd><b>' + lh.big + ' from ' + esc(X.dest) + (lh.ch ? ', with a change' : '') + '</b></dd></div>'
      + '<div><dt>Live times</dt><dd><b>On the board above, and on the National Rail app</b></dd></div></dl></div>';

    var days = '<div class="dtabs" role="tablist">' + DATA.days.map(function(dd, i){
      return '<button type="button" role="tab" data-d="' + i + '" aria-selected="' + (i === day) + '"><span class="ti">' + PI.any + '</span><span>' + dd.label + '</span><i class="cv" aria-hidden="true">▾</i></button>';
    }).join('') + '</div>';
    var rows = DIR().trips.map(function(t, i){
      var how = t.changes.length ? 'change at ' + names(t.changes.map(function(c){ return c.at; })) : 'direct';
      return '<div class="drow"><span class="tm">' + t.big + '</span><span class="sv">' + esc(opsOf(t).join(' and ')) + ', ' + how + '<small>' + esc(t.small) + '</small></span><button type="button" data-pick="' + i + '" aria-pressed="' + (i === idx) + '">' + (i === idx ? '✓ Picked' : 'Pick this train') + '</button></div>';
    }).join('');
    var times = days + '<div class="dwrap"><div class="dboard" style="max-height:430px;overflow:auto;scrollbar-width:none"><div class="dh"><span>Time</span><span>Service</span><span></span></div>' + rows + '</div><p class="dnote">' + esc(DIR().note) + '</p></div>';

    var tips = '<div class="ptips"><div><h4>Arriving and planning</h4><p>' + esc(X.tipArrive || 'I would aim to get there well before the flying starts. If you want a front row seat, head there first and save your pitch. Then take a look round the static show, speak to the pilots and check the food. Visit the toilet before the flying display starts.') + '</p></div>'
      + '<div><h4>Walking and leaving</h4><p>' + esc(CFG.walkBack) + ' Everyone leaves at once, so I would either go a little early or stay in town for something to eat and catch a later train.</p></div></div>'
      + '<div class="facts">' + (X.ptxFacts || []).map(function(f){ return '<span>' + esc(f[0]) + ': <b>' + esc(f[1]) + '</b></span>'; }).join('') + '<span>Last train home: <b>' + lh.big + '</b></span></div>';

    card.innerHTML = '<article class="opt open" style="--m:var(--op1)">'
      + '<div class="oh"><span class="mode-r">' + PI.train + '</span><span class="t">' + esc(trip.title) + '</span><span class="s">' + esc(trip.small) + '</span>'
      + '<span class="legs">' + legChips.join('<span class="ar" aria-hidden="true">›</span>') + '</span>'
      + '<span class="key"><b>' + hm(trip.ride) + '</b><small>' + (ch.length ? ch.length + (ch.length === 1 ? ' change' : ' changes') : 'Direct') + '</small></span></div>'
      + '<div class="lwh' + (lh.v < 1200 ? ' early' : '') + '"><span class="lw-l">Last way home</span><b>' + lh.big + '</b><span class="lw-s">From ' + esc(X.dest) + ' to ' + esc(h.name) + ' on a ' + esc(D().label) + ', gets in at ' + lh.arr + '</span></div>'
      + '<div class="nxt"><div class="dcard has-op" style="--lc:' + (OPC ? opLine(op0) : 'var(--op1)') + ';--oc:' + (OPC ? opLine(op0) : 'var(--op1)') + ';--oc2:var(--opink)"><div class="dc-strip"></div><div class="dc-title"><b>' + esc(op0) + '</b><span class="dc-i">' + PI.any + '</span></div>'
      + '<div class="dc-row"><span class="dc-d"><b>' + esc(first[1]) + '</b><small>' + esc(trip.dest) + '</small></span><span class="dc-t"><b>' + trip.big + '</b><small>' + esc(trip.small) + '</small></span></div><div class="nchips">' + chips + '</div></div></div>'
      + '<div class="ob"><div class="otabs" role="tablist">' + tabs + '</div>'
      + '<div class="pane"' + (ptxTab === 'j' ? '' : ' hidden') + ' data-pane="j">' + journey + '</div>'
      + '<div class="pane"' + (ptxTab === 't' ? '' : ' hidden') + ' data-pane="t">' + times + '</div>'
      + '<div class="pane"' + (ptxTab === 'p' ? '' : ' hidden') + ' data-pane="p">' + tips + '</div>'
      + '<div class="oacts"><button type="button" class="btn pri" data-add="1" aria-pressed="' + !!inPlan + '">' + (inPlan ? '✓ In my plan' : 'Add to my plan') + '</button>'
      + '<button type="button" class="btn sec" data-map="1">' + PI.stop + 'Show on map</button>'
      + '<a class="btn sec" href="' + site + '" target="_blank" rel="noopener">Buy tickets ↗</a></div></div></article>';
    ptxPlan(trip);
    payRender(h);
  }
  function ptxPlan(trip){
    var box = $('ptxPlan'); if (!box) return;
    var h = H(), toShow = dir === 0, lh = ptxLastHome(h), done = plan.ticks.filter(Boolean).length;
    var out = plan.out, home = plan.home, nodes = [];
    function snap(t){ var l = t.s[t.s.length - 1]; return { big: t.big, arr: l[0], hub: h.name, day: D().label }; }
    var cur = snap(trip);
    if (!out && toShow) { out = cur; out.est = 1; }
    if (out) { nodes.push(['Catch', out.big, out.hub + ', ' + out.day, out.est]); nodes.push(['Arrive', out.arr, X.dest, out.est]); }
    nodes.push(['At the show', '', X.atShow || 'At the ' + CFG.targetLabel, 0]);
    if (!home && !toShow) { home = cur; home.est = 1; }
    if (home) nodes.push(['Head home', home.big, X.dest + ' to ' + home.hub, home.est]);
    else nodes.push(['Last way home', lh.big, X.dest + ' to ' + h.name, 1]);
    box.innerHTML = '<div class="card-h"><span aria-hidden="true">' + PI.ticket + '</span><b>My travel plan</b><span class="dots">' + CHECKS.map(function(c, i){ return '<i' + (i < done ? ' class="on"' : '') + '></i>'; }).join('') + '</span><small>' + esc(D().label) + '</small></div>'
      + '<div class="plan-b"><div class="dtl" style="--n:' + nodes.length + ';--m:var(--op1)"><b class="dtl-h">My day</b><ol>' + nodes.map(function(n){ return '<li' + (n[3] ? ' class="est"' : '') + '><span class="sq"></span><small>' + esc(n[0]) + '</small>' + (n[1] ? '<b>' + esc(n[1]) + '</b>' : '') + '<em>' + esc(n[2]) + '</em></li>'; }).join('') + '</ol></div>'
      + '<p class="plan-note">Dashed boxes are the train you are looking at now. Press Add to my plan to keep it.</p>'
      + '<ul class="checks">' + CHECKS.map(function(c, i){ return '<li><label><input type="checkbox" data-c="' + i + '"' + (plan.ticks[i] ? ' checked' : '') + '><span>' + esc(c) + '</span></label></li>'; }).join('') + '</ul></div>';
  }
  /* Pay less: the fare from the picked station first, then the show's own money saving cards */
  function payRender(h){
    var g = $('paygrid'); if (!g) return;
    var f = (CFG.fares || {})[h.code] || {}, op = f['Off-Peak Day Return'], sop = f['Super Off-Peak Day Return'], any = f['Anytime Day Return'];
    var fare = op ? 'When I last checked, an off-peak day return from ' + h.name + ' to ' + X.destShort + ' was ' + money(op) + (sop && sop < op ? ', or ' + money(sop) + ' super off-peak' : '') + (any && any > op ? '. An anytime day return was ' + money(any) : '') + '.'
      : any ? 'When I last checked, an anytime day return from ' + h.name + ' to ' + X.destShort + ' was ' + money(any) + '. Off peak and Advance tickets can be cheaper, so I would check the times before you buy.'
      : 'I would check the fare from ' + h.name + ' on the ' + X.opName + ' website before you go, as off-peak tickets can save you a fair bit.';
    var cards = [['Your fare from ' + h.name, fare, 'Fare', 'ticket']].concat(CFG.pay || []);
    g.innerHTML = cards.map(function(c, i){
      return '<div class="sv-c" style="--sc:' + (i % 2 ? 'var(--navy)' : 'var(--op1)') + '"><div class="sv-t"><span class="si">' + (PAYICON[c[3]] || PAYICON.ticket) + '</span><b>' + esc(c[0]) + '</b></div><p>' + esc(c[1]) + '</p><span class="tag">' + esc(c[2]) + '</span></div>';
    }).join('');
  }
  (function(){
    var faq = $('ptxFaq');
    if (faq) faq.innerHTML = (CFG.faq || []).map(function(q, i){
      return '<details' + (i === 0 ? ' open' : '') + ' style="--qc:' + (i % 2 ? 'var(--navy)' : 'var(--op1)') + '"><summary><span class="qi">' + QICON + '</span><span class="qt">' + esc(q[0]) + '</span></summary><div class="a">' + esc(q[1]) + '</div></details>';
    }).join('');
    var ac = CFG.access || ['Trains can work really well for an airshow, as long as you plan the step free parts before you leave.', ['Book Passenger Assist on the National Rail app or by phone, and staff will meet you at the train.', 'Check the station has step free access to every platform you need, both ways.']];
    if ($('accp')) { $('accp').textContent = ac[0]; $('accl').innerHTML = ac[1].map(function(l){ return '<li>' + esc(l) + '</li>'; }).join(''); }
    var card = $('ptxCard'); if (!card) return;
    card.addEventListener('click', function(e){
      var t = e.target.closest('button'); if (!t) return;
      if (t.dataset.tab) { ptxTab = t.dataset.tab; ptxRender(DIR().trips[idx]); }
      else if (t.dataset.d != null && t.dataset.d !== '') { var was = DIR().trips[idx] ? mm(DIR().trips[idx].big) : 0; day = +t.dataset.d; var tr = DIR().trips; idx = 0; for (var q = 0; q < tr.length; q++) if (mm(tr[q].big) >= was) { idx = q; break; } render(); runTrain(); }
      else if (t.dataset.pick != null) { idx = +t.dataset.pick; board(); draw(); table(); screen(); }
      else if (t.dataset.add) {
        var trip = DIR().trips[idx], l = trip.s[trip.s.length - 1];
        plan[dir === 0 ? 'out' : 'home'] = { big: trip.big, arr: l[0], hub: H().name, day: D().label };
        ptxRender(trip);
      }
      else if (t.dataset.map) { var r = $('route'); if (r) r.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
    });
    $('ptxPlan').addEventListener('change', function(e){
      var c = e.target.dataset && e.target.dataset.c; if (c == null) return;
      plan.ticks[+c] = e.target.checked ? 1 : 0; ptxPlan(DIR().trips[idx]);
    });
    var gd = $('ptxGuide'); if (gd) gd.href = CFG.showUrl;
  })();
