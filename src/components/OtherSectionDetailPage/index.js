import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Carousel from '../Carousel';
import VideoCarousel from '../VideoCarousel';
import './index.css';

const OtherSectionDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const CRAFT_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/cat-list';

    // Get section data from navigation state
    const { sectionId, sectionName, sectionImage } = location.state || {};

    // State management
    const [categories, setCategories] = useState([]);
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

    // Helper function to get image URL
    const getImageUrl = (imageName) => {
        if (!imageName) return null;
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

    // Fetch categories on mount
    useEffect(() => {
        if (!sectionId || !sectionName) {
            navigate('/other-section');
            return;
        }

        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${BASE_URL}/api/get-other-categories/${sectionId}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch categories: ${response.status}`);
                }

                const result = await response.json();
                console.log('OtherSectionDetailPage categories response:', result);

                let foundCategories = [];
                if (result?.crafts241 && Array.isArray(result.crafts241)) {
                    foundCategories = result.crafts241;
                } else if (result?.data && Array.isArray(result.data)) {
                    foundCategories = result.data;
                } else if (result?.categories && Array.isArray(result.categories)) {
                    foundCategories = result.categories;
                } else if (Array.isArray(result)) {
                    foundCategories = result;
                }

                setCategories(foundCategories);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [sectionId, sectionName, navigate]);

    // Handle category row click
    const handleCategoryClick = (category) => {
        const innerDataValue = parseInt(category.innerData, 10);

        if (innerDataValue === 0) {
            // No inner data — go directly to content page
            navigate('/other-section-content', {
                state: {
                    subcatId: category.otherid,
                    innerdata: 'false',
                    categoryName: category.cat_name,
                    serviceName: sectionName,
                    catName: category.cat_name,
                    innerCatName: ''
                }
            });
        } else {
            // Has inner data — go to InnerDataPage
            navigate('/inner-data', {
                state: {
                    innerId: category.otherid,
                    catName: category.cat_name,
                    serviceName: sectionName
                }
            });
        }
    };

    if (loading) {
        return (
            <div className="osd-page-wrapper">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading {sectionName}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="osd-page-wrapper">
                <div className="loading-container">
                    <p style={{ color: '#e74c3c' }}>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="osd-page-wrapper">
            {/* Title with Breadcrumb Navigation */}
            <div className="osd-breadcrumb-header">
                <h1 className="osd-page-title">
                    <div className="breadcrumb-nav">
                        <span
                            className="breadcrumb-item breadcrumb-link"
                            onClick={() => navigate('/other-section')}
                        >
                            Other Sections
                        </span>
                        <span className="breadcrumb-separator">→</span>
                        <span className="breadcrumb-item breadcrumb-current">
                            {toTitleCase(sectionName)}
                        </span>
                    </div>
                </h1>
            </div>

            {/* Video Carousel - First Row */}
            <VideoCarousel />

            {/* Carousel Banner - Second Row */}
            <Carousel />

            {/* Categories List - Third Row */}
            <div className="osd-categories-container">
                <div className="osd-categories-header">
                    <h1 className="osd-categories-title">{toTitleCase(sectionName)}</h1>
                </div>

                {categories.length > 0 ? (
                    <div className="osd-list-wrapper">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id || index}
                                className="osd-list-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ backgroundColor: '#fdf6e3' }}
                                onClick={() => handleCategoryClick(category)}
                            >
                                <div className="osd-list-item-left">
                                    {getImageUrl(category.cat_image) && (
                                        <img
                                            src={getImageUrl(category.cat_image)}
                                            alt={category.cat_name}
                                            className="osd-list-item-icon"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <span className="osd-list-item-name">
                                        {toTitleCase(category.cat_name)}
                                    </span>
                                </div>
                                <div className="osd-list-item-arrow">›</div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="osd-no-categories">
                        <p>No categories available for {sectionName}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OtherSectionDetailPage;
