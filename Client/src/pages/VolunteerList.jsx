import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './CSSItems.css';

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [editVolunteer, setEditVolunteer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: ''
  });

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/volunteer/getvolunteer');
        console.log(response.data);
        setVolunteers(response.data);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      }
    };
    fetchVolunteers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/volunteer/deletevolunteer/${id}`);
      setVolunteers(volunteers.filter(volunteer => volunteer.id !== id));
    } catch (error) {
      console.error('Error deleting volunteer:', error);
    }
  };

  const handleEdit = (volunteer) => {
    setEditVolunteer(volunteer);
    setFormData({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      interest: volunteer.interest
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3001/volunteer/${editVolunteer.id}`, formData);
      setVolunteers(volunteers.map(volunteer => volunteer.id === editVolunteer.id ? response.data : volunteer));
      setEditVolunteer(null); // Clear edit state
      setFormData({ name: '', email: '', phone: '', interest: '' }); // Clear form
    } catch (error) {
      console.error('Error updating volunteer:', error);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'right' }}>Volunteer List</h2>
      {volunteers.length === 0 ? (
        <p>No volunteers found.</p>
      ) : (
        <ul>
          {volunteers.map(volunteer => (
            <li key={volunteer.id}>
              {volunteer.name} - {volunteer.email} - {volunteer.phone} - {volunteer.interest}
              <button onClick={() => handleEdit(volunteer)}>Edit</button>
              <button onClick={() => handleDelete(volunteer.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      
      {editVolunteer && (
        <form onSubmit={handleUpdate}>
          <h3>Update Volunteer</h3>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          <input type="text" name="interest" placeholder="Interest" value={formData.interest} onChange={(e) => setFormData({ ...formData, interest: e.target.value })} />
          <button type="submit">Update Volunteer</button>
        </form>
      )}
    </div>
  );
};

export default VolunteerList;
