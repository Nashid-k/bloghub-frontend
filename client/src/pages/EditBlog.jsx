import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogForm from '../components/BlogForm';
import { blogAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

const EditBlog = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchBlog = useCallback(async () => {
    try {
      const response = await blogAPI.getBlog(id);
      const blogData = response.data;
      const authorId = blogData.author?._id || blogData.author?.id;

      if (!user || authorId !== user.id) {
        navigate('/');
        return;
      }
      setBlog(blogData);
    } catch {
      window.alert('This story could not be loaded.');
      navigate('/');
    } finally {
      setFetchLoading(false);
    }
  }, [id, navigate, user]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await blogAPI.updateBlog(id, formData);
      navigate(`/blog/${id}`);
    } catch (error) {
      window.alert(error.response?.data?.error || 'Could not update this story.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="loading" role="status">Loading story…</div>;
  if (!blog) return null;

  return (
    <div className="edit-blog">
      <span className="eyebrow">YOUR WRITING SPACE</span>
      <h1>Edit your story</h1>
      <BlogForm initialData={blog} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default EditBlog;
