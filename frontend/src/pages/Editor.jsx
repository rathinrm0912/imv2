import React from 'react';
import { useParams } from 'react-router-dom';

const Editor = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4">Document Editor</h1>
        <p className="text-muted-foreground">Document ID: {id}</p>
        <p className="text-sm text-muted-foreground mt-4">
          Full editor with real-time collaboration, comments, and all 22 IM sections coming next...
        </p>
      </div>
    </div>
  );
};

export default Editor;
