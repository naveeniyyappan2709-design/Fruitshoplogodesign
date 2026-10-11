import { useEffect, useState } from 'react';
import { useAuth, API_URL } from '../../contexts/AuthContext';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificationsTab() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-600" /> Notifications
        </h2>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="text-sm font-semibold text-orange-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications.</p>
        ) : (
          notifications.map(n => (
            <div key={n._id} className={`p-4 rounded-xl border ${n.isRead ? 'bg-gray-50 border-gray-100' : 'bg-orange-50 border-orange-200'} flex items-start gap-4`}>
              <div className={`p-2 rounded-full ${n.type === 'Out of Stock' || n.type === 'Critical Stock' ? 'bg-red-100 text-red-600' : n.type === 'Low Stock' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.isRead && (
                <button onClick={() => markAsRead(n._id)} className="text-green-600 hover:text-green-700" title="Mark as read">
                  <CheckCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
