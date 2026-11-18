import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

const BlogView = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchBlog = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await blogAPI.getBlog(id); setBlog(response.data); }
    catch (requestError) { setError(requestError.response?.data?.error || 'This story could not be loaded.'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { fetchBlog(); }, [fetchBlog]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this story? This action cannot be undone.')) return;
    try { await blogAPI.deleteBlog(id); navigate('/'); }
    catch (requestError) { window.alert(requestError.response?.data?.error || 'Could not delete this story.'); }
  };
  if (loading) return <div className="loading" role="status">Loading story…</div>;
  if (error || !blog) return <div className="feed-state feed-error" role="alert"><strong>Story unavailable</strong><p>{error || 'This story may have been removed.'}</p><Link className="button button-dark" to="/">Back to Discover</Link></div>;

  const authorId = blog.author?._id || blog.author?.id;
  const isAuthor = user && authorId === user.id;
  const publishedDate = blog.publishedAt || blog.createdAt;
  return <div className="blog-view"><article className="blog-article">
    <header className="blog-header"><span className="eyebrow"><span className="eyebrow-dot" /> FROM THE BLOGHUB COMMUNITY</span><h1>{blog.title}</h1>
      {blog.excerpt && <p className="blog-intro">{blog.excerpt}</p>}
      <div className="blog-meta"><span>By <strong>{blog.author?.name || 'BlogHub writer'}</strong></span>{publishedDate && <span>Published {new Date(publishedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>}</div>
      <div className="blog-reading-meta"><span>{blog.readingTime || 1} min read</span><span>{(blog.content || '').trim().split(/\\s+/).filter(Boolean).length} words</span></div>
      {!!blog.tags?.length && <div className="blog-tags">{blog.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
    </header>
    <div className="blog-content">{String(blog.content || '').split(/\\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    {isAuthor && <div className="blog-actions"><Link to={`/edit/${blog._id}`} className="button btn-secondary">Edit story</Link><button type="button" onClick={handleDelete} className="button btn-danger">Delete story</button></div>}
  </article><div className="blog-navigation"><Link to="/" className="button button-outline">← Back to Discover</Link></div></div>;
};
export default BlogView;
