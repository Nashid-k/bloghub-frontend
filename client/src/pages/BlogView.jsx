import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogAPI, userAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

const BlogView = () => {
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [engagementLoading, setEngagementLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [discussionError, setDiscussionError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || user?._id;

  const fetchBlog = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await blogAPI.getBlog(id);
      setBlog(response.data);
      setLikesCount(response.data.likesCount || 0);
      setLiked(false);
    } catch (requestError) { setError(requestError.response?.data?.error || 'This story could not be loaded.'); }
    finally { setLoading(false); }
  }, [id]);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try { const response = await blogAPI.getComments(id); setComments(response.data); }
    catch { setDiscussionError('Discussion could not be loaded.'); }
    finally { setCommentsLoading(false); }
  }, [id]);

  useEffect(() => {
    fetchBlog(); fetchComments();
    if (user) userAPI.getBookmarks().then((response) => setBookmarked((response.data || []).some((story) => String(story._id) === String(id)))).catch(() => {});
    else setBookmarked(false);
  }, [fetchBlog, fetchComments, id, userId]);

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    setEngagementLoading(true);
    try {
      const response = await blogAPI.toggleLike(id);
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (requestError) { setDiscussionError(requestError.response?.data?.error || 'Could not update your like.'); }
    finally { setEngagementLoading(false); }
  };

  const handleBookmark = async () => {
    if (!user) { navigate('/login'); return; }
    setEngagementLoading(true);
    try { const response = await blogAPI.toggleBookmark(id); setBookmarked(response.data.bookmarked); }
    catch (requestError) { setDiscussionError(requestError.response?.data?.error || 'Could not update your reading list.'); }
    finally { setEngagementLoading(false); }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;
    try {
      const response = await blogAPI.createComment(id, commentText.trim());
      setComments((current) => [...current, response.data]);
      setCommentText('');
      setDiscussionError('');
    } catch (requestError) { setDiscussionError(requestError.response?.data?.error || 'Could not publish your comment.'); }
  };

  const removeComment = async (commentId) => {
    try { await blogAPI.deleteComment(commentId); setComments((current) => current.filter((comment) => comment._id !== commentId)); }
    catch (requestError) { setDiscussionError(requestError.response?.data?.error || 'Could not remove this comment.'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this story? This action cannot be undone.')) return;
    try { await blogAPI.deleteBlog(id); navigate('/'); }
    catch (requestError) { window.alert(requestError.response?.data?.error || 'Could not delete this story.'); }
  };

  if (loading) return <div className="loading" role="status">Loading story…</div>;
  if (error || !blog) return <div className="feed-state feed-error" role="alert"><strong>Story unavailable</strong><p>{error || 'This story may have been removed.'}</p><Link className="button button-dark" to="/">Back to Discover</Link></div>;

  const authorId = blog.author?._id || blog.author?.id;
  const currentUserId = user?.id || user?._id;
  const isAuthor = user && String(authorId) === String(currentUserId);
  const canRemoveComment = (comment) => user && (String(comment.author?._id) === String(currentUserId) || isAuthor);
  const publishedDate = blog.publishedAt || blog.createdAt;
  

  return <div className="blog-view"><article className="blog-article">
    <header className="blog-header"><span className="eyebrow"><span className="eyebrow-dot" /> FROM THE BLOGHUB COMMUNITY</span><h1>{blog.title}</h1>
      {blog.excerpt && <p className="blog-intro">{blog.excerpt}</p>}
      <div className="blog-meta"><span>By <strong>{blog.author?.name || 'BlogHub writer'}</strong></span>{publishedDate && <span>Published {new Date(publishedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>}</div>
      <div className="blog-reading-meta"><span>{blog.readingTime || 1} min read</span><span>{(blog.content || '').trim().split(/\s+/).filter(Boolean).length} words</span></div>
      {!!blog.tags?.length && <div className="blog-tags">{blog.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
    </header>
    <div className="blog-content">{String(blog.content || '').split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    <div className="article-engagement"><button type="button" className={liked ? 'engagement-button is-active' : 'engagement-button'} onClick={handleLike} disabled={engagementLoading}>♡ <span>{likesCount}</span> {liked ? 'Liked' : 'Like this story'}</button><button type="button" className={bookmarked ? 'engagement-button is-active' : 'engagement-button'} onClick={handleBookmark} disabled={engagementLoading}>{bookmarked ? '▣ Saved to reading list' : '＋ Save for later'}</button></div>
    {isAuthor && <div className="blog-actions"><Link to={`/edit/${blog._id}`} className="button btn-secondary">Edit story</Link><button type="button" onClick={handleDelete} className="button btn-danger">Delete story</button></div>}
  </article>
  <section className="discussion-section"><div className="discussion-heading"><span className="eyebrow">THE CONVERSATION</span><h2>Thoughts worth sharing.</h2><p>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</p></div>
    {discussionError && <p className="error" role="alert">{discussionError}</p>}
    <form className="comment-composer" onSubmit={submitComment}><label htmlFor="comment-content">Add to the conversation</label><textarea id="comment-content" rows="3" maxLength="2000" value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder={user ? 'Share a thoughtful response…' : 'Sign in to join the conversation'} /><div className="comment-composer-footer"><span>{commentText.length}/2000</span><button className="button button-dark" disabled={!commentText.trim()}>Post comment ↗</button></div></form>
    {commentsLoading ? <p className="discussion-empty">Loading discussion…</p> : comments.length === 0 ? <p className="discussion-empty">No comments yet. Start a thoughtful conversation.</p> : <div className="comment-list">{comments.map((comment) => <article className="comment-card" key={comment._id}><div className="comment-avatar">{(comment.author?.name || 'W').slice(0,1).toUpperCase()}</div><div className="comment-body"><div className="comment-byline"><strong>{comment.author?.name || 'Reader'}</strong><time>{new Date(comment.createdAt).toLocaleDateString()}</time></div><p>{comment.content}</p>{canRemoveComment(comment) && <button type="button" className="comment-remove" onClick={() => removeComment(comment._id)}>Remove</button>}</div></article>)}</div>}
  </section>
  <div className="blog-navigation"><Link to="/" className="button button-outline">← Back to Discover</Link></div></div>;
};
export default BlogView;
