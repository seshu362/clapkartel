import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Carousel from '../Carousel';
import VideoCarousel from '../VideoCarousel';
import './index.css';

const InnerDataPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

    // Get data from navigation state
    const { innerId, catName, serviceName } = location.state || {};

    // State management
    const [innerItems, setInnerItems] = useState([]);
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

    // Fetch inner data on mount
    useEffect(() => {
        if (!innerId) {
            navigate('/other-section');
            return;
        }

        const fetchInnerData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${BASE_URL}/api/get-inner-list/${innerId}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch inner data: ${response.status}`);
                }

                const result = await response.json();
                console.log('InnerDataPage response:', result);

                let foundItems = [];
                if (result?.data && Array.isArray(result.data)) {
                    foundItems = result.data;
                } else if (Array.isArray(result)) {
                    foundItems = result;
                }

                setInnerItems(foundItems);
            } catch (err) {
                console.error('Error fetching inner data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInnerData();
    }, [innerId, navigate]);

    // Handle inner item click → go to content page
    const handleItemClick = (item) => {
        navigate('/other-section-content', {
            state: {
                subcatId: item.id,
                innerdata: 'true',
                categoryName: item.title_name,
                serviceName: serviceName || '',
                catName: catName || '',
                innerCatName: item.title_name
            }
        });
    };

    if (loading) {
        return (
            <div className="idp-page-wrapper">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading {catName}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="idp-page-wrapper">
                <div className="loading-container">
                    <p style={{ color: '#e74c3c' }}>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="idp-page-wrapper">
            {/* Breadcrumb Navigation */}
            <div className="idp-breadcrumb-header">
                <h1 className="idp-page-title">
                    <div className="breadcrumb-nav">
                        <span
                            className="breadcrumb-item breadcrumb-link"
                            onClick={() => navigate('/other-section')}
                        >
                            Other Sections
                        </span>

                        {serviceName && serviceName.trim() !== '' && (
                            <>
                                <span className="breadcrumb-separator">→</span>
                                <span
                                    className="breadcrumb-item breadcrumb-link"
                                    onClick={() => navigate(-1)}
                                >
                                    {toTitleCase(serviceName)}
                                </span>
                            </>
                        )}

                        {catName && catName.trim() !== '' && (
                            <>
                                <span className="breadcrumb-separator">→</span>
                                <span className="breadcrumb-item breadcrumb-current">
                                    {toTitleCase(catName)}
                                </span>
                            </>
                        )}
                    </div>
                </h1>
            </div>

            {/* Video Carousel - First Row */}
            <VideoCarousel />

            {/* Carousel Banner - Second Row */}
            <Carousel />

            {/* Inner Items List - Third Row */}
            <div className="idp-categories-container">
                <div className="idp-categories-header">
                    <h1 className="idp-categories-title">{toTitleCase(catName)}</h1>
                </div>

                {innerItems.length > 0 ? (
                    <div className="idp-list-wrapper">
                        {innerItems.map((item, index) => (
                            <motion.div
                                key={item.id || index}
                                className="idp-list-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ backgroundColor: '#fdf6e3' }}
                                onClick={() => handleItemClick(item)}
                            >
                                <span className="idp-list-item-name">
                                    {toTitleCase(item.title_name)}
                                </span>
                                <div className="idp-list-item-arrow">›</div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="idp-no-items">
                        <p>No inner categories found for {catName}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InnerDataPage;
