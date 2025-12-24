import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const WishlistPage = () => {
  const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Message popup state
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState({ type: '', text: '' });

  // Unfollow confirmation modal state
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState(null);

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

  // Fetch current user ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setCurrentUserId(parsedData.user_id || parsedData.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch followers data
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/wish/getprofessionaforwishlist`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        const result = await response.json();

        if (result.status === 'success' && result.data) {
          setWishlistItems(result.data);
          console.log(result.data);
        } else {
          setWishlistItems([]);
        }
      } catch (err) {
        console.error('Error fetching followers:', err);
        setError('Failed to load followers');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/120x120?text=No+Image';
    return `${BASE_URL}/${imagePath}`;
  };

  // Open unfollow confirmation modal
  const handleUnfollowClick = (item) => {
    setUserToUnfollow(item);
    setIsUnfollowModalOpen(true);
  };

  // Close unfollow confirmation modal
  const handleCloseUnfollowModal = () => {
    setIsUnfollowModalOpen(false);
    setTimeout(() => {
      setUserToUnfollow(null);
    }, 300);
  };

  // Confirm and execute unfollow
  const confirmUnfollow = async () => {
    if (!userToUnfollow) return;

    const { pro_reg_id, userName } = userToUnfollow;

    if (!currentUserId) {
      displayMessage('error', 'Please login to unfollow');
      handleCloseUnfollowModal();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/wish/addtowishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: currentUserId,
          pro_reg_id: pro_reg_id
        }),
      });

      const result = await response.json();

      if (result.status === 'success' || response.ok) {
        // Remove user from local state
        setWishlistItems(wishlistItems.filter(item => item.pro_reg_id !== pro_reg_id));
        displayMessage('success', `You unfollowed ${userName}`);
        handleCloseUnfollowModal();
      } else {
        displayMessage('error', 'Failed to unfollow');
      }
    } catch (err) {
      console.error('Error unfollowing user:', err);
      displayMessage('error', 'Failed to unfollow. Please try again.');
    }
  };

  const navigate = useNavigate();

  // Handle user card click to navigate to UserProfile
  const handleUserClick = (item) => {
    navigate('/user-profile', {
      state: {
        sub_cat_id: item.sub_cat_id,
        user_id: item.pro_reg_id
      }
    });
  };



  if (loading) {
    return (
      <div className="wishlist-page">
        <h1 className="wishlist-title">My Followers</h1>
        <div className="wishlist-container">
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-page">
        <h1 className="wishlist-title">My Followers</h1>
        <div className="wishlist-container">
          <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1 className="wishlist-title">My Followers ({wishlistItems.length})</h1>

      <div className="wishlist-container">
        {wishlistItems.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>No followers yet</p>
        ) : (
          wishlistItems.map((item) => (
            <div key={item.wid} className="wishlist-card">
              <div
                className="wishlist-card-left"
                onClick={() => handleUserClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="wishlist-image">
                  <img
                    src={getImageUrl(item.userProfileImage)}
                    alt={item.userName}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/120x120?text=No+Image';
                    }}
                  />
                </div>
                <div className="wishlist-info">
                  <h3 className="wishlist-name">{item.userName}</h3>
                  <p className="wishlist-location">{item.sub_cat_name}</p>
                  {/* {item.user_about && (
                    <p className="wishlist-about">{item.user_about}</p>
                  )} */}
                </div>
              </div>

              <div className="wishlist-actions">
                {/* <button
                  className="wishlist-like-btn"
                  title="In Wishlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="29" height="27" viewBox="0 0 29 27" fill="none">
                    <path d="M28.5 9.07642C28.5048 11.2457 27.6749 13.3324 26.1844 14.8987C22.7669 18.4667 19.4517 22.187 15.9082 25.624C15.0948 26.3993 13.8054 26.3712 13.0284 25.5605L2.81528 14.9001C-0.271759 11.6774 -0.271759 6.47544 2.81528 3.25418C3.54488 2.48304 4.42241 1.86913 5.39465 1.44967C6.3669 1.0302 7.41361 0.81391 8.47134 0.81391C9.52907 0.81391 10.5758 1.0302 11.548 1.44967C12.5203 1.86913 13.3978 2.48304 14.1274 3.25418L14.4998 3.64045L14.8708 3.25418C15.6013 2.48409 16.479 1.87079 17.451 1.45118C18.423 1.03156 19.4693 0.814311 20.5269 0.8125C22.6549 0.8125 24.6891 1.69218 26.183 3.25418C27.674 4.82018 28.5044 6.90698 28.5 9.07642Z" fill="#B6810D" />
                  </svg>
                </button> */}

                <button
                  className="wishlist-following-btn"
                  onClick={() => handleUnfollowClick(item)}
                  title="Following"
                >
                  UnFollow
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Popup */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className={`message-popup ${messageContent.type === 'success' ? 'message-success' : 'message-error'}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <span className="message-icon">
              {messageContent.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="message-text">{messageContent.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unfollow Confirmation Modal */}
      <AnimatePresence>
        {isUnfollowModalOpen && userToUnfollow && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseUnfollowModal}
          >
            <motion.div
              className="unfollow-modal-content"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="unfollow-modal-header">
                <h3>Unfollow User</h3>
                <button className="unfollow-modal-close" onClick={handleCloseUnfollowModal}>
                  ✕
                </button>
              </div>
              <div className="unfollow-modal-body">
                <p>Are you sure you want to unfollow <strong>{userToUnfollow.userName}</strong>?</p>
              </div>
              <div className="unfollow-modal-footer">
                <button className="unfollow-modal-cancel" onClick={handleCloseUnfollowModal}>
                  Cancel
                </button>
                <button className="unfollow-modal-confirm" onClick={confirmUnfollow}>
                  UnFollow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishlistPage;




































