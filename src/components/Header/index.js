import { useNavigate } from 'react-router-dom';
import logoText from "../../assets/clap-kartel-logo.svg";
import SearchIcon from "../../assets/searchVector.png";
import { useState } from 'react';
import "./index.css";

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Handle user logout
   * Clears authentication token and redirects to login page
   */
  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('auth');

    // Redirect to login page
    navigate('/login', { replace: true });
  };

  /**
   * Handle search - Navigate to users page with search query
   */
  const handleSearch = () => {
    navigate('/users', {
      state: { searchQuery: searchQuery.trim() }
    });
  };

  /**
   * Handle Enter key press in search input
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="header-container">
      <img
        src={logoText}
        alt="logoText"
        className="header-logo"
        onClick={() => navigate('/')}
      />
      <div className="header-search-wrapper" onClick={handleSearch}>
        <input
          type="text"
          className="header-search-input"
          placeholder="Search For Actors, Actress, 24 Crafts & More"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <img
          src={SearchIcon}
          alt="searchVector"
          className="header-search-icon"
          onClick={handleSearch}
          style={{ cursor: 'pointer' }}
        />
      </div>
      <button
        className="header-logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Header;