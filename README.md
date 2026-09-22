# TTS bY Waqas Gill

A high-performance, studio-grade Text-to-Speech (TTS) platform powered by **Next.js 15 (App Router)**, **Tailwind CSS**, and **Microsoft Edge Neural Speech Engine**.

## 🌟 Key Features

- **320+ Neural Voices**: High-fidelity, natural-sounding voices across 140+ languages and locales (including English, Urdu, Spanish, Arabic, Hindi, French, German, Japanese, and more).
- **50,000 Words Capacity**: Capable of converting long scripts, articles, and audiobooks up to 50,000 words through intelligent sentence & paragraph chunking.
- **Voice Tuning & Prosody**: Real-time sliders for Speed / Speaking Rate (0.5x – 2.0x), Pitch (-50Hz – +50Hz), and Volume (-50% – +50%).
- **Interactive Studio Audio Player**: Custom waveform visualization, scrubbable progress bar, playback speed selector (0.8x – 2x), and one-click MP3 download.
- **Voice Explorer**: Search voices by name, accent, gender, and voice personality, with instant voice preview audio and favorites bookmarking.
- **Generation History**: Persists recent audio generations in local storage for instant replay and re-downloading.
- **100% Free & Unlimited**: No paid API keys or subscription limits required.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 20, 22, 24+)
- npm

### Installation
```bash
git clone https://github.com/waqasgilljutt/ttsbywaqas.git
cd ttsbywaqas
npm install
```

### Running Locally
```bash
# Start development server
npm run dev

# Or build and run in production mode
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **TTS Engine**: Microsoft Edge Speech Read Aloud Service via `msedge-tts` & `edge-tts`
- **Language**: TypeScript

---
Developed with ❤️ by Waqas Gill
