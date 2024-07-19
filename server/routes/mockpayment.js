module.exports.processPayment = async (paymentData) => {
    const { amount, email, phoneNumber, homeAddress, postalCode, paymentMethod, cardNumber, expiryDate, cvv, currency } = paymentData;

    console.log('Processing payment with the following data:', paymentData);

    // Simulate a delay for payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Basic validation to simulate input checks
    if (!cardNumber || cardNumber.length < 12 || cardNumber.length > 19) {
        return {
            success: false,
            message: 'Invalid card number',
            currency: currency || 'SGD'
        };
    }

    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        return {
            success: false,
            message: 'Invalid expiry date',
            currency: currency || 'SGD'
        };
    }

    if (!cvv || cvv.length < 3 || cvv.length > 4) {
        return {
            success: false,
            message: 'Invalid CVV',
            currency: currency || 'SGD'
        };
    }

    // Simulate random payment failures
    if (Math.random() < 0.1) {  // 10% chance of failure
        return {
            success: false,
            message: 'Payment processing failed due to network error',
            currency: currency || 'SGD'
        };
    }

    // Simulate a successful payment response
    return {
        success: true,
        message: 'Payment processed successfully',
        currency: currency || 'SGD'
    };
};