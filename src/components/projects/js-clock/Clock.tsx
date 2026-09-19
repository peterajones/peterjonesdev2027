import { useState, useEffect } from 'react';
import styles from './Clock.module.css';

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
      <span className={`${styles.clock} ${styles.fadeInText}`}>The time is: {time}</span>
    </h3>
  );
}
