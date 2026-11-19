#!/bin/sh
# Rebuilds the campsite clip frames used as moving backgrounds (not stored in the repo).
# campsite-pan: "Book your bed first" and the camping film. shelter and pitches: the camping film.
# Run from this folder: sh make-frames.sh
cd "$(dirname "$0")"
for c in camp:campsite-pan shelter:shelter pitches:pitches; do
  d=${c%%:*}; f=${c#*:}
  mkdir -p cine/$d cine/${d}L
  ffmpeg -v error -y -i clips/$f.mp4 -t 3.2 -vf "fps=24,crop=ih*1080/1480:ih:(iw-ih*1080/1480)/2:0,scale=1080:1480" -q:v 4 cine/$d/%03d.jpg
  ffmpeg -v error -y -i clips/$f.mp4 -t 3.2 -vf "fps=24,scale=1920:1080" -q:v 4 cine/${d}L/%03d.jpg
  echo "$d: $(ls cine/$d | wc -l) portrait, $(ls cine/${d}L | wc -l) landscape"
done
