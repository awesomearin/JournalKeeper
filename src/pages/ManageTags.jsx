import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserTags, addTag, updateTag, deleteTag } from '../services/tagService';
import '../styles/ManageTags.css';

const ManageTags = () => {
  const [user, setUser] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadTags();
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  const loadTags = async () => {
    try {
      setError('');
      const userTags = await getUserTags();
      setTags(userTags);
    } catch (err) {
      setError(err.message || 'Unable to load tags');
      console.error('Error loading tags:', err);
    }
  };

  const handleAddTag = async (event) => {
    event.preventDefault();
    const trimmedName = newTagName.trim();

    if (!trimmedName) {
      setError('Tag name cannot be empty');
      return;
    }

    if (tags.some((tag) => tag.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A tag with that name already exists');
      return;
    }

    try {
      setLoading(true);
      await addTag(trimmedName);
      setNewTagName('');
      await loadTags();
    } catch (err) {
      setError(err.message || 'Failed to add tag');
      console.error('Error adding tag:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditTag = (tag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
    setError('');
  };

  const cancelEditTag = () => {
    setEditingTagId(null);
    setEditingTagName('');
    setError('');
  };

  const handleSaveTag = async (tag) => {
    const trimmedName = editingTagName.trim();

    if (!trimmedName) {
      setError('Tag name cannot be empty');
      return;
    }

    if (
      tags.some(
        (existingTag) =>
          existingTag.id !== tag.id && existingTag.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setError('A tag with that name already exists');
      return;
    }

    try {
      setLoading(true);
      await updateTag(tag.id, tag.name, trimmedName);
      setEditingTagId(null);
      setEditingTagName('');
      await loadTags();
    } catch (err) {
      setError(err.message || 'Failed to update tag');
      console.error('Error updating tag:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tag) => {
    const confirmed = window.confirm(
      `Delete the tag "${tag.name}"? This will remove it from any tagged entries.`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteTag(tag.id, tag.name);
      await loadTags();
    } catch (err) {
      setError(err.message || 'Failed to delete tag');
      console.error('Error deleting tag:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container className="manage-tags-page mt-4 mb-5">
      <Row className="mb-4">
        <Col>
          <div className="manage-tags-header">
            <div>
              <h1>Manage Tags</h1>
              <p className="text-muted">
                Create, rename, and remove tags. Use them when creating entries to keep your journal organized.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        <Col lg={6}>
          <Card className="tag-card shadow-sm">
            <Card.Body>
              <h2>Add New Tag</h2>
              <Form onSubmit={handleAddTag}>
                <Form.Group className="mb-3" controlId="newTagName">
                  <Form.Label>Tag name</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="e.g. travel"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      disabled={loading}
                    />
                    <Button type="submit" variant="primary" disabled={loading || !newTagName.trim()}>
                      Add Tag
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="tag-card shadow-sm">
            <Card.Body>
              <h2>Existing Tags</h2>
              {tags.length === 0 ? (
                <p className="text-muted">You don't have any tags yet. Add one to get started.</p>
              ) : (
                <div className="tag-list-panel">
                  {tags.map((tag) => (
                    <div key={tag.id} className="tag-list-row">
                      {editingTagId === tag.id ? (
                        <>
                          <Form.Control
                            type="text"
                            value={editingTagName}
                            onChange={(e) => setEditingTagName(e.target.value)}
                            disabled={loading}
                          />
                          <div className="tag-actions">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleSaveTag(tag)}
                              disabled={loading}
                            >
                              Save
                            </Button>
                            <Button variant="outline-secondary" size="sm" onClick={cancelEditTag}>
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="tag-label">#{tag.name}</span>
                          <div className="tag-actions">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => startEditTag(tag)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteTag(tag)}
                            >
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ManageTags;
