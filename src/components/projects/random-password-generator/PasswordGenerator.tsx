import { useEffect, useState } from 'react';
import styles from './PasswordGenerator.module.css';

const SYMBOLS = '!@#$%^&*+?=£()';

function getRandomUpper() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}
function getRandomLower() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}
function getRandomNumber() {
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}
function getRandomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function generatePassword(
  upper: boolean,
  lower: boolean,
  numbers: boolean,
  symbols: boolean,
  length: number
) {
  const generators: Array<() => string> = [];
  if (upper) generators.push(getRandomUpper);
  if (lower) generators.push(getRandomLower);
  if (numbers) generators.push(getRandomNumber);
  if (symbols) generators.push(getRandomSymbol);
  if (generators.length === 0) return '';

  let password = '';
  while (password.length < length) {
    for (const generate of generators) {
      password += generate();
    }
  }
  return password.slice(0, length);
}

function loadBoolSetting(key: string, fallback: boolean) {
  const stored = localStorage.getItem(key);
  if (stored === null) {
    localStorage.setItem(key, String(fallback));
    return fallback;
  }
  return stored === 'true';
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(12);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Settings persist across visits via localStorage; only readable client-side,
  // so this runs in an effect rather than a useState initializer.
  useEffect(() => {
    const storedLength = localStorage.getItem('length');
    if (storedLength === null) {
      localStorage.setItem('length', '12');
    } else {
      setLength(Number(storedLength));
    }
    setUpper(loadBoolSetting('upper', true));
    setLower(loadBoolSetting('lower', true));
    setNumbers(loadBoolSetting('numbers', true));
    setSymbols(loadBoolSetting('symbols', true));
  }, []);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  };

  const updateLength = (value: number) => {
    setLength(value);
    localStorage.setItem('length', String(value));
  };

  const toggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    localStorage.setItem(key, String(value));
  };

  const handleGenerate = (e: React.MouseEvent) => {
    e.preventDefault();
    setPassword(generatePassword(upper, lower, numbers, symbols, length));
  };

  const handleCopy = () => {
    if (!password) {
      showMessage('Generate a password first!');
      return;
    }
    // Fire-and-forget: don't let a slow or permission-gated clipboard call
    // hold up the "Copied!" feedback, which should feel instant either way.
    // navigator.clipboard.writeText can reject OR throw synchronously
    // (e.g. "Document is not focused"), so guard both.
    try {
      navigator.clipboard?.writeText(password)?.catch(() => {});
    } catch {
      // ignored — clipboard access just isn't available right now
    }
    showMessage('Copied!');
  };

  return (
    <div className="stage">
      <div className={styles.passwordGeneratorContainer}>
        <div className={styles.pwgContainer}>
          <h2 className={styles.pwg}>Password Generator</h2>
          <div className={styles.pwgResultContainer}>
            <span id="pwg-result" className={styles.pwg}>
              {password}
            </span>
            <button
              id="clipboard"
              className={styles.clipboard}
              onClick={handleCopy}
              title="Copy to clipboard..."
            >
              <svg
                className={styles.clipboardIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </button>
          </div>
          <div id="msg" className={message ? `${styles.msg} ${styles.fadeOut}` : styles.msg}>
            {message}
          </div>
          <div className={styles.pwgSettings}>
            <div className={styles.pwgSetting}>
              <label className={styles.pwg}>Password length</label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={length}
                id="length"
                className={styles.lengthSlider}
                aria-label="range slider"
                onChange={(e) => updateLength(Number(e.target.value))}
              />
              <span id="length_disp" className={`${styles.lengthDisp} ${styles.pwg}`}>
                {length}
              </span>
            </div>
            <div className={styles.pwgSetting}>
              <label className={styles.pwg}>
                <span
                  id="settings-upper"
                  className={upper ? '' : styles.lineThrough}
                >
                  Include uppercase letters
                </span>
                <input
                  type="checkbox"
                  id="upper"
                  className={styles.settingCheckbox}
                  checked={upper}
                  onChange={(e) => toggle('upper', e.target.checked, setUpper)}
                />
              </label>
            </div>
            <div className={styles.pwgSetting}>
              <label className={styles.pwg}>
                <span
                  id="settings-lower"
                  className={lower ? '' : styles.lineThrough}
                >
                  Include lowercase letters
                </span>
                <input
                  type="checkbox"
                  id="lower"
                  className={styles.settingCheckbox}
                  checked={lower}
                  onChange={(e) => toggle('lower', e.target.checked, setLower)}
                />
              </label>
            </div>
            <div className={styles.pwgSetting}>
              <label className={styles.pwg}>
                <span
                  id="settings-numbers"
                  className={numbers ? '' : styles.lineThrough}
                >
                  Include numbers
                </span>
                <input
                  type="checkbox"
                  id="numbers"
                  className={styles.settingCheckbox}
                  checked={numbers}
                  onChange={(e) => toggle('numbers', e.target.checked, setNumbers)}
                />
              </label>
            </div>
            <div className={styles.pwgSetting}>
              <label className={styles.pwg}>
                <span
                  id="settings-symbols"
                  className={symbols ? '' : styles.lineThrough}
                >
                  Include symbols
                </span>
                <input
                  type="checkbox"
                  id="symbols"
                  className={styles.settingCheckbox}
                  checked={symbols}
                  onChange={(e) => toggle('symbols', e.target.checked, setSymbols)}
                />
              </label>
            </div>
          </div>
          <button
            className={`${styles.pwgBtn} ${styles.pwgBtnLarge} ${styles.generate}`}
            id="generate"
            onClick={handleGenerate}
          >
            Generate password
          </button>
        </div>
      </div>
    </div>
  );
}
