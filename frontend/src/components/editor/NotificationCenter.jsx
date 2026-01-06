import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { X, Bell, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/${user.uid}`);
      setNotifications(response.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => 
        n.id === notifId ? { ...n, read: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    navigate(`/editor/${notif.document_id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-6 w-96 bg-card border border-border rounded-sm shadow-2xl z-30" data-testid="notification-center">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-sm">
          <X size={18} />
        </Button>
      </div>

      <ScrollArea className="h-96">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
                  !notif.read ? 'bg-primary/5' : ''
                }`}
                data-testid={`notification-${notif.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">{notif.title}</h4>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{notif.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                  {!notif.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                      className="rounded-sm h-8 w-8"
                    >
                      <Check size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationCenter;