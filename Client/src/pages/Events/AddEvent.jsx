import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  FormHelperText,
  Breadcrumbs,
  Link
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Formik, Form, Field } from 'formik';
import axios from 'axios';

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

  const validateForm = (values) => {
    const errors = {};
    if (!values.eventName) errors.eventName = 'Event Name is required';
    if (!values.description) errors.description = 'Description is required';
    if (!values.category) errors.category = 'Category is required';
    if (!values.location) errors.location = 'Location is required';
    if (!values.startDate) errors.startDate = 'Start Date is required';
    if (!values.endDate) {
      errors.endDate = 'End Date is required';
    } else if (values.endDate < values.startDate) {
      errors.endDate = 'End Date must be after Start Date';
    }
    if (!values.time) errors.time = 'Time is required';
    if (!values.organiser) errors.organiser = 'Organiser is required';
    if (values.status === 'Paid' && !values.amount) {
      errors.amount = 'Amount is required';
    }
    if (!values.leafPoints) {
      errors.leafPoints = 'Leaf Points is required';
    } else if (values.leafPoints <= 0) {
      errors.leafPoints = 'Leaf Points must be a positive number';
    }
    if (!values.picture) errors.picture = 'Picture is required';
    return errors;
  };

  const handleAddEvent = async (values, { setSubmitting, setErrors }) => {
    const formData = new FormData();
    formData.append('eventName', values.eventName);
    formData.append('description', values.description);
    formData.append('category', values.category);
    formData.append('location', values.location);
    formData.append('startDate', values.startDate ? values.startDate.toISOString() : '');
    formData.append('endDate', values.endDate ? values.endDate.toISOString() : '');
    formData.append('time', values.time);
    formData.append('status', values.status);
    formData.append('amount', values.status === 'Free' ? 0 : values.amount);
    formData.append('organiser', values.organiser);
    formData.append('leafPoints', values.leafPoints);
    formData.append('picture', file);

    const errors = validateForm(values);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setSubmitting(false);
      return;
    }

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
      window.location.href = '/staff/eventbackend';
    } catch (error) {
      console.error('Error adding event:', error);
      handleShowAlert('error', 'Error adding event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={containerStyle}>
      <img src="../src/assets/images/backendBanner.jpg" alt="Event Banner" style={bannerStyle} />
<Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '20px' }}>
        <Link underline="hover" color="inherit" href="/staff/eventbackend">
          EventBackend
        </Link>
<Typography color="textPrimary" fontWeight={'bold'}>Add Event</Typography>
      </Breadcrumbs>
      <Formik
        initialValues={{
          eventName: '',
          description: '',
          category: '',
          location: '',
          startDate: '',
          endDate: '',
          time: '',
          status: '',
          amount: '',
          organiser: '',
          leafPoints: '',
          picture: '',
        }}
        onSubmit={(values, { setSubmitting, setErrors }) => {
          handleAddEvent(values, { setSubmitting, setErrors });
        }}
      >
        {({ isSubmitting, setFieldValue, errors, touched, values }) => {
          useEffect(() => {
            if (values.status === 'Free') {
              setFieldValue('amount', 0);
            }
          }, [values.status, setFieldValue]);

          return (
            <Form>
              <Card sx={cardStyle}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={3} sx={paperStyle}>
                        {preview && (
                          <Box mt={2}>
                            <img
                              src={preview}
                              alt="Event Preview"
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                                maxHeight: '600px',
                              }}
                            />
                          </Box>
                        )}
                        <Button
                          variant="contained"
                          component="label"
                          fullWidth
                          sx={{ marginTop: 2 }}
                        >
                          Upload Picture
                          <input
                            accept="image/*"
                            type="file"
                            name="picture"
                            onChange={(e) => handleFileChange(e, setFieldValue)}
                            hidden
                          />
                        </Button>
                        {errors.picture && touched.picture && (
                          <FormHelperText error>{errors.picture}</FormHelperText>
                        )}
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Field
                        as={TextField}
                        label="Event Name"
                        variant="outlined"
                        name="eventName"
                        fullWidth
                        required
                        InputLabelProps={{ sx: labelStyle }}
                        sx={{ marginBottom: 2 }}
                        error={touched.eventName && Boolean(errors.eventName)}
                        helperText={touched.eventName && errors.eventName}
                      />
                      <Field
                        as={TextField}
                        label="Description"
                        variant="outlined"
                        multiline
                        rows={4}
                        name="description"
                        fullWidth
                        required
                        InputLabelProps={{ sx: labelStyle }}
                        sx={{ marginBottom: 2 }}
                        error={touched.description && Boolean(errors.description)}
                        helperText={touched.description && errors.description}
                      />
                      <Field
                        as={TextField}
                        select
                        label="Category"
                        variant="outlined"
                        name="category"
                        fullWidth
                        required
                        InputLabelProps={{ sx: labelStyle }}
                        sx={{ marginBottom: 2 }}
                        error={touched.category && Boolean(errors.category)}
                        helperText={touched.category && errors.category}
                      >
                        {['recycling', 'upcycling', 'workshop', 'garden-walk'].map(
                          (option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          )
                        )}
                      </Field>
                      <Field
                        as={TextField}
                        label="Leaf Points"
                        variant="outlined"
                        type="number"
                        name="leafPoints"
                        fullWidth
                        required
                        InputLabelProps={{ sx: labelStyle }}
                        sx={{ marginBottom: 2 }}
                        error={touched.leafPoints && Boolean(errors.leafPoints)}
                        helperText={touched.leafPoints && errors.leafPoints}
                      />
                      <Field
                        as={TextField}
                        label="Organiser"
                        variant="outlined"
                        name="organiser"
                        fullWidth
                        required
                        InputLabelProps={{ sx: labelStyle }}
                        sx={{ marginBottom: 2 }}
                        error={touched.organiser && Boolean(errors.organiser)}
                        helperText={touched.organiser && errors.organiser}
                      />
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Field name="startDate">
                          {({ field, form }) => (
                            <>
                              <DatePicker
                                disablePast
                                label="Start Date"
                                inputFormat="YYYY-MM-DD"
                                value={field.value || null}
                                onChange={(newValue) =>
                                  form.setFieldValue(field.name, newValue)
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    fullWidth
                                    required
                                    InputLabelProps={{ sx: labelStyle }}
                                    sx={{ marginBottom: 2, marginTop: 2 }}
                                    error={touched.startDate && Boolean(errors.startDate)}
                                    helperText={touched.startDate && errors.startDate}
                                  />
                                )}
                              />
                              {touched.startDate && errors.startDate && (
                                <FormHelperText error>{errors.startDate}</FormHelperText>
                              )}
                            </>
                          )}
                        </Field>
                      </LocalizationProvider>

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Field name="endDate">
                          {({ field, form }) => (
                            <>
                              <DatePicker
                                disablePast
                                label="End Date"
                                inputFormat="YYYY-MM-DD"
                                value={field.value || null}
                                onChange={(newValue) =>
                                  form.setFieldValue(field.name, newValue)
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    fullWidth
                                    required
                                    InputLabelProps={{ sx: labelStyle }}
                                    sx={{ marginBottom: 4 }}
                                    error={touched.endDate && Boolean(errors.endDate)}
                                    helperText={touched.endDate && errors.endDate}
                                  />
                                )}
                              />
                              {touched.endDate && errors.endDate && (
                                <FormHelperText error>{errors.endDate}</FormHelperText>
                              )}
                            </>
                          )}
                        </Field>
                      </LocalizationProvider>

                      <Field
                        as={TextField}
                        label="Time"
                        variant="outlined"
                        name="time"
                        fullWidth
                        required
                        InputLabelProps={{ sx: labelStyle }}
                        sx={{ marginTop:2,marginBottom: 2 }}
                        error={touched.time && Boolean(errors.time)}
                        helperText={touched.time && errors.time}
                      />

                      <Field
                        as={TextField}
                        select
                        label="Type"
                        variant="outlined"
                        name="status"
                        fullWidth
                        required
                        InputLabelProps={{ sx: labelStyle }}
                        sx={{ marginBottom: 2 }}
                        error={touched.status && Boolean(errors.status)}
                        helperText={touched.status && errors.status}
                      >
                        {['Free', 'Paid'].map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Field>

                      <Field
                        as={TextField}
                        label="Amount"
                        variant="outlined"
                        type="number"
                        name="amount"
                        fullWidth
                        disabled={values.status === 'Free'}
                        required={values.status === 'Paid'}
                        InputLabelProps={{ sx: labelStyle }}
                        sx={{ marginBottom: 2 }}
                        error={touched.amount && Boolean(errors.amount)}
                        helperText={touched.amount && errors.amount}
                      />

                      <Field
                        as={TextField}
                        label="Location"
                        variant="outlined"
                        name="location"
                        fullWidth
                        required 
                          InputLabelProps={{ sx: labelStyle }}
                        sx={{ marginBottom: 2,'& .MuiInputBase-input': { color: 'black' } }}
                        error={touched.location && Boolean(errors.location)}
                        helperText={touched.location && errors.location}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Add Event'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Form>
          );
        }}
      </Formik>
      {alertOpen && (
        <CustomAlert
          type={alertType}
          message={alertMessage}
          onClose={handleCloseAlert}
        />
      )}
    </Box>
  );
};

export default AddEventForm;

// Styles
const labelStyle = {
  '&.MuiInputLabel-root': {
    color: 'black',
    '&.Mui-required::after': {
  content:'none', // Add the asterisk
     color: 'red',
    },
    
  },
};

const containerStyle = {
  padding: '2rem',
  maxWidth: '100%',
  margin: '0 auto',
  backgroundColor: '#99ffcc',
  minHeight: '100vh',
};

const bannerStyle = {
  width: '100%',
  maxWidth: '1330px', 
  height: 'auto',
  maxHeight: '300px', 
  objectFit: 'cover',
  borderRadius: '8px',
  marginBottom: '30px',
  '@media (max-width: 1200px)': {
    maxWidth: '1000px',
  },
  '@media (max-width: 900px)': {
    maxWidth: '700px',
    maxHeight: '250px', 
  },
  '@media (max-width: 600px)': {
    maxWidth: '100%',
    maxHeight: '200px', 
  },
};


const headingStyle = {
  textAlign: 'center',
  marginBottom: '3rem',
  marginTop: '2rem',
color:'black',
fontWeight:'bold',
fontSize:'40px'
};

const cardStyle = {
  maxWidth: '100%',
  margin: '0 auto',
  borderRadius: '8px',
};

const paperStyle = {
  padding: '1rem',
  borderRadius: '8px',
  textAlign: 'center',
};

const alertContainerStyle = {
  position: 'fixed',
  top: '10%',
  right: '5%',
  zIndex: 9999,
  width: '100%',
  maxWidth: '400px',
};

const CustomAlert = ({ type, message, onClose }) => {
  const alertStyle = {
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: type === 'success' ? '#4caf50' : '#f44336',
    color: 'white',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
  };


  return (
    <Box sx={alertContainerStyle}>
      <Paper elevation={3} sx={alertStyle}>
        <Typography variant="body1">{message}</Typography>
        <Button variant="contained" onClick={onClose} sx={{ marginTop: '0.5rem' }}>
          Close
        </Button>
      </Paper>
    </Box>
  );
};
