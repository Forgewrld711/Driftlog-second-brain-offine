# ✦ Driftlog

> *your day, mapped as it drifts through your mind*

A fully offline constellation journal with a bundled 23 MB semantic model. Write about your day — who you saw, where you went, how you felt — and watch it become a living star map.

**Built for [Hackyard Yard #6: Offline](https://hackyard.tech/yards/yard-6)**

---

## What it does

Type or paste anything about your day into Driftlog. It extracts:

| Node type | Color | Examples |
|-----------|-------|---------|
| 🔵 People | Blue | Names of people you mention |
| 🟢 Places | Green | Locations you visited or reference |
| 🟣 Things | Purple | Objects, media, activities |
| 🟠 Feelings | Orange | Emotions detected in your writing |

Entities become glowing nodes on a force-directed constellation graph. Nodes that appear across multiple entries grow larger. Connections form between entities that share an entry — people you met in a place, feelings tied to a thing.

Everything is stored in `localStorage`. No server. No account. No internet. **Ever.**

---

## How to use

1. Open the published site once and let the local brain finish waking up
2. Keep using it online or offline — the app, runtime, and model are cached on-device
3. Write about your day
4. Hit **Map to stars**
5. Watch your day become a constellation

For local development, serve the repository instead of double-clicking the file:

```sh
python -m http.server 4175
```

Then open `http://localhost:4175/driftlog.html`. The deterministic recognizer still works when `driftlog.html` is opened directly, but browsers do not allow the local model Worker to load from `file://`.

---

## Features

- ✦ Bundled MiniLM semantic model — journal text stays on the device
- ✦ Dedicated Web Worker keeps model inference away from the interface thread
- ✦ Deterministic recognition remains instant and works even if the model is paused
- ✦ Service Worker caches the complete app and model for offline use
- ✦ Force-directed graph layout with gentle physics simulation
- ✦ Animated glowing nodes that pulse softly
- ✦ Drag to pan, scroll to zoom, fit-to-screen button
- ✦ Hover tooltips showing node type and entry count
- ✦ Entry log — click any past entry to highlight its nodes
- ✦ Deep-space dark interface designed for low-glare journaling
- ✦ Responsive — works on mobile
- ✦ Entries persist via `localStorage`
- ✦ Contextual local recognition for people, bounded places, quoted works, tags, topics, and feeling families
- ✦ `@people` and `#topics` provide intentional hints without sending text anywhere
- ✦ Zero remote fonts, scripts, model APIs, analytics, or journal-data network calls

---

## Why offline-first?

Your journal is yours. The most intimate thing you can write about — your day, your feelings, the people in your life — shouldn't require a server, an account, or a network request to exist. Driftlog works in a plane, in a blackout, on a machine with no internet, forever.

The interface is vanilla HTML/CSS/JS with no framework or build step. The pinned Transformers.js runtime, ONNX Runtime, tokenizer, and quantized model are committed with the app rather than fetched from a third party.

---

## Roadmap / v2 ideas

- [ ] MCP server integration — expose your constellation as a tool for AI agents
- [x] Local semantic model for ambiguous topic and feeling refinement
- [ ] Voice entry via Web Speech API
- [ ] Export constellation as SVG/PNG
- [ ] Cross-entry "memory threads" — trace a person or feeling across time
- [ ] Offline PWA with home screen install

---

## Credits

**Made by [Miranda Price](https://github.com/mirandaprice12345)**
in collaboration with **Claude Sonnet 4.6** (Anthropic)

Local semantic-brain upgrade built with **Morrow** (OpenAI Codex).

Built in one session, submitted to Hackyard Yard #6 for the early-badge deadline.

*"The best second brain is one that looks like the inside of your mind."*

---

## License

MIT — take it, fork it, make it yours.
