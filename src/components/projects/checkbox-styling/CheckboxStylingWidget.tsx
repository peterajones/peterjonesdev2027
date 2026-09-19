import { useState } from 'react';
import Checkboxes from './Checkboxes';
import CodeBlocks from './CodeBlocks';
import styles from './CheckboxStyling.module.css';

export default function CheckboxStylingWidget() {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <div className={styles.root}>
      <p style={{ paddingBottom: '30px' }}>
        An example of how checkboxes can be styled with CSS.{' '}
        <span className="btn-widget-description">
          <button onClick={() => setDescriptionOpen((v) => !v)}>
            {descriptionOpen ? 'Hide description' : 'Read more...'}
          </button>
        </span>
      </p>
      <div className="stage checkboxes">
        <Checkboxes />
      </div>
      <div className="code-content">
        <div className={descriptionOpen ? 'code-description-open' : 'code-description-closed'}>
          <br />
          <p>In React you have to set the state of each checkbox, false being unchecked.</p>
          <p>
            Each checkbox below has a state of either true or false and that state is
            changed when the checkbox is checked or unchecked.
          </p>
          <p>CSS rules are applied depending on the state of each individual checkbox.</p>
          <p>
            Its more work this way, but you can do much more with state than applying a
            style.
          </p>
          <a
            href="https://github.com/peterajones/styling-checkboxes"
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
