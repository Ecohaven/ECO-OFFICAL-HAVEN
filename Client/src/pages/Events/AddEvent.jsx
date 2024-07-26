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
                                onChange={(date) => form.setFieldValue(field.name, date)}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    fullWidth
                                    required
                                    error={form.touched.startDate && Boolean(form.errors.startDate)}
                                    helperText={form.touched.startDate && form.errors.startDate}
                                    sx={{ marginBottom: 2 }}
                                  />
                                )}
                              />
                            </>
                          )}
                        </Field>
                        <Field name="endDate">
                          {({ field, form }) => (
                            <>
                              <DatePicker
                                disablePast
                                label="End Date"
                                inputFormat="YYYY-MM-DD"
                                value={field.value || null}
                                onChange={(date) => form.setFieldValue(field.name, date)}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    fullWidth
                                    required
                                    error={form.touched.endDate && Boolean(form.errors.endDate)}
                                    helperText={form.touched.endDate && form.errors.endDate}
                                    sx={{ marginBottom: 2 }}
                                  />
                                )}
                              />
                            </>
                          )}
                        </Field>
                      </LocalizationProvider>
                      <Field
                        as={TextField}
                        label="Time"
                        variant="outlined"
                        type="time"
                        name="time"
                        fullWidth
                        required
                        sx={{ marginBottom: 2 }}
                        error={touched.time && Boolean(errors.time)}
                        helperText={touched.time && errors.time}
                      />
                      <Field
                        as={TextField}
                        select
                        label="Status"
                        variant="outlined"
                        name="status"
                        fullWidth
                        required
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
                      {values.status === 'Paid' && (
                        <Field
                          as={TextField}
                          label="Amount"
                          variant="outlined"
                          type="number"
                          name="amount"
                          fullWidth
                          required
                          sx={{ marginBottom: 2 }}
                          error={touched.amount && Boolean(errors.amount)}
                          helperText={touched.amount && errors.amount}
                        />
                      )}
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
              {/* Alert Component */}
              {alertOpen && (
                <Box
                  sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1200,
                  }}
                >
                  <Alert
                    severity={alertType}
                    onClose={handleCloseAlert}
                  >
                    {alertMessage}
                  </Alert>
                </Box>
              )}
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};


const containerStyle = {
  padding: '20px',
  backgroundColor:'lightgreen'
};

const bannerStyle = {
  width: '100%',
  height: 'auto',
  maxHeight: '300px',
  objectFit: 'cover',
};

const cardStyle = {
  padding: '20px',
  marginTop: '20px',
};

const paperStyle = {
  padding: '10px',
  textAlign: 'center',
};

export default AddEventForm;
