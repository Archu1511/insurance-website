import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/auth/reset-password/${token}`, { password });
      setSuccess(true);
      toast.success('Password reset successful! You can now sign in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Set New Password</h1>
        <p className="subtitle">Enter a strong new password for your account.</p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: '#2e7d32', fontWeight: 500, marginBottom: '16px' }}>
              ✅ Your password has been reset successfully!
            </p>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>
              Redirecting you to login in a moment…
            </p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        {!success && (
          <p className="auth-footer">
            Remembered your password? <Link to="/login">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;