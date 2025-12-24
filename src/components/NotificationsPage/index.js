import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react'; // Changed from MoreVertical to MoreHorizontal
import './index.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      name: 'Jatin Shah',
      message: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor....',
      time: '48 m',
      date: '21 July 2025 , 15:33 PM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      unread: true,
      section: 'today'
    },
    {
      id: 2,
      name: 'Sony',
      message: 'Lorem Ipsum dolor sit amet, consectetur',
      time: '50 m',
      date: '21 July 2025 , 15:23 PM',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      unread: true,
      section: 'today'
    },
    {
      id: 3,
      name: 'Jatin Shah',
      message: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor....',
      time: '1h',
      date: '21 July 2025 , 15:33 PM',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      unread: false,
      section: 'today'
    },
    {
      id: 4,
      name: 'Jatin Shah',
      message: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor....',
      time: '23h',
      date: '21 July 2025 , 15:33 PM',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      unread: false,
      section: '20 July 2025'
    },
    {
      id: 5,
      name: 'Jatin Shah',
      message: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor....',
      time: '1d',
      date: '21 July 2025 , 15:33 PM',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      unread: false,
      section: '20 July 2025'
    },
    {
      id: 6,
      name: 'Jatin Shah',
      message: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor....',
      time: '1d',
      date: '21 July 2025 , 15:33 PM',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      unread: false,
      section: '20 July 2025'
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, unread: false })));
  };

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const section = notification.section;
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(notification);
    return groups;
  }, {});

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1 className="notifications-title">Notifications</h1>
        <button className="mark-all-read" onClick={handleMarkAllRead}>
          Mark all as Read
        </button>
      </div>

      <div className="notifications-container">
        {Object.entries(groupedNotifications).map(([section, notifs], sectionIndex) => (
          <div key={section} className="notification-section">
            {notifs.map((notification, index) => (
              <div key={notification.id}>
                <div className="notification-item">
                  <div className="notification-left">
                    <span className={`unread-dot ${notification.unread ? 'visible' : ''}`}></span>
                    <div className="notification-avatar">
                      <img src={notification.avatar} alt={notification.name} />
                    </div>
                    <div className="notification-content">
                      <div className="notification-text">
                        <span className="notification-name">{notification.name}</span>
                        <span className="notification-message">{notification.message}</span>
                      </div>
                      <p className="notification-date">{notification.date}</p>
                    </div>
                  </div>
                  <div className="notification-right">
                    <span className="notification-time">{notification.time}</span>
                    <button className="notification-more">
                      <MoreHorizontal size={20} /> {/* Changed from MoreVertical */}
                    </button>
                  </div>
                </div>
                
                {index === notifs.length - 1 && sectionIndex < Object.keys(groupedNotifications).length - 1 && (
                  <div className="date-divider">
                    <span className="date-divider-text">
                      {Object.keys(groupedNotifications)[sectionIndex + 1]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;