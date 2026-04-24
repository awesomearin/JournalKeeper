import { useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import BackgroundAudio from '../components/BackgroundAudio';
import '../styles/Settings.css';

const Settings = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    window.document.title = 'Settings | JournalKeeper';
  }, []);

  return (
    <Container className="settings-page mt-4 mb-5">
      <Row className="mb-4">
        <Col>
          <div className="settings-header">
            <div>
              <h1>Settings</h1>
              <p className="text-muted">Personalize JournalKeeper and adjust your reading experience.</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="settings-panel shadow-sm">
            <Card.Body>
              <h2>Appearance</h2>
              <Form>
                <Form.Group className="mb-4" controlId="themeSelection">
                  <Form.Label>Theme</Form.Label>
                  <div className="option-group">
                    {[
                      { value: 'system', label: 'System', description: 'Follow your device color scheme.' },
                      { value: 'light', label: 'Light', description: 'Always use a bright interface.' },
                      { value: 'dark', label: 'Dark', description: 'Use a dark interface for low-light reading.' },
                    ].map((option) => (
                      <Form.Check
                        key={option.value}
                        type="radio"
                        id={`theme-${option.value}`}
                        label={
                          <>
                            <strong>{option.label}</strong>
                            <div className="option-description">{option.description}</div>
                          </>
                        }
                        checked={settings.theme === option.value}
                        onChange={() => updateSetting('theme', option.value)}
                        className="settings-radio"
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4" controlId="accentSelection">
                  <Form.Label>Accent Color</Form.Label>
                  <div className="accent-grid">
                    {[
                      { value: 'purple', label: 'Purple' },
                      { value: 'teal', label: 'Teal' },
                      { value: 'orange', label: 'Orange' },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={settings.accent === option.value ? 'dark' : 'outline-secondary'}
                        className={`accent-chip ${settings.accent === option.value ? 'selected' : ''}`}
                        type="button"
                        onClick={() => updateSetting('accent', option.value)}
                      >
                        <span className={`accent-swatch accent-${option.value}`} />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4" controlId="fontSizeSelection">
                  <Form.Label>Text Size</Form.Label>
                  <div className="option-group">
                    {[
                      { value: 'small', label: 'Small' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'large', label: 'Large' },
                    ].map((option) => (
                      <Form.Check
                        key={option.value}
                        type="radio"
                        id={`font-${option.value}`}
                        label={option.label}
                        checked={settings.fontSize === option.value}
                        onChange={() => updateSetting('fontSize', option.value)}
                        className="settings-radio"
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4" controlId="layoutToggle">
                  <Form.Check
                    type="switch"
                    id="compactLayout"
                    label="Compact layout"
                    checked={settings.compactLayout}
                    onChange={(e) => updateSetting('compactLayout', e.target.checked)}
                  />
                  <div className="option-description">
                    Reduce spacing and tighten card layout for faster browsing.
                  </div>
                </Form.Group>

                <Form.Group className="mb-4" controlId="previewToggle">
                  <Form.Check
                    type="switch"
                    id="showPreviews"
                    label="Show entry previews"
                    checked={settings.showPreviews}
                    onChange={(e) => updateSetting('showPreviews', e.target.checked)}
                  />
                  <div className="option-description">
                    Show content previews under entry titles where available.
                  </div>
                </Form.Group>

                <div className="settings-actions">
                  <Button variant="primary" onClick={resetSettings} className="me-2">
                    Reset to Defaults
                  </Button>
                  <Badge bg="secondary" pill>
                    Settings saved automatically
                  </Badge>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="preview-panel shadow-sm">
            <Card.Body>
              <h2>Preview</h2>
              <p className="text-muted">Your selected theme, accent, and typography will apply across the app.</p>
              <div className="preview-card">
                <div className="preview-header">
                  <span>JournalKeeper</span>
                  <Badge bg="info">Live</Badge>
                </div>
                <div className="preview-body">
                  <p>Theme: {settings.theme}</p>
                  <p>Accent: {settings.accent}</p>
                  <p>Text size: {settings.fontSize}</p>
                  <p>Compact layout: {settings.compactLayout ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <BackgroundAudio />
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
