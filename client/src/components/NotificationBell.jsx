import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

const POLL_INTERVAL = 60000;

const notificationMessage = (notification) => {
  const actor = notification.actor?.name || 'Someone';
  switch (notification.type) {
    case 'follow': return { title: actor, detail: 'started following you', icon: '↗' };
    case 'comment': return { title: actor, detail: 'commented on your story', icon: '✎' };
    case 'like': return { title: actor, detail: 'liked your story', icon: '♥' };
    case 'bookmark': return { title: actor, detail: 'saved your story', icon: '▣' };
    default: return { title: actor, detail: 'interacted with your work', icon: '•' };
  }
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
    Math.round((date.getTime() - Date.now()) / 60000),
    'minute',
  );
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await userAPI.getUnreadNotificationCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch {
      // Keep the last known count; the inbox can still be opened and retried.
    }
  }, []);

  const loadNotifications = useCallback(async ({ cursor, append = false } = {}) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');
    try {
      const response = await userAPI.getNotifications({
        limit: 15,
        ...(cursor ? { cursor } : {}),
      });
      const data = response.data;
      setItems((current) => append ? [...current, ...(data.items || [])] : (data.items || []));
      setNextCursor(data.pagination?.nextCursor || null);
      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Notifications could not be loaded. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, POLL_INTERVAL);
    return () => window.clearInterval(interval);
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) loadNotifications();
  };

  const markRead = async (notification) => {
    if (!notification.readAt) {
      setItems((current) => current.map((item) => (
        item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await userAPI.markNotificationRead(notification._id);
      } catch {
        setItems((current) => current.map((item) => (
          item._id === notification._id ? { ...item, readAt: null } : item
        )));
        refreshUnreadCount();
      }
    }
    if (notification.story?._id) {
      setOpen(false);
      navigate(`/blog/${notification.story._id}`);
    }
  };

  const markAllRead = async () => {
    const previousItems = items;
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await userAPI.markAllNotificationsRead();
    } catch {
      setItems(previousItems);
      refreshUnreadCount();
      setError('Could not mark all notifications as read. Please retry.');
    }
  };

  return (
    <div className="notification-root" ref={rootRef}>
      <button
        type="button"
        className={`notification-trigger ${open ? 'notification-trigger-open' : ''}`}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggleOpen}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {open && (
        <section className="notification-panel" role="dialog" aria-label="Notifications">
          <header className="notification-panel-header">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" /> Your activity</span>
              <h2>Notifications</h2>
            </div>
            <button type="button" className="notification-close" aria-label="Close notifications" onClick={() => setOpen(false)}>×</button>
          </header>

          {items.some((item) => !item.readAt) && (
            <div className="notification-toolbar">
              <span>{unreadCount} unread</span>
              <button type="button" onClick={markAllRead}>Mark all as read</button>
            </div>
          )}

          {error && <div className="notification-error" role="alert">{error}</div>}
          {loading ? (
            <div className="notification-state"><span className="loading-mark" /><span>Gathering your updates…</span></div>
          ) : items.length === 0 && !error ? (
            <div className="notification-state">
              <span className="notification-empty-icon">✳</span>
              <strong>All caught up</strong>
              <span>When readers connect with your stories, you’ll see it here.</span>
            </div>
          ) : (
            <div className="notification-list">
              {items.map((notification) => {
                const message = notificationMessage(notification);
                return (
                  <button
                    type="button"
                    className={`notification-item ${notification.readAt ? '' : 'notification-item-unread'}`}
                    key={notification._id}
                    onClick={() => markRead(notification)}
                  >
                    <span className="notification-icon" aria-hidden="true">{message.icon}</span>
                    <span className="notification-copy">
                      <span><strong>{message.title}</strong> {message.detail}</span>
                      {notification.story?.title && <span className="notification-story">{notification.story.title}</span>}
                      <time>{formatTime(notification.createdAt)}</time>
                    </span>
                    {!notification.readAt && <span className="notification-unread-dot" aria-label="Unread" />}
                  </button>
                );
              })}
            </div>
          )}

          {hasMore && (
            <footer className="notification-panel-footer">
              <button type="button" onClick={() => loadNotifications({ cursor: nextCursor, append: true })} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load older notifications'}
              </button>
            </footer>
          )}
          {error && <button type="button" className="notification-retry" onClick={() => loadNotifications()}>Try again</button>}
        </section>
      )}
    </div>
  );
};

export default NotificationBell;
