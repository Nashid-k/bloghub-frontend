import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <Link to="/" className="nav-logo" onClick={closeMenu} aria-label="BlogHub home">bloghub<span>.</span></Link>
        <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span>{menuOpen ? 'Close' : 'Menu'}</span><span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        </button>
        <div className={`nav-menu ${menuOpen ? 'nav-menu-open' : ''}`} id="primary-navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`} onClick={closeMenu}>Discover</NavLink>
          {user && <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`} onClick={closeMenu}>My stories</NavLink>}
          <span className="nav-divider" />
          {!loading && (user ? (
            <>
              <Link to="/create" className="nav-write-button" onClick={closeMenu}>Write a story <span aria-hidden="true">↗</span></Link>
              <button type="button" onClick={handleLogout} className="nav-account-button">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeMenu}>Sign in</Link>
              <Link to="/register" className="nav-write-button" onClick={closeMenu}>Join BlogHub <span aria-hidden="true">↗</span></Link>
            </>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
