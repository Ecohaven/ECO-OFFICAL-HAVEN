import React, { useState, useEffect, useContext } from 'react';
import '../../style/rewards/redeemform.css';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FormControl, Input, Grid, Checkbox, FormControlLabel } from '@mui/material';
import { styled } from '@mui/system';
import * as Yup from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountContext from '../../contexts/AccountContext';
import axios from 'axios';

const Label = styled('label')({
    marginLeft: '100px',
    marginBottom: '-10px',
    fontSize: '16px',
    fontWeight: 'bold',
});

const StyledInput = styled(Input)({
    marginLeft: '90px',
    padding: '10px',
    marginBottom: '8px',
    width: '100%',
    '&::before': {
        content: 'none',
    },
});

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Name is required')
        .matches(/^[A-Za-z ]*$/, 'Name should only contain alphabetic characters and spaces'),
    phoneNumber: Yup.string()
        .required('Phone number is required')
        .matches(/^\d{8}$/, 'Phone number must be exactly 8 digits'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required')
        .matches(/@/, 'Email must contain "@"'),
});

function RewardForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [collectionId, setCollectionId] = useState(null); // State to store collectionId
    const [initialValues, setInitialValues] = useState({ name: '', phoneNumber: '', email: '' });
    const location = useLocation();
    const navigate = useNavigate();
    const { product } = location.state || {};
    const { account } = useContext(AccountContext); // Use context if available

    useEffect(() => {
        if (account && account.name) {
            setInitialValues({
                name: account.name,
                phoneNumber: account.phone_no,
                email: account.email
            });
        } else {
            console.error('No account data found');
            navigate('/', { replace: true });
        }
    }, [navigate, account]);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            // Post data to backend
            const response = await axios.post('http://localhost:3001/collect', {
                name: account.name,
                phoneNumber: account.phone_no,
                email: account.email,
                product: product.itemName,
            });
    
            // Retrieve collectionId from response
            const { collectionId } = response.data;
            setCollectionId(collectionId); // Set collectionId state with the received value
    
            // Store all necessary values in localStorage
            localStorage.setItem('name', values.name);
            localStorage.setItem('phoneNumber', account.phone_no);
            localStorage.setItem('email', values.email);
            localStorage.setItem('product', product.itemName);
            localStorage.setItem('collectionId', collectionId);
    
            setIsSubmitted(true); // Set state to handle submission completion
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setSubmitting(false); // Ensure setSubmitting is called regardless of success or failure
        }
    };

    useEffect(() => {
        if (isSubmitted) {
            setTimeout(() => {
                navigate('/successcollect');
            }, 400); // Redirect after submission
        }
    }, [isSubmitted, navigate]);

    return (
        <div className='rewardform'>
            {/* banner */}
            <div className="headbanner">
                <img src="../../src/assets/images/rewardbanner.png" alt="Banner" />
                <h1>Redeem Form</h1>
            </div>

            {/* back button */}
            <Grid item xs={12} className="back">
                <a href='/redemptionshop'>
                    <img src="../../src/assets/images/icons/back.png" alt="back" />
                </a>
                <p><a href='/redemptionshop'>Back to redemption shop</a></p>
            </Grid>

            {/* product details & form */}
            <h2 className='info'>Information</h2>
            <div className="form-section">
                <div className='product-details'>
                    {product && (
                        <>
                            <h2>{product.itemName}</h2>
                            <img src={`http://localhost:3001/eco/product-images/${product.itemimg}`} alt={product.itemName} className='product-image' />
                            <p><b>{product.leaves}</b> Leaves</p>
                        </>
                    )}
                </div>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize // Ensures that form updates when initialValues change
                    onSubmit={handleSubmit}
                >
                    {({ errors, isSubmitting }) => (
                        <Form>
                            <FormControl fullWidth>
                                <Label>Name <span className='asterisk'>*</span></Label>
                                <Field name="name" as={StyledInput} placeholder="Name" disabled />
                                <ErrorMessage name="name" component="div" className="error-message" />
                            </FormControl>
                            <FormControl fullWidth>
                                <Label>Phone Number <span className='asterisk'>*</span></Label>
                                <Field name="phoneNumber" as={StyledInput} placeholder="Phone number" disabled />
                                <ErrorMessage name="phoneNumber" component="div" className="error-message" />
                            </FormControl>
                            <FormControl fullWidth>
                                <Label>Email <span className='asterisk'>*</span></Label>
                                <Field name="email" as={StyledInput} placeholder="Email" disabled />
                                <ErrorMessage name="email" component="div" className="error-message" />
                            </FormControl>

                            {/* collection details */}
                            {collectionId && (
                                <div className='detail'>
                                    <h2>Please remember the collection details</h2>
                                    <p>Potong Pasir Community Club</p>
                                    <p>6 Potong Pasir Ave 2, Singapore 358361</p>
                                    <p>Monday - Friday: <span className='time'>11:00am - 8:00pm</span></p>
                                    <p>Saturday & Sunday: <span className='time'>12:00pm - 4:00pm</span></p>
                                    <p className='extra'>*please collect within a week</p>
                                    <h1>Collection ID</h1>
                                    <h1 className='idnumber'>{collectionId}</h1>
                                </div>
                            )}

                            {/* checkboxes */}
                            <FormControlLabel
                                control={<Checkbox required />}
                                label="I have read and agreed to the Privacy Policy"
                            />
                            <FormControlLabel
                                control={<Checkbox required />}
                                label="I have read and agreed to the Terms & Conditions"
                            />

                            {/* submit button */}
                            <button type="submit" className='submitbutton' disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Redeem now'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default RewardForm;
