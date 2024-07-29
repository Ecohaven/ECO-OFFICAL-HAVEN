import React, { useState } from 'react';
import axios from 'axios';
import DropdownCheckbox from '../../../components/DropdownCheckbox'; // Import the DropdownCheckbox component
import '../../style/volunteer.css';

const interestOptions = [
  'Environmental Conservation',
  'Community Service',
  'Health and Wellness',
  'Nature Walks',
  'Gardening'
];

const InputField = ({ type, name, placeholder, value, onChange, error, min, label }) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input 
      type={type} 
      id={name} 
      name={name} 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange} 
      className={`form-input ${error ? 'input-error' : ''}`}
      required
      min={min} // Set the min attribute if provided
    />
    {error && <p className="error">{error}</p>}
  </div>
);

const VolunteerForm = ({ onSubmit = () => {} }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    availabilityDate: '',  
    interests: [] // Interests should be an array
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{8}$/;

    if (!nameRegex.test(formData.firstName)) errors.firstName = 'First name must contain only letters.';
    if (!nameRegex.test(formData.lastName)) errors.lastName = 'Last name must contain only letters.';
    if (!emailRegex.test(formData.email)) errors.email = 'Invalid email format.';
    if (!phoneRegex.test(formData.phone)) errors.phone = 'Phone must be exactly 8 digits.';
    if (formData.interests.length === 0) errors.interests = 'Please select at least one interest.';
    if (!formData.availabilityDate) errors.availabilityDate = 'Please select an availability date.';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/volunteer/', {
        ...formData,
        interest: formData.interests.join(', ') // Join interests into a single string
      });
      onSubmit(response.data);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', availabilityDate: '', interests: [''] });
    } catch (error) {
      console.error('Error creating volunteer:', error);
      setError('Error creating volunteer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '', availabilityDate: '', interests: [''] });
    setValidationErrors({});
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="headbanner">
        <img src="../../src/assets/images/volunteerbanner.png" alt="Banner" />
        <h1>Volunteer with us!</h1>
      </div>
      <h2 style={{ textAlign: 'center', marginTop: '-20px' }}>Volunteer Form</h2>
      <form onSubmit={handleSubmit} className="volunteer-form">
        <InputField 
          type="text" 
          name="firstName" 
          placeholder="First Name" 
          value={formData.firstName} 
          onChange={(e) => handleChange('firstName', e.target.value)} 
          error={validationErrors.firstName}
          label="First Name"
        />
        <InputField 
          type="text" 
          name="lastName" 
          placeholder="Last Name" 
          value={formData.lastName} 
          onChange={(e) => handleChange('lastName', e.target.value)} 
          error={validationErrors.lastName}
          label="Last Name"
        />
        <InputField 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={(e) => handleChange('email', e.target.value)} 
          error={validationErrors.email}
          label="Email"
        />
        <InputField 
          type="text" 
          name="phone" 
          placeholder="Phone (8 digits)" 
          value={formData.phone} 
          onChange={(e) => handleChange('phone', e.target.value)} 
          error={validationErrors.phone}
          label="Phone"
        />
        <InputField 
          type="date" 
          name="availabilityDate" 
          value={formData.availabilityDate} 
          onChange={(e) => handleChange('availabilityDate', e.target.value)} 
          error={validationErrors.availabilityDate}
          min={today} // Set the min attribute to today's date
          label="Availability Date"
        />
        <DropdownCheckbox 
          label="Select Your Interests" 
          options={interestOptions}
          selectedOptions={formData.interests}
          onChange={(selectedInterests) => handleChange('interests', selectedInterests)}
          error={validationErrors.interests}
        />

        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Volunteer'}
          </button>
          <button type="button" onClick={handleClear}>Clear</button>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <div className="loading">Processing...</div>}
      </form>
    </div>
  );
};

export default VolunteerForm;
