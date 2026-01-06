import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Plus, FileText, Moon, Sun, LogOut, Search, Filter, Upload } from 'lucide-react';
import ImportDialog from '../components/dashboard/ImportDialog';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showImport, setShowImport] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/documents?user_id=${user?.uid}`);
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const createNewDocument = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/documents`, {
        title: `Investment Memorandum - ${new Date().toLocaleDateString()}`,
        created_by: user.uid
      });
      toast.success('Document created');
      navigate(`/editor/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to create document');
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || doc.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Redwood IM Platform</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {userProfile?.display_name || user?.displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-sm"
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="rounded-sm"
              data-testid="logout-btn"
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-sm"
              data-testid="search-input"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="rounded-sm"
            >
              All
            </Button>
            <Button
              variant={filter === 'draft' ? 'default' : 'outline'}
              onClick={() => setFilter('draft')}
              className="rounded-sm"
            >
              Drafts
            </Button>
            <Button
              variant={filter === 'in_review' ? 'default' : 'outline'}
              onClick={() => setFilter('in_review')}
              className="rounded-sm"
            >
              In Review
            </Button>
          </div>
          <Button
            onClick={createNewDocument}
            className="rounded-sm"
            data-testid="create-doc-btn"
          >
            <Plus size={18} className="mr-2" />
            New Document
          </Button>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-sm">
            <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No documents found</p>
            <p className="text-muted-foreground mb-4">Create your first investment memorandum</p>
            <Button onClick={createNewDocument} className="rounded-sm">
              <Plus size={18} className="mr-2" />
              Create Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/editor/${doc.id}`)}
                className="border border-border rounded-sm p-6 hover:border-primary hover:shadow-md transition-all cursor-pointer bg-card"
                data-testid={`doc-card-${doc.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <FileText size={24} className="text-primary" />
                  <span className="text-xs px-2 py-1 rounded-sm bg-muted font-mono">
                    {doc.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Updated {new Date(doc.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
