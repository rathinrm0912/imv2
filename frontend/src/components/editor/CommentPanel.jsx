import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { MessageSquare, Send, X, Reply } from 'lucide-react';
import { toast } from 'sonner';

const CommentPanel = ({ documentId, sectionId, isOpen, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, userProfile } = useAuth();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, documentId, sectionId]);

  const fetchComments = async () => {
    try {
      const params = { document_id: documentId };
      if (sectionId) params.section_id = sectionId;
      
      const response = await axios.get(`${API_URL}/api/comments`, { params });
      setComments(response.data);
    } catch (error) {
      toast.error('Failed to load comments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      // Extract mentions from comment (simple @email detection)
      const mentions = newComment.match(/@([\w.-]+@[\w.-]+\.\w+)/g)?.map(m => m.substring(1)) || [];

      await axios.post(`${API_URL}/api/comments`, {
        document_id: documentId,
        section_id: sectionId,
        user_id: user.uid,
        user_name: userProfile?.display_name || user.displayName,
        text: newComment,
        mentions,
        parent_id: replyTo
      });

      setNewComment('');
      setReplyTo(null);
      fetchComments();
      toast.success('Comment posted');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const organizeComments = () => {
    const topLevel = comments.filter(c => !c.parent_id);
    return topLevel.map(parent => ({
      ...parent,
      replies: comments.filter(c => c.parent_id === parent.id)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="w-96 border-l border-border bg-card h-full flex flex-col" data-testid="comment-panel">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} />
          <h3 className="font-semibold">Comments</h3>
          <span className="text-xs text-muted-foreground">({comments.length})</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-sm">
          <X size={18} />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {organizeComments().map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {comment.user_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.user_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{comment.text}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(comment.id)}
                    className="h-7 text-xs rounded-sm"
                  >
                    <Reply size={12} className="mr-1" />
                    Reply
                  </Button>
                </div>
              </div>

              {/* Replies */}
              {comment.replies?.length > 0 && (
                <div className="ml-11 space-y-2 border-l-2 border-border pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {reply.user_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{reply.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reply.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        {replyTo && (
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Replying to comment</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
              className="h-5 px-2 rounded-sm"
            >
              Cancel
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment... (use @email to mention)"
            rows={2}
            className="rounded-sm text-sm"
            data-testid="comment-input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !newComment.trim()}
            className="rounded-sm"
            data-testid="comment-submit"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CommentPanel;