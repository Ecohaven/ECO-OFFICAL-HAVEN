const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const yup = require('yup');

require('dotenv').config();

// email to confirm subscription
router.post('/subscription', async (req, res) => {
    let validationSchema = yup.object({
        email: yup.string().email().required()
    });
    try {
        await validationSchema.validate(req.body); // Validate the request body

        // Send email to confirm subscription
        const email = req.body.email;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EcoHaven Subscription Confirmation',
            html: 
            `
                <html>
                <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f4f4f9; margin: 0; padding: 0;">
                <div style="max-width: 700px; margin: auto; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="text-align: center; color: #4CAF50;">Eco<span style="color: #333;">Haven</span></h1>
                    <h2 style="text-align: center; color: #333;">Subscription Confirmation</h2>
                    <p style="text-align: center; color: #333;">Thank you for subscribing to EcoHaven! You will now receive our latest updates and promotions.</p>
                </div>
                </body>
                </html>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({ message: 'Email sent' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;