import "./index.css";
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();
  return (
    <div className="navbar-container">
      <ul className="navbar-left-menu">
        <li onClick={() => navigate('/actors')}>Actors</li>
        <li onClick={() => navigate('/actress')}>Actress</li>
        <li onClick={() => navigate('/director')}>Director</li>
        <li onClick={() => navigate('/casting')}>Casting Call</li>
        <li onClick={() => navigate('/craft')}>24 Crafts</li>
        <li onClick={() => navigate('/other-section')}>Other Sections</li>
      </ul>
      <ul className="navbar-right-menu">
        <li onClick={() => navigate('/users')}>Users</li>
        <li onClick={() => navigate('/followers')}>Followers</li>
        <li onClick={() => navigate('/')}>Messages</li>
        <li onClick={() => navigate('/notification')}>Notifications</li>
        <li onClick={() => navigate('/profile')}>Profile</li>
      </ul>
    </div>
  );
};

export default NavBar;