// components/NotesSection.js
import React, { useState } from 'react';

function NotesSection({ customerId }) {
  const [notes, setNotes] = useState([
    {
      id: 1,
      text: 'Customer inquired about refund policy for cancelled flights.',
      timestamp: '2025-04-12 10:23 AM',
      agent: 'Sarah J.'
    }
  ]);
  
  const [newNote, setNewNote] = useState('');
  
  const addNote = () => {
    if (newNote.trim() === '') return;
    
    const currentDate = new Date();
    const timestamp = currentDate.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const note = {
      id: notes.length + 1,
      text: newNote,
      timestamp,
      agent: 'Sarah J.'
    };
    
    setNotes([...notes, note]);
    setNewNote('');
  };
  
  return (
    <div className="notes-section">
      <div className="section-header">
        <h2>Customer Notes</h2>
      </div>
      <div className="notes-list">
        {notes.map(note => (
          <div key={note.id} className="note-item">
            <div className="note-content">{note.text}</div>
            <div className="note-meta">
              <span>{note.timestamp}</span>
              <span className="note-agent">{note.agent}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="add-note">
        <textarea
          placeholder="Add a note about this customer..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button className="btn-primary" onClick={addNote}>Save Note</button>
      </div>
    </div>
  );
}

export default NotesSection;
