import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// The service worker is for the installed production app only. In development
// its cached HTML can outlive Vite and leave an empty React root on localhost.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then(registrations =>
    Promise.all(registrations.map(registration => registration.unregister()))
  ).catch(error => console.warn('Could not clear the development service worker:', error));
  void caches.keys().then(keys =>
    Promise.all(keys.filter(key => key.startsWith('gurukul-')).map(key => caches.delete(key)))
  ).catch(error => console.warn('Could not clear the development app cache:', error));
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Gurukul AI could not render:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'radial-gradient(ellipse at 50% 0%, #263b45, #101d2a 52%, #07111f)', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ width: 'min(100%, 620px)', padding: 32, border: '1px solid #f8717140', borderRadius: 24, background: '#081321e8' }}>
            <p style={{ color: '#fca5a5', fontWeight: 700 }}>The learning page hit an error while starting.</p>
            <p style={{ color: '#cbd5e1' }}>Refresh the page. If it appears again, share this error:</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: '#fecaca' }}>{this.state.error.message}</pre>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('The page is missing its #root mount point.');
createRoot(rootElement).render(<AppErrorBoundary><App /></AppErrorBoundary>);
