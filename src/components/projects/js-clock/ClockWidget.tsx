import { useState } from 'react';
import Clock from './Clock';
import CodeBlocks from './CodeBlocks';
import styles from './Clock.module.css';

export default function ClockWidget() {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <div className={styles.root}>
      <p style={{ paddingBottom: '30px' }}>
        Here is a simple clock that generates the current time using the
        JavaScript <code className="inline">Date</code> object.{' '}
        <span className="btn-widget-description">
          <button onClick={() => setDescriptionOpen((v) => !v)}>
            {descriptionOpen ? 'Hide description' : 'Read more...'}
          </button>
        </span>
      </p>
      <div className={`stage ${styles.clock}`}>
        <Clock />
      </div>
      <div className="code-content">
        <div className={descriptionOpen ? 'code-description-open' : 'code-description-closed'}>
          <br />
          <p>
            In React I have set the initial state of the component to{' '}
            <code className="inline">date: new Date()</code> and when the
            component mounts I start the clock ticking with{' '}
            <code className="inline">
              this.clock = setInterval(() =&gt; this.count(), 1000);
            </code>
            .
          </p>
          <p>
            When the page changes I set{' '}
            <code className="inline">clearInterval(this.clock);</code> in the{' '}
            <code className="inline">componentWillUnmount</code> lifecycle
            component.
          </p>
          <a
            href="https://github.com/peterajones/Twelve-Hour-Digital-Clock"
            target="_new"
            className="github-link"
          >
            <span>Get it on GitHub</span>
            <span className="github-getit">
              <div className="github-logo" />
            </span>
          </a>
          <span className="btn-widget-code">
            <button onClick={() => setCodeOpen((v) => !v)}>
              {codeOpen ? 'Hide the code' : 'Show me the code'}
            </button>
          </span>
        </div>
        <CodeBlocks open={codeOpen} onToggle={() => setCodeOpen((v) => !v)} />
      </div>
    </div>
  );
}
