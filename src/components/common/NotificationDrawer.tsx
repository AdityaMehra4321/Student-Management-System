import React, { useState, useEffect } from 'react';
import { X, Bell, Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { api } from '../../services/api.js';
import { Announcement } from '../../types.js';
import { useAuth } from '../../context/AuthContext.js';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [priority, setPriority] = useState('NORMAL');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAnnouncements();
    }
  }, [isOpen]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      await api.createAnnouncement({ title, content, targetRole, priority });
      setTitle('');
      setContent('');
      setShowAddModal(false);
      await loadAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canPost = user?.role === 'ADMIN' || user?.role === 'STAFF' || user?.role === 'TEACHER';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-sm text-slate-900">Institutional Announcements</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {canPost && !showAddModal && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Announcement</span>
            </button>
          )}

          {showAddModal && (
            <form onSubmit={handleCreateAnnouncement} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
              <div className="font-semibold text-slate-900">New Announcement</div>
              <div>
                <label className="block text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Schedule Update"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Detailed message..."
                  rows={3}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-slate-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Audience</label>
                  <select
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="ALL">Everyone</option>
                    <option value="STUDENT">Students Only</option>
                    <option value="TEACHER">Teachers Only</option>
                    <option value="STAFF">Staff Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800"
                >
                  {submitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading notices...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No active announcements</div>
          ) : (
            announcements.map(item => (
              <div key={item.id} className="p-3.5 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-xs text-slate-900 leading-snug">{item.title}</h4>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      item.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-800'
                        : item.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>From: {item.authorName} ({item.authorRole})</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 text-center text-xs text-slate-500">
          Academia Notification Broadcast Service
        </div>
      </div>
    </div>
  );
};
