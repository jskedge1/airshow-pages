"""Builds public-transport-layout.html, the copy of the public transport page used in the Transport Pages Preview.
run: python3 layouts-pt/make_pt_preview.py"""
import os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
subprocess.check_call([sys.executable, os.path.join(here, 'apply_pt_layout.py'), '--preview'])
print('built public-transport-layout.html')
