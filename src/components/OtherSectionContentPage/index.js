import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';

const OtherSectionContentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

    // Get data from navigation state — supports both old and new navigation format
    const {
        categoryId,
        otherId,
        categoryName,
        // New fields from OtherSectionDetailPage / InnerDataPage
        subcatId,
        innerdata,
        serviceName,
        catName,
        innerCatName
    } = location.state || {};

    // Determine which ID to use for API call — new subcatId takes priority
    const contentId = subcatId || otherId || categoryId;

    // Build display name for loading/empty states
    const displayName = innerCatName || catName || categoryName || 'Content';

    // State for API data
    const [contentItems, setContentItems] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
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

    // Helper function to construct content image URL
    const getContentImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `${BASE_URL}/${imagePath}`;
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

    // Helper function to check if link is a YouTube URL
    const isYouTubeLink = (url) => {
        if (!url) return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    // Helper function to extract YouTube video ID
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return match ? match[1] : null;
    };

    // Helper function to get file type from path
    const getFileType = (filePath) => {
        if (!filePath) return null;
        const extension = filePath.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
        if (['pdf'].includes(extension)) return 'pdf';
        if (['doc', 'docx'].includes(extension)) return 'document';
        return 'file';
    };

    // Fetch content based on category ID
    useEffect(() => {
        // Redirect to other-section page if no category ID provided
        if (!contentId) {
            navigate('/other-section');
            return;
        }

        const fetchContent = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${BASE_URL}/api/content/${contentId}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch content: ${response.status}`);
                }

                const result = await response.json();
                console.log('Content API Response:', result);

                // Extract data from response
                if (result?.content && Array.isArray(result.content)) {
                    setContentItems(result.content);
                    setTotalRecords(result.total_records || result.content.length);
                } else {
                    setContentItems([]);
                    setTotalRecords(0);
                }

            } catch (err) {
                console.error('Error fetching content:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [contentId, navigate]);

    // Loading state
    if (loading) {
        return (
            <div className="content-page">
                <h1 className="content-title">{displayName || categoryName || 'Loading...'}</h1>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading content...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="content-page">
                <h1 className="content-title">{displayName || categoryName}</h1>
                <div className="error-container">
                    <p className="error-message">Error: {error}</p>
                    <button
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (contentItems.length === 0) {
        return (
            <div className="content-page">
                <h1 className="content-title">{displayName || categoryName}</h1>
                <div className="empty-container">
                    <p className="empty-message">No content available in this category</p>
                    <button className="back-button" onClick={() => navigate(-1)}>
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="content-page">
            {/* Title with Breadcrumb Navigation */}
            <h1 className="content-title">
                <div className="breadcrumb-nav">
                    <span
                        className="breadcrumb-item breadcrumb-link"
                        onClick={() => navigate('/other-section')}
                    >
                        Other Sections
                    </span>

                    {serviceName && (
                        <>
                            <span className="breadcrumb-separator">→</span>
                            <span
                                className="breadcrumb-item breadcrumb-link"
                                onClick={() => navigate(-2)}
                            >
                                {toTitleCase(serviceName)}
                            </span>
                        </>
                    )}

                    {catName && (
                        <>
                            <span className="breadcrumb-separator">→</span>
                            <span
                                className="breadcrumb-item breadcrumb-link"
                                onClick={() => navigate(-1)}
                            >
                                {toTitleCase(catName)}
                            </span>
                        </>
                    )}

                    <span className="breadcrumb-separator">→</span>
                    <span className="breadcrumb-item breadcrumb-current">
                        {toTitleCase(displayName)}
                    </span>
                </div>
            </h1>

            <div className="content-grid">
                {contentItems.map((item) => {
                    const hasYouTubeLink = isYouTubeLink(item.link_url);
                    const youtubeVideoId = hasYouTubeLink ? getYouTubeVideoId(item.link_url) : null;
                    const contentImage = getContentImageUrl(item.content_image);
                    const attachedFile = getContentImageUrl(item.content_attached_file);
                    const attachedFileTwo = getContentImageUrl(item.content_attached_file_two);

                    return (
                        <div key={item.id} className="content-card">
                            {/* YouTube Video or Image */}
                            {hasYouTubeLink && youtubeVideoId ? (
                                <div className="content-media">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                                        title={item.content_title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="content-video"
                                    />
                                </div>
                            ) : contentImage ? (
                                <div className="content-media">
                                    <img
                                        src={contentImage}
                                        alt={item.content_title}
                                        className="content-image"
                                        onError={(e) => {
                                            console.error('Failed to load content image:', contentImage);
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : null}

                            {/* Content Info */}
                            <div className="content-info">
                                <h3 className="content-card-title">{item.content_title}</h3>

                                {item.content_text && (
                                    <p className="content-text">{item.content_text}</p>
                                )}

                                {/* Attached Files */}
                                <div className="content-files">
                                    {item.content_attached_file && (
                                        <a
                                            href={attachedFile}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-link"
                                        >
                                            📎 View File {getFileType(item.content_attached_file) === 'image' ? '(Image)' : ''}
                                        </a>
                                    )}
                                    {item.content_attached_file_two && (
                                        <a
                                            href={attachedFileTwo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-link"
                                        >
                                            📄 Download {getFileType(item.content_attached_file_two) === 'pdf' ? 'PDF' : 'File'}
                                        </a>
                                    )}
                                </div>

                                {/* Metadata */}
                                <div className="content-meta">
                                    {item.yearwise && (
                                        <span className="meta-tag">📅 {item.yearwise}</span>
                                    )}
                                    {/* {item.content_order && (
                                        <span className="meta-tag">#{item.content_order}</span>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* {totalRecords > 0 && (
                <div className="content-footer">
                    <p className="total-count">Total: {totalRecords} item{totalRecords !== 1 ? 's' : ''}</p>
                </div>
            )} */}
        </div>
    );
};

export default OtherSectionContentPage;
