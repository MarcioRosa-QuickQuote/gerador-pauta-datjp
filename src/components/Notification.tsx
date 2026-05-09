'use client';

import { useEffect, useState } from 'react';

let globalSetNotification: ((msg: string, timeout?: number) => void) | null = null;

export function showNotification(msg: string, timeout?: number) {
  globalSetNotification?.(msg, timeout);
}

export default function Notification() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    globalSetNotification = (msg: string, timeout = 3000) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => setVisible(false), timeout);
    };
    return () => { globalSetNotification = null; };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="relative z-[9999] mt-2 mx-auto px-4 py-4 rounded text-[clamp(0.875rem,2.5vw,1.125rem)]"
      style={{ color: '#333' }}
    >
      {message}
    </div>
  );
}
