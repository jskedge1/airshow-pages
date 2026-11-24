"""Assemble each film.js from the approved house style (airshow-security-video/film.js on
claude/amazing-davinci-lvpjwe, kept here as _build/house.js) + _build/extras.js + _build/<film>.js."""
import re, sys, pathlib
B = pathlib.Path(__file__).parent
house = (B / 'house.js').read_text().split('\n')
def find(prefix):
    for i, l in enumerate(house):
        if l.startswith(prefix): return i
    raise SystemExit('missing ' + prefix)
i_copy, i_hits, i_acc, i_kit = find('// ---------------------------------------------------------------- copy'), find('// ---------------------------------------------------------------- hits'), find('// scene-specific accents'), find('// ================================================================ drawing kit')
i_sc, i_outro, i_list = find('// 1. which shows search bags'), find('// outro'), find('const SCENES = [')
extras = (B / 'extras.js').read_text()
for film in sys.argv[1:] or ['volunteer', 'transport']:
    src = (B / f'{film}.js').read_text()
    parts = dict(re.findall(r'//@@(\w+)\n(.*?)(?=//@@|\Z)', src, flags=re.S))
    head = '\n'.join(house[:i_copy]).replace('// How airshow security works:', f'// {film}: house style cartoon motion design.')
    out = [head, '// ---------------------------------------------------------------- copy', parts['COPY'],
           '\n'.join(house[i_hits:i_acc]), '// scene-specific accents', parts['HITS'],
           '\n'.join(house[i_kit:i_sc]), extras, '// ================================================================ scenes', parts['SCENES'],
           '\n'.join(house[i_outro:i_list]), '\n'.join(house[i_list + 1:])]
    js = '\n'.join(out)
    js = js.replace("box(ctx, -330, -52, 660, 84, 0, C.teal); text(ctx, 'ukairshowguide.co.uk', 0, 10, font(50, 700, UI), C.white, 'center');",
                    "let us = 50; ctx.font = font(us, 700, UI); while (ctx.measureText(URL).width + 90 > G.w - 80 && us > 28) { us -= 2; ctx.font = font(us, 700, UI); } const uw = ctx.measureText(URL).width + 90; box(ctx, -uw / 2, -52, uw, 84, 0, C.teal); text(ctx, URL, 0, 10 - (50 - us) * 0.35, font(us, 700, UI), C.white, 'center');")
    assert 'const uw' in js
    js = js.replace("const LAW_ROWS", "// const LAW_ROWS")
    (B.parent / film / 'film.js').write_text(js)
    print('built', film, len(js.split('\n')), 'lines')
