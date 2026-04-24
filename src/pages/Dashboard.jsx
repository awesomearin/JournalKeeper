import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import AddEntryModal from '../components/AddEntryModal';
import { getUserJournalEntries } from '../services/journalService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryAdded, setEntryAdded] = useState(false);
  const [recentEntries, setRecentEntries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadRecentEntries();
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  const loadRecentEntries = async () => {
    try {
      const entries = await getUserJournalEntries();
      // Show only the 3 most recent entries
      setRecentEntries(entries.slice(0, 3));
    } catch (error) {
      console.error('Error loading recent entries:', error);
    }
  };

  useEffect(() => {
    if (entryAdded) {
      loadRecentEntries();
    }
  }, [entryAdded]);

  const formatDate = (date) => {
    if (!date) return '';
    const options = {
      month: 'short',
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

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center mb-4">Welcome to your Dashboard!</h1>
          <Alert variant="info" className="text-center">
            <strong>JournalKeeper</strong> - Your personal journaling companion
          </Alert>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>📝 New Entry</Card.Title>
              <Card.Text>
                Start writing your thoughts and memories. Create a new journal entry.
              </Card.Text>
              <Button 
                variant="primary" 
                className="w-100"
                onClick={() => setShowAddModal(true)}
              >
                Create Entry
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>📚 My Entries</Card.Title>
              <Card.Text>
                View and manage all your journal entries. Browse through your memories.
              </Card.Text>
              <Button 
                variant="secondary" 
                className="w-100"
                onClick={() => navigate('/entries')}
              >
                View Entries
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>📊 Statistics</Card.Title>
              <Card.Text>
                See insights about your journaling habits and writing patterns.
              </Card.Text>
              <Button variant="info" className="w-100" onClick={() => navigate('/stats')}>
                View Stats
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>🏷️ Categories</Card.Title>
              <Card.Text>
                Organize your entries with tags and categories for better organization.
              </Card.Text>
              <Button variant="success" className="w-100" onClick={() => navigate('/tags')}>
                Manage Tags
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>🔍 Search</Card.Title>
              <Card.Text>
                Find specific entries quickly with powerful search functionality.
              </Card.Text>
              <Button variant="warning" className="w-100" onClick={() => navigate('/entries')}>
                Search Entries
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>⚙️ Settings</Card.Title>
              <Card.Text>
                Customize your journaling experience and account preferences.
              </Card.Text>
              <Button variant="primary" className="w-100" onClick={() => navigate('/settings')}>
                Open Settings
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <Card className="theme-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Recent Activity</h5>
                <Button variant="link" size="sm" onClick={() => navigate('/entries')}>
                  View All →
                </Button>
              </div>

              {recentEntries.length === 0 ? (
                <div className="text-center">
                  <p className="text-muted mb-0">
                    No recent entries yet. Start your journaling journey by creating your first entry!
                  </p>
                </div>
              ) : (
                <div className="recent-entries">
                  {recentEntries.map((entry) => (
                    <div key={entry.id} className="recent-entry-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="entry-info">
                          <div className="entry-title">
                            {getMoodEmoji(entry.mood)} {entry.title}
                          </div>
                          <div className="entry-date text-muted">
                            {formatDate(entry.createdAt)}
                          </div>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate('/entries')}
                        >
                          View
                        </Button>
                      </div>
                      <div className="entry-preview text-muted">
                        {entry.content.length > 100
                          ? `${entry.content.substring(0, 100)}...`
                          : entry.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddEntryModal 
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onEntryAdded={() => {
          setEntryAdded(!entryAdded);
        }}
        navigate={navigate}
      />
    </Container>
  );
};

export default Dashboard;