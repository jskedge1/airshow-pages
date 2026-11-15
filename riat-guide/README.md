# The Big Guide to RIAT (thebigguidetoriat.co.uk)

Rebuilt Nov 2026 as its own site for RIAT27 at MOD Boscombe Down, separate from
The Big Guide to UK Airshows but built from this repo. Navy, teal and red started
on the RIAT guide, so they stay here, with red leading.

| Page | Wix page on thebigguidetoriat.co.uk | Address for the Wix HTML embed |
|---|---|---|
| Home, RIAT 2027 overview | / (home) | https://jskedge1.github.io/airshow-pages/riat-guide/index.html |
| Getting there | /getting-there | https://jskedge1.github.io/airshow-pages/riat-guide/getting-there.html |
| Camping and hotels | /camping-and-stay | https://jskedge1.github.io/airshow-pages/riat-guide/camping-and-stay.html |
| FAQ and first timers | /faq | https://jskedge1.github.io/airshow-pages/riat-guide/faq.html |

- `site.css` styles every page. `site.js` draws the header, menu and footer, and holds the page list.
  To add a page: add a row to PAGES in site.js, then make the Wix page with that slug.
- Inside a Wix embed, links open the matching Wix page in the whole window; opened straight from
  GitHub they go file to file. If a Wix page address changes, change its slug in site.js.
- The home page replaces the old "moving" notice (`../riat-moving.html`) on the RIAT Wix site.
- Photos are shared with the UK site (`../camping-layout/img/`).
- Promotion on the UK site: `riat.html` (hero button and the "My full RIAT guide has its own home" section)
  and the sister site card in `footer.html`.
