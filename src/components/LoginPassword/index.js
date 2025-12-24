import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './index.css';
import loginpasswordbackground from '../../assets/background.png';
import loginpasswordlogo from '../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';


const LoginPassword = () => {
     const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  }); 


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  return (
    <div className="login-password-container" style={{ backgroundImage: `url(${loginpasswordbackground})` }}>
      {/* Logo at top left */}
      <div className="login-password-logo-container">
        <div className="login-password-logo">
          <div className="login-password-logo-icon">
            <img src={loginpasswordlogo} alt="CLAP KARTEL" className="login-password-film-reel-1"/>
          </div>
        </div>
      </div>

      {/* Glassmorphism Login Form */}
      <div className="login-password-form-wrapper">
        <div className="login-password-form-container">
          {/* Header */}
          <div className="login-password-header-section">
            <h2 className="login-password-title">Log in</h2>
            <div className="login-password-subtitle-logo-row">
              <p className="login-password-subtitle">Signin to Continue</p>
              <div className="login-password-form-logo">
                <div className="login-password-form-logo-icon">
                  <img src={loginpasswordlogo} alt="CLAP KARTEL" className="login-password-film-reel"/>
                </div>
              </div>
            </div>
          </div>

          <div className="login-password-form">
            <div className="login-password-form-group">
              <input
                type="text"
                name="username"
                placeholder="Username or Email"
                value={formData.username}
                onChange={handleChange}
                className="login-password-form-input"
              />
            </div>

            <div className="login-password-form-group">
              <div className="login-password-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="login-password-form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="login-password-forgot-password-wrapper">
              <a href="#password" className="login-password-forgot-password">Forgot Password</a>
            </div>

            <button onClick={handleSubmit} className="login-password-login-button">
              Login
            </button>

            <div className="login-password-signup-link">
              Already have an Account? <Link to="/signup">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPassword