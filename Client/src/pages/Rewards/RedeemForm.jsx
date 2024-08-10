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
    marginLeft: '10px',
    marginBottom: '-10px',
    fontSize: '16px',
    fontWeight: 'bold',
});

const StyledInput = styled(Input)({
    marginLeft: '10px',
    padding: '10px',
    marginBottom: '8px',
    width: '90%',
    '&::before': {
        content: 'none',
    },
    '& .MuiInputBase-input': {
        color: 'black', 
        '&.Mui-disabled': {
            opacity: 1,
            '-webkit-text-fill-color': 'black',
        },
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
    const [initialValues, setInitialValues] = useState({ name: '', phoneNumber: '', email: '' });
    const location = useLocation();
    const navigate = useNavigate();
    const { product } = location.state || {};
    const { account } = useContext(AccountContext);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
            // Redeem product
            await axios.post('http://localhost:3001/eco/redeem', {
                accountId: account.id,
                email: account.email,
                phoneNumber: account.phone_no,
                productName: product.itemName
            });

            // Fetch latest collectionId
            const response = await axios.get('http://localhost:3001/collect/collectionIds');
            const latestCollectionId = response.data[response.data.length - 1]?.collectionId;

            if (latestCollectionId) {
                // Send confirmation email
                await axios.post('http://localhost:3001/collect/send-email', {
                    email: account.email,
                    collectionId: latestCollectionId,
                    itemName: product.itemName,
                    itemImage: `http://localhost:3001/eco/product-images/${product.itemimg}`
                });
            }

            // Store user and product information
            localStorage.setItem('name', values.name);
            localStorage.setItem('phoneNumber', account.phone_no);
            localStorage.setItem('email', values.email);
            localStorage.setItem('product', product.itemName);

            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (isSubmitted) {
            setTimeout(() => {
                navigate('/successcollect');
            }, 400);
        }
    }, [isSubmitted, navigate]);

    const remainingLeaves = account.leaf_points - product.leaves;

    return (
        <div className='rewardform'>
            {/* banner */}
            <div className="rewardbanner">
                <img src="../../src/assets/images/redeemformbanner.png" alt="Banner" />
            </div>

            {/* back button */}
            <Grid item xs={12} className="back">
                <a href='/redemptionshop'>
                    <img src="../../src/assets/images/icons/back.png" alt="back" />
                </a>
                <p><a href='/redemptionshop'>Back to redemption shop</a></p>
            </Grid>

            {/* product details & form */}
            <div className="form-section">
                <div className='productdetails'>
                    {product && (
                        <>
                            <h2>{product.itemName}</h2>
                            <img src={`http://localhost:3001/eco/product-images/${product.itemimg}`} alt={product.itemName} className='product-image' />
                            <p><b>{product.leaves}</b> 🍃</p>
                            <div className='leaves-info'>
                                <p><b>Total Leaves:</b> {account.leaf_points} 🍃</p>
                                <p><b>Leaves After Redemption:</b> {remainingLeaves} 🍃</p>
                            </div>
                        </>
                    )}
                </div>
                <div className='form-fields'>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        enableReinitialize
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
                                <div className='collection-detail'>
                                    <h2>Please remember the collection details</h2>
                                    <p>Potong Pasir Community Club</p>
                                    <p>6 Potong Pasir Ave 2, Singapore 358361</p>
                                    <p>Monday - Friday: <span className='time'>11:00am - 8:00pm</span></p>
                                    <p>Saturday & Sunday: <span className='time'>12:00pm - 4:00pm</span></p>
                                    <p className='extra'>*please collect within a week</p>
                                </div>

                                {/* checkboxes */}
                                <div className="checkboxes-container" style={{ marginLeft: '-100px' }}>
                                    <FormControlLabel style={{ marginLeft: '-50px' }}
                                        control={<Checkbox required />}
                                        label="I have read and agreed to the Privacy Policy"
                                    />
                                    <FormControlLabel style={{ marginLeft: '-13px' }}
                                        control={<Checkbox required />}
                                        label="I have read and agreed to the Terms & Conditions"
                                    />
                                </div>

                                {/* submit button */}
                                <button type="submit" className='submitbutton' disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Redeem now'}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}

export default RewardForm;