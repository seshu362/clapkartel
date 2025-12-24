import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const OtherSections = () => {
  const navigate = useNavigate();

  // API Configuration
  const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
  const CRAFT_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/cat-list';

  // State for sections data
  const [sectionsData, setSectionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Helper function to construct image URL
  const getOtherSectionImageUrl = (imageName) => {
    if (!imageName) return '';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    return `${CRAFT_IMAGE_BASE_URL}/${imageName}`;
  };

  // Helper function to convert text to title case
  const toTitleCase = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Fetch other sections data
  useEffect(() => {
    const fetchOtherSections = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BASE_URL}/api/get-other-formats`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch other sections: ${response.status}`);
        }

        const result = await response.json();
        console.log('Other Sections Full API Response:', result);

        setSectionsData(result);

      } catch (err) {
        console.error('Error fetching other sections:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOtherSections();
  }, []);

  // Function to fetch categories when a section is clicked
  const fetchCategories = async (sectionId, section) => {
    try {
      setLoadingCategories(true);
      setCategoryError(null);
      setCategories([]);
      setHasAttemptedFetch(false);

      console.log('Fetching categories for section:', sectionId);

      const response = await fetch(`${BASE_URL}/api/get-other-categories/${sectionId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const result = await response.json();
      console.log('Categories API Full Response:', JSON.stringify(result, null, 2));

      let foundCategories = [];

      // Check multiple possible response structures
      if (result?.crafts241 && Array.isArray(result.crafts241)) {
        foundCategories = result.crafts241;
      } else if (result?.data && Array.isArray(result.data)) {
        foundCategories = result.data;
      } else if (result?.categories && Array.isArray(result.categories)) {
        foundCategories = result.categories;
      } else if (Array.isArray(result)) {
        foundCategories = result;
      }

      console.log('Found categories:', foundCategories);
      console.log('Categories length:', foundCategories.length);

      setCategories(foundCategories);
      setHasAttemptedFetch(true);

      // Check if the first category has id: null and navigate directly
      if (foundCategories.length > 0 && foundCategories[0].id === null && foundCategories[0].otherid) {
        console.log('Category has null id, navigating directly with otherid:', foundCategories[0].otherid);
        console.log('Using section sub_cat_name:', section?.sub_cat_name);
        // For items with id: null, use sub_cat_name from the clicked section
        navigate('/other-section-content', {
          state: {
            otherId: foundCategories[0].otherid,
            categoryName: section?.sub_cat_name || foundCategories[0].sub_cat_name || 'Content'
          }
        });
        // Don't open modal, reset states
        setIsModalOpen(false);
        setSelectedSection(null);
        setCategories([]);
        setLoadingCategories(false);
        return;
      }

    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategoryError(err.message);
      setCategories([]);
      setHasAttemptedFetch(true);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle section item click
  const handleSectionClick = async (section) => {
    console.log('Section clicked:', section);
    setSelectedSection(section);
    setCategories([]);
    setHasAttemptedFetch(false);
    setIsModalOpen(true);
    await fetchCategories(section.id, section);
     };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLoadingCategories(false);
    setCategoryError(null);
    setHasAttemptedFetch(false);
    setTimeout(() => {
      setSelectedSection(null);
      setCategories([]);
    }, 300);
  };

  // Render modal body content
  const renderModalContent = () => {
    console.log('Rendering Modal Content:', {
      loading: loadingCategories,
      error: categoryError,
      hasAttemptedFetch,
      categoriesCount: categories?.length,
      categories: categories
    });

    // Show loading state
    if (loadingCategories) {
      return (
        <div className="modal-loading">
          <motion.div
            className="modal-loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading categories...</p>
        </div>
      );
    }

    // Show error state
    if (categoryError) {
      return (
        <div className="modal-error">
          <div className="no-profiles-icon">⚠️</div>
          <h3 className="no-profiles-title">Error Loading Profiles</h3>
          <p className="no-profiles-subtitle">
            {categoryError}
          </p>
        </div>
      );
    }

    // Show empty state - only after fetch has been attempted
    if (hasAttemptedFetch && (!categories || !Array.isArray(categories) || categories.length === 0)) {
      return (
        <div className="no-profiles-container">
          <h3 className="no-profiles-title">Currently no profiles in this section</h3>
        </div>
      );
    }

    // Show categories grid
    return (
      <motion.div
        className="other-category-grid"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.08
            }
          }
        }}
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id || index}
            className="other-category-card"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{
              scale: 1.05,
              y: -5,
              boxShadow: "0 10px 30px rgba(191, 137, 6, 0.2)",
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Navigate to OtherSectionContentPage with category data
              // Use otherid if id is null, otherwise use id
              navigate('/other-section-content', {
                state: {
                  categoryId: category.id,
                  otherId: category.otherid,
                  categoryName: category.cat_name
                }
              });

              // Close the modal
              handleCloseModal();
            }}

          >
            <div className="other-category-icon-wrapper">
              <img
                src={getOtherSectionImageUrl(category.cat_image) || null}
                alt={category.cat_name}
                className="other-category-icon"
                onError={(e) => {
                  console.error('Failed to load category image:', category.cat_image);
                }}
              />
            </div>
            <div className="other-category-info">
              <h3 className="other-category-name">
                {toTitleCase(category.cat_name)}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="other-sections">
        <h1 className="sections-title">Other Sections</h1>
        <div className="page-loading">
          <motion.div
            className="page-loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading sections...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="other-sections">
        <h1 className="sections-title">Other Sections</h1>
        <div className="page-error">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!sectionsData || !sectionsData.subcategories) {
    return (
      <div className="other-sections">
        <h1 className="sections-title">Other Sections</h1>
        <div className="page-empty">
          <p>No sections available</p>
        </div>
      </div>
    );
  }

  // Define format order for display
  const formatOrder = [
    'Video Format',
    'Document Format',
    'List Format',
    'Information Format',
    'Support Format'
  ];

  return (
    <div className="other-sections">
      <h1 className="sections-title">Other Sections</h1>

      {formatOrder.map((formatName, formatIndex) => {
        const formatItems = sectionsData.subcategories[formatName];

        // Skip if no items in this format
        if (!formatItems || formatItems.length === 0) {
          return null;
        }

        return (
          <React.Fragment key={formatName}>
            {/* Items Grid */}
            <div className={`sections-row row-${formatItems.length}`}>
              {formatItems.map((section) => {
                const imgSrc = getOtherSectionImageUrl(
                  section.sub_picture || section.cat_image
                );

                return (
                  <div
                    key={section.id}
                    className="section-item"
                    onClick={() => handleSectionClick(section)}
                  >
                    <div className="section-image-wrapper">
                      <img
                        src={imgSrc}
                        alt={section.sub_cat_name}
                        className="section-image"
                        onError={(e) => {
                          console.error('Failed to load image:', imgSrc);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="section-name">{toTitleCase(section.sub_cat_name)}</p>
                  </div>
                );
              })}
            </div>

            {/* Divider between formats */}
            {formatIndex < formatOrder.length - 1 && (
              <div className="section-divider"></div>
            )}
          </React.Fragment>
        );
      })}

      {/* Modal for Section Details */}
      <AnimatePresence>
        {isModalOpen && selectedSection && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="modal-content other-section-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background Elements */}
              <div className="modal-bg-decoration other-modal-bg">
                <div className="modal-circle modal-circle-1"></div>
                <div className="modal-circle modal-circle-2"></div>
                <div className="modal-circle modal-circle-3"></div>
              </div>

              {/* Modal Header */}
              <div className="modal-header other-modal-header">
                <motion.div
                  className="modal-header-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="modal-logo-container">
                    <img
                      src={getOtherSectionImageUrl(selectedSection.sub_picture || selectedSection.cat_image)}
                      alt={selectedSection.sub_cat_name}
                      className="modal-craft-logo"
                    />
                  </div>
                  <div className="modal-header-info">
                    <h2 className="modal-craft-title">{toTitleCase(selectedSection.sub_cat_name)}</h2>
                  </div>
                </motion.div>
                <motion.button
                  className="modal-close-btn"
                  onClick={handleCloseModal}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                {renderModalContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OtherSections;