# BRD-to-Application Copilot - Frontend

> **Component Notice**: This repository contains the **Frontend Client** for the BRD-to-Application Generation Copilot. It interfaces with the FastAPI backend orchestration engine to drive the end-to-end multi-agent code generation pipeline.

---

## Overview

The **Frontend** provides an interactive, dark-themed control center that guides users from raw Business Requirement Documents (BRD) to previewing and live-editing autonomously generated, full-stack Next.js applications.

It coordinates user inputs, human-in-the-loop architecture refinement, real-time Server-Sent Events (SSE) log streaming from autonomous agents, and an interactive live application sandbox preview.

---

## Multi-Agent Architecture & Frontend Interaction

The application is powered by an autonomous multi-agent pipeline orchestrated by the backend. The frontend acts as the operational interface across three discrete phases:

```
[Raw BRD / Upload] 
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Phase 1: Architecture Formulation & Human-in-the-Loop   │
│ - Architect Agent: Generates full Markdown system spec │
│ - Refiner Agent: Iteratively refines spec via chat bar │
└──────────────────────────┬─────────────────────────────┘
                           │ User Approval
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: Autonomous Code Generation Pipeline (SSE)     │
│ - Planner Agent: Generates JSON task graph & scaffold   │
│ - Backend Agent: Builds SQLite schemas & API routes    │
│ - Frontend Agent: Creates Next.js pages & components   │
│ - Integration / QA Agent: Verifies, binds port, runs   │
└──────────────────────────┬─────────────────────────────┘
                           │ Live Dev Server Ready
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 3: Live Sandbox & Real-time Modification         │
│ - Embedded Sandbox: Live iframe on dynamic port        │
│ - Application Modifier Agent: Natural language hot-fix │
└────────────────────────────────────────────────────────┘
```

### Multi-Agent Pipeline Roles

1. **Architect Agent (Screen 1)**
   - Accepts raw BRD text or documents (PDF, DOCX, TXT) parsed via the backend.
   - Generates a complete Functional and Technical Architecture Specification covering database models, routes, API endpoints, business logic, and UI mockups.

2. **Refiner Agent (Screen 2)**
   - Provides a conversational prompt interface allowing users to critique, expand, or adjust the architecture specification before any code is generated.

3. **Planner Agent (Screen 3 - Autonomous Phase)**
   - Breaks down approved technical specifications into a token-safe execution plan.
   - Scaffolds package configurations, dependencies, and project structure.

4. **Backend Agent (Screen 3 - Autonomous Phase)**
   - Implements data layer abstractions using Node.js built-in `node:sqlite` (`DatabaseSync`).
   - Seeds initial sample data and generates Next.js App Router API endpoints (`src/app/api/.../route.ts`).

5. **Frontend Agent (Screen 3 - Autonomous Phase)**
   - Generates responsive, dark-themed React components, navigation, layouts, data grids, and forms matching the architecture specification.

6. **Integration & QA Agent (Screen 3 - Autonomous Phase)**
   - Validates file structure, manages dependency links, allocates an available ephemeral port, and launches the generated application dev server.

7. **Application Modifier Agent (Screen 3 - Live Preview)**
   - Powers the real-time chat assistant next to the live application preview.
   - Inspects existing files in the generated application, applies focused updates, and triggers Next.js Fast Refresh without restarting the application server.

---

## Screen Breakdown & Workflow

### Screen 1: BRD Input & Ingestion
- Upload document files (`.pdf`, `.docx`, `.txt`) or input raw text.
- Drag-and-drop file ingestion with parsing feedback.
- Triggers the backend **Architect Agent** to generate the initial system specification.

### Screen 2: Architecture Specification Editor
- Split-screen / full-view rendered Markdown viewer for the technical specification.
- Interactive refinement chat bar communicating with the **Refiner Agent** to adjust requirements.
- "Approve & Generate" action initiates the autonomous generation pipeline.

### Screen 3: Agent Stream & Live Application Sandbox
- **Real-time Agent Console**: Streams real-time progress, agent thoughts, file creation events, and terminal outputs via Server-Sent Events (SSE).
- **Embedded Sandbox**: Displays the running, generated application directly within a responsive iframe connected to the allocated dynamic port.
- **Modifier Sidebar**: Direct chat channel with the **Application Modifier Agent** to request immediate code adjustments on the fly.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **HTTP & Streaming**: Axios, Native EventSource (Server-Sent Events)
- **Markdown Rendering**: React Markdown, Remark GFM

---

## Project Structure

```
frontend/
├── package.json
├── tsconfig.json
├── next.config.ts
├── src/
│   ├── app/
│   │   ├── globals.css                   # Dark theme design system & typography
│   │   ├── layout.tsx                    # Root layout
│   │   └── page.tsx                      # Main pipeline state coordinator
│   └── components/
│       ├── Header.tsx                    # Header with step progress indicator
│       ├── Screen1BRDInput.tsx           # Document ingestion & BRD submission
│       ├── Screen2ArchitectureEditor.tsx # Markdown spec viewer & refinement chat
│       └── Screen3ApplicationPreview.tsx # SSE log terminal, iframe, & modifier chat
```

---

## Getting Started

### Prerequisites

- Node.js 20+ or Node.js 22+ (recommended)
- Running Backend Service (FastAPI running at `http://localhost:8000`)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   Create a `.env.local` file if you need to point to a custom backend address:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```
   *(Defaults to `http://localhost:8000` if omitted).*

4. Start the development server:
   ```bash
   npm run dev
   ```
