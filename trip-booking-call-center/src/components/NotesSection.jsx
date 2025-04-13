import React, { useState, useEffect } from 'react';

function NotesSection({ customerId, agentId = null }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch notes when component mounts or customerId changes
  useEffect(() => {
    if (customerId) {
      fetchNotes();
    } else {
      setNotes([]);
      setLoading(false);
    }
  }, [customerId]);
  
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/notes/customer/${customerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer notes');
      }
      
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Could not load notes');
    } finally {
      setLoading(false);
    }
  };
  
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const addNote = async () => {
    if (newNote.trim() === '') return;
    
    try {
      setSubmitting(true);
      
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          agent_id: agentId,
          content: newNote
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save note');
      }
      
      const savedNote = await response.json();
      
      // Add the new note to our state
      setNotes(prevNotes => [...prevNotes, savedNote]);
      setNewNote('');
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleKeyDown = (e) => {
    // Submit note on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      addNote();
    }
  };
  
  if (loading && notes.length === 0) {
    return (
      <div className="notes-section">
        <div className="section-header">
          <h2>Customer Notes</h2>
        </div>
        <div className="loading">Loading notes...</div>
      </div>
    );
  }
  
  if (error && notes.length === 0) {
    return (
      <div className="notes-section">
        <div className="section-header">
          <h2>Customer Notes</h2>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="notes-section">
      <div className="section-header">
        <h2>Customer Notes</h2>
      </div>
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="no-notes">No notes for this customer yet</div>
        ) : (
          // Sort notes from newest to oldest
          [...notes]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map(note => (
              <div key={note.id} className="note-item">
                <div className="note-content">{note.content}</div>
                <div className="note-meta">
                  <span>{formatTimestamp(note.created_at)}</span>
                  <span className="note-agent">{note.agent_name}</span>
                </div>
              </div>
            ))
        )}
      </div>
      <div className="add-note">
        <textarea
          placeholder="Add a note about this customer..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={submitting}
        />
        <button 
          className="btn-primary" 
          onClick={addNote}
          disabled={submitting || newNote.trim() === ''}
        >
          {submitting ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}

export default NotesSection;