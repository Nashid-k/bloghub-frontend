import React, { useMemo, useState } from 'react';

const BlogForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    tags: (initialData?.tags || []).join(', '),
    status: initialData?.status || 'draft',
  });
  const [preview, setPreview] = useState(false);
  const words = useMemo(() => formData.content.trim().split(/\s+/).filter(Boolean).length, [formData.content]);
  const readingTime = Math.max(1, Math.ceil(words / 220));
  const update = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    onSubmit({ ...formData, tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean) });
  };

  return (
    <form onSubmit={submit} className="blog-form writing-studio">
      <div className="studio-topline">
        <span className="eyebrow">THE WRITING STUDIO</span>
        <span className="studio-reading-time">{readingTime} min read · {words} words</span>
      </div>
      <div className="form-group">
        <label htmlFor="title">Story title</label>
        <input id="title" name="title" value={formData.title} onChange={update} required minLength="3" maxLength="120" placeholder="Give your story a memorable title" />
      </div>
      <div className="form-group">
        <label htmlFor="excerpt">Short description <span className="field-hint">Optional · up to 240 characters</span></label>
        <textarea id="excerpt" name="excerpt" value={formData.excerpt} onChange={update} maxLength="240" rows="2" placeholder="What should readers know before they begin?" />
        <span className="character-count">{formData.excerpt.length}/240</span>
      </div>
      <div className="form-group">
        <label htmlFor="tags">Topics <span className="field-hint">Separate with commas · up to 8</span></label>
        <input id="tags" name="tags" value={formData.tags} onChange={update} placeholder="Design, technology, culture" />
      </div>
      <div className="studio-editor-heading">
        <label htmlFor="content">Your story</label>
        <div className="studio-tools">
          <span className="field-hint">Plain text with paragraph breaks</span>
          <button type="button" className="studio-preview-toggle" onClick={() => setPreview((value) => !value)}>{preview ? 'Edit story' : 'Preview'}</button>
        </div>
      </div>
      {preview ? (
        <div className="writing-preview" aria-live="polite">
          <h2>{formData.title || 'Your story title'}</h2>
          {formData.excerpt && <p className="preview-excerpt">{formData.excerpt}</p>}
          {formData.content.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      ) : (
        <textarea id="content" name="content" value={formData.content} onChange={update} required minLength="1" maxLength="50000" rows="18" placeholder="Start with the idea you can't stop thinking about…" />
      )}
      <div className="studio-footer">
        <label className="status-select-label" htmlFor="status">Save as
          <select id="status" name="status" value={formData.status} onChange={update}>
            <option value="draft">Draft — only you can see it</option>
            <option value="published">Published — visible to everyone</option>
          </select>
        </label>
        <button type="submit" disabled={loading || !formData.title.trim() || !formData.content.trim()} className="button btn-primary">
          {loading ? 'Saving…' : formData.status === 'published' ? 'Publish story ↗' : 'Save draft'}
        </button>
      </div>
    </form>
  );
};

export default BlogForm;
