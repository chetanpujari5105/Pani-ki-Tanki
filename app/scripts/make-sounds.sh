#!/bin/bash
# Synthesises TankiAlert's built-in alert sounds with ffmpeg (no samples, no downloads, so they are original and
# licence-free), normalises each to about -14 LUFS with a -1 dBFS peak limit, and writes them as small mono AAC .m4a
# files to Sources/Resources/sounds/. Re-run it after changing a recipe. Needs: brew install ffmpeg
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=Sources/Resources/sounds
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"
SR=44100
TARGET=-14

# Soft attack so nothing clicks.
A="min(1,t/0.004)"

# id | seconds | aevalsrc expression | extra filter (reverb/tails), or "anull"
recipe() {
  case "$1" in
  ting) # A soft two-partial chime around G6.
    echo "1.6|$A*(0.62*sin(2*PI*1568*t)*exp(-2.6*t)+0.22*sin(2*PI*3136*t)*exp(-4.5*t)+0.08*sin(2*PI*4704*t)*exp(-7*t))|aecho=0.8:0.5:60:0.18" ;;
  drop) # Two water drops: a fast upward pitch chirp with a quick decay, the second smaller.
    echo "1.3|$A*(0.9*sin(2*PI*(650*t+0.5*14000*t*t))*exp(-28*t)*lt(t,0.25)+gte(t,0.42)*0.55*sin(2*PI*(820*(t-0.42)+0.5*16000*(t-0.42)*(t-0.42)))*exp(-32*(t-0.42))*lt(t,0.7))|aecho=0.8:0.6:45|90:0.25|0.12" ;;
  bell) # A small hand bell: inharmonic partials (hum, prime, minor third, fifth, octave) ringing out.
    echo "2.6|$A*(0.18*sin(2*PI*330*t)*exp(-0.9*t)+0.5*sin(2*PI*660*t)*exp(-1.4*t)+0.22*sin(2*PI*792*t)*exp(-1.9*t)+0.16*sin(2*PI*990*t)*exp(-2.3*t)+0.14*sin(2*PI*1320*t)*exp(-2.9*t)+0.07*sin(2*PI*1716*t)*exp(-4*t))|anull" ;;
  siren) # A gentle two-tone wail: a pure tone gliding 660 <-> 880 Hz, faded in and out, nothing harsh.
    echo "2.2|min(1,t/0.25)*min(1,(2.2-t)/0.4)*(0.7*sin(2*PI*(770*t-(110/(2*PI*1.2))*cos(2*PI*1.2*t)))+0.12*sin(4*PI*(770*t-(110/(2*PI*1.2))*cos(2*PI*1.2*t))))|anull" ;;
  success) # A rising C5-E5-G5 arpeggio with soft mallet tones; the last note rings.
    local n=""
    local i=0
    for f in 523.25 659.25 783.99; do
      local d; d=$(echo "$i*0.14" | bc -l)
      local dec=7; [ $i -eq 2 ] && dec=3
      n+="+gte(t,$d)*min(1,(t-$d)/0.004)*(0.55*sin(2*PI*$f*(t-$d))+0.12*sin(2*PI*$f*4*(t-$d))*exp(-14*(t-$d)))*exp(-$dec*(t-$d))"
      i=$((i+1))
    done
    echo "1.5|(${n#+})|aecho=0.8:0.5:50:0.15" ;;
  esac
}

lufs() { ffmpeg -hide_banner -nostats -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '/I:/ {v=$2} END {print v}'; }

for id in ting drop bell siren success; do
  IFS='|' read -r dur expr fx <<<"$(recipe "$id")"
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "aevalsrc='$expr':s=$SR:d=$dur" \
    -af "$fx,afade=t=out:st=$(echo "$dur-0.12" | bc -l):d=0.12" -ac 1 "$TMP/$id.wav"
  # Two passes: gain to target, peak-limit, then correct whatever the limiter took away.
  in=$TMP/$id.wav
  for pass in 1 2; do
    i=$(lufs "$in")
    gain=$(echo "$TARGET - ($i)" | bc -l)
    ffmpeg -hide_banner -loglevel error -y -i "$in" \
      -af "volume=${gain}dB,alimiter=limit=0.89:attack=1:release=30:level=disabled" "$TMP/$id-$pass.wav"
    in=$TMP/$id-$pass.wav
  done
  ffmpeg -hide_banner -loglevel error -y -i "$in" -c:a aac -b:a 96k -ar $SR -ac 1 -movflags +faststart "$OUT/$id.m4a"
  printf '%-8s %4ss  %6s LUFS  %s\n' "$id" "$dur" "$(lufs "$OUT/$id.m4a")" "$(du -h "$OUT/$id.m4a" | cut -f1)"
done
