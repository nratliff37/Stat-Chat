import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = location.state?.query || 'No query provided';
  const db = location.state?.db || 'unknown';

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

if (loading) {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://static.vecteezy.com/system/resources/thumbnails/035/334/843/small_2x/ai-generated-sport-stadium-with-baseball-ball-at-night-backdrop-for-background-advertisement-photo.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: 'white',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: '3rem',
          color: '#e53935',
          marginBottom: '1rem',
        }}
      >
        Stat Chat
      </h1>

      {/* Animated Dots Loading Text */}
      <p
        style={{
          fontSize: '1.2rem',
          marginBottom: '2rem',
          letterSpacing: '1px',
        }}
      >
        Fetching stats from the dugout<span className="dots">...</span>
      </p>

      {/* Rotating Baseball Spinner */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundImage:
            'url("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Baseball_%28crop%29_transparent.png/1200px-Baseball_%28crop%29_transparent.png")',
          backgroundSize: 'cover',
          animation: 'spinBall 1s linear infinite',
          marginBottom: '2rem',
        }}
      />

      {/* Progress Bar */}
      <div
        style={{
          width: '60%',
          height: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginTop: '1rem',
        }}
      >
        <div
          className="progress-fill"
          style={{
            height: '100%',
            width: '0%',
            backgroundColor: '#e53935',
            animation: 'fillBar 1.5s forwards',
          }}
        ></div>
      </div>

      {/* Inline CSS Animations */}
      <style>{`
        @keyframes spinBall {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fillBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .dots::after {
          content: '.';
          animation: dotJump 1.5s infinite steps(3, end);
        }

        @keyframes dotJump {
          0% { content: '.'; }
          33% { content: '..'; }
          66% { content: '...'; }
          100% { content: ''; }
        }
      `}</style>
    </div>
  );
}


  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://static.vecteezy.com/system/resources/thumbnails/035/334/843/small_2x/ai-generated-sport-stadium-with-baseball-ball-at-night-backdrop-for-background-advertisement-photo.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
        }}
      />

      {/* Foreground */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: '3rem',
            color: '#e53935',
            marginBottom: '0.75rem',
          }}
        >
          Search Results
        </h1>

        <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
          Your query: <strong>{query}</strong>
        </p>

        <p style={{ marginBottom: '2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="material-icons">{db === "mongodb" ? "storage" : "dns"}</i>
          Connected to <strong>{db.toUpperCase()}</strong>
        </p>

        {/* Result Card */}
        <div
          className="card"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '2rem',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
            maxWidth: '600px',
            width: '90%',
            marginBottom: '2rem',
            animation: 'fadeInUp 0.7s ease-out',
          }}
        >
          <div className="card-content">
            <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              {db === 'mongodb' ? 'MongoDB Result' : 'SQL Result'}
            </span>
            <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
              This data was retrieved using <strong>{db.toUpperCase()}</strong>. <br />
              (You can plug in {db === 'mongodb' ? 'NoSQL-based' : 'SQL'} logic here.)
            </p>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#757575',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 2rem',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            cursor: 'pointer',
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          ← BACK TO SEARCH
        </button>
      </div>
    </div>
  );
}

