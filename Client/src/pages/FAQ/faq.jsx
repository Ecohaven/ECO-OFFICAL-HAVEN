import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/faqs');
      setFaqs(response.data);
    } catch (error) {
      console.error('Failed to fetch FAQs', error);
    }
  };

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h4>Frequently Asked Questions</h4>
      {faqs.map((item, index) => (
        <div
          className={`faq-item ${activeIndex === index ? 'active' : ''}`}
          key={index}
          onClick={() => toggleAccordion(index)}
        >
          <div className="faq-question">
            {item.question}
          </div>
          <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
            {item.answer}
          </div>
        </div>
      ))}

      <style>
        {`
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

          .faq-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 15px;
            overflow: hidden;
            transition: all 0.3s ease-in-out;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            background-color: #f9f9f9;
          }

          .faq-question {
            background-color: #4caf50;
            color: #fff;
            padding: 15px;
            font-weight: bold;
            font-size: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background-color 0.3s;
          }

          .faq-question:hover {
            background-color: #45a049;
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

          .faq-item:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .faq-question::after {
            content: '+';
            font-size: 18px;
            transition: transform 0.3s;
          }

          .faq-item.active .faq-question::after {
            transform: rotate(45deg);
          }
        `}
      </style>
    </div>
  );
};

export default FAQ;

