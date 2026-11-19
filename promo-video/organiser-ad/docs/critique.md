# Critique log

## Round 1
| hook | read | motion | variety | brand | sync | min |
|  6   |  6   |   7    |    8    |   8   |  -   |  6  |

Worst three:
1. [b0, 16x9] Frame 0 shows an empty glass slab; type only starts after b0.15 -> the first frame doesn't say anything -> start kicker at -0.6 and headline at -0.25, slab spring from -1.25 so frame 0 already carries moving type.
2. [b8-16] "EVERY UK AIRSHOW." runs under the browser panel -> headline unreadable -> split into three lines (EVERY UK / AIRSHOW. / ONE GUIDE.) and move panel to x=840, w=960.
3. [b56-64] Row 1 of show pills overflows the frame (RIAT, Blackpool clipped) -> 33 px type, 28 px padding, 16 px gaps, 330 px slot.
Also: teal kickers on bright glass too faint -> tealSoft at 30 px; S5 kicker ran under the tiles -> "ALL FREE"; long tile titles now wrap.
Checks failed: no-gap ok; pills not in safe area.
Verdict: ANOTHER ROUND

## Round 2
| hook | read | motion | variety | brand | sync | min |
|  8   |  7   |   8    |    8    |   9   |  8   |  7  |

Worst three:
1. [b52-64] Small body copy in step cards / tiles (27-31 px) hard at phone size -> 34 px cards, 30 px tiles, bigger grid.
2. [b62] Permission line lost on the busy crowd -> sits on its own dark glass strip.
3. [b63-64] Slot-to-end-card morph showed a grey smudge -> tint now blends teal -> the end card's light frost, so the cut lands on the same glass.
Also: b56 frame was an empty photo -> title starts during the whip; S1 open window shortened (7.4-8).
Sync: 34/44 hits within 20 ms; the misses are whooshes/typing with soft onsets by design.
Verdict: ANOTHER ROUND

## Round 3
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   9   |  8   |  8  |

Fixed: "YOUR SHOW HERE" label overlapped Duxford (slot 360 px, 38 px type); tile grid pulled inside the safe area.
Remaining (not blocking): the light-sweep whoosh at b6 has no sharp onset; S4 holds one layout for 10 s (cards change every 2.5 s).
Verdict: READY
