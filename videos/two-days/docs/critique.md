# Critique log: Two Days, Same Airshow

Sheets looked at each round: out/two-days/contact_p1.png, contact_p2.png, phone_p1.png, phone_p2.png,
full-size stills in out/two-days/stills/, strips strip_m2 / strip_jet / strip_doors.
(Brand = the shared kit palette and Barlow; "real product UI" does not apply, the film is a cartoon.)

## Round 0 (first look, before scoring)
First sheet rendered clean. Fixed straight away: scene labels too small on the phone sheet (36 -> 46 px,
battery label 33 -> 40 px); Charlie stood in front of the "Quiet space" tent label; the payoff plane flew
through the battery card and behind heads; bottom third of the frame was empty grass for 8 beats of every
moment (added the numbered title cards "1 Arriving" ...). Client changes folded in: square corners on all of
this film's own boxes, the 20-beat "standing nearby" section, kit aircraft cut-outs.

## Round 1
| hook | read | motion | variety | brand | sync | min |
|  7   |  7   |   7    |    8    |   9   |  8   |  7  |

Evidence: hook, beat 0 both halves identical with the Mustang already in frame and Charlie hopping, the
caption lands at 0.3, but the two halves only start to differ at 6.5. Read, the five "nearby" points get
1.95 s each including their slide-in (beats 90.4-103.4), too fast for "Flapping, rocking and ear defenders
are all fine". Motion, strip_doors: the organisers headline is already in place while the doors are only a
third open, so the frame shows "e airshow p" sliced by both halves. Variety, six moments share one grammar
on purpose, but each has its own set, sound shape and prop. Sync, every hit is generated from HITS.

Worst three:
1. [beats 90-104] Five points at 2.6 beats each -> a parent reading on a phone cannot finish the long ones
   -> FIX: kickCard shortened to 86.3-89.3, points every 2.8 beats from 89.4, right-half actions
   (step back 89.6, smile 95, "Can I help?" 98.5, defenders 100.6) re-timed to land with their point.
2. [beats 105.2-107] Headline sliced by the opening doors -> reads as a glitch -> FIX: sceneShows title
   pop moved from T3+0.2 to T3+0.6 so it slides in as the doors clear; first tile moved up to T3+1.8 so the
   navy panel is not empty for 2.5 beats.
3. [beats 14-20] Left and right gates met at the divider and read "AIRSHOW AIRSHOW"; queue hid the left
   banner -> FIX: gate() moved to x 745 (left) and x 240 (right), queue shifted left with it. Also the
   opening promise pill 36 -> 40 px.

Checks failed: none outright (longest gap without a new event: beats 4.6-6.5, 1.4 s).
Verdict: ANOTHER ROUND

## Round 2
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   9   |  8   |  8  |

Evidence: hook, beat 0-4 hopping Charlie, plane with rings crossing the divider, caption up by 0.3, left
half now starts to grey at 4.6. Read, phone_p1/p2: every caption, title card, tag and header label reads;
smallest text is the opening promise pill (40 px) and the organisers kicker (36 px). Motion, strip_doors:
doors part cleanly and the headline now slides in after they clear; strip_m1: clock rolls 09:00 -> 11:00
while the queue walks in. Variety: six sets, plus the nearby section and the navy panel.

Worst three:
1. [beats 43-46.6, right half] The "soft" jet flew behind Dad's head and under the tag, and its soft shape
   was mostly hidden -> the key contrast with the left burst was lost -> FIX: m3 right, family moved right
   (kid 590, Dad 770), jet lowered to y 352, soft shape clamped to x 190-330 in clear sky.
2. [beats 101-105, right half] Calmer Charlie had arms straight out (POSE.hug while sitting) and read as a
   shrug -> FIX: nb() arms ease from ears to POSE.hold (hands in lap) while he rocks.
3. [beats 14-16, left half] Left is an empty veiled field for 2 beats before the queue starts -> acceptable
   (the right half is the one playing), queue start already at 14.5; no change beyond the gate move.

Checks failed: none.
Verdict: ANOTHER ROUND (round 3 needed by rule)

## Round 3 (on the final sheets and the mixed film)
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   9   |  9   |  8  |

Evidence: hook, beat 0: split already on screen, Charlie hopping on both sides, Mustang and rings crossing
the divider, caption at 0.3, calm-video promise at 0.5. Read, phone_p1/p2: all captions, title cards, tags,
header labels, the clock and the five "nearby" points read at phone size. Motion: springs on every pop,
page pushes inside each half, clock digits roll, the jet shape swells over 1.2 s (strip_jet), no shake or
flash anywhere. Variety: gate, crowd line, jet, lunch, quiet tent, car, then the bystander replay, the navy
organiser panel and the full-width payoff. Brand: kit palette, Barlow only, kit aircraft cut-outs only,
square corners. Sync: sync.py 52 of 57 hits within 20 ms of an onset, median 1.7 ms; master -14.1 LUFS,
-1.2 dBTP.

Worst three (none blocking, left as known weaknesses):
1. [beats 14-86] The veil over the waiting half makes about half the frame pale for much of the middle
   of the film. It directs the eye, but the sheet looks washed. Could be lowered from 0.42 to about 0.3.
2. [beats 0-4.6] Both halves are identical at the start by design; the only hint of "two days" before
   beat 4.6 is the caption. A viewer with captions hidden by a player UI gets the idea late.
3. [beats 108-121] The organiser tiles are the same six-tile pop as the sister film; tile text is 50 px,
   readable but the smallest body text in the film.

Checks failed: none. Longest gap without a new event is about 1.9 s (beats 121-123.1, the organiser
panel holding before the push to the payoff).
Verdict: READY

Post-round note: the 'beth' blip was listed at beat 72.2 but her label pops at 70.2; hit moved, sfx and mix re-run (picture unchanged).
