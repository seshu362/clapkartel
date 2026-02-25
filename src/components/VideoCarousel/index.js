import { useState, useEffect, useRef } from "react";
import "./index.css";

const VideoCarousel = () => {
    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

    // State management
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isMuted, setIsMuted] = useState(true); // Start muted

    // Carousel settings
    const videosToShow = 3;
    const videoCardWidth = 400; // Width of each video card
    const containerRef = useRef(null);

    // Helper function to get authorization headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Helper function to convert YouTube URL to embed URL
    const convertToEmbedUrl = (url, muted = true) => {
        if (!url) return '';
        if (url.includes('youtube.com/embed/')) return url;
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (videoIdMatch && videoIdMatch[1]) {
            const muteParam = muted ? '1' : '0';
            return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=${muteParam}&controls=1&modestbranding=1&rel=0`;
        }
        return url;
    };

    // Helper function to get video thumbnail from YouTube
    const getYouTubeThumbnail = (url) => {
        if (!url) return null;
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (videoIdMatch && videoIdMatch[1]) {
            return `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
        }
        return null;
    };

    // Fetch videos from API
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('No token found, skipping video fetch');
                    setLoading(false);
                    return;
                }

                setLoading(true);

                const response = await fetch(`${BASE_URL}/getPodCastAll`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    console.log('Failed to fetch videos');
                    setLoading(false);
                    return;
                }

                const result = await response.json();

                if (result?.result && Array.isArray(result.result) && result.result.length > 0) {
                    setVideos(result.result);
                    setSelectedVideo(result.result[0]); // Set first video as default
                }
            } catch (err) {
                console.error('Error fetching videos:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    // Auto-scroll effect
    useEffect(() => {
        if (videos.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => {
                const next = prev + 1;
                return next >= videos.length ? 0 : next;
            });
        }, 3000); // Auto-scroll every 3 seconds

        return () => clearInterval(timer);
    }, [videos.length]);

    // Handle smooth scroll animation
    useEffect(() => {
        if (containerRef.current && videos.length > 0) {
            containerRef.current.style.transition = "transform 0.5s ease-in-out";
            containerRef.current.style.transform = `translateX(-${currentIndex * videoCardWidth}px)`;
        }
    }, [currentIndex]);

    // Handle video card click
    const handleVideoClick = (video, index) => {
        setSelectedVideo(video);
        setCurrentIndex(index);
        setIsMuted(false); // Unmute when user clicks a video
    };

    // Create extended array for infinite loop effect
    const extendedVideos = videos.length > 0
        ? [...videos, ...videos.slice(0, videosToShow)]
        : [];

    if (loading) {
        return (
            <div className="video-carousel-loading">
                <div className="loading-spinner"></div>
                <p>Loading videos...</p>
            </div>
        );
    }

    if (videos.length === 0) {
        return null; // Don't show if no videos
    }

    return (
        <div className="video-carousel-wrapper">
            {/* Main Video Player */}
            <div className="video-player-main">
                {selectedVideo && (
                    <iframe
                        key={`${selectedVideo.id}-${isMuted}`}
                        src={convertToEmbedUrl(selectedVideo.video_url, isMuted)}
                        title={selectedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="main-video-iframe"
                    />
                )}
            </div>

            {/* Video Carousel */}
            <div className="video-carousel-container">
                {/* Previous Button */}
                <button
                    className="video-nav-btn prev-video-btn"
                    onClick={() => {
                        setCurrentIndex((prev) => {
                            return prev > 0 ? prev - 1 : videos.length - 1;
                        });
                    }}
                    aria-label="Previous video"
                >
                    ‹
                </button>

                <div
                    ref={containerRef}
                    className="video-carousel-track"
                >
                    {extendedVideos.map((video, index) => (
                        <div
                            key={`${video.id}-${index}`}
                            className={`video-card ${selectedVideo?.id === video.id ? 'active' : ''}`}
                            onClick={() => handleVideoClick(video, index % videos.length)}
                        >
                            <div className="video-thumbnail">
                                <img
                                    src={getYouTubeThumbnail(video.video_url)}
                                    alt={video.title}
                                    className="thumbnail-image"
                                />
                                <div className="play-overlay">
                                    <div className="play-icon">▶</div>
                                </div>
                            </div>
                            <div className="video-info">
                                <h3 className="video-title">{video.title}</h3>
                                <p className="video-description">
                                    {video.description?.substring(0, 100)}...
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    className="video-nav-btn next-video-btn"
                    onClick={() => {
                        setCurrentIndex((prev) => {
                            return prev < videos.length - 1 ? prev + 1 : 0;
                        });
                    }}
                    aria-label="Next video"
                >
                    ›
                </button>
            </div>
        </div>
    );
};

export default VideoCarousel;
