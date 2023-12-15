import React from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkDown = ({ chatMsgContent }) => {
  return (
    <Markdown
      components={{
        code({ node, children, inline, className, ...props }) {
          const match = /language-(\w+)/.exec(className || '');

          return (
            <SyntaxHighlighter
              style={dracula}
              PreTag='div'
              language={'javascript'}
              children={String(children).replace(/\n$/, '')}
              {...props}
            />
          );
        },
      }}
    >
      {chatMsgContent}
    </Markdown>
  );
};

export default MarkDown;
