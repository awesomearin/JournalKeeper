import { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, Alert, ProgressBar } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const BackgroundAudio = ({ compact = false }) => {
  const [user, setUser] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [autoPlay, setAutoPlay] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadStoredAudio();
      } else {
        stopAudio();
        localStorage.removeItem('backgroundAudioPlaying');
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && audioFile && autoPlay && !isPlaying) {
      // Auto-play when user logs in and has audio and auto-play is enabled
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error('Auto-play failed:', err);
            // Auto-play might be blocked by browser, user needs to interact first
          }).then(() => {
            setIsPlaying(true);
            localStorage.setItem('backgroundAudioPlaying', 'true');
          });
        }
      }, 1000); // Small delay to ensure DOM is ready
    }
  }, [user, audioFile, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    // Restore audio state when component re-mounts or audioFile changes
    if (audioFile && audioRef.current) {
      audioRef.current.src = audioFile.data;
      audioRef.current.loop = true;
      audioRef.current.volume = volume;

      // If it was playing before, resume playing
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error resuming audio:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [audioFile, isPlaying]);

  useEffect(() => {
    // Update volume without restarting the audio
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const loadStoredAudio = () => {
    const storedAudio = localStorage.getItem('backgroundAudio');
    const storedAutoPlay = localStorage.getItem('backgroundAudioAutoPlay');
    const storedIsPlaying = localStorage.getItem('backgroundAudioPlaying');

    if (storedAudio) {
      const audioData = JSON.parse(storedAudio);
      setAudioFile(audioData);
      if (audioRef.current) {
        audioRef.current.src = audioData.data;
        audioRef.current.loop = true;
        audioRef.current.volume = volume;
      }
    }

    if (storedAutoPlay !== null) {
      setAutoPlay(JSON.parse(storedAutoPlay));
    }

    if (storedIsPlaying !== null) {
      setIsPlaying(JSON.parse(storedIsPlaying));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Audio file must be smaller than 10MB');
      return;
    }

    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const audioData = {
        name: file.name,
        data: e.target.result,
        type: file.type
      };

      localStorage.setItem('backgroundAudio', JSON.stringify(audioData));
      setAudioFile(audioData);

      if (audioRef.current) {
        audioRef.current.src = audioData.data;
        audioRef.current.loop = true;
        audioRef.current.volume = volume;
      }

      setSuccess('Audio uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    };

    reader.readAsDataURL(file);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioFile) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem('backgroundAudioPlaying', 'false');
      setError(''); // Clear any previous errors
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Failed to play audio');
        setIsPlaying(false);
        localStorage.setItem('backgroundAudioPlaying', 'false');
      });
      setIsPlaying(true);
      localStorage.setItem('backgroundAudioPlaying', 'true');
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    localStorage.setItem('backgroundAudioPlaying', 'false');
  };

  const removeAudio = () => {
    localStorage.removeItem('backgroundAudio');
    localStorage.removeItem('backgroundAudioPlaying');
    setAudioFile(null);
    stopAudio();
    setSuccess('Audio removed successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
  };

  if (!user) {
    return null; // Don't render if user is not logged in
  }

  if (compact) {
    // Only render if there's an audio file
    if (!audioFile) {
      return null;
    }

    // Minimal floating controls
    return (
      <div className="background-audio-compact" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: 'var(--shadow)',
        zIndex: 1000,
        color: 'var(--text)'
      }}>
        {error && (
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#dc3545' }}>
            {error}
          </div>
        )}
        <div className="d-flex align-items-center gap-2">
          <Button
            variant={isPlaying ? "warning" : "success"}
            size="sm"
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </Button>

          <Button variant="outline-secondary" size="sm" onClick={stopAudio} title="Stop">
            ⏹️
          </Button>

          <div className="d-flex align-items-center gap-1" style={{ minWidth: '80px' }}>
            <span style={{ fontSize: '12px' }}>🔊</span>
            <Form.Range
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              style={{ width: '50px' }}
            />
          </div>

          <small className="text-muted" style={{
            fontSize: '11px',
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--text)'
          }}>
            {audioFile.name}
          </small>
        </div>
        <audio ref={audioRef} loop />
      </div>
    );
  }

  // Full card version for settings page
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title>🎵 Background Audio</Card.Title>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Upload Background Audio</Form.Label>
          <Form.Control
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
          />
          <Form.Text className="text-muted">
            Supported formats: MP3, WAV, OGG, etc. Max size: 10MB
          </Form.Text>
        </Form.Group>

        {audioFile && (
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <small className="text-muted">Current: {audioFile.name}</small>
              <Button variant="outline-danger" size="sm" onClick={removeAudio}>
                Remove
              </Button>
            </div>

            <div className="d-flex align-items-center gap-2 mb-2">
              <Button
                variant={isPlaying ? "warning" : "success"}
                size="sm"
                onClick={togglePlayPause}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </Button>

              <Button variant="outline-secondary" size="sm" onClick={stopAudio}>
                ⏹️ Stop
              </Button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="small">🔊</span>
              <Form.Range
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-grow-1"
              />
              <span className="small">{Math.round(volume * 100)}%</span>
            </div>

            <Form.Check
              type="switch"
              id="autoPlayToggle"
              label="Auto-play on login"
              checked={autoPlay}
              onChange={(e) => {
                const newAutoPlay = e.target.checked;
                setAutoPlay(newAutoPlay);
                localStorage.setItem('backgroundAudioAutoPlay', JSON.stringify(newAutoPlay));
              }}
              className="mt-2"
            />
            <Form.Text className="text-muted">
              Note: Browsers may block auto-play. Click play manually if needed.
            </Form.Text>
          </div>
        )}

        <audio ref={audioRef} loop />
      </Card.Body>
    </Card>
  );
};

export default BackgroundAudio;