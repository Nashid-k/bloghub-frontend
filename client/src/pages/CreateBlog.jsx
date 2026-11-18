import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from '../components/BlogForm';
import { blogAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

const CreateBlog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true); setError('');
    try {
      const response = await blogAPI.createBlog(formData);
      navigate(response.data.status === 'published' ? `/blog/${response.data._id}` : '/profile');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Your story could not be saved. Please try again.');
    } finally { setLoading(false); }
  };
  if (!user) return null;
  return <div className="create-blog"><span className="eyebrow">A NEW PAGE</span><h1>Write something worth sharing.</h1>{error && <p className="error" role="alert">{error}</p>}<BlogForm onSubmit={handleSubmit} loading={loading} /></div>;
};
export default CreateBlog;
