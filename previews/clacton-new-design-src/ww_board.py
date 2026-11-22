"""Round 2: Where to watch, on the map, in the Duxford page's board.

Duxford's board has solid colour tabs and a white panel beside the map (its styles `ww-css` and `wwmap-dux`, its colour
script `wwmap-dux-js` and its tab script). Clacton's page had an older version of the board with different markup
(`ww-board`, `ww-grid`, `ww-pc`). This rewrites Clacton's board into Duxford's markup, keeping Clacton's own spots,
words, map pins and notes, and swaps the older styles and tab script for Duxford's.
"""
import re

PIN = ('<span class="xd-tt-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c-3.7 0-6.6 2.9-6.6 6.5 0 4.9 '
       '6.6 12.5 6.6 12.5s6.6-7.6 6.6-12.5c0-3.6-2.9-6.5-6.6-6.5z" fill="currentColor"/><circle cx="12" cy="9" r="2.5"/></svg></span>')


def add_before_html_end(html, block):
    # the page has no closing body tag of its own (the ones in the file sit inside scripts), so add before </html>
    end = html.rstrip()
    return (end[:-len("</html>")] + block + "</html>\n") if end.endswith("</html>") else html + block


def ww_like_duxford(html, dux):
    i = html.find('<section class="ww reveal" id="wwMaps"')
    assert i > -1, "Clacton's Where to watch board not found"
    j = html.index("</section>", i) + len("</section>")
    old = html[i:j]
    head = re.search(r'<div class="ww-head">.*?</p></div>', old, re.S).group(0)
    tabs = re.findall(r'<button type="button" role="tab" id="ww-t\d+"[^>]*>.*?</span>([^<]+)</button>', old, re.S)
    bodies = re.findall(r'(<div class="xd-tt-board ww-board" role="tabpanel" id="ww-p\d+".*?</figure></div></div>)', old, re.S)
    assert len(tabs) == len(bodies) == 6, (len(tabs), len(bodies))
    note = re.search(r'<p class="ww-note">.*?</p>', old, re.S).group(0)
    tab_html, pan_html = [], []
    for n, (label, body) in enumerate(zip(tabs, bodies)):
        on = n == 0
        tab_html.append('<button type="button" role="tab" class="ww-in" id="ww-clacton-t%d" aria-controls="ww-clacton-p%d" '
                        'aria-selected="%s" tabindex="%d">%s%s</button>'
                        % (n, n, "true" if on else "false", 0 if on else -1, PIN, label.strip()))
        h4 = re.search(r"<h4>(.*?)</h4>", body).group(1)
        txt = re.search(r'<div class="ww-txt">(.*?)<ul class="ww-pc">', body, re.S).group(1).replace("<h4>%s</h4>" % h4, "", 1)
        lis = re.findall(r'<li(?: class="con")?><b>(.*?)</b>(.*?)</li>', body)
        assert lis, "no facts for " + h4
        href = re.search(r'<a class="ww-open" href="([^"]+)"', body).group(1)
        iframe = re.search(r"<iframe.*?</iframe>", body, re.S).group(0)
        cap = re.search(r"<figcaption>(.*?)</figcaption>", body, re.S)
        pan_html.append(
            '<div class="ww-panel ww-in" role="tabpanel" id="ww-clacton-p%d" aria-labelledby="ww-clacton-t%d"%s>'
            '<div class="ww-txt"><h4>%s</h4>%s<ul class="ww-facts">%s</ul>%s'
            '<a class="ww-go" href="%s" target="_blank" rel="noopener">%s<span>Open in Google Maps</span><i aria-hidden="true">&rarr;</i></a></div>'
            '<div class="ww-map">%s</div></div>'
            % (n, n, "" if on else " hidden", h4, txt.strip(),
               "".join("<li><b>%s</b>%s</li>" % (k, v) for k, v in lis),
               ("<p>%s</p>" % cap.group(1)) if cap else "", href, PIN, iframe))
    new = ('<section class="ww reveal" id="wwMap" aria-label="Where to watch, on the map">\n      ' + head +
           '\n      <div class="sw-tabs ww-tabs"><div class="xd-tt-tabs" role="tablist" aria-label="Viewing spots">' +
           "".join(tab_html) + '</div>' + "".join(pan_html) + '</div>\n      ' + note + '\n    </section>')
    html = html[:i] + new + html[j:]
    # Clacton's older board styles and tab script out
    m = re.search(r'<style id="ww-maps">.*?</style>', html, re.S)
    assert m, "ww-maps style"
    html = html[:m.start()] + html[m.end():]
    m = re.search(r'<script>\s*\(function\(\)\{\s*function pickSpot\(box, i\)\{.*?</script>', html, re.S)
    assert m, "pickSpot script"
    html = html[:m.start()] + html[m.end():]
    # Duxford's styles, colour script and tab script in
    add = ""
    for pat in [r'<style id="ww-css">.*?</style>', r'<style id="wwmap-dux">.*?</style>', r'<script id="wwmap-dux-js">.*?</script>',
                r'<script>\s*\(function\(\)\{\s*function show\(box, i\)\{.*?</script>']:
        m = re.search(pat, dux, re.S)
        assert m, pat
        add += m.group(0) + "\n"
    # Clacton has six spots and Duxford five, so six tabs share the row
    add += ('<style id="wwmap-clacton">@media (min-width:761px){body #wwMap .ww-tabs .xd-tt-tabs'
            '{grid-template-columns:repeat(6,minmax(0,1fr))!important}}</style>\n')
    return add_before_html_end(html, add)
