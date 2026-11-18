import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, blogAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

const Profile = () => {
  const [userBlogs, setUserBlogs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    let active = true;
    Promise.all([userAPI.getProfile(), userAPI.getBookmarks()]).then(([profileResponse, bookmarkResponse]) => {
      if (active) { setUserBlogs(profileResponse.data.blogs || []); setBookmarks(bookmarkResponse.data || []); }
    }).catch(() => { if (active) setError('Some creator data could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Delete this story permanently?')) return;
    try { await blogAPI.deleteBlog(blogId); setUserBlogs((current) => current.filter((blog) => blog._id !== blogId)); }
    catch { setError('Could not delete this story. Please try again.'); }
  };
  if (!user) return <div className="feed-state">Please sign in to view your writing.</div>;
  if (loading) return <div className="loading" role="status">Loading your studio…</div>;
  const published = userBlogs.filter((blog) => (blog.status || 'published') === 'published').length;
  const drafts = userBlogs.filter((blog) => blog.status === 'draft').length;
  const visibleBlogs = userBlogs.filter((blog) => filter === 'all' || (filter === 'draft' ? blog.status === 'draft' : (blog.status || 'published') === 'published'));

  return <div className="profile creator-dashboard">
    <header className="creator-dashboard-header"><div><span className="eyebrow">YOUR CREATOR STUDIO</span><h1>Welcome back, {user.name?.split(' ')[0]}.</h1><p>Your ideas, all in one place. Keep writing.</p></div><Link to="/create" className="button button-dark">New story ↗</Link></header>
    <section className="creator-stats" aria-label="Writing statistics"><div><span>Total stories</span><strong>{userBlogs.length}</strong></div><div><span>Published</span><strong>{published}</strong></div><div><span>Drafts</span><strong>{drafts}</strong></div></section>
    {error && <p className="error" role="alert">{error}</p>}
    <section className="user-blogs"><div className="creator-list-heading"><div><span className="eyebrow">YOUR LIBRARY</span><h2>Your stories</h2></div><div className="creator-filters" aria-label="Filter stories"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button><button className={filter === 'published' ? 'active' : ''} onClick={() => setFilter('published')}>Published</button><button className={filter === 'draft' ? 'active' : ''} onClick={() => setFilter('draft')}>Drafts</button></div></div>
      {visibleBlogs.length === 0 ? <div className="feed-state"><strong>{filter === 'draft' ? 'No drafts yet.' : 'Nothing here just yet.'}</strong><p>Start with a thought and turn it into a story.</p><Link to="/create" className="button button-dark">Create a story ↗</Link></div> : <div className="blogs-list">{visibleBlogs.map((blog) => <article key={blog._id} className="blog-item creator-story-row"><div className="creator-story-copy"><span className={blog.status === 'draft' ? 'status-pill status-draft' : 'status-pill status-published'}>{blog.status || 'published'}</span><h3>{blog.title}</h3><p className="blog-preview">{blog.excerpt || blog.content.substring(0, 150)}{blog.content.length > 150 ? '…' : ''}</p><div className="blog-meta"><span>Updated {new Date(blog.updatedAt || blog.createdAt).toLocaleDateString()}</span><span>{blog.readingTime || 1} min read</span></div></div><div className="blog-actions"><Link to={blog.status === 'draft' ? `/edit/${blog._id}` : `/blog/${blog._id}`} className="button btn-secondary">{blog.status === 'draft' ? 'Continue' : 'Read'}</Link><Link to={`/edit/${blog._id}`} className="button button-outline">Edit</Link><button onClick={() => handleDeleteBlog(blog._id)} className="button btn-danger">Delete</button></div></article>)}</div>}
    </section>
    <section className="saved-reading-list"><div className="creator-list-heading"><div><span className="eyebrow">YOUR READING LIST</span><h2>Saved for later</h2></div><span className="saved-count">{bookmarks.length} saved</span></div>{bookmarks.length === 0 ? <p className="discussion-empty">Stories you bookmark will be waiting here when you return.</p> : <div className="saved-story-grid">{bookmarks.map((story) => <article className="saved-story-card" key={story._id}><span className="eyebrow">{story.author?.name || 'BlogHub writer'}</span><h3>{story.title}</h3><p>{story.excerpt || story.content?.slice(0, 130)}</p><Link to={'/blog/' + story._id}>Continue reading →</Link></article>)}</div>}</section>
  </div>;
};
export default Profile;
