# Critique: calendar walkthrough

## Round 1
| hook | read | motion | variety | brand | sync | min |
|  6   |  6   |   7    |    8    |   9   |  -   |  6  |

Worst three:
1. [beats 0-6] The capture's own "UK AIRSHOW DATES 2027" title shows through under "EVERY UK AIRSHOW." -> left-to-right navy shade (0.97 to 0.45) and focus moved to the formation.
2. [beats 29-33, 69-72] Taps on June and Free to watch happen at rest zoom, the buttons are ~40 px -> camera pushes 1.7x onto the filter bar before each tap.
3. [beats 93-118] Captions sit over the real toasts ("Added to your list", "Calendar file saved") -> camera frames the toast at screen y ~780, above the caption band.
Also: recap grid touched the bottom edge and opened on a blank beat 120 (tiles from 119.6, smaller grid); end card background repeated the page title (now the Red Arrows photo).
Verdict: ANOTHER ROUND

## Round 2
| hook | read | motion | variety | brand | sync | min |
|  8   |  7   |   8    |    8    |   9   |  9   |  7  |

sync.py: 45/45 hits within 20 ms, median 2.2 ms. Mix -14.1 LUFS, -1.3 dBTP.
Worst three:
1. [beats 51-55] Typing mask started 38 px into the input, so the placeholder's "Sear" stayed and read "Searire" -> mask from the input's left edge, reveal 66 px of the real "Spitfire" capture.
2. [beat 0] First word only starts rising on frame 0 -> starts at -0.5 so "EVERY" is already up.
3. [beats 0-6] Faint ghost of the page title behind the hook; accepted, it reads as texture under a 0.97 shade.
Verdict: ANOTHER ROUND

## Round 3
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   9   |  9   |  8  |

Typing strip: S, Spit, Spitfi, Spitfire, then the real results capture (month counts change). June and I'm going taps land on the real buttons at 1.7x. Toasts sit above the caption band. Recap grid and end card read at phone size.
Remaining (not blocking): rest-zoom frames between steps show small page text; captions carry the message there.
Verdict: READY
