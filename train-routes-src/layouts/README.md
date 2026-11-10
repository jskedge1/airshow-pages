# Train page layout (10 Nov 2026)

Jack picked layout A: four numbered tabs (Plan your train, Your journey, Your station, Tickets and tips) with a
"Your train" strip under them. lx.css and lx.js hold it (mode "a"; mode "b" is the long page version he did not pick).
The page's own sections are moved into the tabs, not copied, so the page scripts are untouched.

After rebuilding or patching any train page, run `python3 train-routes-src/layouts/apply_layout_a.py` (safe to repeat).
make_layouts.py builds side by side previews of both layouts for one page.
