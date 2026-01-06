import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMockAuth } from '../contexts/MockAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Save, Download, MessageSquare, Moon, Sun, Users, Bell } from 'lucide-react';
import SectionNavigation from '../components/editor/SectionNavigation';
import SectionEditor from '../components/editor/SectionEditor';
import CommentPanel from '../components/editor/CommentPanel';
import NotificationCenter from '../components/editor/NotificationCenter';
import ExportDialog from '../components/editor/ExportDialog';

const USE_MOCK_AUTH = process.env.REACT_APP_USE_MOCK_AUTH === 'true';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authHook = USE_MOCK_AUTH ? useMockAuth : useAuth;
  const { user } = authHook();
  const { theme, toggleTheme } = useTheme();
  const [document, setDocument] = useState(null);
  const [activeSection, setActiveSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchDocument();
    setupRealtimeSync();
  }, [id]);

  // Auto-save on changes
  useEffect(() => {
    if (unsavedChanges && document) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [unsavedChanges, document]);

  const fetchDocument = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/documents/${id}`);
      setDocument(response.data);
      if (response.data.sections.length > 0) {
        setActiveSection(response.data.sections[0].section_id);
      }
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSync = () => {
    const docRef = doc(db, 'documents', id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDocument(prev => ({
          ...prev,
          ...data,
          sections: data.sections || prev?.sections || []
        }));
      }
    }, (error) => {
      console.error('Realtime sync error:', error);
    });

    return unsubscribe;
  };

  const handleSectionUpdate = (updatedSection) => {
    setDocument(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.section_id === updatedSection.section_id ? updatedSection : s
      )
    }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!document) return;
    
    setSaving(true);
    try {
      await axios.patch(`${API_URL}/api/documents/${id}`, {
        sections: document.sections,
        title: document.title
      });
      
      // Update Firestore for real-time sync
      const docRef = doc(db, 'documents', id);
      await docRef.set({
        sections: document.sections,
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      setUnsavedChanges(false);
      toast.success('Document saved');
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentSection = () => {
    return document?.sections.find(s => s.section_id === activeSection);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-20">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-sm"
              data-testid="back-button"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{document?.title}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{unsavedChanges ? 'Unsaved changes' : 'Saved'}</span>
                <span>•</span>
                <span>{document?.status.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="rounded-sm"
              data-testid="notifications-btn"
            >
              <Bell size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="rounded-sm"
              data-testid="comments-btn"
            >
              <MessageSquare size={16} className="mr-2" />
              Comments
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExport(true)}
              className="rounded-sm"
              data-testid="export-btn"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={saving || !unsavedChanges}
              className="rounded-sm"
              data-testid="save-btn"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-sm"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Navigation */}
        {document && (
          <SectionNavigation
            sections={document.sections}
            activeSection={activeSection}
            onSectionClick={setActiveSection}
          />
        )}

        {/* Center - Section Editor */}
        <div className="flex-1 overflow-y-auto">
          {document && getCurrentSection() && (
            <SectionEditor
              section={getCurrentSection()}
              onUpdate={handleSectionUpdate}
            />
          )}
        </div>

        {/* Right Sidebar - Comments */}
        {showComments && (
          <CommentPanel
            documentId={id}
            sectionId={activeSection}
            isOpen={showComments}
            onClose={() => setShowComments(false)}
          />
        )}
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationCenter
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Export Dialog */}
      {showExport && (
        <ExportDialog
          documentId={id}
          isOpen={showExport}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};

export default Editor;