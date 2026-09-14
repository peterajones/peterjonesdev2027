import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <h3>
      <span className="clock fade-in-text">The time is: {time}</span>
    </h3>
  );
}
