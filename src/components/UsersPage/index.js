import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoText from "../../assets/clap-kartel-logo.svg";
import SearchIcon from "../../assets/searchVector.png";
import "../../components/Header/index.css";
import "../../components/Navbar/index.css";
import './index.css';

const UsersPage = () => {
    const navigate = useNavigate();
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

    // Data states
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search state (from header search bar)
    const [searchQuery, setSearchQuery] = useState('');

    // Message popup state
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState({ type: '', text: '' });

    // Helper function to get authorization headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Helper function to display message popup
    const displayMessage = (type, text) => {
        setMessageContent({ type, text });
        setShowMessage(true);
        setTimeout(() => {
            setShowMessage(false);
        }, 3000);
    };

    // Handle user logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
        navigate('/login', { replace: true });
    };

    // Handle search from header
    const handleHeaderSearch = () => {
        // Search happens in real-time via useEffect
    };

    // Handle Enter key press in search input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleHeaderSearch();
        }
    };

    // Fetch all users data
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);

                const apiUrl = `${BASE_URL}/api/getAllUsersList`;

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                const result = await response.json();

                if (result.userList) {
                    setUsers(result.userList);
                } else {
                    setUsers([]);
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search query only
    useEffect(() => {
        let filtered = [...users];

        // Filter by search query (by name)
        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(user =>
                user.userName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    }, [users, searchQuery]);

    // Get image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://placehold.co/120?text=No+Image';
        return `${BASE_URL}/${imagePath}`;
    };

    // Get current user ID
    const getCurrentUserId = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                return parsedData.user_id || parsedData.id;
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    };

    // Handle Follow/Unfollow action
    const handleFollowToggle = async (user) => {
        const currentUserId = getCurrentUserId();

        if (!currentUserId) {
            displayMessage('error', 'Please login to follow users');
            return;
        }

        if (user.is_wishlist === "1") {
            displayMessage('info', `You are already following ${user.userName}`);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/wish/addtowishlist`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: currentUserId,
                    pro_reg_id: user.userId
                }),
            });

            const result = await response.json();

            if (result.status === 'success' || response.ok) {
                setUsers(users.map(u =>
                    u.userId === user.userId
                        ? { ...u, is_wishlist: "1" }
                        : u
                ));
                displayMessage('success', `You are now following ${user.userName}`);
            } else {
                displayMessage('error', 'Failed to follow user');
            }
        } catch (err) {
            console.error('Error following user:', err);
            displayMessage('error', 'Failed to follow user. Please try again.');
        }
    };

    // Handle Message action
    const handleMessage = (userId, userName) => {
        console.log('Message user:', userId, userName);
        displayMessage('info', 'Message functionality will be implemented in next step');
    };

    // Handle user card click to navigate to UserProfile
    const handleUserClick = (user) => {
        navigate('/user-profile', {
            state: {
                sub_cat_id: user.sub_cat_id,
                user_id: user.userId
            }
        });
    };

    // Render Header (embedded)
    const renderHeader = () => (
        <div className="header-container">
            <img
                src={logoText}
                alt="logoText"
                className="header-logo"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            />
            <div className="header-search-wrapper">
                <input
                    type="text"
                    className="header-search-input"
                    placeholder="Search users by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <img
                    src={SearchIcon}
                    alt="searchVector"
                    className="header-search-icon"
                    onClick={handleHeaderSearch}
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

    // Render Navbar (embedded)
    const renderNavbar = () => (
        <div className="navbar-container">
            <ul className="navbar-left-menu">
                <li onClick={() => navigate('/actors')}>Actors</li>
                <li onClick={() => navigate('/actress')}>Actress</li>
                <li onClick={() => navigate('/director')}>Director</li>
                <li onClick={() => navigate('/casting')}>Casting Call</li>
                <li onClick={() => navigate('/craft')}>24 Crafts</li>
                <li onClick={() => navigate('/other-section')}>Other Sections</li>
            </ul>
            <ul className="navbar-right-menu">
                <li onClick={() => navigate('/users')} style={{ color: '#BF8906', fontWeight: 'bold' }}>Users</li>
                <li onClick={() => navigate('/followers')}>Followers</li>
                <li onClick={() => navigate('/')}>Messages</li>
                <li onClick={() => navigate('/notification')}>Notifications</li>
                <li onClick={() => navigate('/profile')}>Profile</li>
            </ul>
        </div >
    );

    if (loading) {
        return (
            <>
                {renderHeader()}
                {renderNavbar()}
                <div className="users-page">
                    <h1 className="users-title">All Users</h1>
                    <div className="users-container">
                        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                {renderHeader()}
                {renderNavbar()}
                <div className="users-page">
                    <h1 className="users-title">All Users</h1>
                    <div className="users-container">
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Embedded Header */}
            {renderHeader()}

            {/* Embedded Navbar */}
            {renderNavbar()}

            <div className="users-page">
                <h1 className="users-title">All Users ({filteredUsers.length})</h1>

                <div className="users-grid">
                    {filteredUsers.length === 0 ? (
                        <div className="no-users-found">
                            <p className="no-users-message">
                                {searchQuery
                                    ? 'No users found matching your search'
                                    : 'No users found'}
                            </p>
                            {searchQuery && (
                                <button
                                    className="clear-all-filters-btn"
                                    onClick={() => setSearchQuery('')}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <motion.div
                                key={user.userId}
                                className="user-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div
                                    className="user-card-image"
                                    onClick={() => handleUserClick(user)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        src={getImageUrl(user.userProfileImage)}
                                        alt={user.userName}
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/120?text=No+Image';
                                        }}
                                    />
                                </div>

                                <div
                                    className="user-card-info"
                                    onClick={() => handleUserClick(user)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <h3 className="user-name">{user.userName}</h3>
                                    {user.sub_cat_name && (
                                        <p className="user-category">{user.sub_cat_name}</p>
                                    )}
                                    {!user.sub_cat_name && (
                                        <p className="user-category" style={{ color: '#999' }}>No category</p>
                                    )}
                                </div>

                                <div className="user-card-actions">
                                    {user.is_wishlist === "1" ? (
                                        <button
                                            className="following-btn"
                                            onClick={() => handleFollowToggle(user)}
                                            title="Following"
                                        >
                                            Following
                                        </button>
                                    ) : (
                                        <button
                                            className="follow-btn"
                                            onClick={() => handleFollowToggle(user)}
                                            title="Follow"
                                        >
                                            Follow
                                        </button>
                                    )}

                                    <button
                                        className="message-btn"
                                        onClick={() => handleMessage(user.userId, user.userName)}
                                        title="Message"
                                    >
                                        Message
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Message Popup */}
                <AnimatePresence>
                    {showMessage && (
                        <motion.div
                            className={`message-popup ${messageContent.type === 'success' ? 'message-success' : messageContent.type === 'error' ? 'message-error' : 'message-info'}`}
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="message-icon">
                                {messageContent.type === 'success' ? '✓' : messageContent.type === 'error' ? '✕' : 'ℹ'}
                            </span>
                            <span className="message-text">{messageContent.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default UsersPage;
