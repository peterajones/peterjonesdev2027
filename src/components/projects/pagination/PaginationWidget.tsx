import { useState } from 'react';
import Data from './Data';
import CodeBlocks from './CodeBlocks';

export default function PaginationWidget() {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <>
      <p style={{ paddingBottom: '30px' }}>
        Using a REST API and Google Maps in React.{' '}
        <span className="btn-widget-description">
          <button onClick={() => setDescriptionOpen((v) => !v)}>
            {descriptionOpen ? 'Hide description' : 'Read more...'}
          </button>
        </span>
      </p>
      <div className="stage">
        <Data />
      </div>
      <div className="code-content">
        <div className={descriptionOpen ? 'code-description-open' : 'code-description-closed'}>
          <br />
          <p>
            I wanted to re-visit pagination so I took a vanilla JS project and converted it
            for ReactJS. The demo below is my ReactJS version.
          </p>
          <p>
            After fetching the data, I styled a &apos;card&apos; to display the fetched data.
            While doing this I noticed that the user&apos;s data included geographical
            coordinates, so why not add Google maps to the cards!
          </p>
          <p>
            The coordinates are of course bogus, but they are distinct. Most of them are in
            the middle of some ocean or Antarctica, but if you look closely you will see that
            each map is distinct.
          </p>
          <p>The challenge with the maps was to be able to display more than one map per page.</p>
          <p>
            In the React demo below, I&apos;m fetching the data from{' '}
            <a href="https://jsonplaceholder.typicode.com/users" target="_new">
              https://jsonplaceholder.typicode.com/users
            </a>{' '}
            and React Hooks to display the data. The pagination is different from the
            original in that it is rendered programmatically.
          </p>
          <a href="https://github.com/peterajones/pagination" target="_new" className="github-link">
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
      </div>
      <CodeBlocks open={codeOpen} onToggle={() => setCodeOpen((v) => !v)} />
    </>
  );
}
