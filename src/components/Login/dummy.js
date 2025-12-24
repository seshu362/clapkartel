import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import backgroundImage from '../../assets/background.png';
import logoText from '../../assets/logo-text.png';
import logo from '../../assets/logo.png';
import './index.css';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingUpRecaptcha, setSettingUpRecaptcha] = useState(false);
  const navigate = useNavigate();

  const setupRecaptcha = async () => {
    if (settingUpRecaptcha) {
      console.log('reCAPTCHA setup already in progress, waiting...');
      // Wait for current setup to complete
      while (settingUpRecaptcha) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return window.recaptchaVerifier;
    }

    setSettingUpRecaptcha(true);
    try {
      // Clear any existing reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          await window.recaptchaVerifier.clear();
        } catch (clearError) {
          console.warn('Error clearing existing reCAPTCHA:', clearError);
        }
        window.recaptchaVerifier = null;
      }

      // Clear the container element
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }

      // Wait a bit for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: window.__USE_VISIBLE_RECAPTCHA__ ? 'normal' : 'invisible',
        callback: (token) => {
          console.log('reCAPTCHA resolved', token ? token.substring(0, 8) + '...' : '');
        },
        'expired-callback': () => {
          try { 
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear(); 
            }
          } catch (_) {}
          window.recaptchaVerifier = null;
          console.warn('reCAPTCHA expired');
        }
      });
      return window.recaptchaVerifier;
    } catch (error) {
      console.error('reCAPTCHA setup error:', error);
      // If reCAPTCHA is already rendered, try to clear and retry once
      if (error.message && error.message.includes('already been rendered')) {
        console.log('reCAPTCHA already rendered, attempting cleanup and retry...');
        try {
          const container = document.getElementById('recaptcha-container');
          if (container) {
            container.innerHTML = '';
          }
          await new Promise(resolve => setTimeout(resolve, 200));
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: window.__USE_VISIBLE_RECAPTCHA__ ? 'normal' : 'invisible',
            callback: (token) => {
              console.log('reCAPTCHA resolved (retry)', token ? token.substring(0, 8) + '...' : '');
            },
            'expired-callback': () => {
              try { 
                if (window.recaptchaVerifier) {
                  window.recaptchaVerifier.clear(); 
                }
              } catch (_) {}
              window.recaptchaVerifier = null;
              console.warn('reCAPTCHA expired (retry)');
            }
          });
          return window.recaptchaVerifier;
        } catch (retryError) {
          console.error('reCAPTCHA retry failed:', retryError);
          throw retryError;
        }
      }
      throw error;
    } finally {
      setSettingUpRecaptcha(false);
    }
  };

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.warn('Error clearing reCAPTCHA on cleanup:', error);
        }
        window.recaptchaVerifier = null;
      }
      // Also clear the container
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobileNumber(value);
      setError('');
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtpCode(value);
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
      const verifier = await setupRecaptcha();
      const phoneNumber = `+91${mobileNumber}`;
      
      if (process.env.REACT_APP_FIREBASE_TEST_MODE === 'true') {
        console.log('Using test phone number in TEST MODE');
      }

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      window.confirmationResult = confirmation;
      setOtpSent(true);
    } catch (error) {
      console.error('Send OTP Error:', error);
      if (error.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later');
      } else if (error.code === 'auth/captcha-check-failed') {
        setError('Verification failed. Please refresh and try again');
      } else {
        setError('Failed to send OTP. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };  

  const verifyOtpNow = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      if (!window.confirmationResult) {
        throw new Error('Please request OTP first');
      }

      console.log('[Login] Starting OTP verification for code:', otpCode);
      const result = await window.confirmationResult.confirm(otpCode);
      const user = result?.user || auth.currentUser;
      
      // Get phone number WITHOUT country code for the API
      let phoneForAPI = '';
      if (user?.phoneNumber) {
        // Remove +91 from the phone number
        phoneForAPI = user.phoneNumber.replace(/^\+91/, '');
      } else if (mobileNumber) {
        phoneForAPI = mobileNumber;
      }
      
      // Store the full E164 format in localStorage for other uses
      const e164Phone = user?.phoneNumber || `+91${mobileNumber}`;
      if (e164Phone) {
        localStorage.setItem('phoneNumber', e164Phone);
      }

      try {
        console.log('[Login] Calling backend login API with phone:', phoneForAPI);
        
        // CORRECTED URL - removed 'public' from the path
        const response = await fetch('https://www.whysocial.in/clap-kartel/public/auth/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include', // required for cookies
          body: JSON.stringify({ phone: phoneForAPI })
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        let data = {};
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('[Login] Non-JSON response:', text);
          throw new Error('Invalid response format from server');
        }

        if (!response.ok) {
          console.error('[Login] Login API failed:', response.status, data);
          
          // Better error messages based on the response
          if (data?.error) {
            throw new Error(data.error);
          } else if (data?.message) {
            throw new Error(data.message);
          } else if (response.status === 404) {
            throw new Error('User not found. Please sign up first.');
          } else if (response.status === 401) {
            throw new Error('Authentication failed. Please try again.');
          } else if (response.status === 400) {
            throw new Error('Invalid request. Please check your phone number.');
          } else if (response.status === 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error(`Login failed (${response.status})`);
          }
        }

        // Extract token from various possible response structures
        const token = data?.token || data?.access_token || data?.data?.token || data?.authToken;
        
        if (token) {
          console.log('[Login] Backend token received');
          localStorage.setItem('token', token);
          localStorage.setItem('auth', keepLoggedIn ? '1' : '0');
          
          // Store user data if available
          if (data?.user || data?.data?.user) {
            const userData = data?.user || data?.data?.user;
            localStorage.setItem('userData', JSON.stringify(userData));
          }
        } else {
          console.warn('[Login] No token in response, checking if session-based auth...');
          // Some backends use session cookies instead of tokens
          if (response.ok) {
            console.log('[Login] Login successful, using session cookies');
            localStorage.setItem('auth', keepLoggedIn ? '1' : '0');
          } else {
            throw new Error('Login successful but no authentication token received');
          }
        }

        console.log('[Login] Login successful, navigating to home');
        navigate('/', { replace: true });
        
      } catch (apiErr) {
        console.error('[Login] Backend login error:', apiErr);
        
        // Handle specific network errors
        if (apiErr instanceof TypeError) {
          if (apiErr.message === 'Failed to fetch') {
            // Could be CORS, network issue, or server down
            setError('Unable to connect to server. Please check your internet connection or try again later.');
          } else if (apiErr.message.includes('ERR_CONNECTION_CLOSED')) {
            setError('Connection to server was lost. Please try again.');
          } else if (apiErr.message.includes('ERR_CONNECTION_REFUSED')) {
            setError('Server is not responding. Please try again later.');
          } else {
            setError('Network error. Please check your connection and try again.');
          }
        } else if (apiErr.message && apiErr.message.includes('CORS')) {
          setError('Server configuration error. Please contact support.');
        } else {
          setError(typeof apiErr?.message === 'string' ? apiErr.message : 'Login failed. Please try again.');
        }
        return;
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      if (error.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        setError('OTP has expired. Please request a new one.');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Invalid OTP. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    verifyOtpNow();
  };

  return (
    <div className="clapkart-login-auth-container">
      <div className="clapkart-login-auth-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <img 
          src={logoText}
          alt="CLAP KARTEL"
          className="clapkart-login-clap-kartel-logo"
        />
      </div>

      <div className="clapkart-login-auth-right">
        <div className="clapkart-login-auth-form-container">
          <div className="clapkart-login-logo-container">
            <img 
              src={logo}
              alt="Clap Kartel Logo"
              className="clapkart-login-form-logo"
            />
          </div>

          <h2 className="clapkart-login-auth-title">Login</h2>
          <p className="clapkart-login-auth-subtitle">Please login to continue to your account.</p>

          <div className="clapkart-login-auth-form">
            <div id="recaptcha-container"></div>
            
            <div className="clapkart-login-form-group">
              <label className="clapkart-login-form-label">Mobile Number</label>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={handlePhoneNumberChange}
                className="clapkart-login-form-input"
                maxLength="10"
                disabled={loading || otpSent}
              />
            </div>

            <div className="clapkart-login-login-options">
              <div className="clapkart-login-checkbox-group">
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="clapkart-login-terms-checkbox"
                  disabled={loading}
                />
                <label htmlFor="keepLoggedIn" className="clapkart-login-checkbox-label">
                  Keep me logged in
                </label>
              </div>
              <button 
                className="clapkart-login-login-with-password"
                onClick={() => navigate('/login-password')}
                disabled={loading}
              >
                Login with password
              </button>
            </div>

            {!otpSent ? (
              <button 
                onClick={handleSubmit} 
                className="clapkart-login-submit-button" 
                disabled={loading || mobileNumber.length !== 10}
              >
                {loading ? 'Sending...' : 'Sign in'}
              </button>
            ) : (
              <>
                <div className="clapkart-login-form-group">
                  <label className="clapkart-login-form-label">Enter OTP</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={handleOtpChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && otpCode.length === 6) {
                        handleVerifyOtp(e);
                      }
                    }}
                    className="clapkart-login-form-input"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    disabled={loading}
                  />
                </div>
                <button 
                  onClick={handleVerifyOtp} 
                  className="clapkart-login-submit-button" 
                  disabled={loading || otpCode.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </>
            )}

            {error && (
              <p className="clapkart-login-error-message">
                {error}
              </p>
            )}
          </div>

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