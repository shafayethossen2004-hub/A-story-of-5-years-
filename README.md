# 🌙 Moonlit Bloom — An Interactive Love Experience

A cinematic, interactive digital confession experience crafted with **Vanilla JavaScript (ES Modules)**, **HTML5 2D Canvas**, **GSAP timelines**, and custom **Procedural Web Audio API sound synthesis**.

Set under a moonlit night sky, the app takes the viewer on a multi-act visual journey: a beating heart hero, moonflower burst transitions, kinetic typography character reveals, a procedurally growing blossom tree, glowing butterfly flight trails, and an interactive handwritten love note.

---

## ✨ Features & Highlights

- **Beating Heart Hero (Act 1)**: Interactive pulse animation with synthesized heartbeat audio thuds. Tapping triggers a glowing touch ripple and heart particle burst.
- **Kinetic Typography (Act 3)**: GSAP 3D character hinges that shatter and reform into personalized proposal/confession headlines.
- **Procedural Canvas Blossom Tree (Act 4)**: 60fps HTML5 canvas rendering engine procedural branching, blooming heart petals, god-rays, floating bokeh, twinkling starfields, and falling petals.
- **Celestial Constellation Sky (Act 6)**: Starfield sky with flying butterflies drawing glowing particle trails, shooting stars, and ring text animations.
- **Procedural Web Audio Engine**: Pure Web Audio synthesis delivering soft heartbeat low tones, crystal glass chimes, and ambient pentatonic melodies (D Major scale). Zero external audio file dependencies.
- **Interactive Personalization Modal**: Real-time modal UI allowing customization of partner/sender names, proposal lines, promise subtitles, and personal handwritten letter content (persisted in `localStorage`).
- **Wax-Sealed Love Letter Overlay**: A 3D parchment paper love letter card with a wax stamp seal, Google Fonts typography (`Great Vibes` & `Cormorant Garamond`), and gold ribbon accents.
- **Ultra Responsive & Accessible**: Optimized for touch viewports with dynamic height units (`100dvh`), keyboard navigation (`tabindex`, `Enter`/`Space` hotkeys), and reduced-motion fallback states.

---

## 🛠️ Tech Stack & Architecture

- **Core**: HTML5, Vanilla CSS3 (Custom Design Tokens), ES6+ Modules
- **Animation**: [GSAP 3.12](https://greensock.com/gsap/) (GreenSock Animation Platform)
- **Graphics**: HTML5 2D Canvas Context (Sprite pooling & Bezier curve math)
- **Audio**: Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`)
- **Bundler & Tooling**: [Vite 7.x](https://vitejs.dev/)

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🎨 Customizing & Personalizing

You can customize the text and note in two ways:

1. **Live via In-App UI**: Click the **Customize** button in the top right control bar while running the app to open the personalization dialog. Changes update live and persist in `localStorage`.
2. **Code Default Configuration**: Edit default values in `index.html` or the `defaultConfig` object in `romantic.js`.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

Developed with ♥ by [Saklin Ali](https://github.com/saklincodes).


