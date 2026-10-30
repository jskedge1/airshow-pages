import subprocess,re,html,json,time
F={}
for h in 'BHM WVH SHR TFC EUS MAN CRE STA COV CDF LDS NOT'.split():
    s=subprocess.run(['curl','-s','--max-time','40','-A','Mozilla/5.0 (planning preview)',f'https://traintimes.org.uk/{h}/COS/10:00/'+json.load(open('dates.json'))[0][1]],capture_output=True,text=True).stdout
    f={}
    for blk in re.findall(r'<div class="fares slide"><ul>(.*?)</ul>',s,re.S):
        for li in re.findall(r'<li>(.*?)</li>',blk,re.S):
            t=html.unescape(re.sub('<[^>]+>','',li)).strip()
            m=re.match(r'£([\d.]+)(?: £[\d.]+)* (.+)$',t)
            if not m: continue
            v,n=float(m.group(1)),re.sub(r'\s*\(.*\)$','',m.group(2)).strip()
            if n in ('Off-Peak Day Return','Super Off-Peak Day Return','Anytime Day Return'):
                f[n]=min(f.get(n,1e9),v)
    F[h]=f;print(h,f,flush=True);time.sleep(1)
json.dump(F,open('fares.json','w'))
