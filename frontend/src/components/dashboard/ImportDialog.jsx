import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { Upload, FileJson } from 'lucide-react';

const ImportDialog = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid JSON file');
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const response = await axios.post(`${API_URL}/api/import/${user.uid}`, jsonData);
      
      toast.success('Document imported successfully');
      onClose();
      onSuccess && onSuccess();
      navigate(`/editor/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to import document. Please check the file format.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-sm" data-testid="import-dialog">
        <DialogHeader>
          <DialogTitle>Import Document</DialogTitle>
          <DialogDescription>
            Import a previously exported JSON document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="file-upload">Select JSON File</Label>
            <div className="mt-2">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-sm cursor-pointer hover:bg-muted transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <FileJson size={32} className="mb-2 text-primary" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">JSON files only</p>
                    </>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-sm">
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="rounded-sm"
            data-testid="import-confirm-btn"
          >
            <Upload size={16} className="mr-2" />
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
