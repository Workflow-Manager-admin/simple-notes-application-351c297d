# Notes Frontend – Architecture Documentation

## Overview

The `notes_frontend` is a modern, minimalistic, single-page React application for managing notes (create, read, update, delete, search). It is entirely client-side with persistent storage achieved via the browser's localStorage—meaning there are no backend APIs or server-side dependencies.

The design emphasizes:
- Clear separation of UI sections (sidebar for navigation, main editor area, and top navigation)
- Inlined, self-contained functional components within a single `App.js`
- Centralized state, all changes flowing through controlled state updates and React hooks

---

## High-Level Structure

```
src/
  App.js        # Main application logic, all UI and handlers
  index.js      # Entrypoint rendering App
  App.css       # Application styling and CSS variables
  index.css     # Global style reset and fonts
```
The application's entire runtime logic, data interactions, and UI are coded directly in `App.js` as the `App` component.

---

## Component Breakdown

### 1. App (Root Component)

- **Responsibility:** Owns all application state (`notes`, `activeNoteId`, `searchTerm`), storage sync logic, and hosts other UI sections as inlined components.
- **Subcomponents:**
  - `TopNav`: Header bar with app branding and create note button
  - `Sidebar`: Lists all notes and contains the note search/filter UI
  - `NoteEditor`: Edits the currently selected note (title/body), also provides note deletion
- **Publicly Exposed UI Methods:**
  - `createNote()`, `updateNote(id, fields)`, `deleteNote(id)`, `selectNote(id)`

### 2. TopNav

- App name/branding and "+ New" button to trigger note creation.
- Calls `createNote()` from `App`.

### 3. Sidebar

- Shows a list of all note titles and the live search field.
- Supports changing the `activeNoteId` by clicking a note (`selectNote(id)`).
- Filters notes using the `searchTerm`.

### 4. NoteEditor

- Displays the currently selected note (from `activeNoteId`).
- Lets the user update the note's `title` and `body` live, firing `updateNote`.
- Provides a button to delete the note (`deleteNote`).

---

## Component Interaction & Data Flow

```mermaid
flowchart TD
    A[User Action] -->|Sidebar select| App
    A2[User Action] -->|TopNav: +New| App
    A3[User Type] -->|Sidebar search| App

    App --> TopNav
    App --> Sidebar
    App --> NoteEditor

    TopNav --[createNote]--> App
    Sidebar --[selectNote]--> App
    NoteEditor --[updateNote, deleteNote]--> App

    App <--> B[localStorage['notes']]

    classDef data fill:#ffe5b2,stroke:#cb8b1b;
    classDef view fill:#e6e6fa,stroke:#6241a2;
    class TopNav,Sidebar,NoteEditor view;
    class B data;
```

- All UI event handlers are attached at the component level, but every handler ultimately calls a function defined in `App` (which then updates state).
- State updates (via React's `setState`) immediately trigger data persistence to localStorage for notes; on reload, state is repopulated from localStorage.
- The sidebar and main area always render based on the latest state in `App`.

---

## State Management

- Uses React's `useState` for all local state.
- Notes data is represented as an array of Note objects, persisted to and restored from localStorage under the `"notes"` key.
- React's `useEffect` is used for:
  - Loading notes from localStorage *once* on initial mount
  - Saving notes to localStorage *whenever notes change*

### Data Shape

```js
type Note = {
  id: string,         // Unique string (timestamp-based)
  title: string,      // Note title
  body: string,       // Note content text
  lastEdited: string, // ISO datestamp for last edit
}
```

- `notes`: Array<Note>
- `activeNoteId`: string | null
- `searchTerm`: string

---

## Data Persistence & Storage

- **Initial Load:** On mount, reads notes from `window.localStorage['notes']` (JSON array).
- **Syncing:** Every time the `notes` array changes, it's serialized and written back to localStorage.
- **No version migration, no partial loads.** Full replacement every time.

---

## UI Composition

- **TopNav:** Present at the top for all screen sizes, with a clearly visible "New" button.
- **Sidebar:** To the left on larger screens; hidden on mobile. Contains a scrollable list of notes and a search bar.
- **Main Editor Area:** To the right, shows and edits the content/title of the currently selected note (if any). Responsive layout ensures writing comfort and clarity.

---

## Flow: User Action to Data Persistence

1. **User creates a note:** ("+ New")
   - Triggers `createNote()`, new note added to `notes` state, new activeNoteId set, state saved to storage.

2. **User updates note (typing):**
   - Triggers `updateNote(id, { ... })`, state is updated and immediately saved to storage.

3. **User deletes note:**
   - Triggers `deleteNote(id)`, state updated, fallback active note chosen, new state is saved to storage.

4. **User searches notes:**
   - Updates the `searchTerm` state which filters the sidebar view — no storage writes.

---

## Design Rationale

- **Single-file, flat structure:** Keeps the app minimal and transparent, ideal for fast onboarding or small projects.
- **No external contexts or state management libraries:** All state lifted to the root; no context API needed at this scale.
- **Immediate, persistent storage:** Simple `localStorage` persistence every time a relevant state changes—ensures robustness and user data safety without dependency on server APIs.
- **Responsive UI:** Layout adapts for mobile/small-screens by hiding the sidebar for single-pane focus.

---

## Extensibility Notes

For larger or more complex apps, consider:
- Splitting UI sections (Sidebar, TopNav, NoteEditor) into their own files/components for isolation and maintainability.
- Adding a context provider if multiple distinct parts of the app need to share deeply nested state.
- Implementing optimistic updates, undo, or versioning in localStorage.
- Adding external synchronization (e.g., cloud sync) via APIs as needed, adapting the storage logic.

---

## Summary

This architecture provides a highly maintainable, intuitive foundation for a client-side notes app, suitable for expansion but immediately usable as a minimal, robust product. The app’s flow is transparent, owing to centralized state and tightly coupled UI logic.

```
Task completed: High-level architecture documentation for notes_frontend generated, including structure, components, data flow, storage, and rationale.
