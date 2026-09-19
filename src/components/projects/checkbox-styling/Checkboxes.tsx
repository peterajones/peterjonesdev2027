import { useState } from 'react';
import styles from './CheckboxStyling.module.css';

export default function Checkboxes() {
  const [newsletter1, setNewsletter1] = useState(false);
  const [notifications1, setNotifications1] = useState(true);
  const [alerts1, setAlerts1] = useState(false);
  const [newsletter2, setNewsletter2] = useState(true);
  const [notifications2, setNotifications2] = useState(false);
  const [alerts2, setAlerts2] = useState(true);

  return (
    <>
      <h2>Converting checkboxes to switches</h2>
      <div id="forms-wrapper" className={styles.formsWrapper}>
        <form action="GET" id="form1" className={styles.form1}>
          <h4 className={styles.checkboxGroup}>Conventional checkboxes</h4>
          <div id="checkboxes" className={styles.checkboxes}>
            <label className={styles.checkboxLabel}>
              <input
                className={styles.checkboxInput}
                id="newsletter-1"
                name="newsletter-1"
                type="checkbox"
                onChange={() => setNewsletter1((v) => !v)}
                checked={newsletter1}
              />
              Newsletter
            </label>
            <label className={styles.checkboxLabel}>
              <input
                className={styles.checkboxInput}
                name="notifications-1"
                type="checkbox"
                onChange={() => setNotifications1((v) => !v)}
                checked={notifications1}
              />
              Notifications
            </label>
            <label className={styles.checkboxLabel}>
              <input
                className={styles.checkboxInput}
                name="alerts-1"
                type="checkbox"
                onChange={() => setAlerts1((v) => !v)}
                checked={alerts1}
              />
              Email Alerts
            </label>
          </div>
        </form>
        <form action="GET" id="form2" className={styles.form2}>
          <h4 className={styles.checkboxGroup}>Styled checkboxes</h4>
          <div id="switches" className={styles.switches}>
            <label htmlFor="newsletter-2">
              <input
                className={styles.checkboxInput}
                type="checkbox"
                name="newsletter-2"
                id="newsletter-2"
                onChange={() => setNewsletter2((v) => !v)}
                checked={newsletter2}
              />
              <span />
              Newsletter
            </label>
            <label htmlFor="notifications-2">
              <input
                className={styles.checkboxInput}
                type="checkbox"
                name="notifications-2"
                id="notifications-2"
                onChange={() => setNotifications2((v) => !v)}
                checked={notifications2}
              />
              <span />
              Notifications
            </label>
            <label htmlFor="alerts-2">
              <input
                className={styles.checkboxInput}
                type="checkbox"
                name="alerts-2"
                id="alerts-2"
                onChange={() => setAlerts2((v) => !v)}
                checked={alerts2}
              />
              <span />
              Email Alerts
            </label>
          </div>
        </form>
      </div>
      <br />
    </>
  );
}
