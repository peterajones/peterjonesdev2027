import { useState } from 'react';
import PizzaSlices from './PizzaSlices';
import CodeBlocks from './CodeBlocks';

export default function PizzaPieWidget() {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <>
      <p>
        This was a prototype of an idea for a client.{' '}
        <span className="btn-widget-description">
          <br />
          <button onClick={() => setDescriptionOpen((v) => !v)}>
            {descriptionOpen ? 'Hide description' : 'Read more...'}
          </button>
        </span>
      </p>
      <br />
      <div className="stage pizza-pie">
        <PizzaSlices />
      </div>
      <div className="code-content">
        <div className={descriptionOpen ? 'code-description-open' : 'code-description-closed'}>
          <p>
            The client wanted to graphically show how many orders / visits were left until
            a free pizza was available.
          </p>
          <p>
            Converting this for React was just a matter of setting the initial state to{' '}
            <code className="inline">slices: 0</code>.
          </p>
          <p>
            Changing the number of slices fires an <code className="inline">onChange</code>{' '}
            event which changes the number of slices set in state
          </p>
          <p>
            Knowing the number of slices means that I know which slice(s) I need to target
            with the CSS and provide an animation.
          </p>
          <p>Try it out!</p>
          <a
            href="https://github.com/peterajones/pizza-pie-revealed"
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
