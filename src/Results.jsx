import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const query = location.state?.query || 'No query provided';
  const db = location.state?.db || 'sql';
  const generatedSql = location.state?.generatedSql || '';
  const results = location.state?.results || [];
  const error = results.length === 0 ? 'No data found.' : '';

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
        }}
      >
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

        <p
          style={{
            fontSize: '1.2rem',
            marginBottom: '2rem',
            letterSpacing: '1px',
          }}
        >
          Fetching stats from the dugout<span className="dots">...</span>
        </p>

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
        minHeight: '100vh',
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://static.vecteezy.com/system/resources/thumbnails/035/334/843/small_2x/ai-generated-sport-stadium-with-baseball-ball-at-night-backdrop-for-background-advertisement-photo.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        color: 'white',
        fontFamily: "'IBM Plex Sans', sans-serif",
        padding: '2rem',
      }}
    >
      <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: '3rem', color: '#e53935' }}>Search Results</h1>
      <p>Your query: <strong>{query}</strong></p>
      {db === 'mongodb' ? (
  <>
    <p>Generated MongoDB Query:</p>
    <pre>
      {typeof generatedSql === 'object'
        ? JSON.stringify(generatedSql, null, 2)
        : 'No MongoDB query was generated.'}
    </pre>
    </>
  ) : (
    <p>
      Generated SQL: <code>{generatedSql || 'No SQL query was generated.'}</code>
    </p>
  )}





      {error ? (
      <p style={{ color: '#ff8a80' }}>{error}</p>
    ) : Array.isArray(results) && results.length > 0 &&
    !(results[0].hasOwnProperty("insertedId") ||
      results[0].hasOwnProperty("modifiedCount") ||
      results[0].hasOwnProperty("deletedCount")) ? (
      <div
        style={{
          marginTop: '1rem',
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '1rem',
          borderRadius: '12px',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
          <thead>
            <tr>
              {Object.keys(results[0]).map((col, i) => (
                <th key={i} style={{ borderBottom: '1px solid white', padding: '0.5rem' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                <td key={j} style={{ padding: '0.5rem' }}>
                  {typeof val === 'object' && val !== null
                    ? JSON.stringify(val)
                    : val}
                </td>
              ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p style={{ color: '#a5d6a7', marginTop: '1rem' }}>
        Query executed successfully. No data to display.
      </p>
    )}


      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '2rem',
          backgroundColor: '#757575',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 2rem',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 'bold',
          letterSpacing: '1px',
          cursor: 'pointer',
        }}
      >
        ← BACK TO SEARCH
      </button>
    </div>
  );
}
