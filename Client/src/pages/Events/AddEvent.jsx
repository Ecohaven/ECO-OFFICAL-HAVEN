import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object().shape({
  eventName: Yup.string().required('Event Name is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
  location: Yup.string().required('Location is required'),
  startDate: Yup.date().required('Start Date is required'),
  endDate: Yup.date()
    .required('End Date is required')
    .min(Yup.ref('startDate'), 'End Date must be after Start Date'),
  time: Yup.string().required('Time is required'),
  status: Yup.string().required('Status is required'),
  amount: Yup.number().required('Amount is required'),
  organiser: Yup.string().required('Organiser is required'),
  leafPoints: Yup.number()
    .required('Leaf Points is required')
    .positive('Leaf Points must be a positive number'),
  picture: Yup.mixed().required('Picture is required'),
});

const AddEventForm = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);

  const handleFileChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setFieldValue('picture', file);
    }
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleShowAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleAddEvent = async (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append('eventName', values.eventName);
    formData.append('description', values.description);
    formData.append('category', values.category);
    formData.append('location', values.location);
    formData.append('startDate', values.startDate.toISOString());
    formData.append('endDate', values.endDate.toISOString());
    formData.append('time', values.time);
    formData.append('status', values.status);
    formData.append('amount', values.amount);
    formData.append('organiser', values.organiser);
    formData.append('leafPoints', values.leafPoints);
    formData.append('picture', file);

    try {
      const response = await axios.post(
        'http://localhost:3001/api/eventcreation',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      handleShowAlert('success', response.data.message);
      window.location.href = '/eventbackend';
    } catch (error) {
      console.error('Error adding event:', error);
      handleShowAlert('error', 'Error adding event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={containerStyle}>
      <Typography variant="h4" sx={headingStyle}>
        Add Event
      </Typography>
      <Formik
        initialValues={{
          eventName: '',
          description: '',
          category: '',
          location: '',
          startDate: null,
          endDate: null,
          time: '',
          status: 'Free',
          amount: '',
          organiser: '',
          leafPoints: '',
          picture: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddEvent(values, { setSubmitting });
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  label="Event Name"
                  variant="outlined"
                  name="eventName"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  name="description"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  select
                  label="Category"
                  variant="outlined"
                  name="category"
                  fullWidth
                  required
                >
                  {['recycling', 'upcycling', 'workshop', 'garden-walk'].map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    )
                  )}
                </Field>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  label="Location"
                  variant="outlined"
                  name="location"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Field name="startDate">
                    {({ field, form }) => (
                      <DatePicker
                        disablePast
                        label="Start Date"
                        inputFormat="YYYY-MM-DD"
                        value={field.value}
                        onChange={(newValue) =>
                          form.setFieldValue(field.name, newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            fullWidth
                            required
                          />
                        )}
                      />
                    )}
                  </Field>
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Field name="endDate">
                    {({ field, form }) => (
                      <DatePicker
                        disablePast
                        label="End Date"
                        inputFormat="YYYY-MM-DD"
                        value={field.value}
                        onChange={(newValue) =>
                          form.setFieldValue(field.name, newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            fullWidth
                            required
                          />
                        )}
                      />
                    )}
                  </Field>
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  label="Time"
                  variant="outlined"
                  name="time"
                  fullWidth
                  placeholder="e.g., 10:00 AM - 12:00 PM"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  select
                  label="Status"
                  variant="outlined"
                  name="status"
                  fullWidth
                  required
                >
                  {['Free', 'Paid'].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Field>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  label="Amount"
                  variant="outlined"
                  type="number"
                  name="amount"
                  fullWidth
                  placeholder="Enter amount"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  label="Organiser"
                  variant="outlined"
                  name="organiser"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  label="Leaf Points"
                  variant="outlined"
                  type="number"
                  name="leafPoints"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  type="file"
                  name="picture"
                  onChange={(e) => handleFileChange(e, setFieldValue)}
                  style={fileInputStyle}
                />
                {preview && (
                  <Box mt={2}>
                    <img
                      src={preview}
                      alt="Event Preview"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    Add Event
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

const containerStyle = {
  maxWidth: '800px',
  width: '100%',
  margin: 'auto',
  padding: '20px',
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
};

const headingStyle = {
  marginBottom: '20px',
  textAlign: 'center',
};

const fileInputStyle = {
  display: 'block',
  marginBottom: '10px',
};

export default AddEventForm;
