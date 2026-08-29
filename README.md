# SIDEQUEST — WebMCP Challenge Demo

> **Agent-native productivity for staying on the main quest.**
> Built for nonlinear, ADHD, and distraction-prone work styles.

---

## 🌟 Overview

**SIDEQUEST** is a local-first, distraction-resilient workspace built to solve the core cognitive breakdown in self-directed work: losing the Main Quest to tangent distractions.

For the **WebMCP Challenge**, SIDEQUEST exposes **28 browser-native WebMCP tools** via `document.modelContext`, allowing browser agents (like ChatGPT with WebMCP, or custom agent runtimes) to observe and interact with the user's active productivity context with zero brittle DOM clicking.

---

## 🚀 Fast Track for Judges

1. Open the app at `/demo` (or click **Judge Mode** in the sidebar navigation).
2. The app immediately initializes an **isolated demo workspace** (`sidequest:demo:v1`), protecting all real user data.
3. Review the **WebMCP Interaction Guide** with 6 copyable prompts:
   - **Prompt 1**: `"I have 45 minutes. Get me back to useful work."` *(Reads state, restores Context Keeper note, sets Main Quest, starts focus session)*
   - **Prompt 2**: `"I'm stuck. Make my next action smaller."` *(Breaks down blocked next action into an ultra-low friction 2-minute micro-step)*
   - **Prompt 3**: `"Park 'redesign my portfolio' so I don't switch tasks."` *(Parks the distraction into the Side Quest Parking Lot without losing focus)*
   - **Prompt 4**: `"Start a 25-minute focus session."` *(Engages countdown timer on the active Main Quest)*
   - **Prompt 5**: `"I've been working for a while. Check if a recovery break makes sense."` *(Checks movement and hydration history and suggests healthy recovery)*
   - **Prompt 6**: `"What did I accomplish?"` *(Summarizes focus minutes, completed steps, player level, and combo streak)*
4. Run prompts through ChatGPT or use the built-in **Interactive WebMCP Tool Runner** at the bottom of the page to execute tools directly.
5. Watch the **Live Agent Action Timeline** record every execution in real-time with execution times, before/after state diffs, and inspectable JSON payloads.
6. Check off all 7 milestones in the **WebMCP Scenario Tracker**!

---

## 🛠️ WebMCP Architecture & 28 Registered Tools

### Protocol Integration
```
[ChatGPT / Browser Agent]
        │
        ▼ (JSON-RPC / WebMCP API)
[document.modelContext]
        │
        ▼
[SIDEQUEST WebMCP Registry (28 Tools)]
        │
        ├─► Work & Quests (12 Tools)
        ├─► Focus Session (5 Tools)
        ├─► Context Keeper (3 Tools)
        ├─► Side Quest Parking Lot (3 Tools)
        ├─► Recovery & Physical Well-being (3 Tools)
        └─► Player State & XP (2 Tools)
        │
        ▼
[React State Store & Storage Isolation (sidequest:demo:v1)]
```

### Safety & Guardrails
- **Read-Only / Mutation Classification**: All tools are strictly annotated with `readOnlyHint` and categorized for agent transparency.
- **State Snapshot Differencing**: Every mutation captures before-and-after snapshots (Main Quest, Next Action, Progress, Focus Timer, Parked Count).
- **Protected Human-Only Actions**: Dangerous operations (`clearLocalData`, `importBackup`, `resetNamespace`) are excluded from WebMCP tool exposure.

---

## 📦 Technology Stack

- **React 18 + Vite**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (Layout animations & reduced motion support)
- **Lucide React**
- **WebMCP** (`document.modelContext`)
- **localStorage** with isolated storage namespaces
