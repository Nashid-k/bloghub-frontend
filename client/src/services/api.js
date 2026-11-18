import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  logout: () => api.post('/auth/logout'),
};

export const blogAPI = {
  getAllBlogs: (params = {}) => api.get('/blogs', { params }),
  getBlog: (id) => api.get(`/blogs/${id}`),
  getMyBlogs: () => api.get('/blogs/mine'),
  getMyBlog: (id) => api.get(`/blogs/mine/${id}`),
  createBlog: (blogData) => api.post('/blogs', blogData),
  updateBlog: (id, blogData) => api.put(`/blogs/${id}`, blogData),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  getEngagement: (id) => api.get(`/blogs/${id}/engagement`),
  toggleLike: (id) => api.post(`/blogs/${id}/like`),
  toggleBookmark: (id) => api.post(`/blogs/${id}/bookmark`),
  getComments: (id) => api.get(`/blogs/${id}/comments`),
  createComment: (id, content) => api.post(`/blogs/${id}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/blogs/comments/${commentId}`),
};

export const userAPI = { getProfile: () => api.get('/users/me'), getBookmarks: () => api.get('/users/bookmarks') };
export default api;
