import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import { blogAPI } from '../services/api';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await blogAPI.getAllBlogs();
      setBlogs(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'We could not load stories right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return blogs;
    return blogs.filter((blog) => [
      blog.title,
      blog.content,
      blog.author?.name,
    ].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery));
  }, [blogs, query]);

  const featuredBlog = filteredBlogs[0];
  const remainingBlogs = filteredBlogs.slice(1);

  const handleDeleteBlog = (blogId) => {
    setBlogs((currentBlogs) => currentBlogs.filter((blog) => blog._id !== blogId));
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> A space for ideas worth sharing</span>
          <h1>Good stories make<br /><em>better conversations.</em></h1>
          <p className="hero-description">
            Discover thoughtful writing from curious people. Find a new perspective,
            follow an idea, or publish something of your own.
          </p>
          <div className="hero-actions">
            <a href="#stories" className="button button-dark">Explore stories <span aria-hidden="true">↘</span></a>
            <Link to="/create" className="hero-text-link">Start writing <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-art-orbit orbit-one" />
          <div className="hero-art-orbit orbit-two" />
          <div className="hero-art-note note-back"><span>IDEAS</span><strong>01</strong></div>
          <div className="hero-art-note note-front"><span>THE ART OF</span><strong>Thinking<br />out loud.</strong><i>BlogHub journal · Vol. 01</i></div>
          <span className="hero-spark spark-one">✳</span>
          <span className="hero-spark spark-two">✳</span>
        </div>
        <div className="hero-bottomline"><span>READ WIDELY. THINK DEEPLY.</span><span>MADE FOR THE CURIOUS <span aria-hidden="true">✳</span></span></div>
      </section>

      <section className="stories-section" id="stories">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE READING ROOM</span>
            <h2>Stories to get into.</h2>
            <p>Fresh perspectives from the BlogHub community.</p>
          </div>
          <label className="story-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stories or writers"
              aria-label="Search stories or writers"
            />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
          </label>
        </div>

        {loading ? (
          <div className="feed-state" role="status"><span className="loading-mark" /> Gathering the latest stories…</div>
        ) : error ? (
          <div className="feed-state feed-error" role="alert">
            <strong>That page is taking a breather.</strong>
            <p>{error}</p>
            <button className="button button-outline" onClick={fetchBlogs}>Try again</button>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="feed-state empty-state">
            <span className="empty-symbol">✳</span>
            <strong>{query ? 'No stories found.' : 'The first page is still unwritten.'}</strong>
            <p>{query ? 'Try another title, topic or writer name.' : 'Be the first to share an idea with the community.'}</p>
            {query ? <button className="button button-outline" onClick={() => setQuery('')}>Clear search</button> : <Link className="button button-dark" to="/create">Write the first story <span aria-hidden="true">↗</span></Link>}
          </div>
        ) : (
          <div className="story-layout">
            <div className="story-main">
              <BlogCard blog={featuredBlog} onDelete={handleDeleteBlog} featured />
            </div>
            {remainingBlogs.length > 0 && (
              <div className="story-grid">
                {remainingBlogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} onDelete={handleDeleteBlog} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="writer-banner">
        <div><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>Have something<br /><em>on your mind?</em></h2></div>
        <p>The best time to share an idea is before you convince yourself not to.</p>
        <Link to="/create" className="button button-light">Write a story <span aria-hidden="true">↗</span></Link>
      </section>
      <footer className="site-footer"><Link to="/" className="footer-brand">bloghub<span>.</span></Link><span>Read widely. Write honestly.</span><span>© {new Date().getFullYear()} BlogHub</span></footer>
    </div>
  );
};

export default Home;
