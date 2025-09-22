import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#ef4444' }}>{String(error?.message || error)}</p>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {error?.stack || ''}
          </pre>
          <button onClick={() => { this.setState({ error: null }); location.reload(); }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


