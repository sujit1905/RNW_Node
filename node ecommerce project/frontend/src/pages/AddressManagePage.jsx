import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight
} from 'react-icons/fi';

export default function AddressManagePage() {
  const { user, isLoggedIn, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.shippingAddress) {
      const sa = user.shippingAddress;
      setName(sa.name || '');
      setPhone(sa.phone || '');
      setAddress(sa.address || '');
      setCity(sa.city || '');
      setStateVal(sa.state || '');
      setPincode(sa.pincode || '');
    } else if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  if (!isLoggedIn) return <Navigate to="/login?redirect=/profile/address" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim()) return setError('Name is required.');
    if (!phone.trim()) return setError('Phone number is required.');
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      return setError('Please enter a valid 10-digit mobile number.');
    }
    if (!address.trim()) return setError('Address is required.');
    if (!city.trim()) return setError('City is required.');
    if (!stateVal.trim()) return setError('State is required.');
    if (!pincode.trim()) return setError('Pincode is required.');
    if (!/^\d{6}$/.test(pincode.replace(/\D/g, ''))) {
      return setError('Please enter a valid 6-digit pincode.');
    }

    try {
      setLoading(true);
      const payload = {
        shippingAddress: {
          name: name.trim(),
          phone: phone.replace(/\D/g, ''),
          address: address.trim(),
          city: city.trim(),
          state: stateVal.trim(),
          pincode: pincode.replace(/\D/g, ''),
        }
      };

      await updateProfile(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-velura-50">
      <div className="container-main py-8 sm:py-12 lg:py-16">
        
        {/* Back Link */}
        <div className="mb-6 flex items-center gap-2 text-xs text-velura-400">
          <Link to="/" className="hover:text-ink-900 transition-colors">Home</Link>
          <FiChevronRight size={11} />
          <Link to="/dashboard" className="hover:text-ink-900 transition-colors">My Account</Link>
          <FiChevronRight size={11} />
          <span className="text-ink-600 font-medium">Manage Address</span>
        </div>

        <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              Manage Address
            </h1>
            <p className="text-xs text-velura-400 mt-1">Configure your default shipping details for seamless checkout</p>
          </div>

          {error && (
            <div className="rounded-xl border border-danger-light bg-danger-light px-4 py-3 text-xs text-danger flex items-center gap-2">
              <FiAlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-success-light bg-success-light px-4 py-3 text-xs text-success flex items-center gap-2">
              <FiCheckCircle size={16} />
              <span>Shipping address saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-velura-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-velura-50">
              <FiMapPin className="text-gold-500" size={18} />
              <h2 className="font-bold text-ink-900 text-sm sm:text-base" style={{ fontFamily: "var(--font-display)" }}>
                Shipping Address Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* Recipient Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">Recipient Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-velura pl-10"
                    placeholder="Recipient's full name"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">Contact Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input-velura pl-10"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
              </div>

              {/* Address / House / Street */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">Street Address</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={3}
                  className="input-velura"
                  placeholder="Flat/House No., Building, Street Name, Area"
                  required
                />
              </div>

              {/* 3-Column: City, State, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* City */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="input-velura"
                    placeholder="City"
                    required
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">State</label>
                  <input
                    type="text"
                    value={stateVal}
                    onChange={e => setStateVal(e.target.value)}
                    className="input-velura"
                    placeholder="State"
                    required
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="input-velura"
                    placeholder="6-digit PIN"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-3.5 px-6 disabled:opacity-50"
            >
              {loading ? 'Saving Address…' : 'Save Address'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
