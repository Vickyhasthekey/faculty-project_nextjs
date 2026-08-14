# ProfMatch (Next.js)

Faculty search and RAG chat run **inside this Vercel/Next.js app**. There is no Render backend on the search/chat path.

- Search: hashed 384-d vectors over a **bundled** list of 665 professors (UCLA + CWRU). Every name in that file is equally fast — nothing is left on Render.
- NUS / `nus.edu` rows are excluded. The live dump had none; the filter is still applied.
- Chat: Gemini (`GEMINI_API_KEY`) with retrieved faculty stuffed into the prompt

## Local setup

```bash
cp .env.example .env.local   # add GEMINI_API_KEY for chat; search works without it
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Search `computer vision`, filter UCLA, then try the chat widget.

```bash
npm test
```

After you push to GitHub, Vercel deploys this repo. You can delete the local clone; GitHub + Vercel keep the site. Add `GEMINI_API_KEY` in the Vercel project env vars for chat.

The FastAPI/Render service is no longer required for this frontend.
