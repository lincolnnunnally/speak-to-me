# Speak to Me

A simple, personal Bible reading app focused on hearing Scripture as a living word from God — not a history textbook.

**Core feature:** Speak to Me mode with quiet reading, relational invitation questions, and private journaling.

## Why this exists

Most people approach the Bible the way they were taught in school or certain churches: as a historical document to decode or a moral textbook to master. When that method produces fatigue instead of life, they conclude the problem is them.

The real issue is often the posture. A book written to be received as a living word from a Person will frustrate the reader who treats it like an ancient encyclopedia.

This app trains a different reflex: from “What did this mean then?” to “What is this saying to me, right now, by the Spirit?”

## Features (MVP)

- **Today’s verse** from ChurchConnect Content Hub (BSB + Real Life Application)
- Enter any simple Bible reference (John 3:16, Psalm 23, Romans 8:1, etc.)
- Clean, distraction-free reading of the passage
- Four quiet, relational invitation questions (not study questions)
- Private journal responses (your account / device — never bulk-shared as free text)
- Optional **anonymized need themes** sent to ChurchConnect so area pastors can preach relevantly (topics only, not your journal)

## ChurchConnect interconnect

| Action | API |
|--------|-----|
| Load today’s VOTD + RLT | `GET {CHURCHCONNECT_API}/api/public/homescreen-verse` |
| View / journal / need signals | `POST {CHURCHCONNECT_API}/api/public/verse-engagement` |

Env (optional):

```bash
NEXT_PUBLIC_CHURCHCONNECT_API_URL=https://api.churchconnect.cloud
```

Pastors see aggregates in ChurchConnect → Sermon Prep Audience Pulse / area-needs — never individual journal text.

## Tech

- Next.js 15.5 + Tailwind CSS
- Free public-domain Bible text (World English Bible / KJV fallback via free APIs)
- Local storage only for journals — nothing leaves the device

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Live

Deployed on Vercel: https://speak-to-me-lincolnnunnallys-projects.vercel.app

(Or the project production domain once set.)
