import { useState } from 'react';
import Counter from './Counter';
import CodeBlocks from './CodeBlocks';

export default function RollupCounterWidget() {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <>
      <p style={{ paddingBottom: '30px' }}>
        This is a React version of a rolling digit counter, along with the
        original vanilla JavaScript it's based on.
        <span className="btn-widget-description">
          <button onClick={() => setDescriptionOpen((v) => !v)}>
            {descriptionOpen ? 'Hide description' : 'Read more...'}
          </button>
        </span>
      </p>
      <div className="stage">
        <Counter />
      </div>
      <div className="code-content">
        <div className={descriptionOpen ? 'code-description-open' : 'code-description-closed'}>
          <br />
          <p>
            In React each change to the count adds a new digit span in an{' '}
            <code className="inline">enter</code> state and flags the old one
            as <code className="inline">exit</code>. A frame later both flip
            to their <code className="inline">-active</code> class, which is
            what actually triggers the CSS slide; once the transition
            finishes, the exiting digit is removed from state.
          </p>
          <p>
            The vanilla JS version below achieves the same effect by hand:
            each click creates new <code className="inline">enter</code> and{' '}
            <code className="inline">exit</code> spans, toggles their classes
            on a delay, and removes the old one once the transition finishes.
          </p>
          <a
            href="https://github.com/peterajones/rolloup-counter"
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
    </>
  );
}
