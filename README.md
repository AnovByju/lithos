# Lithos — Infinite Literature

> A TikTok-style infinite scroll feed for literature. Discover poems, quotes, stories, letters and philosophy from history's greatest minds — Shakespeare, Rumi, Da Vinci, Kafka and more.

![Lithos Preview](https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80)

## ✨ Features

- **TikTok-style snap scroll** — one piece at a time, full screen
- **48+ authentic literary works** from 40+ authors across 26 centuries
- **Live WebGL shader background** via Three.js
- **Apple Liquid Glass aesthetic** — frosted glass cards, specular highlights, physics tilt
- **Auto-hiding navbar** — disappears on scroll down, returns on scroll up
- **Save collection** — bookmark pieces to your personal panel
- **Filter by type** — Poems, Quotes, Stories, Letters, Diaries, Essays, Philosophy
- **Virtual windowing** — only ±2 cards rendered at a time for performance
- **Source links** — every piece links back to Wikipedia or Internet Archive
- **Keyboard navigation** — `↑` / `↓` or `j` / `k`
- **Infinite pool** — shuffled & looped, never repeats immediately

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Three.js** — WebGL shader animation
- **shadcn/ui** project structure
- **lucide-react** — icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/lithos.git
cd lithos

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
lithos/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main TikTok-style feed page
│   └── globals.css         # Global styles & CSS variables
├── components/
│   ├── lit-card.tsx        # Full-screen literature card
│   └── ui/
│       ├── shader-animation.tsx   # Three.js WebGL background
│       ├── theme-toggle.tsx       # Dark/light toggle
│       └── gooey-text.tsx         # Morphing text effect
├── lib/
│   ├── literature-data.ts  # All 48 literary pieces + types
│   └── utils.ts            # Tailwind cn() helper
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🌐 Deploy to Vercel

The easiest way to deploy is via [Vercel](https://vercel.com):

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo directly at [vercel.com/new](https://vercel.com/new).

## 📚 Literature Sources

All content sourced from:
- [Wikipedia](https://en.wikipedia.org) — public domain literary works
- [Internet Archive](https://archive.org) — digitized manuscripts and notebooks

## 📄 License

MIT — free to use, modify and distribute.
