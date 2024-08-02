import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState('');
  const [reviewToEdit, setReviewToEdit] = useState(null);

  const fetchReviews = async () => {
  try {
    const response = await axios.get('http://localhost:3001/review'); // Ensure the correct endpoint
    console.log('Fetched reviews:', response.data); // Debugging: Check the data structure
    setReviews(response.data);
  } catch (err) {
    console.error('Error fetching reviews:', err);
  }
};

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  const review = { title, content, rating };

  try {
    if (reviewToEdit) {
      await axios.put(`http://localhost:3001/review/${reviewToEdit.id}`, review);
      console.log('Updated review:', reviewToEdit.id); // Debugging
    } else {
      const response = await axios.post('http://localhost:3001/review/reviews', review);
      console.log('Posted review:', response.data); // Debugging
    }
    fetchReviews();
    setTitle('');
    setContent('');
    setRating('');
    setReviewToEdit(null);
  } catch (err) {
    console.error('Error posting review:', err);
  }
};

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/review/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const handleEdit = (review) => {
    setTitle(review.title);
    setContent(review.content);
    setRating(review.rating);
    setReviewToEdit(review);
  };

 const styles = {
  reviewPage: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '10px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
  },
  titleInput: { // Specific style for title input
    border: '2px solid black',
  },
  button: {
    padding: '10px 15px',
    marginRight: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  reviewList: {
    listStyleType: 'none',
    padding: '0',
  },
  reviewItem: {
    border: '1px solid #ddd',
    padding: '10px',
    marginBottom: '10px',
  },
  editButton: {
    padding: '5px 10px',
    marginRight: '5px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  editButtonHover: {
    backgroundColor: '#218838',
  },
  deleteButtonHover: {
    backgroundColor: '#c82333',
  },
};

  return (
    <div style={styles.reviewPage}>
      <h1>Reviews</h1>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2>{reviewToEdit ? 'Edit Review' : 'Create Review'}</h2>
        <div style={styles.formGroup}>
          <label style={styles.label}>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Rating:</label>
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
            min="1"
            max="5"
            style={styles.input}
          />
        </div>
        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor)}
        >
          {reviewToEdit ? 'Update' : 'Submit'}
        </button>
      </form>
      <div className="review-list">
        <h2>All Reviews</h2>
        {Array.isArray(reviews) ? (
          <ul style={styles.reviewList}>
            {reviews.map((review) => (
              <li key={review.id} style={styles.reviewItem}>
                <h3>{review.title}</h3>
                <p>{review.content}</p>
                <p>Rating: {review.rating}</p>
                <button
                  onClick={() => handleEdit(review)}
                  style={styles.editButton}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.editButtonHover.backgroundColor)}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = styles.editButton.backgroundColor)}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  style={styles.deleteButton}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.deleteButtonHover.backgroundColor)}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = styles.deleteButton.backgroundColor)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews available.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
