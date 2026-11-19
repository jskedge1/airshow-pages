# Plan your 2027 airshow: social graphics

Nine slides in two sizes, made 19 Nov 2026 from `slides.html`.

| Folder / file | Size | Use it for |
|---|---|---|
| `landscape/*.png` | 1920x1080 | YouTube community, Facebook, X, website, YouTube video |
| `tiktok/*.png` | 1080x1920 | TikTok photo mode (swipe carousel), Instagram Reels and Stories, YouTube Shorts |
| `plan-2027-landscape.mp4` | 1920x1080, 45 s | Silent slideshow with fades, for Facebook or YouTube |
| `plan-2027-tiktok.mp4` | 1080x1920, 45 s | Silent slideshow with fades. Add a sound in the TikTok app |

## Glass effect videos (19 Nov 2026)

`glass-plan-2027-tiktok.mp4` (1080x1920) and `glass-plan-2027-landscape.mp4` (1920x1080) are the same five steps plus the two bonus steps,
made in the glass effect house style (kinetic type, red step cards, real photos only, music and the standard end card), 90 seconds at 60 fps.
They are built from `saved/glass-effect/content-plan5.js` and `index-plan5.html`. See `saved/glass-effect/README.md` to change and re-render them.

## The slides

0. Cover: How to plan your 2027 airshow (5 steps plus 2 bonus)
1. Pick your airshow (November to February)
2. Book your tickets (as soon as they go on sale)
3. Book a place to stay: campsites, hotels, B&Bs, inns, caravans
4. Plan your route down: car, train, shuttle bus, park and ride, coach
5. Build your airshow kit: chairs, picnic, flask, table, sun cream, hats, sunglasses, waterproofs, water, power bank, ear defenders, binoculars, plus check the weather
6. Bonus: night before checks
7. Bonus: show day, arrive early
8. End: see you on the crowd line, ukairshowguide.co.uk

Photos are the AI illustrations from `plan-2027-img/` and `guide-img/`, so every slide carries an "AI illustration" tag.
The TikTok slides keep text out of the right hand button column and above the caption area at the bottom.

## Changing a slide

Edit the `SLIDES` list in `slides.html` (text, photo, kit items), check it in a browser with
`slides.html?f=land` or `slides.html?f=tok` (add `&s=3` for one slide), then run:

```
node social/plan-2027/render.js
```

That remakes every PNG and both MP4s. The slideshow timings are `HOLD` in `render.js`.

## Caption ideas

TikTok / Reels:

> How to plan your 2027 airshow in 5 steps ✈️ Pick your show, book tickets, book a bed, plan the route, build your kit. Plus 2 bonus tips for show day. Save this for the 2027 season! Full planner at ukairshowguide.co.uk
>
> #airshow #airshow2027 #ukairshow #aviation #avgeek #RIAT #planewatching #dayout #camping #ukdaysout

Facebook / X:

> The 2027 airshow dates are coming in, so now is the time to plan. Here is how I do it, step by step, from picking a show in winter to packing the kit the week before. Every step has a full guide at ukairshowguide.co.uk
