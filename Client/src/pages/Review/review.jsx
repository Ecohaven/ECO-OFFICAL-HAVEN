import React, { useState } from 'react';
import axios from 'axios';

const ReviewPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [event, setEvent] = useState('');
  const [rating, setRating] = useState(0); // Initialize as 0
  const [reviewDescription, setReviewDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const review = { firstName, lastName, email, event, rating, reviewDescription };

    try {
      await axios.post('http://localhost:3001/review/reviews', review);
      resetForm();
    } catch (err) {
      console.error('Error posting review:', err);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setEvent('');
    setRating(0);
    setReviewDescription('');
  };

  const styles = {
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      marginTop: '30px',
      marginBottom: '50px',
      padding: '30px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      backgroundColor: '#fff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      borderRadius: '10px',
    },
    logoText: {
      fontSize: '28px',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#2c3e50',
      marginBottom: '20px',
      letterSpacing: '1px',
    },
    greenText: {
      color: '#27ae60',
    },
    title: {
      fontSize: '24px',
      marginBottom: '20px',
      textAlign: 'center',
      color: '#2c3e50',
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: '18px',
      marginBottom: '15px',
      color: '#2c3e50',
      fontWeight: '500',
    },
    formGroup: {
      marginBottom: '25px',
    },
    label: {
      display: 'block',
      marginBottom: '10px',
      fontWeight: '600',
      color: '#34495e',
      fontSize: '15px',
    },
    input: {
      width: '100%',
      padding: '14px',
      borderRadius: '8px',
      border: '1px solid #dcdde1',
      fontSize: '16px',
      color: '#2c3e50',
      backgroundColor: '#ecf0f1',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s, background-color 0.3s',
    },
    inputFocus: {
      borderColor: '#27ae60',
      backgroundColor: '#fff',
    },
    textarea: {
      width: '100%',
      padding: '14px',
      borderRadius: '8px',
      border: '1px solid #dcdde1',
      minHeight: '100px',
      fontSize: '16px',
      color: '#2c3e50',
      backgroundColor: '#ecf0f1',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s, background-color 0.3s',
    },
    rating: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px',
      gap: '10px',
    },
    starLabel: {
      fontSize: '32px',
      color: '#dcdde1',
      cursor: 'pointer',
      transition: 'transform 0.2s, color 0.3s',
    },
    starLabelActive: {
      color: '#f1c40f',
    },
    starInput: {
      display: 'none',
    },
    submitButton: {
      padding: '10px 0',
      backgroundColor: '#27ae60',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      width: '100%',
      maxWidth: '200px',
      fontSize: '16px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      transition: 'background-color 0.3s, box-shadow 0.3s',
      boxSizing: 'border-box',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      margin: '0 auto',
      display: 'block',
    },
    submitButtonHover: {
      backgroundColor: '#2ecc71',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    },
  };

  return (
    <div style={styles.container}>
      <p style={styles.logoText}>
        <span style={styles.greenText}>Eco</span>Haven
      </p>
      <h2 style={styles.title}>Leave a Review</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="first-name" style={styles.label}>
            First Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
            onBlur={(e) => (e.target.style.borderColor = '#dcdde1')}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="last-name" style={styles.label}>
            Last Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
            onBlur={(e) => (e.target.style.borderColor = '#dcdde1')}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>
            Email <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
            onBlur={(e) => (e.target.style.borderColor = '#dcdde1')}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="event" style={styles.label}>
            Event <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="event"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            required
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
            onBlur={(e) => (e.target.style.borderColor = '#dcdde1')}
          />
        </div>

        <hr />

        <h2 style={styles.sectionTitle}>Share Your Experience</h2>
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>How would you rate us?</p>
        <div style={styles.rating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              style={{
                ...styles.starLabel,
                ...(rating >= star ? styles.starLabelActive : {}),
              }}
              htmlFor={`star${star}`}
            >
              ★
              <input
                type="radio"
                id={`star${star}`}
                name="rating"
                value={star}
                checked={rating === star}
                onChange={() => setRating(star)}
                style={styles.starInput}
              />
            </label>
          ))}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="review-description" style={styles.label}>
            Review <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            id="review-description"
            value={reviewDescription}
            onChange={(e) => setReviewDescription(e.target.value)}
            required
            style={styles.textarea}
            onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
            onBlur={(e) => (e.target.style.borderColor = '#dcdde1')}
          ></textarea>
        </div>

        <button
          type="submit"
          style={styles.submitButton}
          onMouseOver={(e) => (e.target.style.backgroundColor = styles.submitButtonHover.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = styles.submitButton.backgroundColor)}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ReviewPage;
