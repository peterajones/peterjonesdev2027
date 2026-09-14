import { useState } from 'react';

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
      <div id="forms-wrapper">
        <form action="GET" id="form1">
          <h4 className="checkbox-group">Conventional checkboxes</h4>
          <div id="checkboxes">
            <label className="checkbox-label">
              <input
                className="checkbox-input"
                id="newsletter-1"
                name="newsletter-1"
                type="checkbox"
                onChange={() => setNewsletter1((v) => !v)}
                checked={newsletter1}
              />
              Newsletter
            </label>
            <label className="checkbox-label">
              <input
                className="checkbox-input"
                name="notifications-1"
                type="checkbox"
                onChange={() => setNotifications1((v) => !v)}
                checked={notifications1}
              />
              Notifications
            </label>
            <label className="checkbox-label">
              <input
                className="checkbox-input"
                name="alerts-1"
                type="checkbox"
                onChange={() => setAlerts1((v) => !v)}
                checked={alerts1}
              />
              Email Alerts
            </label>
          </div>
        </form>
        <form action="GET" id="form2">
          <h4 className="checkbox-group">Styled checkboxes</h4>
          <div id="switches">
            <label htmlFor="newsletter-2">
              <input
                className="checkbox-input"
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
                className="checkbox-input"
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
                className="checkbox-input"
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
