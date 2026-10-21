# Site custom code (Wix Settings > Custom Code)

The header menu lives in two custom code blocks on the Wix site, not in this repo:
"UK Airshow Guide header menu styles" (head) and "UK Airshow Guide header menu" (body end).

Log In and Log Out flow (21 Oct 2026):
- Log Out in the header shows a "Signing off" screen, then opens /my-airshow-hub?signout=1.
  masterPage.js (site code) sees signout=1, logs the member out with wix-members-frontend,
  then opens /my-airshow-hub again so the hub login page shows.
- Log In in the header asks "Ready to enter your hub?" first. "Yes, take me in" opens the Wix login,
  and once the member is logged in a big "Welcome back" screen shows, then they land on My Airshow Hub.
- The overlay styles are in header-login-overlays.css, appended to the header menu styles block.
- The hub login card (my-airshow-hub.html) asks the same question and shows its own welcome back screen.

Airshow Hub button HUD effect (21 Oct 2026):
- The Airshow Hub button in the header has the HUD look on every page, not only on My Airshow Hub and the forum:
  dark box, cyan glow, bracket corners that open out on hover, pinging dot when logged out.
- The styles are in header-hub-button-hud.css, appended to the header menu styles block (marked /*hubhud*/).
  The old purple button rules and the hub-only button rules were folded into it, as that block has a 15,000 character limit.
