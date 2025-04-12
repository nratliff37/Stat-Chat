import React from 'react';

export default function SearchBar({ query, setQuery, onSearch }) {
  return (
    <div className="row">
      <div className="input-field col s10">
<input
  type="text"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="e.g., Who hit the most homeruns?"
  style={{
    fontFamily: "'IBM Plex Sans', sans-serif",
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    width: '100%',
    maxWidth: '500px',
    marginBottom: '1rem',
  }}
/>
      </div>
<button
  className="btn red"
  onClick={onSearch}
  style={{
    width: '100%',
    padding: '0.75rem 2rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    fontFamily: "'IBM Plex Sans', sans-serif",
    letterSpacing: '1px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  }}
>
  SEARCH
</button>

    </div>
  );
}

