  (function(){
    var x = CFG.x || {}, nm = x.checkWith || x.opName || CFG.operator || 'the train company', sites = x.opSites || {};
    var url = sites[nm] || { 'Greater Anglia': 'https://www.greateranglia.co.uk/' }[nm], link = url ? '<a href="' + url + '" target="_blank" rel="noopener">' + nm + '</a>' : nm;
    $('tncheck').innerHTML = 'I would advise checking your train again with ' + link + ' or <a href="https://www.nationalrail.co.uk/" target="_blank" rel="noopener">National Rail</a> about a week before you go, and once more on the morning. Engineering work can change things on the day too.';
    if (x.tnExtra) { $('tnextra').textContent = x.tnExtra; $('tnextra').hidden = false; }
  })();
