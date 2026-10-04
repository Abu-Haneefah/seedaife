# Seed AI Academy

> **Learn AI. Build with AI. Grow with AI.**

Seed AI Academy is a modern, high-performance web platform built with **Next.js (App Router)**, **TypeScript**, **Three.js**, and **GSAP**. It offers project-based coding and AI courses for children (age 6+), teenagers, adults, and working professionals.

---

## Features

- **Interactive 3D Seedbot Scene (Three.js)**:
  - Procedural 3D robot character ("Seedbot") built purely from code with rounded extruded geometry, toon shaders, and emissive glowing eyes.
  - Natural idle bobbing, periodic blinking, and smooth lerped pointer/touch tracking for head and eyes.
  - Interactive click-to-spin animation with spark particle bursts and speech bubble dialogue.
  - Three orbiting glowing planets (101, 102, 103) with raycasted hover tooltips and click-to-scroll navigation to corresponding curriculum levels.
  - 300+ canvas particle sprites drifting with depth parallax.
  - Camera dolly and robot repositioning scrubbed across page sections via **GSAP ScrollTrigger**.
  - Crisp rendering across all viewports with dynamic devicePixelRatio scaling and antialiasing on large screens.
- **3D Coverflow Carousel ("What You Will Build")**:
  - CSS 3D perspective transforms (`translateZ`, `rotateY`, `translateX`).
  - Active card pointer tilt effect (`--tx`, `--ty`).
  - Card flip to show project descriptions, keyboard arrow navigation, dot indicators, touch swipe support, and pause-on-hover autoplay.
- **3D Course Ladder**:
  - Perspective staircase for Generative AI 101, 102, and 103 levels with interactive level detail drawers.
- **Who It Is For**:
  - Audience tab switcher paired with an interactive 3D rotating CSS cube (`cube--0` through `cube--4`).
- **Seedbot Chat Simulator**:
  - Conversational demo with typing indicators, quick prompt chips, keyword matching, and triggers for 3D Seedbot spark bursts.
- **Preloader Animation**:
  - SVG animation of a cracking seed, growing sprout, and assembling robot head with skip intro capability and session storage persistence.
- **Free Workshop Registration**:
  - Lead capture form with live field validation, conditional child age band for parents, and success confirmation.
- **Accessible Accordion**:
  - Keyboard-operable FAQ with ARIA attributes and smooth expand/collapse.
- **Motion & Accessibility**:
  - Built-in reduced motion toggle in the footer that respects system preferences (`prefers-reduced-motion`) and halts 3D animation loops.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18, TypeScript)
- **3D Graphics**: [Three.js](https://threejs.org/)
- **Animation & Scroll Orchestration**: [GSAP](https://greensock.com/gsap/) & [ScrollTrigger](https://greensock.com/scrolltrigger/)
- **Typography**: [Inter](https://fonts.google.com/specimen/Inter) via `next/font/google`
- **Styling**: Modern CSS Custom Properties, CSS 3D Transforms, Fluid Typography with `clamp()`

---

## Brand Palette

| Token     | Hex       | Role                                                    |
| :-------- | :-------- | :------------------------------------------------------ |
| `--plum`  | `#2A1450` | Primary dark background and body text on light surfaces |
| `--lime`  | `#B8F23C` | Primary accent, hero highlights, buttons, and 101 level |
| `--lilac` | `#A98BFF` | Secondary accent, support graphics, and 102 level       |
| `--cream` | `#FFF8E7` | Contrast background sections and headline highlights    |
| `--coral` | `#FF6F61` | Accent highlight, alerts, and 103 level                 |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18.17.0 or higher
- `npm`, `pnpm`, or `yarn`

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Abu-Haneefah/seedaife.git
cd seedaife
npm install
```

### Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Create an optimized production build and run it:

```bash
npm run build
npm run start
```

---

## Project Structure

```text
seedaife/
├── public/
│   └── images/                # Brand logos and icons
├── src/
│   ├── app/
│   │   ├── globals.css        # Core stylesheet, tokens, keyframes & animations
│   │   ├── layout.tsx         # Root layout (Inter font, metadata, audio/cursor ambient layers)
│   │   ├── page.tsx           # Home landing page with all interactive sections
│   │   ├── not-found.tsx      # Custom 404 page
│   │   ├── login/
│   │   │   └── page.tsx       # Login route
│   │   └── register/
│   │       └── page.tsx       # Registration route
│   ├── components/
│   │   ├── CourseLadder.tsx   # 3D staircase & course detail drawer
│   │   ├── FaqAccordion.tsx   # Accessible FAQ collapsible items
│   │   ├── Footer.tsx         # Footer with links, reduced-motion toggle, legal modals
│   │   ├── GlowCursor.tsx     # Desktop pointer follower radial glow
│   │   ├── Modals.tsx         # Privacy, Terms, WhatsApp & Email modal dialogs
│   │   ├── Navbar.tsx         # Sticky blurred navbar & animated mobile drawer
│   │   ├── Preloader.tsx      # SVG seed sprout & assembly intro animation
│   │   ├── ProjectCarousel.tsx# 3D Coverflow carousel with tilt & card flip
│   │   ├── SeedbotChat.tsx    # Scripted chat widget simulator
│   │   ├── SeedbotScene.tsx   # Three.js 3D Seedbot, orbiting planets & particles
│   │   ├── SvgSprite.tsx      # Reusable #seedai-mark SVG symbol definition
│   │   ├── WhatsAppFab.tsx    # Floating WhatsApp CTA button
│   │   ├── WhoTabs.tsx        # Audience tabs with 3D rotating CSS cube
│   │   └── WorkshopForm.tsx   # Free workshop registration & lead capture
│   └── lib/
│       ├── config.ts          # Centralized configuration & link builders
│       └── ticker.ts          # Shared requestAnimationFrame loop & math helpers
├── .gitignore
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## Environment Variables

Create a `.env.local` file in the root directory if you wish to override default contact details or connect backend services:

---

## License

All rights reserved © Seed AI Academy.
