import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { addJournalEntry } from '../services/journalService';
import { getUserTags } from '../services/tagService';
import '../styles/AddEntryModal.css';

const AddEntryModal = ({ show, onHide, onEntryAdded, navigate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!show) return;

    const loadTags = async () => {
      try {
        const tags = await getUserTags();
        setAvailableTags(tags.map((tag) => tag.name));
      } catch (err) {
        console.error('Error loading tags for entry creation:', err);
      }
    };

    loadTags();
  }, [show]);

  const handleTagsChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    setSelectedTags(selected);
  };

  const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'angry', emoji: '😠', label: 'Angry' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate input
    if (!title.trim()) {
      setError('Please enter a title for your entry');
      return;
    }

    if (!content.trim()) {
      setError('Please write something in your entry');
      return;
    }

    setLoading(true);

    try {
      const entryId = await addJournalEntry(title, content, mood, selectedTags);
      setSuccess('Entry added successfully!');

      // Reset form
      setTitle('');
      setContent('');
      setMood('neutral');
      setSelectedTags([]);

      // Call callback to refresh entries list
      if (onEntryAdded) {
        onEntryAdded(entryId);
      }

      // Close modal and navigate to entries page
      setTimeout(() => {
        onHide();
        if (navigate) {
          navigate('/entries');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to add entry. Please try again.');
      console.error('Error adding entry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setMood('neutral');
    setSelectedTags([]);
    setError('');
    setSuccess('');
    onHide();
  };

  const currentMood = moods.find((m) => m.value === mood) || moods[3];

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>✍️ Create New Entry</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter entry title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              placeholder="Write your thoughts, feelings, and memories here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              className="entry-textarea"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assign Tags</Form.Label>
            {availableTags.length > 0 ? (
              <Form.Select
                multiple
                value={selectedTags}
                onChange={handleTagsChange}
                disabled={loading}
                size={Math.min(6, availableTags.length)}
              >
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Text className="text-muted">
                Create tags on the dashboard under Manage Tags, then assign them here.
              </Form.Text>
            )}
            <Form.Text className="text-muted d-block mt-2">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple tags.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>How are you feeling?</Form.Label>
            <div className="mood-selector">
              {moods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`mood-option ${mood === m.value ? 'active' : ''}`}
                  onClick={() => setMood(m.value)}
                  disabled={loading}
                  title={m.label}
                >
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </button>
              ))}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save Entry'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddEntryModal;
