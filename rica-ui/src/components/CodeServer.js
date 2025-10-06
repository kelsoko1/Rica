import React from 'react';
import './CodeServer.css';

const CodeServer = () => {
  // Replace this URL with your actual code-server URL
  const codeServerUrl = 'http://72.60.133.11:2021';

  return (
    <div className="code-server-container">
      <iframe
        src={codeServerUrl}
        title="VS Code in Browser"
        className="code-server-frame"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default CodeServer;
