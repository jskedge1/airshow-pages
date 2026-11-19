#!/bin/sh
# Masters <dir>/mix.wav to about -14 LUFS (true peak under -1 dBFS) -> <dir>/mix_norm.wav. Run: sh master.sh rv-civL
cd "$(dirname "$0")"
I=$(ffmpeg -hide_banner -nostats -i "$1/mix.wav" -af ebur128 -f null - 2>&1 | grep "I:" | tail -1 | awk '{print $2}')
G=$(python3 -c "print(round(-13.6 - $I, 2))")
ffmpeg -v error -y -i "$1/mix.wav" -af "highpass=f=28,lowpass=f=16000,aformat=channel_layouts=stereo,aresample=192000,volume=${G}dB,alimiter=limit=0.84:attack=1:release=80:level=false,aresample=48000" "$1/mix_norm.wav"
echo "in $I LUFS, gain $G dB, out $(ffmpeg -hide_banner -nostats -i "$1/mix_norm.wav" -af ebur128=peak=true -f null - 2>&1 | grep -E 'I:|Peak:' | tail -2 | tr -s ' ' | tr '\n' ' ')"
