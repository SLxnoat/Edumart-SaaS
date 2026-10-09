import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link');
      setLoading(false);
      navigate('/login');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify/${token}`, {
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        setSuccess('Email verified successfully! You can now log in to your account.');
        setVerified(true);

        // Redirect to login after showing success message for a moment
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Verifying Email</h2>
            <p>Please wait while we verify your email address...</p>
          </div>
          <div className="verify-content">
            <div className="verify-icon">🔄</div>
            <p className="verify-text">Verifying your email address...</p>
            <div className="verify-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Email Verified</h2>
            <p>Your email address has been successfully verified</p>
          </div>
          <div className="verify-content">
            <div className="verify-icon">✅</div>
            <p className="verify-text">{success}</p>
            <div className="verify-actions">
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
              <Link to="/" className="btn btn-outline">
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Email Verification</h2>
          <p>Verify your email address to activate your account</p>
        </div>

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="verify-content">
          <div className="verify-icon">📧</div>
          <p className="verify-text">
            We&apos;ve sent a verification link to your email. Please check your inbox and click the link to verify your account.
          </p>
          {!loading && !error && !success && (
            <div className="verify-actions">
              <button
                className="btn btn-outline"
                onClick={() => navigate('/')}
              >
                Go to Home
              </button>
            </div>
          )}
        </div>

        <div className="auth-links">
          <p>
            Didn&apos;t receive the email? <Link to="/resend-verification">Resend verification email</Link>
          </p>
          <p>
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;