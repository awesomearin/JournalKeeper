import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserJournalEntries, deleteJournalEntry } from '../services/journalService';
import '../styles/Entries.css';

const Entries = () => {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadEntries();
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  const loadEntries = async () => {
    try {
      setError('');
      const userEntries = await getUserJournalEntries();
      console.log('Loaded entries:', userEntries);
      setEntries(userEntries);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load entries. Please try again.';
      setError(errorMessage);
      console.error('Error loading entries:', err);
    }
  };

  const handleDeleteEntry = async (entryId, entryTitle) => {
    if (window.confirm(`Are you sure you want to delete "${entryTitle}"? This action cannot be undone.`)) {
      setDeletingId(entryId);
      try {
        await deleteJournalEntry(entryId);
        setEntries(entries.filter((entry) => entry.id !== entryId));
        setError('');
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete entry. Please try again.';
        setError(errorMessage);
        console.error('Error deleting entry:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      neutral: '😐',
      anxious: '😰',
      grateful: '🙏',
      excited: '🤩',
      calm: '😌',
    };
    return moodEmojis[mood] || '📝';
  };

  const normalize = (text) => text?.toString().toLowerCase() || '';

  const filteredEntries = entries.filter((entry) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const dateText = formatDate(entry.createdAt);
    const tagsText = Array.isArray(entry.tags) ? entry.tags.join(' ') : '';
    return [entry.title, entry.content, dateText, tagsText]
      .map(normalize)
      .some((value) => value.includes(query));
  });

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Container className="mt-4 mb-5">
      <Row className="mb-4">
        <Col>
          <div className="entries-header">
            <h1>📚 My Journal Entries</h1>
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard')}
              className="mt-2"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {entries.length > 0 && (
        <Row className="mb-3">
          <Col>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Search by title, content, date, or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setSearchTerm('')}
                disabled={!searchTerm}
              >
                Clear
              </Button>
            </InputGroup>
          </Col>
        </Row>
      )}

      {entries.length === 0 ? (
        <Row>
          <Col>
            <Card className="text-center p-5">
              <Card.Body>
                <h5 className="mb-3">No entries yet</h5>
                <p className="text-muted mb-0">
                  Start your journaling journey by creating your first entry!
                </p>
                <Button
                  variant="primary"
                  className="mt-3"
                  onClick={() => navigate('/dashboard')}
                >
                  Create First Entry
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : filteredEntries.length === 0 ? (
        <Row>
          <Col>
            <Card className="text-center p-5">
              <Card.Body>
                <h5 className="mb-3">No entries match your search</h5>
                <p className="text-muted mb-0">
                  Try a different keyword, title, or date format to find your entry.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <div className="entries-list">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="entry-card mb-3 shadow-sm">
              <Card.Body>
                <div className="entry-header">
                  <div>
                    <Card.Title className="entry-title">
                      {getMoodEmoji(entry.mood)} {entry.title}
                    </Card.Title>
                    <div className="entry-meta-row">
                      <Card.Subtitle className="text-muted entry-date">
                        {formatDate(entry.createdAt)}
                      </Card.Subtitle>
                      {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                        <div className="entry-tags">
                          {entry.tags.map((tag) => (
                            <span key={tag} className="entry-tag">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="entry-mood">
                    <span className="mood-badge">{getMoodEmoji(entry.mood)}</span>
                  </div>
                </div>

                <Card.Text className="entry-content mt-3">
                  {entry.content}
                </Card.Text>

                {entry.updatedAt &&
                  new Date(entry.updatedAt).getTime() !==
                    new Date(entry.createdAt).getTime() && (
                    <small className="text-muted d-block mt-3">
                      Last edited: {formatDate(entry.updatedAt)}
                    </small>
                  )}

                <div className="entry-actions mt-4">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id, entry.title)}
                    disabled={deletingId === entry.id}
                  >
                    {deletingId === entry.id ? 'Deleting...' : '🗑️ Delete'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default Entries;
