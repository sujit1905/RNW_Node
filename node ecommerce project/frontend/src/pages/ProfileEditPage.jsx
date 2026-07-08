import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiLock,
  FiCamera,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight
} from 'react-icons/fi';

export default function ProfileEditPage() {
  const { user, isLoggedIn, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOtp, setModalOtp] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalConfirmPassword, setModalConfirmPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isLoggedIn) return <Navigate to="/login?redirect=/profile/edit" replace />;

  const resetModalState = () => {
    setModalOtp('');
    setModalPassword('');
    setModalConfirmPassword('');
    setModalError('');
    setModalSuccess('');
    setOtpSent(false);
    setCountdown(0);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file.');
      return;
    }

    if (file.size > 800 * 1024) {
      setProfileError('Image too large. Maximum size is 800 KB.');
      return;
    }

    setProfileError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setProfileError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setProfileLoading(true);
      const payload = {
        name,
        phone: phone ? phone.replace(/\D/g, '') : '',
        profileImage,
      };

      await updateProfile(payload);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[@$!%*?&#]/.test(password),
  };

  const modalPasswordChecks = {
    minLength: modalPassword.length >= 8,
    hasUpper: /[A-Z]/.test(modalPassword),
    hasLower: /[a-z]/.test(modalPassword),
    hasDigit: /[0-9]/.test(modalPassword),
    hasSpecial: /[@$!%*?&#]/.test(modalPassword),
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    const isGoogleOnly = user?.isGoogleUser;
    if (!isGoogleOnly && !oldPassword) {
      setPasswordError('Current password is required to change password.');
      return;
    }

    if (!password) {
      setPasswordError('New password is required.');
      return;
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      setPasswordError('Password does not meet the difficulty requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const payload = {
        name,
        phone: phone ? phone.replace(/\D/g, '') : '',
        profileImage,
        password,
      };
      if (!isGoogleOnly) {
        payload.oldPassword = oldPassword;
      }

      await updateProfile(payload);
      setPasswordSuccess(true);
      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setModalError('');
    setModalSuccess('');
    try {
      setModalLoading(true);
      const data = await apiRequest('/auth/forgot-password-otp', {
        method: 'POST',
        body: JSON.stringify({ email: user?.email }),
      });
      setOtpSent(true);
      setCountdown(60);
      setModalSuccess(data.message || 'OTP sent successfully.');
    } catch (err) {
      setModalError(err.message || 'Failed to send OTP.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalResetSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (modalPassword !== modalConfirmPassword) {
      setModalError('Passwords do not match.');
      return;
    }

    if (!Object.values(modalPasswordChecks).every(Boolean)) {
      setModalError('Password does not meet strength requirements.');
      return;
    }

    try {
      setModalLoading(true);
      const data = await apiRequest('/auth/reset-password-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: user?.email,
          otp: modalOtp,
          password: modalPassword,
        }),
      });
      setModalSuccess(data.message || 'Password reset successful!');
      setTimeout(() => {
        setIsModalOpen(false);
        resetModalState();
        setPasswordSuccess(true);
        setTimeout(() => setPasswordSuccess(false), 4000);
      }, 2000);
    } catch (err) {
      setModalError(err.message || 'Failed to reset password.');
    } finally {
      setModalLoading(false);
    }
  };

  const renderStrengthIndicator = (pwd, checks) => {
    if (!pwd) return null;
    const items = [
      { label: 'At least 8 characters', met: checks.minLength },
      { label: 'One uppercase letter (A-Z)', met: checks.hasUpper },
      { label: 'One lowercase letter (a-z)', met: checks.hasLower },
      { label: 'One digit (0-9)', met: checks.hasDigit },
      { label: 'One special character (@$!%*?&#)', met: checks.hasSpecial },
    ];

    return (
      <div className="bg-velura-50 border border-velura-200 rounded-xl p-3 mt-2 flex flex-col gap-1.5">
        <span className="text-xs font-bold text-ink-700 mb-1">
          Password Requirements:
        </span>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs" style={{ color: item.met ? '#059669' : 'var(--color-velura-500)' }}>
            {item.met ? (
              <FiCheckCircle size={14} className="text-success shrink-0" />
            ) : (
              <FiAlertCircle size={14} className="text-velura-300 shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const initial = (name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-velura-50">
      <div className="container-main py-8 sm:py-12 lg:py-16">
        
        {/* Back Link */}
        <div className="mb-6 flex items-center gap-2 text-xs text-velura-400">
          <Link to="/" className="hover:text-ink-900 transition-colors">Home</Link>
          <FiChevronRight size={11} />
          <Link to="/dashboard" className="hover:text-ink-900 transition-colors">My Account</Link>
          <FiChevronRight size={11} />
          <span className="text-ink-600 font-medium">Edit Profile</span>
        </div>

        <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              Edit Profile
            </h1>
            <p className="text-xs text-velura-400 mt-1">Update your personal details, profile picture and passwords</p>
          </div>

          {/* Profile Details Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-6 bg-white border border-velura-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            {profileError && (
              <div className="rounded-xl border border-danger-light bg-danger-light px-4 py-3 text-xs text-danger flex items-center gap-2">
                <FiAlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="rounded-xl border border-success-light bg-success-light px-4 py-3 text-xs text-success flex items-center gap-2">
                <FiCheckCircle size={16} />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            {/* Avatar Row */}
            <div className="flex items-center gap-5 flex-wrap">
              <div className="relative w-20 h-20 shrink-0">
                <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-velura-100 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, var(--color-gold-400), var(--color-gold-600))" }}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initial
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-ink-900 text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-gold-500 transition-colors cursor-pointer">
                  <FiCamera size={12} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <div>
                <h3 className="font-bold text-ink-900 text-sm mb-1" style={{ fontFamily: "var(--font-display)" }}>Profile Picture</h3>
                <p className="text-xs text-velura-400 mb-2">Upload square JPG, PNG, or WebP. Max 800 KB.</p>
                {profileImage && (
                  <button type="button" onClick={handleRemoveImage} className="text-xs font-semibold text-danger flex items-center gap-1 hover:underline">
                    <FiTrash2 size={12} /> Remove
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-velura-50">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-velura pl-10"
                    placeholder="E.g. Sujit Mewada"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-velura pl-10 bg-velura-100 text-velura-400 cursor-not-allowed border-velura-200"
                  />
                </div>
                <span className="text-[10px] text-velura-300 mt-1 block">Email address cannot be changed.</span>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input-velura pl-10"
                    placeholder="10-digit number"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary text-xs py-3.5 px-6 disabled:opacity-50"
            >
              {profileLoading ? 'Saving Profile...' : 'Save Profile details'}
            </button>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-6 bg-white border border-velura-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            {passwordError && (
              <div className="rounded-xl border border-danger-light bg-danger-light px-4 py-3 text-xs text-danger flex items-center gap-2">
                <FiAlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="rounded-xl border border-success-light bg-success-light px-4 py-3 text-xs text-success flex items-center gap-2">
                <FiCheckCircle size={16} />
                <span>Password changed successfully!</span>
              </div>
            )}

            <div>
              <h2 className="font-bold text-ink-900 text-base" style={{ fontFamily: "var(--font-display)" }}>Change Password</h2>
              <p className="text-xs text-velura-400 mt-0.5">Keep your account secure by rotating your password</p>
            </div>

            <div className="space-y-4">
              {/* Current Password */}
              {!user?.isGoogleUser && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">Current Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      className="input-velura pl-10"
                      placeholder="Current password"
                      autoComplete="current-password"
                    />
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-velura pl-10"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                {renderStrengthIndicator(password, passwordChecks)}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="input-velura pl-10"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs font-semibold text-gold-600 hover:text-gold-700 underline"
                >
                  Forgot Password? Reset via OTP
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading || !password || password !== confirmPassword || !Object.values(passwordChecks).every(Boolean)}
              className="btn-primary text-xs py-3.5 px-6 disabled:opacity-50"
            >
              {passwordLoading ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" style={{ backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl border border-velura-100 max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-velura-100 flex items-center justify-between">
              <h3 className="font-bold text-ink-900 text-sm sm:text-base" style={{ fontFamily: "var(--font-display)" }}>Reset Password</h3>
              <button onClick={() => { setIsModalOpen(false); resetModalState(); }} className="text-velura-400 hover:text-ink-900 text-xl font-light">&times;</button>
            </div>

            <form onSubmit={handleModalResetSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="rounded-xl border border-danger-light bg-danger-light px-4 py-2.5 text-xs text-danger">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="rounded-xl border border-success-light bg-success-light px-4 py-2.5 text-xs text-success">
                  {modalSuccess}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1">Email Address</label>
                <input type="email" value={user?.email || ''} disabled className="input-velura bg-velura-100 text-velura-400 cursor-not-allowed border-velura-200" />
              </div>

              {otpSent ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1">Verification OTP</label>
                    <input type="text" value={modalOtp} onChange={e => setModalOtp(e.target.value)} placeholder="6-digit OTP code" className="input-velura" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1">New Password</label>
                    <input type="password" value={modalPassword} onChange={e => setModalPassword(e.target.value)} placeholder="At least 8 characters" className="input-velura" required />
                    {renderStrengthIndicator(modalPassword, modalPasswordChecks)}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1">Confirm Password</label>
                    <input type="password" value={modalConfirmPassword} onChange={e => setModalConfirmPassword(e.target.value)} placeholder="Confirm password" className="input-velura" required />
                  </div>
                  <button type="submit" disabled={modalLoading} className="btn-primary w-full py-3.5 text-xs">
                    {modalLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-velura-500 leading-relaxed">We will send a one-time verification password code to your registered email address.</p>
                  <button type="button" onClick={handleSendOtp} disabled={modalLoading} className="btn-primary w-full py-3.5 text-xs">
                    {modalLoading ? 'Sending...' : 'Send Verification OTP'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
