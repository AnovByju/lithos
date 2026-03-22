why not doom scroll literature
lithos-two.vercel.app — TikTok-style infinite scroll through the greatest writing in human history.
Show Image
Swipe through poems, quotes, stories, letters and philosophy from Shakespeare, Rumi, Da Vinci, Kafka, Plato and 35+ more. One piece at a time. Full screen. Forever.

What's inside

Snap scroll — one piece per swipe, just like TikTok
48+ real literary works across 26 centuries
Filter by Poems, Quotes, Stories, Letters, Diaries, Philosophy
Save pieces to your personal collection
Every piece links to its Wikipedia / Internet Archive source
WebGL animated background via Three.js
Works on mobile and desktop


Run it locally
You need Node.js installed first.
bashgit clone https://github.com/AnovByju/lithos.git
cd lithos
npm install
npm run dev
Open http://localhost:3000

Add a new literary piece
Open lib/literature-data.ts and add to the LITERATURE array:
ts{
  id: "unique_id",
  author: "Author Name",
  era: "1800–1850 · Nationality & Role",
  type: "quote",  // poem | quote | story | letter | diary | essay | philosophy
  title: "Work Title",
  content: "The text goes here.",
  source: "Wikipedia — Work Title",
  sourceUrl: "https://en.wikipedia.org/wiki/Work_Title"
},
Save → git push → live in 30 seconds on Vercel.

Tech
Next.js 14 · TypeScript · Tailwind CSS · Three.js · shadcn/ui
License
MIT
