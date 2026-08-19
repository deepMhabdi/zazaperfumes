import Router from './router';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#e0e0e0',
            border: '1px solid rgba(192,192,192,0.15)',
            borderRadius: '2px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
        }}
      />
      <Router />
    </>
  );
}
