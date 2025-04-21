import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedDb, setSelectedDb] = useState('sql');
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (query.trim()) {
      console.log("Submitting query:", query, "to", selectedDb.toUpperCase());
  
      const endpoint =
        selectedDb === 'sql'
          ? 'http://localhost:3001/api/generate-sql'
          : 'http://localhost:3001/api/generate-mongo';
  
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userQuery: query })
        });
  
        const result = await response.json();
        console.log("Generated Query:", result.sql || result.mongo);
        console.log("Query Result:", result.data);
  
        navigate('/results', {
          state: {
            query,
            db: selectedDb,
            generatedSql: result.sql || result.mongo,  // support both SQL and Mongo output
            results: result.data
          }
        });
      } catch (err) {
        console.error("Search failed:", err);
      }
    } else {
      console.warn("Query input is empty!");
    }
  };
  



  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
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
            'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://wallpapers.com/images/featured/baseball-field-background-5rtbkwderzw4et04.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
          color: 'white',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: '4rem',
            marginBottom: '0.5rem',
            color: '#e53935',
          }}
        >
          Stat Chat
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: '#eeeeee',
            marginBottom: '2rem',
          }}
        >
          Ask anything about Major League Baseball stats.
        </p>

        {/* FORM CARD */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            width: '90%',
            maxWidth: '600px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          {/* Database Toggle */}
<div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  fontFamily: "'IBM Plex Sans', sans-serif",
}}>
  <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem' }}>
    Choose a Database
  </label>

  <div style={{
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '9999px',
    padding: '0.25rem',
    backdropFilter: 'blur(6px)',
    width: '100%',
    maxWidth: '300px',
  }}>
    <button
      onClick={() => setSelectedDb('sql')}
      style={{
        flex: 1,
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        border: 'none',
        backgroundColor: selectedDb === 'sql' ? '#e53935' : 'transparent',
        color: selectedDb === 'sql' ? 'white' : 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background 0.3s',
      }}
    >
      SQL
    </button>
    <button
      onClick={() => setSelectedDb('mongodb')}
      style={{
        flex: 1,
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        border: 'none',
        backgroundColor: selectedDb === 'mongodb' ? '#e53935' : 'transparent',
        color: selectedDb === 'mongodb' ? 'white' : 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background 0.3s',
      }}
    >
      MongoDB
    </button>
  </div>
</div>

          {/* Query Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Who hit the most homeruns?"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              color: 'white',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            style={{
              backgroundColor: '#e53935',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              letterSpacing: '1px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}

