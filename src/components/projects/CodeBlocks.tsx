import { Fragment } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// The "Show me the code" panel every project widget shares: the original
// HTML/CSS/JS iteration of the demo, one highlighted block per file. Each
// project passes its own files (from its codeFiles.ts) in display order.
export interface CodeFile {
  name: string;
  language: 'html' | 'css' | 'javascript';
  code: string;
}

interface Props {
  files: CodeFile[];
  open: boolean;
  onToggle: () => void;
}

export default function CodeBlocks({ files, open, onToggle }: Props) {
  return (
    <section className={open ? 'code is-open' : 'code is-closed'}>
      <p>
        The code displayed below is from my original iteration in HTML, CSS and JS.
      </p>
      {files.map((file) => (
        <Fragment key={file.name}>
          <div className="code-header">{file.name}</div>
          <SyntaxHighlighter language={file.language} style={atomDark}>
            {file.code}
          </SyntaxHighlighter>
        </Fragment>
      ))}
      <br />
      <span className="btn-widget-code">
        <button className="btn-toggle-code-bottom" onClick={onToggle}>
          {open ? 'Hide the code' : 'Show me the code'}
        </button>
      </span>
      <br />
      <a href="/projects" className="backBtn btnLink">
        Back to Projects
      </a>
      <section style={{ height: '60px' }} />
    </section>
  );
}
