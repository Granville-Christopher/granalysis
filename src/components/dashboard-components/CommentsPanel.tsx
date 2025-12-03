import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X, Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';
import { toast } from '../../utils/toast';

interface Comment {
  id: number;
  content: string;
  section?: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

interface CommentsPanelProps {
  fileId: number;
  section?: string;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({ fileId, section }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (fileId) {
      fetchComments();
    }
  }, [fileId, section]);

  const fetchComments = async () => {
    try {
      console.log('[CommentsPanel] Fetching comments for fileId:', fileId, 'section:', section);
      const res = await api.get(`/comments/file/${fileId}`);
      console.log('[CommentsPanel] Comments response:', res.data);
      if (res.data?.status === 'success') {
        const allComments = res.data.data || [];
        console.log('[CommentsPanel] All comments:', allComments.length);
        const filtered = section
          ? allComments.filter((c: Comment) => c.section === section || !c.section)
          : allComments;
        console.log('[CommentsPanel] Filtered comments:', filtered.length);
        setComments(filtered);
      } else {
        console.warn('[CommentsPanel] Unexpected response format:', res.data);
        setComments([]);
      }
    } catch (error: any) {
      console.error('[CommentsPanel] Failed to fetch comments:', error);
      console.error('[CommentsPanel] Error response:', error.response?.data);
      setComments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      console.log('[CommentsPanel] Creating comment:', { fileId, content: newComment, section });
      const res = await api.post('/comments', {
        fileId,
        content: newComment,
        section: section || null,
      });
      console.log('[CommentsPanel] Create comment response:', res.data);
      if (res.data?.status === 'success') {
        setNewComment('');
        // Immediately add the new comment to the list optimistically
        if (res.data?.data) {
          const newCommentData: Comment = {
            id: res.data.data.id,
            content: res.data.data.content,
            section: res.data.data.section,
            createdAt: res.data.data.createdAt,
            user: res.data.data.user || { fullName: 'You', email: '' },
          };
          setComments(prev => [newCommentData, ...prev]);
        }
        // Also fetch to ensure we have the latest data
        setTimeout(() => {
          fetchComments();
        }, 500);
      } else {
        console.error('[CommentsPanel] Failed to create comment:', res.data?.message);
        toast.error(res.data?.message || 'Failed to create comment');
      }
    } catch (error: any) {
      console.error('[CommentsPanel] Failed to create comment:', error);
      console.error('[CommentsPanel] Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editText.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const res = await api.put(`/comments/${id}`, { content: editText });
      if (res.data?.status === 'success') {
        setEditingId(null);
        setEditText('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const res = await api.delete(`/comments/${id}`);
      if (res.data?.status === 'success') {
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className={`${glassmorphismClass} rounded-xl p-4`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" style={{ color: colors.accent }} />
        <h3 className={`text-lg font-semibold ${colors.text}`}>Comments</h3>
        <span className={`text-sm ${colors.textSecondary}`}>({comments.length})</span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {comments.length === 0 ? (
          <p className={`text-sm text-center py-4 ${colors.textSecondary}`}>No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}
            >
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={`w-full px-2 py-1 rounded border outline-none text-sm ${
                      colors.isDark
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      className="px-3 py-1 text-xs rounded bg-blue-500 text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="px-3 py-1 text-xs rounded bg-gray-500 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${colors.text}`}>{comment.user.fullName}</p>
                      <p className={`text-sm mt-1 ${colors.textSecondary}`}>{comment.content}</p>
                      <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditText(comment.content);
                        }}
                        className="p-1 rounded hover:bg-white/10"
                        aria-label="Edit comment"
                      >
                        <Edit2 className="w-3.5 h-3.5" style={{ color: colors.textSecondary }} />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 rounded hover:bg-white/10"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className={`flex-1 px-3 py-2 rounded-lg border outline-none text-sm ${
            colors.isDark
              ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="p-2 rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: colors.accent, color: 'white' }}
          aria-label="Send comment"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

