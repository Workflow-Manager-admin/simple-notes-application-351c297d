import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * Main App component for the notes application.
 */
function App() {
  // Define color palette according to requirements
  const COLORS = {
    accent: "#ffca28",
    primary: "#1976d2",
    secondary: "#424242",
    lightBg: "#ffffff",
    sidebarBg: "#f6f8fa",
    border: "#e5e7eb",
    shadow: "rgba(33, 33, 33, 0.04)",
    textPrimary: "#212121",
    textSecondary: "#525252",
  };

  // Note structure: { id, title, body, lastEdited }
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load notes from localStorage on mount
  useEffect(() => {
    const storedNotes = window.localStorage.getItem("notes");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
      // Set last note as active
      const parsed = JSON.parse(storedNotes);
      setActiveNoteId(parsed.length > 0 ? parsed[0].id : null);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    window.localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // PUBLIC_INTERFACE
  const createNote = () => {
    const newNote = {
      id: String(Date.now()),
      title: "Untitled Note",
      body: "",
      lastEdited: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  // PUBLIC_INTERFACE
  const updateNote = (id, fields) => {
    setNotes((notes) =>
      notes.map((note) =>
        note.id === id
          ? { ...note, ...fields, lastEdited: new Date().toISOString() }
          : note
      )
    );
  };

  // PUBLIC_INTERFACE
  const deleteNote = (id) => {
    const idx = notes.findIndex((n) => n.id === id);
    const updated = notes.filter((note) => note.id !== id);
    setNotes(updated);
    // Switch to another note if one is left
    if (updated.length > 0) {
      // Prefer previous note
      setActiveNoteId(
        idx === 0 ? updated[0].id : updated[idx - 1]?.id || updated[0].id
      );
    } else {
      setActiveNoteId(null);
    }
  };

  // PUBLIC_INTERFACE
  const selectNote = (id) => {
    setActiveNoteId(id);
  };

  // Filter notes by search
  const displayedNotes =
    searchTerm.trim() === ""
      ? notes
      : notes.filter(
          (n) =>
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.body.toLowerCase().includes(searchTerm.toLowerCase())
        );

  // Find active note
  const activeNote = notes.find((n) => n.id === activeNoteId);

  // --- UI Components inline for simplicity ---
  // PUBLIC_INTERFACE
  const TopNav = () => (
    <nav
      style={{
        width: "100%",
        height: 56,
        background: COLORS.primary,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: `0 2px 4px ${COLORS.shadow}`,
        padding: "0 1.5rem",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: "1.18rem",
          letterSpacing: "0.01em",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            background: COLORS.accent,
            borderRadius: "50%",
            marginRight: 10,
            display: "inline-block",
          }}
        ></span>
        Simple Notes
      </div>
      <button
        className="add-btn"
        style={{
          background: COLORS.accent,
          color: COLORS.secondary,
          fontWeight: 600,
          border: "none",
          borderRadius: "8px",
          padding: "7px 22px",
          fontSize: 16,
          cursor: "pointer",
          transition: "background .18s",
        }}
        onClick={createNote}
        aria-label="Create Note"
      >
        + New
      </button>
    </nav>
  );

  // PUBLIC_INTERFACE
  const Sidebar = () => (
    <aside
      style={{
        width: 280,
        background: COLORS.sidebarBg,
        borderRight: `1px solid ${COLORS.border}`,
        paddingTop: 0,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 56px)",
        minHeight: 0,
      }}
    >
      <div style={{ padding: "1.3rem 1rem 0.4rem", position: "sticky", top: 0, zIndex: 1, background: COLORS.sidebarBg }}>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          spellCheck={false}
          aria-label="Search notes"
          style={{
            width: "100%",
            padding: "0.6rem 0.8rem",
            borderRadius: "7px",
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            fontSize: 15,
            color: COLORS.textPrimary,
            fontWeight: 400,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: "1.35rem",
        }}
      >
        {displayedNotes.length === 0 ? (
          <div
            style={{
              color: "#bdbdbd",
              textAlign: "center",
              marginTop: "2rem",
              fontSize: 16,
            }}
          >
            {notes.length === 0
              ? "No notes yet. Click + New to add one!"
              : "No matching notes."}
          </div>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {displayedNotes.map((note) => (
              <li
                key={note.id}
                style={{
                  marginBottom: 2,
                }}
              >
                <button
                  className="sidebar-note"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background:
                      note.id === activeNoteId ? COLORS.accent : "transparent",
                    border: "none",
                    borderRadius: 7,
                    padding: "0.9rem 0.95rem",
                    color:
                      note.id === activeNoteId
                        ? COLORS.secondary
                        : COLORS.textPrimary,
                    cursor: "pointer",
                    fontWeight:
                      note.id === activeNoteId ? 700 : 400,
                    boxShadow:
                      note.id === activeNoteId
                        ? `0 1px 5px 0 ${COLORS.shadow}`
                        : "none",
                    position: "relative",
                    fontSize: 15,
                    letterSpacing: 0.01,
                  }}
                  onClick={() => selectNote(note.id)}
                  aria-current={note.id === activeNoteId}
                  aria-label={`Select note: ${note.title}`}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 1, 
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" 
                  }}>
                    {note.title.length > 33
                      ? note.title.slice(0, 31) + "…"
                      : note.title}
                  </div>
                  <div
                    style={{
                      color:
                        note.id === activeNoteId
                          ? COLORS.secondary
                          : "#858997",
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {new Date(note.lastEdited).toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );

  // PUBLIC_INTERFACE
  const NoteEditor = () => {
    if (!activeNote) {
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "#bdbdbd",
            height: "100%",
          }}
        >
          Select or create a note on the left.
        </div>
      );
    }

    const handleTitleChange = (e) => {
      updateNote(activeNote.id, { title: e.target.value });
    };

    const handleBodyChange = (e) => {
      updateNote(activeNote.id, { body: e.target.value });
    };

    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "2.2rem 2.3rem 1.7rem",
          maxWidth: 768,
          margin: "0 auto",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}>
          <input
            className="note-title"
            value={activeNote.title}
            onChange={handleTitleChange}
            spellCheck={false}
            maxLength={100}
            style={{
              fontWeight: 700,
              fontSize: 24,
              lineHeight: "120%",
              background: "transparent",
              border: "none",
              outline: "none",
              marginLeft: "-5px",
              flex: 1,
              color: COLORS.textPrimary,
              letterSpacing: "0.01em",
              minWidth: 0,
            }}
            aria-label="Note Title"
          />
          <button
            className="delete-btn"
            onClick={() => deleteNote(activeNote.id)}
            aria-label="Delete note"
            style={{
              marginLeft: 16,
              background: COLORS.secondary,
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              padding: "9px 18px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 15,
              transition: "background .18s",
            }}
          >
            Delete
          </button>
        </div>
        <textarea
          className="note-body"
          style={{
            fontSize: 17,
            color: COLORS.textPrimary,
            border: `1.6px solid ${COLORS.border}`,
            borderRadius: 8,
            minHeight: 300,
            padding: "1.25rem",
            resize: "vertical",
            background: "#fff",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
            flex: 1,
          }}
          value={activeNote.body}
          onChange={handleBodyChange}
          placeholder="Start typing your note here..."
          aria-label="Note Body"
        ></textarea>
        <div style={{ marginTop: 24, color: COLORS.secondary, fontSize: 13, textAlign: "right"}}>
          Last edited: {new Date(activeNote.lastEdited).toLocaleString()}
        </div>
      </div>
    );
  };

  // Responsive layout (sidebar collapses on mobile)
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.lightBg,
        color: COLORS.textPrimary,
        display: "flex",
        flexDirection: "column",
      }}
      data-theme="light"
    >
      <TopNav />
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          height: "calc(100vh - 56px)",
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflow: "auto",
            background: COLORS.lightBg,
          }}
        >
          <NoteEditor />
        </main>
      </div>
    </div>
  );
}

export default App;
