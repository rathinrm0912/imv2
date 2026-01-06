import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner';
import { Download, FileJson, FileText, File } from 'lucide-react';

const ExportDialog = ({ documentId, isOpen, onClose }) => {
  const [format, setFormat] = useState('json');
  const [exporting, setExporting] = useState(false);
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.post(`${API_URL}/api/export/${documentId}?format=${format}`, {}, {
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format === 'json') {
        // Download JSON
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${documentId}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('JSON exported successfully');
      } else if (format === 'compiled') {
        // Download both HTML and TXT files
        toast.success('Compiled files ready for download');
        window.open(`${API_URL}/api/download/${documentId}.html`, '_blank');
        window.open(`${API_URL}/api/download/${documentId}.txt`, '_blank');
      } else {
        toast.info(`${format.toUpperCase()} export coming soon`);
      }

      onClose();
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-sm" data-testid="export-dialog">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription>
            Choose the format for exporting your investment memorandum
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={format} onValueChange={setFormat}>
            <div className="flex items-center space-x-3 p-3 border border-border rounded-sm hover:bg-muted transition-colors">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileJson size={24} className="text-primary" />
                  <div>
                    <div className="font-medium">JSON</div>
                    <div className="text-xs text-muted-foreground">Import/export data format</div>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 border border-border rounded-sm hover:bg-muted transition-colors">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <File size={24} className="text-primary" />
                  <div>
                    <div className="font-medium">PDF</div>
                    <div className="text-xs text-muted-foreground">Formatted PDF document</div>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 border border-border rounded-sm hover:bg-muted transition-colors">
              <RadioGroupItem value="docx" id="docx" />
              <Label htmlFor="docx" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <File size={24} className="text-primary" />
                  <div>
                    <div className="font-medium">Word (DOCX)</div>
                    <div className="text-xs text-muted-foreground">Editable Word document</div>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 border border-border rounded-sm hover:bg-muted transition-colors">
              <RadioGroupItem value="compiled" id="compiled" />
              <Label htmlFor="compiled" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-primary" />
                  <div>
                    <div className="font-medium">Compiled (HTML + TXT)</div>
                    <div className="text-xs text-muted-foreground">Single-file archive</div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-sm">
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="rounded-sm"
            data-testid="export-confirm-btn"
          >
            <Download size={16} className="mr-2" />
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;