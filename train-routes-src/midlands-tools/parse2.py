import json,re,html,sys
def txt(s):
    s=re.sub(r'<(script|style).*?</\1>','',s,flags=re.S);s=re.sub(r'<br\s*/?>|</li>|</tr>|</p>|</h\d>|</div>','\n',s);t=re.sub(r'<[^>]+>',' ',s);t=html.unescape(t)
    return [re.sub(r'\s+',' ',l).strip() for l in t.split('\n') if l.strip()]
def calls(h):
    out=[]
    for l in txt(h):
        if l.startswith('Leaving') or 'Kindly' in l: continue
        m=re.match(r"^(.+?) (\d\d:\d\d)(?: (\d\d:\d\d))?(?: (\S+))?$",l)
        if m: out.append([m.group(1),m.group(2),m.group(3) or '',m.group(4) or ''])
    return out
def parse(path):
    d=json.load(open(path)); R={}
    for k,rows in d.items():
        J=[]
        for r in rows:
            if not r['ga'] or not r['stages']: continue
            infos=[html.unescape(x).replace('+',' ') for x in re.findall(r'info\[\]=([^&]+)',r['key'])]
            legs=[]
            stages=sorted(r['stages'],key=lambda s:int((re.search(r'stage=(\d+)',s['link']) or [0,1])[1]))
            for i,s in enumerate(stages):
                legs.append({'info':infos[i] if i<len(infos) else '','calls':calls(s['html'])})
            J.append(legs)
        R[k]=J
    return R
if __name__=='__main__':
    R=parse(sys.argv[1])
    for k,J in R.items():
        print('==',k,len(J))
        for legs in J[:40]:
            print('  ',' | '.join(f"{lg['calls'][0][0][:14]} {lg['calls'][0][2] or lg['calls'][0][1]} > {lg['calls'][-1][0][:14]} {lg['calls'][-1][1]} ({len(lg['calls'])})" for lg in legs if lg['calls']))
