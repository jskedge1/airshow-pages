"""Builds public-transport-layout.html: the public transport page with the sign style layout, for the preview.
The live page is not touched. run: python3 layouts-pt/make_pt_preview.py"""
import os
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
s = open(root + '/public-transport.html').read()
s = s.replace('</head>', '<style id="px-css">\n' + open(here + '/pt.css').read() + '</style>\n</head>', 1)
k = s.rfind('</body>'); s = s[:k] + '<script id="px-js">\n' + open(here + '/pt.js').read().replace('/*UKGEO*/', open(here + '/ukgeo.json').read()) + '</script>\n' + s[k:]
open(root + '/public-transport-layout.html', 'w').write(s); print('built public-transport-layout.html')
