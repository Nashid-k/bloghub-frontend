import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { blogAPI } from '../services/api';

const getExcerpt = (content = '', limit = 210) => {
  const plainText = content.replace(/\s+/g, ' ').trim();
  if (plainText.length <= limit) return plainText;
  return `${plainText.slice(0, limit).trimEnd()}…`;
};

const BlogCard = ({ blog, onDelete, featured = false }) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const authorId = blog.author?._id || blog.author?.id;
  const isAuthor = user && authorId && authorId === user.id;

  const handleDelete = async () => {
    if (!window.confirm('Delete this story? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await blogAPI.deleteBlog(blog._id);
      onDelete?.(blog._id);
    } catch (error) {
      window.alert(error.response?.data?.error || 'Could not delete this story. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const authorName = blog.author?.name || 'BlogHub writer';
  const publishedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return (
    <article className={`story-card ${featured ? 'story-card-featured' : ''}`}>
      {featured && <div className="featured-art" aria-hidden="true"><span>THE<br />READING<br />ROOM</span><i>✳</i><b>BH.</b></div>}
      <div className="story-card-body">
        <div className="story-card-kicker"><span className="kicker-dot" /> {featured ? 'A STORY TO START WITH' : 'COMMUNITY STORY'}</div>
        <h3><Link to={`/blog/${blog._id}`}>{blog.title}</Link></h3>
        <p className="story-excerpt">{getExcerpt(blog.content, featured ? 300 : 165)}</p>
        <div className="story-card-footer">
          <div className="story-author"><span className="author-avatar">{authorName.charAt(0).toUpperCase()}</span><span><strong>{authorName}</strong><small>{publishedDate}</small></span></div>
          <Link to={`/blog/${blog._id}`} className="story-read-link" aria-label={`Read ${blog.title}`}>Read story <span aria-hidden="true">↗</span></Link>
        </div>
        {isAuthor && <div className="story-owner-actions"><Link to={`/edit/${blog._id}`}>Edit</Link><button type="button" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button></div>}
      </div>
    </article>
  );
};

export default BlogCard;
