import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FAQBackend = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFaq, setCurrentFaq] = useState({ question: '', answer: '' });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/faqs');
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentFaq({ ...currentFaq, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`http://localhost:3001/api/faqs/${currentFaq.id}`, currentFaq);
      } else {
        await axios.post('http://localhost:3001/api/faqs', currentFaq);
      }
      setIsEditing(false);
      setCurrentFaq({ question: '', answer: '' });
      fetchFAQs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleEdit = (index) => {
    setCurrentFaq(faqs[index]);
    setActiveIndex(index);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/faqs/${id}`);
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h4>Frequently Asked Questions</h4>
      {faqs.map((item, index) => (
        <div className="faq-wrapper" key={index}>
          <div className="faq-header">
            <div className="faq-question" onClick={() => toggleAccordion(index)}>
              {item.question}
            </div>
            <div className="faq-actions">
              <button
                className="edit-btn"
                onClick={(e) => { e.stopPropagation(); handleEdit(index); }}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
              >
                Delete
              </button>
            </div>
          </div>
          <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
            {item.answer}
          </div>
        </div>
      ))}

      <div className="faq-form">
        <h4>{isEditing ? 'Edit FAQ' : 'Add FAQ'}</h4>
        <div className="form-group">
          <label htmlFor="question">Question</label>
          <input
            type="text"
            id="question"
            name="question"
            value={currentFaq.question}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="answer">Answer</label>
          <textarea
            id="answer"
            name="answer"
            value={currentFaq.answer}
            onChange={handleChange}
          />
        </div>
        <button className={isEditing ? 'update-btn' : 'add-btn'} onClick={handleSave}>
          {isEditing ? 'Update' : 'Add'}
        </button>
      </div>

      <style jsx>{`
        .faq-container {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .faq-container h4 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
          font-size: 28px;
        }

        .faq-wrapper {
          margin-bottom: 15px;
        }

        .faq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background-color: green;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease-in-out;
        }

        .faq-header:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .faq-question {
          font-weight: bold;
          font-size: 18px;
          color: white;
          flex: 1;
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          padding: 0 15px;
          background-color: #fff;
          color: #666;
          font-size: 16px;
          line-height: 1.5;
          transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
        }

        .faq-answer.active {
          max-height: 200px; /* Adjust based on content */
          padding: 15px;
        }

        .faq-actions {
          display: flex;
          gap: 10px;
          margin-left: 10px;
        }

        .faq-actions button {
          border: none;
          border-radius: 4px;
          padding: 8px 15px;
          cursor: pointer;
          transition: background-color 0.3s;
          color: white;
          font-size: 14px;
          font-weight: bold;
        }

        .edit-btn {
          background-color: #4caf50;
        }

        .edit-btn:hover {
          background-color: #45a049;
        }

        .delete-btn {
          background-color: red;
        }

        .delete-btn:hover {
          background-color: #2c6b2f;
        }

        .faq-form {
          margin-top: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .faq-form h4 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
          font-size: 24px;
        }

        .faq-form .form-group {
          margin-bottom: 15px;
        }

        .faq-form .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .faq-form .form-group input,
        .faq-form .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          box-sizing: border-box; /* Ensure padding doesn't affect width */
        }

        .faq-form button {
          display: block;
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
          color: white;
          font-size: 16px;
          font-weight: bold;
        }

        .add-btn {
          background-color: #4caf50;
        }

        .add-btn:hover {
          background-color: #45a049;
        }

        .update-btn {
          background-color: #388e3c;
        }

        .update-btn:hover {
          background-color: #2c6b2f;
        }
      `}</style>
    </div>
  );
};

export default FAQBackend;
