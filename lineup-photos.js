/* Line-up photos for newly confirmed aircraft.
   Every show page loads this file just before its own photo list (the lu-lib block),
   so a photo added here shows on the line-up of every feature page at once.
   Each entry: [pattern matched against aircraft name, mark, squadron, air arm and operator (not case sensitive),
                photo address (240 x 140 webp in camping-layout/img/, named lu-<type>.webp),
                alt text, photographer credit (leave "" for Jack's own photos)].
   Entries here are checked before the built-in list, so put the more specific pattern first.
   Photos come from Jack's Google Drive, Mac and hard drives (Jacks Drive, T7). Added 27 Oct 2026. */
window.LU_EXTRA = [
  ["lysander", "https://jskedge1.github.io/airshow-pages/camping-layout/img/lu-lysander.webp", "The Westland Lysander on display at Old Warden", ""]
];
