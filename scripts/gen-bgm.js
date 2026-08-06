/**
 * Generate short royalty-free procedural BGM loops (WAV).
 * Run: node scripts/gen-bgm.js
 */
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "assets", "audio", "tracks");
fs.mkdirSync(outDir, { recursive: true });

function writeWav(filePath, samples, sampleRate = 44100) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

function env(t, attack, decay, sustain, release, dur) {
  if (t < attack) return t / attack;
  if (t < attack + decay) {
    const u = (t - attack) / decay;
    return 1 - u * (1 - sustain);
  }
  if (t < dur - release) return sustain;
  if (t < dur) return sustain * (1 - (t - (dur - release)) / release);
  return 0;
}

function tone(freq, t, type = "sine") {
  const p = 2 * Math.PI * freq * t;
  if (type === "triangle") return (2 / Math.PI) * Math.asin(Math.sin(p));
  if (type === "square") return Math.sign(Math.sin(p)) * 0.35;
  return Math.sin(p);
}

function makeTrack(kind, seconds = 48) {
  const sr = 44100;
  const n = Math.floor(sr * seconds);
  const out = new Float64Array(n);

  // Chord progressions / moods
  const presets = {
    neon: {
      bpm: 86,
      root: 55,
      pads: [0, 3, 7, 10],
      bass: [0, 0, 5, 3],
      sparkle: true,
    },
    alley: {
      bpm: 72,
      root: 49,
      pads: [0, 4, 7, 11],
      bass: [0, 7, 5, 3],
      sparkle: false,
    },
    chill: {
      bpm: 78,
      root: 52,
      pads: [0, 3, 7, 12],
      bass: [0, 5, 3, 7],
      sparkle: true,
    },
  };
  const p = presets[kind];
  const beat = 60 / p.bpm;
  const bar = beat * 4;

  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const barIndex = Math.floor(t / bar) % p.bass.length;
    const bassSemi = p.bass[barIndex];
    const bassFreq = p.root * Math.pow(2, bassSemi / 12);

    // soft bass
    let s = tone(bassFreq, t, "sine") * 0.18 * env((t % bar), 0.05, 0.2, 0.7, 0.3, bar);
    s += tone(bassFreq * 0.5, t, "triangle") * 0.08;

    // pad chords
    for (const semi of p.pads) {
      const f = p.root * 2 * Math.pow(2, (semi + bassSemi) / 12);
      const vib = 1 + 0.003 * Math.sin(2 * Math.PI * 0.12 * t);
      s += tone(f * vib, t, "sine") * 0.045;
      s += tone(f * 1.5 * vib, t, "triangle") * 0.012;
    }

    // vinyl / night hush
    s += (Math.random() * 2 - 1) * 0.008;

    // occasional sparkle arpeggio
    if (p.sparkle) {
      const step = Math.floor((t % (beat * 2)) / (beat / 2));
      const arp = [0, 7, 12, 15][step % 4];
      const af = p.root * 4 * Math.pow(2, (arp + bassSemi) / 12);
      const local = t % (beat / 2);
      s += tone(af, t, "sine") * 0.035 * env(local, 0.01, 0.05, 0.2, 0.12, beat / 2);
    }

    // gentle lowpass-ish soft clip
    out[i] = Math.tanh(s * 1.4) * 0.85;
  }

  // fade in/out for seamless-ish loop feel
  const fade = Math.floor(sr * 1.5);
  for (let i = 0; i < fade; i++) {
    out[i] *= i / fade;
    out[n - 1 - i] *= i / fade;
  }
  return out;
}

const tracks = [
  ["lorde-bar-1.wav", "neon"],
  ["lorde-bar-2.wav", "alley"],
  ["lorde-bar-3.wav", "chill"],
];

for (const [name, kind] of tracks) {
  const file = path.join(outDir, name);
  writeWav(file, makeTrack(kind, 52));
  console.log("wrote", file);
}
console.log("done");
