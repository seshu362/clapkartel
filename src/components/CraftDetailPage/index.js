import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Carousel from '../Carousel';
import VideoCarousel from '../VideoCarousel';
import './index.css';

const CraftDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const CRAFT_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/cat-list';

    // Get craft category data from navigation state
    const { categoryId, categoryName, categoryImage } = location.state || {};

    // State management
    const [subcategories, setSubcategories] = useState([]);
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





    // Helper function to get craft image URL
    const getCraftImageUrl = (imageName) => {
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

    // Fetch all data on component mount
    useEffect(() => {
        // Redirect if no category data
        if (!categoryId || !categoryName) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);





                // Fetch subcategories for this craft
                const subcategoriesResponse = await fetch(`${BASE_URL}/api/allSubCategoryList/${categoryId}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (subcategoriesResponse.ok) {
                    const subcategoriesResult = await subcategoriesResponse.json();

                    if (subcategoriesResult?.subcategorylist && Array.isArray(subcategoriesResult.subcategorylist)) {
                        setSubcategories(subcategoriesResult.subcategorylist);
                    } else if (subcategoriesResult?.data && Array.isArray(subcategoriesResult.data)) {
                        setSubcategories(subcategoriesResult.data);
                    } else if (Array.isArray(subcategoriesResult)) {
                        setSubcategories(subcategoriesResult);
                    }
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId, categoryName, navigate]);

    // Handle subcategory click
    const handleSubcategoryClick = (subcategory) => {
        navigate('/subcategory-users', {
            state: {
                subCategoryId: subcategory.id,
                subCategoryName: subcategory.sub_cat_name,
                categoryName: categoryName,
                sourcePage: '/craft-detail'
            }
        });
    };

    if (loading) {
        return (
            <div className="craft-detail-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading {categoryName}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="craft-detail-page-wrapper">
            {/* Title with Breadcrumb Navigation */}
            <div className="craft-breadcrumb-header">
                <h1 className="craft-page-title">
                    <div className="breadcrumb-nav">
                        <span
                            className="breadcrumb-item breadcrumb-link"
                            onClick={() => navigate('/')}
                        >
                            24 Crafts
                        </span>
                        <span className="breadcrumb-separator">→</span>
                        <span className="breadcrumb-item breadcrumb-current">
                            {toTitleCase(categoryName)}
                        </span>
                    </div>
                </h1>
            </div>

            {/* Video Carousel - First Row */}
            <VideoCarousel />

            {/* Carousel Banner - Second Row */}
            <Carousel />

            {/* Subcategories Section - Third Row */}
            <div className="craft-subcategories-container">
                <div className="craft-subcategories-header">
                    <h1 className="craft-subcategories-title">{toTitleCase(categoryName)}</h1>
                </div>

                {subcategories.length > 0 ? (
                    <div className="craft-subcategories-grid">
                        {subcategories.map((subcategory, index) => (
                            <motion.div
                                key={subcategory.id || index}
                                className="craft-subcategory-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                                onClick={() => handleSubcategoryClick(subcategory)}
                            >
                                <img
                                    src={getCraftImageUrl(subcategory.sub_picture) || getCraftImageUrl(categoryImage)}
                                    alt={subcategory.sub_cat_name}
                                    className="craft-subcategory-image"
                                    onError={(e) => {
                                        console.error('Failed to load subcategory image:', subcategory.sub_picture);
                                        // Fallback to category image if subcategory image fails
                                        if (categoryImage && e.target.src !== getCraftImageUrl(categoryImage)) {
                                            e.target.src = getCraftImageUrl(categoryImage);
                                        } else {
                                            e.target.src = 'https://placehold.co/60x60?text=Icon';
                                        }
                                    }}
                                />
                                <h1 className="craft-subcategory-name">
                                    {toTitleCase(subcategory.sub_cat_name)}
                                </h1>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="no-subcategories">
                        <p>No subcategories available for {categoryName}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CraftDetailPage;
