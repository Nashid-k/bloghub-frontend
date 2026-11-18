import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogForm from '../components/BlogForm';
import { blogAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

const EditBlog = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchBlog = useCallback(async () => {
    try {
      const response = await blogAPI.getMyBlog(id);
      const authorId = response.data.author?._id || response.data.author?.id || response.data.author;
      if (!user || authorId.toString() !== user.id.toString()) { navigate('/'); return; }
      setBlog(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'This story could not be loaded.');
    } finally { setFetchLoading(false); }
  }, [id, navigate, user]);

  useEffect(() => { if (user) fetchBlog(); }, [fetchBlog, user]);
  const handleSubmit = async (formData) => {
    setLoading(true); setError('');
    try {
      const response = await blogAPI.updateBlog(id, formData);
      navigate(response.data.status === 'published' ? `/blog/${id}` : '/profile');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not save this story.');
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <div className="loading" role="status">Loading your story…</div>;
  if (!blog) return <div className="feed-state feed-error" role="alert"><strong>Story unavailable</strong><p>{error}</p><button className="button button-outline" onClick={() => navigate('/profile')}>Back to your stories</button></div>;
  return <div className="edit-blog"><span className="eyebrow">YOUR WRITING SPACE</span><h1>Keep shaping the story.</h1>{error && <p className="error" role="alert">{error}</p>}<BlogForm initialData={blog} onSubmit={handleSubmit} loading={loading} /></div>;
};
export default EditBlog;
