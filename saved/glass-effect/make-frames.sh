#!/bin/sh
# Rebuilds the campsite clip frames used behind "Book your bed first" (not stored in the repo, about 40 MB).
# Run from this folder: sh make-frames.sh
cd "$(dirname "$0")"
mkdir -p cine/camp cine/campL
ffmpeg -v error -y -i clips/campsite-pan.mp4 -vf "fps=24,crop=ih*1080/1480:ih:(iw-ih*1080/1480)/2:0,scale=1080:1480" -q:v 4 cine/camp/%03d.jpg
ffmpeg -v error -y -i clips/campsite-pan.mp4 -vf "fps=24,scale=1920:1080" -q:v 4 cine/campL/%03d.jpg
echo "frames: $(ls cine/camp | wc -l) portrait, $(ls cine/campL | wc -l) landscape"
