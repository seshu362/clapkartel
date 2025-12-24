import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';

const CraftDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get craft data from navigation state
    const { craftId, craftName, craftImage } = location.state || {};

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const CRAFT_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/cat-list';

    // State for subcategories
    const [subCategories, setSubCategories] = useState([]);
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

    // Helper function to convert text to title case
    const toTitleCase = (text) => {
        if (!text) return '';
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Helper function to construct craft category image URL
    const getCraftImageUrl = (imageName) => {
        if (!imageName) return '';
        if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
            return imageName;
        }
        return `${CRAFT_IMAGE_BASE_URL}/${imageName}`;
    };

    // Fetch subcategories on component mount
    useEffect(() => {
        const fetchSubCategories = async () => {
            // Redirect to craft page if no craft data
            if (!craftId) {
                navigate('/craft');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${BASE_URL}/api/allSubCategoryList/${craftId}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch subcategories: ${response.status}`);
                }

                const result = await response.json();

                if (result?.subcategorylist && result.subcategorylist.length > 0) {
                    setSubCategories(result.subcategorylist);
                } else {
                    setSubCategories([]);
                }

            } catch (err) {
                console.error('Error fetching subcategories:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubCategories();
    }, [craftId, navigate]);

    // Handle breadcrumb click to go back to crafts page
    const handleBreadcrumbClick = () => {
        navigate('/craft');
    };

    // Handle subcategory click
    const handleSubCategoryClick = (subCategory) => {
        navigate('/subcategory-users', {
            state: {
                subCategoryId: subCategory.id,
                subCategoryName: subCategory.sub_cat_name,
                categoryName: craftName,
                sourcePage: '/craft-detail'
            }
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="craft-detail-page">
                <div className="craft-detail-loading-container">
                    <div className="craft-detail-loading-spinner"></div>
                    <p>Loading subcategories...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="craft-detail-page">
                <div className="craft-detail-error-container">
                    <p className="craft-detail-error-message">Error: {error}</p>
                    <button
                        className="craft-detail-retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="craft-detail-page">
            {/* Breadcrumb Navigation */}
            <div className="craft-detail-breadcrumb-nav">
                <span
                    className="craft-detail-breadcrumb-item craft-detail-breadcrumb-link"
                    onClick={handleBreadcrumbClick}
                >
                    24 Crafts
                </span>
                <span className="craft-detail-breadcrumb-separator">›</span>
                <span className="craft-detail-breadcrumb-item craft-detail-breadcrumb-current">
                    {toTitleCase(craftName)}
                </span>
            </div>

            {/* Page Title and Icon - Hero Header */}
            <div className="craft-detail-header">
                <div className="craft-detail-icon-wrapper">
                    <img
                        src={getCraftImageUrl(craftImage)}
                        alt={craftName}
                        className="craft-detail-icon"
                        onError={(e) => {
                            console.error('Failed to load craft image:', getCraftImageUrl(craftImage));
                            e.target.src = 'https://placehold.co/100x100?text=No+Image';
                        }}
                    />
                </div>
                <h1 className="craft-detail-title">{toTitleCase(craftName)}</h1>
            </div>

            {/* Subcategories Section */}
            <div className="craft-detail-content">
                {subCategories.length > 0 ? (
                    <>
                        <h2 className="craft-detail-section-heading">
                            All Categories
                        </h2>
                        <div className="craft-detail-subcategory-grid">
                            {subCategories.map((subCategory) => (
                                <div
                                    key={subCategory.id}
                                    className="craft-detail-subcategory-item"
                                    onClick={() => handleSubCategoryClick(subCategory)}
                                >
                                    <div className="craft-detail-subcategory-image-wrapper">
                                        <img
                                            src={getCraftImageUrl(craftImage)}
                                            alt={subCategory.sub_cat_name}
                                            className="craft-detail-subcategory-image"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/80x80?text=No+Image';
                                            }}
                                        />
                                    </div>
                                    <p className="craft-detail-subcategory-name">
                                        {toTitleCase(subCategory.sub_cat_name)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="craft-detail-empty-container">
                        <p className="craft-detail-empty-message">No subcategories available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CraftDetailPage;
