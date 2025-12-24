import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import backgroundImage from '../../assets/background.png';
import logoText from '../../assets/clap-kartel-logo.svg';
import logo from '../../assets/logo.png';
import './index.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        emailId: '',
        userType: 'Professional / Individual'
    });
    const [formErrors, setFormErrors] = useState({});
    const [agreeTerms, setAgreeTerms] = useState(false);
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
                    } catch (_) { }
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
                            } catch (_) { }
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

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }

        if (!formData.phoneNumber) {
            errors.phoneNumber = 'Phone number is required';
        } else if (formData.phoneNumber.length !== 10) {
            errors.phoneNumber = 'Enter a valid 10-digit mobile number';
        }

        if (!formData.emailId.trim()) {
            errors.emailId = 'Email is required';
        } else if (!emailRegex.test(formData.emailId)) {
            errors.emailId = 'Enter a valid email address';
        }

        if (formData.userType === 'Professional / Individual') {
            errors.userType = 'Please select your user type';
        }

        if (!agreeTerms) {
            errors.terms = 'Please agree to the terms and conditions';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phoneNumber') {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: cleaned }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
        setError('');
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

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const verifier = await setupRecaptcha();
            const phoneNumber = `+91${formData.phoneNumber}`;

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

            console.log('[Signup] Starting OTP verification for code:', otpCode);
            const result = await window.confirmationResult.confirm(otpCode);
            const user = result?.user || auth.currentUser;
            let e164Phone = '';
            if (user?.phoneNumber) {
                e164Phone = user.phoneNumber;
            } else if (formData.phoneNumber) {
                e164Phone = `+91${formData.phoneNumber}`;
            }
            if (e164Phone) {
                localStorage.setItem('phoneNumber', e164Phone);
            }

            try {
                console.log('[Signup] Calling backend register API');
                const response = await fetch('https://www.eparivartan.co.in/gullycinema/public/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.fullName || '',
                        phone: e164Phone || null,
                        email: formData.emailId || ''
                    })
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    console.error('[Signup] Register API failed:', response.status, data);
                    throw new Error(data?.message || 'Registration failed');
                }
                const token = data?.token || data?.access_token || data?.data?.token;
                if (token) {
                    console.log('[Signup] Backend token received');
                    localStorage.setItem('token', token);
                } else {
                    console.warn('[Signup] No token field in response:', data);
                }
            } catch (apiErr) {
                console.error('[Signup] Backend register error:', apiErr);
                setError(typeof apiErr?.message === 'string' ? apiErr.message : 'Registration failed');
                return;
            }

            console.log('[Signup] Navigating to /');
            navigate('/', { replace: true });
        } catch (error) {
            console.error('OTP Verification Error:', error);
            setError('Invalid OTP. Please try again');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        verifyOtpNow();
    };

    return (
        <div className="clapkart-signup-auth-container">
            <div className="clapkart-signup-auth-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
                <img
                    src={logoText}
                    alt="CLAP KARTEL"
                    className="clapkart-signup-clap-kartel-logo"
                />
            </div>

            <div className="clapkart-signup-auth-right">
                <div className="clapkart-signup-auth-form-container">
                    <div className="clapkart-signup-logo-container">
                        <img
                            src={logo}
                            alt="Clap Kartel Logo"
                            className="clapkart-signup-form-logo"
                        />
                    </div>

                    <h2 className="clapkart-signup-auth-title">Create an Account</h2>
                    <p className="clapkart-signup-auth-subtitle">Sign up to Continue</p>

                    <div className="clapkart-signup-auth-form">
                        <div id="recaptcha-container"></div>

                        <div className="clapkart-signup-form-group">
                            <label className="clapkart-signup-form-label">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`clapkart-signup-form-input ${formErrors.fullName ? 'clapkart-signup-error' : ''}`}
                                disabled={loading || otpSent}
                            />
                            {formErrors.fullName && <span className="clapkart-signup-error-text">{formErrors.fullName}</span>}
                        </div>

                        <div className="clapkart-signup-form-group">
                            <label className="clapkart-signup-form-label">Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Enter 10-digit mobile number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={`clapkart-signup-form-input ${formErrors.phoneNumber ? 'clapkart-signup-error' : ''}`}
                                maxLength="10"
                                disabled={loading || otpSent}
                            />
                            {formErrors.phoneNumber && <span className="clapkart-signup-error-text">{formErrors.phoneNumber}</span>}
                        </div>

                        <div className="clapkart-signup-form-group">
                            <label className="clapkart-signup-form-label">Email ID</label>
                            <input
                                type="email"
                                name="emailId"
                                placeholder="Enter your email id"
                                value={formData.emailId}
                                onChange={handleChange}
                                className={`clapkart-signup-form-input ${formErrors.emailId ? 'clapkart-signup-error' : ''}`}
                                disabled={loading || otpSent}
                            />
                            {formErrors.emailId && <span className="clapkart-signup-error-text">{formErrors.emailId}</span>}
                        </div>

                        <div className="clapkart-signup-form-group">
                            <label className="clapkart-signup-form-label">Select</label>
                            <select
                                name="userType"
                                value={formData.userType}
                                onChange={handleChange}
                                className={`clapkart-signup-form-select ${formErrors.userType ? 'clapkart-signup-error' : ''}`}
                                disabled={loading || otpSent}
                            >
                                <option value="Professional / Individual">Professional / Individual</option>
                                <option value="Professional">Professional</option>
                                <option value="Individual">Individual</option>
                            </select>
                            {formErrors.userType && <span className="clapkart-signup-error-text">{formErrors.userType}</span>}
                        </div>

                        <div className="clapkart-signup-terms-group">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreeTerms}
                                onChange={(e) => {
                                    setAgreeTerms(e.target.checked);
                                    if (formErrors.terms) {
                                        setFormErrors(prev => ({ ...prev, terms: '' }));
                                    }
                                }}
                                className="clapkart-signup-terms-checkbox"
                                disabled={loading || otpSent}
                            />
                            <label htmlFor="agreeTerms" className="clapkart-signup-terms-label">
                                We value your privacy. By signing up, you agree to our{' '}
                                <span className="clapkart-signup-terms-link">Terms of Service</span> and{' '}
                                <span className="clapkart-signup-terms-link">Privacy Policy</span>.
                            </label>
                        </div>
                        {formErrors.terms && <span className="clapkart-signup-error-text clapkart-signup-terms-error">{formErrors.terms}</span>}

                        {!otpSent ? (
                            <button
                                onClick={handleSubmit}
                                className="clapkart-signup-submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Verification Code'}
                            </button>
                        ) : (
                            <>
                                <div className="clapkart-signup-form-group">
                                    <label className="clapkart-signup-form-label">Enter OTP</label>
                                    <input
                                        type="text"
                                        value={otpCode}
                                        onChange={handleOtpChange}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !loading && otpCode.length === 6) {
                                                handleVerifyOtp(e);
                                            }
                                        }}
                                        className="clapkart-signup-form-input"
                                        placeholder="Enter 6-digit OTP"
                                        maxLength="6"
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    onClick={handleVerifyOtp}
                                    className="clapkart-signup-submit-button"
                                    disabled={loading || otpCode.length !== 6}
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </>
                        )}

                        {error && (
                            <p className="clapkart-signup-error-message">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="clapkart-signup-auth-footer">
                        <span className="clapkart-signup-footer-text">Already have an account? </span>
                        <Link to="/login" className="clapkart-signup-footer-link">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;