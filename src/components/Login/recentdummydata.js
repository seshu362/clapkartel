import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/background.png';
import logoText from '../../assets/clap-kartel-logo.svg';
import logo from '../../assets/logo.png';
import './index.css';

const Login = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            setMobileNumber(value);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mobileNumber.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://www.whysocial.in/clap-kartel/public/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                // body: JSON.stringify({ phoneNumber: 91.Number(mobileNumber) })
                body: JSON.stringify({ phoneNumber: Number(`91${mobileNumber}`) })

            });

            const data = await response.json();
            console.log('API Response:', data);  // Show result in console

            if (!response.ok) {
                throw new Error(data?.message || 'Login failed');
            }

            // Store token - checking for both 'token' and 'access_token' from API response
            if (data?.token) {
                console.log(data.token)
                localStorage.setItem('token', data.token);
            } else if (data?.access_token) {
                // console.log(data.access_token)
                localStorage.setItem('token', data.access_token);
            }

            localStorage.setItem('auth', keepLoggedIn ? '1' : '0');

            // Navigate to home or dashboard
            navigate('/', { replace: true });

        } catch (err) {
            console.error('Login Error:', err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="clapkart-login-auth-container">
            <div className="clapkart-login-auth-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
                <img src={logoText} alt="CLAP KARTEL" className="clapkart-login-clap-kartel-logo" />
            </div>

            <div className="clapkart-login-auth-right">
                <div className="clapkart-login-auth-form-container">
                    <div className="clapkart-login-logo-container">
                        <img src={logo} alt="Clap Kartel Logo" className="clapkart-login-form-logo" />
                    </div>

                    <h2 className="clapkart-login-auth-title">Login</h2>
                    <p className="clapkart-login-auth-subtitle">Please login to continue to your account.</p>

                    <div className="clapkart-login-form-group">
                        <label className="clapkart-login-form-label">Mobile Number</label>
                        <input
                            type="tel"
                            placeholder="Enter 10-digit mobile number"
                            value={mobileNumber}
                            onChange={handlePhoneNumberChange}

                            // ENTER KEYWord Button
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !loading && mobileNumber.length === 10) {
                                    handleSubmit(e);
                                }
                            }}
                            className="clapkart-login-form-input"
                            maxLength="10"
                            disabled={loading}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="clapkart-login-submit-button"
                        disabled={loading || mobileNumber.length !== 10}
                    >
                        {loading ? 'Processing...' : 'Login'}
                    </button>

                    {error && <p className="clapkart-login-error-message">{error}</p>}

                    <div className="clapkart-login-auth-footer">
                        <span className="clapkart-login-footer-text">Need an account? </span>
                        <Link to="/signup" className="clapkart-login-footer-link">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
