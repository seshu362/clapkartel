import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  // Handle section item click — navigate to OtherSectionDetailPage (no modal)
  const handleSectionClick = (section) => {
    console.log('Section clicked:', section);
    navigate('/other-section-detail', {
      state: {
        sectionId: section.id,
        sectionName: section.sub_cat_name,
        sectionImage: section.sub_picture || section.cat_image
      }
    });
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

  // Define format order for display (matching API response keys)
  const formatOrder = [
    'Video',
    'Learning',
    'List',
    'Information',
    'Rentals',
    'Support'
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
    </div>
  );
};

export default OtherSections;