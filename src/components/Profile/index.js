import React, { useState, useEffect } from 'react'
import image2 from "../../assets/profileImage2.png";
import profileBanner from "../../assets/profile-banner.png";
import profileSkillIcon from "../../assets/profileskillicon.svg";
import skillViewIcon from "../../assets/skill-view-icon.svg";
import skillEditIcon from "../../assets/skill-edit-icon.svg";
import skillDeleteIcon from "../../assets/skill-delete-icon.svg";
import './index.css'
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiUser, FiInfo, FiBriefcase, FiAward, FiFileText, FiVideo, FiCalendar, FiPlus, FiX, FiAlertTriangle } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { MdPhotoLibrary } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';


const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Location names state
  const [locationNames, setLocationNames] = useState({
    country: '',
    state: '',
    city: ''
  });

  // View Modal state
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillDetails, setSkillDetails] = useState(null);
  const [loadingSkillDetails, setLoadingSkillDetails] = useState(false);
  const [skillDetailsError, setSkillDetailsError] = useState(null);

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    cat_id: '',
    sub_cat_id: '',
    user_about: '',
    user_special_skills: '',
    user_bio: '',
    video_links: ['']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Skill Modal state
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [addSkillFormData, setAddSkillFormData] = useState({
    cat_id: '',
    sub_cat_id: '',
    user_about: '',
    user_special_skills: '',
    user_bio: '',
    video_links: ['']
  });
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // API Configuration
  const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch(`${BASE_URL}/api/allCategoryList`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const result = await response.json();


      if (result?.categoryList && result.categoryList.length > 0) {
        setCategories(result.categoryList);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      alert('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch subcategories based on category
  const fetchSubcategories = async (catId) => {
    try {
      setLoadingSubcategories(true);
      setSubcategories([]);

      const response = await fetch(`${BASE_URL}/api/allSubCategoryList/${catId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subcategories: ${response.status}`);
      }

      const result = await response.json();


      if (result?.subcategorylist && result.subcategorylist.length > 0) {
        setSubcategories(result.subcategorylist);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      alert('Failed to load subcategories');
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Fetch user profile data and skills
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BASE_URL}/userpro/getprofessionrecord`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const result = await response.json();

        console.log('=== PROFILE DATA API RESPONSE ===');
        console.log('Full API Response:', result);
        console.log('User Data:', result.data);
        console.log('================================');

        if (result?.status === 'success' && result?.data && result.data.length > 0) {
          setUserData(result.data[0]);
          console.log('User Profile Set:', result.data[0]);
        } else {
          throw new Error('No user data found');
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserSkills = async () => {
      try {
        setSkillsLoading(true);

        const response = await fetch(`${BASE_URL}/api/getUserSubCatList`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch skills: ${response.status}`);
        }

        const result = await response.json();


        if (result?.status && result?.userSubCatList && result.userSubCatList.length > 0) {
          setSkills(result.userSubCatList);
        }

      } catch (err) {
        console.error('Error fetching skills:', err);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchUserData();
    fetchUserSkills();
  }, []);

  // Fetch location names when userData is available
  useEffect(() => {
    const fetchLocationNames = async () => {
      if (!userData) return;

      const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      try {
        // Fetch country name
        if (userData.userCountry && userData.userCountry !== '0') {
          const countryResponse = await fetch(`${BASE_URL}/api/locations`, {
            method: 'GET',
            headers: headers
          });

          if (countryResponse.ok) {
            const countryResult = await countryResponse.json();
            const countries = countryResult?.data || countryResult || [];
            const country = countries.find(c => c.id === userData.userCountry || c.id === parseInt(userData.userCountry));
            if (country) {
              setLocationNames(prev => ({ ...prev, country: country.name }));
            }
          }
        }

        // Fetch state name
        if (userData.userCountry && userData.userStateList && userData.userStateList !== '0') {
          const stateResponse = await fetch(`${BASE_URL}/api/locations?country_id=${userData.userCountry}`, {
            method: 'GET',
            headers: headers
          });

          if (stateResponse.ok) {
            const stateResult = await stateResponse.json();
            const states = stateResult?.data || stateResult || [];
            const state = states.find(s => s.id === userData.userStateList || s.id === parseInt(userData.userStateList));
            if (state) {
              setLocationNames(prev => ({ ...prev, state: state.name }));
            }
          }
        }

        // Fetch city name
        if (userData.userStateList && userData.userCity && userData.userCity !== '0') {
          const cityResponse = await fetch(`${BASE_URL}/api/locations?state_id=${userData.userStateList}`, {
            method: 'GET',
            headers: headers
          });

          if (cityResponse.ok) {
            const cityResult = await cityResponse.json();
            const cities = cityResult?.data || cityResult || [];
            const city = cities.find(c => c.id === userData.userCity || c.id === parseInt(userData.userCity));
            if (city) {
              setLocationNames(prev => ({ ...prev, city: city.name }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching location names:', error);
      }
    };

    fetchLocationNames();
  }, [userData]);

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `https://www.whysocial.in/clap-kartel/public/${imagePath}`;
  };

  const profileImageUrl = userData?.userProfileImage
    ? getProfileImageUrl(userData.userProfileImage)
    : image2;

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to get video URL
  const getVideoUrl = (video) => {
    if (!video) return null;
    if (typeof video === 'string') return video;
    return video?.link || video?.video_link || video?.url || video?.video_url || null;
  };

  // Skill action handlers
  const handleViewSkill = async (skill) => {
    try {
      setSelectedSkill(skill);
      setIsSkillModalOpen(true);
      setLoadingSkillDetails(true);
      setSkillDetailsError(null);

      const response = await fetch(`${BASE_URL}/api/viewUserSkills/${skill.e_pro_id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to view skill: ${response.status}`);
      }

      const result = await response.json();


      setSkillDetails(result.data);
      setLoadingSkillDetails(false);
    } catch (err) {
      console.error('Error viewing skill:', err);
      setSkillDetailsError('Failed to load skill details');
      setLoadingSkillDetails(false);
    }
  };

  const handleEditSkill = async (skill) => {
    try {
      setSelectedSkill(skill);
      setLoadingSkillDetails(true);

      // Fetch skill details first
      const response = await fetch(`${BASE_URL}/api/viewUserSkills/${skill.e_pro_id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch skill details: ${response.status}`);
      }

      const result = await response.json();


      const professionInfo = result.data?.profession_info || {};
      const videoLinks = result.data?.video_links || [];

      // Populate form with existing data
      setEditFormData({
        cat_id: professionInfo.cat_id || skill.cat_id || '',
        sub_cat_id: professionInfo.sub_cat_id || skill.sub_cat_id || '',
        user_about: professionInfo.user_about || '',
        user_special_skills: professionInfo.user_special_skills || '',
        user_bio: professionInfo.user_bio || '',
        video_links: videoLinks.length > 0
          ? videoLinks.map(v => getVideoUrl(v) || '').filter(Boolean)
          : ['']
      });

      setIsEditModalOpen(true);
      setLoadingSkillDetails(false);
    } catch (err) {
      console.error('Error loading skill for edit:', err);
      alert('Failed to load skill details for editing');
      setLoadingSkillDetails(false);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoLinkChange = (index, value) => {
    setEditFormData(prev => {
      const newVideoLinks = [...prev.video_links];
      newVideoLinks[index] = value;
      return { ...prev, video_links: newVideoLinks };
    });
  };

  const handleAddVideoLink = () => {
    setEditFormData(prev => ({
      ...prev,
      video_links: [...prev.video_links, '']
    }));
  };

  const handleRemoveVideoLink = (index) => {
    setEditFormData(prev => ({
      ...prev,
      video_links: prev.video_links.filter((_, i) => i !== index)
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSkill) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('cat_id', editFormData.cat_id);
      formData.append('sub_cat_id', editFormData.sub_cat_id);
      formData.append('user_about', editFormData.user_about);
      formData.append('user_special_skills', editFormData.user_special_skills);
      formData.append('user_bio', editFormData.user_bio);

      // Add video links
      editFormData.video_links.forEach((link, index) => {
        if (link.trim()) {
          formData.append(`video_link[${index}]`, link.trim());
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/upddateUserSkills/${selectedSkill.e_pro_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to update skill: ${response.status}`);
      }

      const result = await response.json();


      // Refresh skills list
      const skillsResponse = await fetch(`${BASE_URL}/api/getUserSubCatList`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (skillsResponse.ok) {
        const skillsResult = await skillsResponse.json();
        if (skillsResult?.status && skillsResult?.userSubCatList) {
          setSkills(skillsResult.userSubCatList);
        }
      }

      alert('Skill updated successfully!');
      handleCloseEditModal();
    } catch (err) {
      console.error('Error updating skill:', err);
      alert('Failed to update skill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTimeout(() => {
      setSelectedSkill(null);
      setEditFormData({
        cat_id: '',
        sub_cat_id: '',
        user_about: '',
        user_special_skills: '',
        user_bio: '',
        video_links: ['']
      });
    }, 300);
  };

  const handleDeleteSkill = (skill) => {
    setSkillToDelete(skill);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!skillToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/deletUserSkills/${skillToDelete.e_pro_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete skill: ${response.status}`);
      }

      const result = await response.json();


      // Remove the skill from the local state
      setSkills(prevSkills => prevSkills.filter(s => s.e_pro_id !== skillToDelete.e_pro_id));

      alert(`Successfully deleted: ${skillToDelete.sub_cat_name}`);
      handleCloseDeleteModal();
    } catch (err) {
      console.error('Error deleting skill:', err);
      alert('Failed to delete skill. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTimeout(() => {
      setSkillToDelete(null);
    }, 300);
  };

  // Add Skill Modal Handlers
  const handleOpenAddSkillModal = async () => {
    setIsAddSkillModalOpen(true);
    await fetchCategories();
  };

  const handleCloseAddSkillModal = () => {
    setIsAddSkillModalOpen(false);
    setTimeout(() => {
      setAddSkillFormData({
        cat_id: '',
        sub_cat_id: '',
        user_about: '',
        user_special_skills: '',
        user_bio: '',
        video_links: ['']
      });
      setSubcategories([]);
    }, 300);
  };

  const handleAddSkillFormChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cat_id') {
      setAddSkillFormData(prev => ({
        ...prev,
        cat_id: value,
        sub_cat_id: '' // Reset subcategory when category changes
      }));

      if (value) {
        fetchSubcategories(value);
      } else {
        setSubcategories([]);
      }
    } else {
      setAddSkillFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddSkillVideoLinkChange = (index, value) => {
    setAddSkillFormData(prev => {
      const newVideoLinks = [...prev.video_links];
      newVideoLinks[index] = value;
      return { ...prev, video_links: newVideoLinks };
    });
  };

  const handleAddSkillAddVideoLink = () => {
    setAddSkillFormData(prev => ({
      ...prev,
      video_links: [...prev.video_links, '']
    }));
  };

  const handleAddSkillRemoveVideoLink = (index) => {
    setAddSkillFormData(prev => ({
      ...prev,
      video_links: prev.video_links.filter((_, i) => i !== index)
    }));
  };

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!addSkillFormData.cat_id || !addSkillFormData.sub_cat_id) {
      alert('Please select both Category and Subcategory');
      return;
    }

    setIsAddingSkill(true);

    try {
      const formData = new FormData();
      formData.append('cat_id', addSkillFormData.cat_id);
      formData.append('sub_cat_id', addSkillFormData.sub_cat_id);
      formData.append('user_about', addSkillFormData.user_about);
      formData.append('user_special_skills', addSkillFormData.user_special_skills);
      formData.append('user_bio', addSkillFormData.user_bio);

      // Add video links
      addSkillFormData.video_links.forEach((link, index) => {
        if (link.trim()) {
          formData.append(`video_link[${index}]`, link.trim());
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/postuserskills`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to add skill: ${response.status}`);
      }

      const result = await response.json();


      // Refresh skills list
      const skillsResponse = await fetch(`${BASE_URL}/api/getUserSubCatList`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (skillsResponse.ok) {
        const skillsResult = await skillsResponse.json();
        if (skillsResult?.status && skillsResult?.userSubCatList) {
          setSkills(skillsResult.userSubCatList);
        }
      }

      alert('Skill added successfully!');
      handleCloseAddSkillModal();
    } catch (err) {
      console.error('Error adding skill:', err);
      alert('Failed to add skill. Please try again.');
    } finally {
      setIsAddingSkill(false);
    }
  };

  // Handle modal close
  const handleCloseSkillModal = () => {
    setIsSkillModalOpen(false);
    setLoadingSkillDetails(false);
    setSkillDetailsError(null);
    setTimeout(() => {
      setSelectedSkill(null);
      setSkillDetails(null);
    }, 300);
  };

  // Render skill modal content
  const renderSkillModalContent = () => {
    // Show loading state
    if (loadingSkillDetails) {
      return (
        <div className="modal-loading">
          <motion.div
            className="modal-loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading skill details...</p>
        </div>
      );
    }

    // Show error state
    if (skillDetailsError) {
      return (
        <div className="modal-error">
          <div className="no-profiles-icon">⚠️</div>
          <h3 className="no-profiles-title">Error Loading Details</h3>
          <p className="no-profiles-subtitle">
            {skillDetailsError}
          </p>
        </div>
      );
    }

    // Show empty state
    if (!skillDetails) {
      return (
        <div className="no-profiles-container">
          <h3 className="no-profiles-title">No details available</h3>
        </div>
      );
    }

    // Show skill details
    const professionInfo = skillDetails.profession_info || {};
    const videoLinks = skillDetails.video_links || [];

    return (
      <div className="skill-details-container">
        {/* Profession Details Section */}
        {selectedSkill && (
          <div className="skill-detail-section">
            <div className="skill-detail-header">
              <FiBriefcase className="skill-detail-icon" />
              <h3 className="skill-detail-title">Profession Details</h3>
            </div>
            <div className="skill-detail-content">
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{selectedSkill.cat_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Skill:</span>
                <span className="detail-value">{selectedSkill.sub_cat_name}</span>
              </div>
              {professionInfo.user_about && (
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{professionInfo.user_about}</span>
                </div>
              )}
              {professionInfo.create_at && (
                <div className="detail-row">
                  <span className="detail-label">Created At:</span>
                  <span className="detail-value">{formatDate(professionInfo.create_at)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Bio Section */}
        {professionInfo.user_bio && (
          <div className="skill-detail-section">
            <div className="skill-detail-header">
              <FiInfo className="skill-detail-icon" />
              <h3 className="skill-detail-title">Bio</h3>
            </div>
            <p className="skill-detail-content">{professionInfo.user_bio}</p>
          </div>
        )}

        {/* Special Skills Section */}
        {professionInfo.user_special_skills && (
          <div className="skill-detail-section">
            <div className="skill-detail-header">
              <FiAward className="skill-detail-icon" />
              <h3 className="skill-detail-title">Special Skills</h3>
            </div>
            <p className="skill-detail-content">{professionInfo.user_special_skills}</p>
          </div>
        )}

        {/* Video Links Section */}
        <div className="skill-detail-section">
          <div className="skill-detail-header">
            <FiVideo className="skill-detail-icon" />
            <h3 className="skill-detail-title">Videos</h3>
          </div>
          <div className="skill-detail-content">
            {videoLinks && videoLinks.length > 0 ? (
              <div className="video-links-container">
                {videoLinks.map((video, index) => {
                  const videoUrl = getVideoUrl(video);

                  if (!videoUrl) return null;

                  return (
                    <div key={index} className="video-link-item">
                      <div className="video-thumbnail">
                        <FiVideo className="video-icon" />
                      </div>
                      <div className="video-info">
                        <p className="video-title">
                          {video?.title || video?.name || `Video ${index + 1}`}
                        </p>
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="video-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(videoUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <FiVideo style={{ fontSize: '14px' }} />
                          Open Video Link
                        </a>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}

                {videoLinks.filter(video => getVideoUrl(video)).length === 0 && (
                  <div className="no-videos">
                    <FiVideo className="no-videos-icon" />
                    <p className="no-videos-text">No valid video links available</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-videos">
                <FiVideo className="no-videos-icon" />
                <p className="no-videos-text">No videos available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="profile-container">
        <div style={{ textAlign: 'center', padding: '50px', color: '#bf8906' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="profile-container">
        <div style={{ textAlign: 'center', padding: '50px', color: '#bf8906' }}>
          Error loading profile: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="new-profile-container">
        {/* Left Column: Profile Card */}
        <div className="profile-card">
          {/* Banner Image with Profile Photo */}
          <div className="profile-banner-section">
            <img src={profileBanner} alt="Profile Banner" className="profile-banner-image" />
            <div className="profile-photo-wrapper">
              <img src={profileImageUrl} alt="Profile" className="profile-card-image" />
            </div>
          </div>

          {/* User Name */}
          <h2 className="profile-card-name">
            {userData?.['userName ']?.trim() || userData?.userName || 'User Name'}
          </h2>

          {/* Email and Phone */}
          <div className="profile-card-contact">
            <span className="profile-card-label">
              {userData?.['userEmailid ']?.trim() || userData?.userEmailid || 'Email not available'}
            </span>
            <span className="profile-card-detail-separator">|</span>
            <span className="profile-card-label">
              {userData?.['userContact ']?.trim() || userData?.userContact || 'Phone not available'}
            </span>
          </div>

          {/* Height and Age */}
          <div className="profile-card-detail-row">
            <span className="profile-card-detail-label">
              Height: {userData?.userHeight || 'N/A'}
            </span>
            <span className="profile-card-detail-separator">|</span>
            <span className="profile-card-detail-label">
              Age Group: {userData?.userAge || 'N/A'}
            </span>
          </div>

          {/* Location Section - White Background */}
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">Location</h4>
            <p className="profile-card-section-text">
              {userData?.userAddress && userData.userAddress.trim() ? (
                <>
                  {userData.userAddress}
                  {(locationNames.city || locationNames.state || locationNames.country || userData?.userZipcode) && (
                    <>
                      <br />
                      {locationNames.city && `${locationNames.city}`}
                      {locationNames.state && `${locationNames.city ? ', ' : ''}${locationNames.state}`}
                      {locationNames.country && `${(locationNames.city || locationNames.state) ? ', ' : ''}${locationNames.country}`}
                      {userData?.userZipcode && userData.userZipcode.trim() && ` - ${userData.userZipcode}`}
                    </>
                  )}
                </>
              ) : (
                'Address not provided'
              )}
            </p>
          </div>

          {/* Social Links Section - White Background */}
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">Social Links</h4>
            {(userData?.userSocialLinkFace || userData?.userSocialLinkInsta || userData?.userSocialLinkYoutube) ? (
              <div className="profile-card-social-icons">
                {userData?.userSocialLinkFace && userData.userSocialLinkFace.trim() !== '' ? (
                  <a
                    href={userData.userSocialLinkFace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-card-social-icon facebook"
                  >
                    <FaFacebookF />
                  </a>
                ) : null}

                {userData?.userSocialLinkInsta && userData.userSocialLinkInsta.trim() !== '' ? (
                  <a
                    href={userData.userSocialLinkInsta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-card-social-icon instagram"
                  >
                    <FaInstagram />
                  </a>
                ) : null}

                {userData?.userSocialLinkYoutube && userData.userSocialLinkYoutube.trim() !== '' ? (
                  <a
                    href={userData.userSocialLinkYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-card-social-icon youtube"
                  >
                    <FaYoutube />
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="profile-card-section-text profile-card-null-message">No social links added</p>
            )}
          </div>

          {/* Budget Section - White Background */}
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">Budget</h4>
            <p className="profile-card-section-text">
              {userData?.userBudget && userData.userBudget.trim() !== ''
                ? `₹ ${userData.userBudget}`
                : 'Budget not specified'}
            </p>
          </div>

          {/* About Section - White Background */}
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">About</h4>
            <p className="profile-card-section-text">
              {userData?.userAbout && userData.userAbout.trim() !== ''
                ? userData.userAbout
                : 'No description provided'}
            </p>
          </div>

          {/* Edit Profile Button */}
          <button className="profile-card-edit-button" onClick={() => navigate('/profileupate')}>
            Edit Profile
          </button>
        </div>

        {/* Right Column: Main Content */}
        <div className="profile-main-content">
          {/* Skills Section */}
          <div className="profile-skills-section">
            <div className="profile-section-header">
              <h3 className="profile-section-title">Skills</h3>
              <div className="profile-section-buttons">
                <button
                  className="profile-gallery-button"
                  onClick={() => navigate('/gallery')}
                >
                  <MdPhotoLibrary size={18} />
                  Gallery
                </button>
                <button
                  className="profile-add-skills-button"
                  onClick={handleOpenAddSkillModal}
                >
                  Add More Skills
                </button>
              </div>
            </div>

            {!skillsLoading && skills.length > 0 && (
              <div className="profile-skills-grid">
                {skills.map((skill, index) => (
                  <div key={index} className="profile-skill-card">
                    <div className="skill-card-header">
                      <div className="skill-header-left">
                        <img src={profileSkillIcon} alt="skill icon" className="skill-icon" />
                        <div className="skill-category">{skill.cat_name}</div>
                      </div>
                      <div className="skill-actions">
                        <button
                          className="skill-action-btn view-btn"
                          onClick={() => handleViewSkill(skill)}
                          title="View Details"
                        >
                          <img src={skillViewIcon} alt="view" className="skill-action-icon" />
                        </button>
                        <button
                          className="skill-action-btn edit-btn"
                          onClick={() => handleEditSkill(skill)}
                          title="Edit Skill"
                        >
                          <img src={skillEditIcon} alt="edit" className="skill-action-icon" />
                        </button>
                        <button
                          className="skill-action-btn delete-btn"
                          onClick={() => handleDeleteSkill(skill)}
                          title="Delete Skill"
                        >
                          <img src={skillDeleteIcon} alt="delete" className="skill-action-icon" />
                        </button>
                      </div>
                    </div>
                    <div className="skill-name">{skill.sub_cat_name}</div>
                    {skill.description && (
                      <div className="skill-description">{skill.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!skillsLoading && skills.length === 0 && (
              <div className="profile-skills-empty">
                <div className="no-profiles-container">
                  <div className="no-profiles-icon">🎯</div>
                  <h3 className="no-profiles-title">No Skills Added Yet</h3>
                  <p className="no-profiles-subtitle">
                    Click "Add More Skills" to showcase your expertise
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal for Skill Details */}
      <AnimatePresence>
        {isSkillModalOpen && selectedSkill && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseSkillModal}
          >
            <motion.div
              className="modal-content skill-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-bg-decoration">
                <div className="modal-circle modal-circle-1"></div>
                <div className="modal-circle modal-circle-2"></div>
                <div className="modal-circle modal-circle-3"></div>
              </div>

              <div className="modal-header">
                <motion.div
                  className="modal-header-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="modal-logo-container">
                    <img
                      src={profileSkillIcon}
                      alt="skill icon"
                      className="modal-craft-logo"
                    />
                  </div>
                  <div className="modal-header-info">
                    <h2 className="modal-craft-title">{selectedSkill.sub_cat_name}</h2>
                    <p className="modal-craft-subtitle">{selectedSkill.cat_name}</p>
                  </div>
                </motion.div>
                <motion.button
                  className="modal-close-btn"
                  onClick={handleCloseSkillModal}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="modal-body">
                {renderSkillModalContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedSkill && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseEditModal}
          >
            <motion.div
              className="modal-content edit-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-bg-decoration">
                <div className="modal-circle modal-circle-1"></div>
                <div className="modal-circle modal-circle-2"></div>
                <div className="modal-circle modal-circle-3"></div>
              </div>

              <div className="modal-header">
                <motion.div
                  className="modal-header-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="modal-logo-container">
                    <FiEdit2 className="modal-craft-logo-icon" />
                  </div>
                  <div className="modal-header-info">
                    <h2 className="modal-craft-title">Edit Skill</h2>
                    <p className="modal-craft-subtitle">{selectedSkill.sub_cat_name}</p>
                  </div>
                </motion.div>
                <motion.button
                  className="modal-close-btn"
                  onClick={handleCloseEditModal}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleEditSubmit} className="edit-form">
                  <div className="edit-form-field">
                    <label className="edit-form-label">Description</label>
                    <textarea
                      name="user_about"
                      value={editFormData.user_about}
                      onChange={handleEditFormChange}
                      className="edit-form-textarea"
                      placeholder="Enter description about your skill..."
                      rows="4"
                    />
                  </div>

                  <div className="edit-form-field">
                    <label className="edit-form-label">Special Skills</label>
                    <input
                      type="text"
                      name="user_special_skills"
                      value={editFormData.user_special_skills}
                      onChange={handleEditFormChange}
                      className="edit-form-input"
                      placeholder="e.g., Singing, Acting, Dancing"
                    />
                  </div>

                  <div className="edit-form-field">
                    <label className="edit-form-label">Bio</label>
                    <textarea
                      name="user_bio"
                      value={editFormData.user_bio}
                      onChange={handleEditFormChange}
                      className="edit-form-textarea"
                      placeholder="Enter your bio..."
                      rows="3"
                    />
                  </div>

                  <div className="edit-form-field">
                    <div className="video-links-header">
                      <label className="edit-form-label">Video Links</label>
                      <button
                        type="button"
                        onClick={handleAddVideoLink}
                        className="add-video-btn"
                      >
                        <FiPlus /> Add Link
                      </button>
                    </div>
                    <div className="video-links-list">
                      {editFormData.video_links.map((link, index) => (
                        <div key={index} className="video-link-input-group">
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => handleVideoLinkChange(index, e.target.value)}
                            className="edit-form-input"
                            placeholder={`Video link ${index + 1}`}
                          />
                          {editFormData.video_links.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVideoLink(index)}
                              className="remove-video-btn"
                            >
                              <FiX />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="edit-form-actions">
                    <button
                      type="button"
                      onClick={handleCloseEditModal}
                      className="cancel-btn"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Skill'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && skillToDelete && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseDeleteModal}
          >
            <motion.div
              className="modal-content delete-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="delete-modal-content">
                <div className="delete-icon-container">
                  <FiAlertTriangle className="delete-warning-icon" />
                </div>
                <h2 className="delete-modal-title">Delete Skill?</h2>
                <p className="delete-modal-message">
                  Are you sure you want to delete <strong>"{skillToDelete.sub_cat_name}"</strong>?
                </p>
                <p className="delete-modal-warning">
                  This action cannot be undone.
                </p>
                <div className="delete-modal-actions">
                  <button
                    onClick={handleCloseDeleteModal}
                    className="delete-cancel-btn"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="delete-confirm-btn"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Skill Modal */}
      <AnimatePresence>
        {isAddSkillModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseAddSkillModal}
          >
            <motion.div
              className="modal-content add-skill-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-bg-decoration">
                <div className="modal-circle modal-circle-1"></div>
                <div className="modal-circle modal-circle-2"></div>
                <div className="modal-circle modal-circle-3"></div>
              </div>

              <div className="modal-header">
                <motion.div
                  className="modal-header-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="modal-logo-container">
                    <FiPlus className="modal-craft-logo-icon" />
                  </div>
                  <div className="add-skill-modal-header-content">
                    <h2 className="add-skill-modal-title">Add Skill</h2>
                    <p className="add-skill-modal-subtitle">
                      Share your expertise - choose category, add details & links
                    </p>
                  </div>
                </motion.div>
                <motion.button
                  className="modal-close-btn"
                  onClick={handleCloseAddSkillModal}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleAddSkillSubmit} className="add-skill-form">
                  {/* Category Selection */}
                  <div className="add-skill-form-field">
                    <label className="add-skill-form-label">
                      <FiBriefcase style={{ fontSize: '16px' }} />
                      Category
                      <span className="required-star">*</span>
                    </label>
                    {loadingCategories ? (
                      <div className="loading-categories">
                        <div className="loading-spinner"></div>
                        Loading categories...
                      </div>
                    ) : (
                      <select
                        name="cat_id"
                        value={addSkillFormData.cat_id}
                        onChange={handleAddSkillFormChange}
                        className="add-skill-form-select"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.cat_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Subcategory Selection */}
                  <div className="add-skill-form-field">
                    <label className="add-skill-form-label">
                      <FiAward style={{ fontSize: '16px' }} />
                      Subcategory / Skill
                      <span className="required-star">*</span>
                    </label>
                    {loadingSubcategories ? (
                      <div className="loading-categories">
                        <div className="loading-spinner"></div>
                        Loading subcategories...
                      </div>
                    ) : (
                      <select
                        name="sub_cat_id"
                        value={addSkillFormData.sub_cat_id}
                        onChange={handleAddSkillFormChange}
                        className="add-skill-form-select"
                        disabled={!addSkillFormData.cat_id || subcategories.length === 0}
                        required
                      >
                        <option value="">
                          {!addSkillFormData.cat_id
                            ? 'Select a category first'
                            : subcategories.length === 0
                              ? 'No subcategories available'
                              : 'Select a subcategory'}
                        </option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.sub_cat_name}
                          </option>
                        ))}
                      </select>
                    )}
                    {addSkillFormData.cat_id && subcategories.length === 0 && !loadingSubcategories && (
                      <p className="field-helper-text">
                        No subcategories available for this category
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="add-skill-form-field">
                    <label className="add-skill-form-label">
                      <FiFileText style={{ fontSize: '16px' }} />
                      Description
                    </label>
                    <textarea
                      name="user_about"
                      value={addSkillFormData.user_about}
                      onChange={handleAddSkillFormChange}
                      className="add-skill-form-textarea"
                      placeholder="Describe your expertise and experience in this skill..."
                      rows="4"
                    />
                    <p className="field-helper-text">
                      Tell others about your experience and what you can offer
                    </p>
                  </div>

                  {/* Special Skills */}
                  <div className="add-skill-form-field">
                    <label className="add-skill-form-label">
                      <FiAward style={{ fontSize: '16px' }} />
                      Special Skills
                    </label>
                    <input
                      type="text"
                      name="user_special_skills"
                      value={addSkillFormData.user_special_skills}
                      onChange={handleAddSkillFormChange}
                      className="add-skill-form-input"
                      placeholder="e.g., Singing, Acting, Dancing"
                    />
                    <p className="field-helper-text">
                      Separate multiple skills with commas
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="add-skill-form-field">
                    <label className="add-skill-form-label">
                      <FiUser style={{ fontSize: '16px' }} />
                      Bio
                    </label>
                    <textarea
                      name="user_bio"
                      value={addSkillFormData.user_bio}
                      onChange={handleAddSkillFormChange}
                      className="add-skill-form-textarea"
                      placeholder="Share a brief bio about yourself..."
                      rows="3"
                    />
                    <p className="field-helper-text">
                      A short introduction about who you are
                    </p>
                  </div>

                  {/* Video Links */}
                  <div className="add-skill-form-field">
                    <div className="video-links-header">
                      <label className="add-skill-form-label">
                        <FiVideo style={{ fontSize: '16px' }} />
                        Video Links
                      </label>
                      <button
                        type="button"
                        onClick={handleAddSkillAddVideoLink}
                        className="add-video-btn"
                      >
                        <FiPlus /> Add Link
                      </button>
                    </div>
                    <div className="video-links-list">
                      {addSkillFormData.video_links.map((link, index) => (
                        <div key={index} className="video-link-input-group">
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => handleAddSkillVideoLinkChange(index, e.target.value)}
                            className="add-skill-form-input"
                            placeholder="https://youtube.com/..."
                          />
                          {addSkillFormData.video_links.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleAddSkillRemoveVideoLink(index)}
                              className="remove-video-btn"
                            >
                              <FiX />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="field-helper-text">
                      Add links to your work samples or portfolio videos
                    </p>
                  </div>

                  {/* Form Actions */}
                  <div className="edit-form-actions">
                    <button
                      type="button"
                      onClick={handleCloseAddSkillModal}
                      className="cancel-btn"
                      disabled={isAddingSkill}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isAddingSkill || !addSkillFormData.cat_id || !addSkillFormData.sub_cat_id}
                    >
                      {isAddingSkill ? 'Adding Skill...' : 'Add Skill'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Profile