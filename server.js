const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// SMTP Configuration
const smtpHost = 'smtp.kelvinzanzibarcars.co.tz';  // Replace with your SMTP host
const smtpPort = 465;  // Replace with your SMTP port
const smtpUsername = 'booking@kelvinzanzibarcars.co.tz';
const smtpPassword = 'booking@kelvin';  // Replace with your email password

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: true, // true for 465, false for other ports
    auth: {
        user: smtpUsername,
        pass: smtpPassword,
    }
});

// POST request to handle car reservation
app.post('/reserve-car', (req, res) => {
    const data = req.body;

    // Validate required fields
    const requiredFields = [
        'carBrand', 
        'carModel', 
        'startDate', 
        'endDate', 
        'pickupTime',
        'dropoffTime',
        'pickupLocation', 
        'dropoffLocation', 
        'customerEmail', 
        'customerPhone'
    ];

    for (let field of requiredFields) {
        if (!data[field] || data[field] === '') {
            return res.status(400).json({ error: `Missing required field: ${field}` });
        }
    }

    // Create customer confirmation email content
    const customerSubject = "Car Reservation Confirmation - Kelvin Zanzibar Cars";
    const customerMessage = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background-color: #f4f4f4; padding: 20px; text-align: center; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Reservation Confirmation</h1>
                </div>
                <div class='content'>
                    <p>Dear Customer,</p>
                    <p>Thank you for choosing Kelvin Zanzibar Cars. Your reservation has been received with the following details:</p>
                    <p><strong>Vehicle:</strong> ${data.carBrand} ${data.carModel}</p>
                    <p><strong>Pick-up Date:</strong> ${data.startDate}</p>
                    <p><strong>Pick-up Time:</strong> ${data.pickupTime}</p>
                    <p><strong>Drop-off Date:</strong> ${data.endDate}</p>
                    <p><strong>Drop-off Time:</strong> ${data.dropoffTime}</p>
                    <p><strong>Pick-up Location:</strong> ${data.pickupLocation}</p>
                    <p><strong>Drop-off Location:</strong> ${data.dropoffLocation}</p>
                    <p>We will review your reservation and contact you shortly to confirm the details.</p>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <p>Best regards,<br>Kelvin Zanzibar Cars Team</p>
                </div>
                <div class='footer'>
                    <p>Kelvin Zanzibar Cars<br>
                    Phone: +255 712 682 981<br>
                    Email: info@kelvinzanzibarcars.co.tz<br>
                    Website: www.kelvinzanzibarcars.co.tz</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Create admin notification email content
    const adminSubject = `New Car Reservation - ${data.carBrand} ${data.carModel}`;
    const adminMessage = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .details { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>New Reservation Details</h1>
                </div>
                <div class='content'>
                    <div class='details'>
                        <h2>Reservation Information:</h2>
                        <p><strong>Vehicle:</strong> ${data.carBrand} ${data.carModel}</p>
                        <p><strong>Pick-up Date:</strong> ${data.startDate}</p>
                        <p><strong>Pick-up Time:</strong> ${data.pickupTime}</p>
                        <p><strong>Drop-off Date:</strong> ${data.endDate}</p>
                        <p><strong>Drop-off Time:</strong> ${data.dropoffTime}</p>
                        <p><strong>Pick-up Location:</strong> ${data.pickupLocation}</p>
                        <p><strong>Drop-off Location:</strong> ${data.dropoffLocation}</p>
                    </div>
                    
                    <div class='details'>
                        <h2>Customer Information:</h2>
                        <p><strong>Email:</strong> ${data.customerEmail}</p>
                        <p><strong>Phone:</strong> ${data.customerPhone}</p>
                    </div>
                    
                    <p>Please review and confirm this reservation as soon as possible.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Send confirmation email to customer
    const mailOptionsCustomer = {
        from: smtpUsername,
        to: data.customerEmail,
        subject: customerSubject,
        html: customerMessage,
    };

    // Send notification email to admin
    const mailOptionsAdmin = {
        from: smtpUsername,
        to: 'info@kelvinzanzibarcars.co.tz',
        subject: adminSubject,
        html: adminMessage,
    };

    // Send emails
    Promise.all([
        transporter.sendMail(mailOptionsCustomer),
        transporter.sendMail(mailOptionsAdmin),
    ])
    .then(() => {
        res.status(200).json({ 
            success: true, 
            message: 'Reservation confirmation emails sent successfully' 
        });
    })
    .catch((error) => {
        console.error('Email sending failed:', error);
        res.status(500).json({ 
            error: 'Failed to send reservation emails',
            details: error.message 
        });
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});
