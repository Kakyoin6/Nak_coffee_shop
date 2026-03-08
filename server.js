const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Basic middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// In-memory storage (for demo - replace with database in production)
let orders = [];
let contacts = [];
let menuItems = [
    { id: 1, name: 'Kenyan Espresso', price: 450, description: 'Rich, bold AA grade Kenyan coffee with wine-like acidity', category: 'coffee' },
    { id: 2, name: 'Cappuccino', price: 550, description: 'Classic Italian style with velvety microfoam art', category: 'coffee' },
    { id: 3, name: 'Latte', price: 600, description: 'Smooth espresso with creamy steamed milk', category: 'coffee' },
    { id: 4, name: 'Americano', price: 400, description: 'Kenyan espresso with hot water for a smooth taste', category: 'coffee' },
    { id: 5, name: 'Mocha', price: 650, description: 'Chocolate espresso with steamed milk and whipped cream', category: 'coffee' },
    { id: 6, name: 'Caramel Macchiato', price: 700, description: 'Vanilla, espresso, steamed milk, and caramel drizzle', category: 'coffee' },
    { id: 7, name: 'Matcha Latte', price: 750, description: 'Premium Japanese matcha with steamed milk', category: 'tea' },
    { id: 8, name: 'Hibiscus Tea', price: 350, description: 'Refreshing Kenyan hibiscus infusion, served hot or cold', category: 'tea' },
    { id: 9, name: 'Flat White', price: 580, description: 'Australian style with double ristretto and microfoam', category: 'coffee' },
    { id: 10, name: 'Turkish Coffee', price: 480, description: 'Traditional finely ground coffee with cardamom', category: 'coffee' },
    { id: 11, name: 'Cold Brew', price: 520, description: '24-hour steeped Kenyan AA coffee, served over ice', category: 'coffee' },
    { id: 12, name: 'Affogato', price: 680, description: 'Vanilla ice cream topped with hot espresso shot', category: 'dessert' }
];

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// API Routes

// Get menu items
app.get('/api/menu', (req, res) => {
    try {
        res.json({
            success: true,
            data: menuItems,
            currency: 'KES'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get menu by category
app.get('/api/menu/:category', (req, res) => {
    try {
        const category = req.params.category;
        const filteredItems = menuItems.filter(item => item.category === category);
        res.json({
            success: true,
            data: filteredItems,
            currency: 'KES'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Submit order
app.post('/api/orders', [
    body('customerName').trim().isLength({ min: 2, max: 50 }).withMessage('Customer name must be 2-50 characters'),
    body('customerEmail').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('customerPhone').matches(/^\+254\d{9}$/).withMessage('Valid Kenyan phone number required (+254XXXXXXXXX)'),
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.id').isInt({ min: 1 }).withMessage('Valid item ID required'),
    body('items.*.quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be 1-10'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Valid total amount required'),
    body('deliveryAddress').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Address must be 5-200 characters'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], validateRequest, (req, res) => {
    try {
        const order = {
            id: orders.length + 1,
            ...req.body,
            status: 'pending',
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        };

        // Validate items exist and calculate total
        let calculatedTotal = 0;
        for (const item of order.items) {
            const menuItem = menuItems.find(m => m.id === item.id);
            if (!menuItem) {
                return res.status(400).json({ success: false, message: `Invalid item ID: ${item.id}` });
            }
            calculatedTotal += menuItem.price * item.quantity;
        }

        // Verify total amount matches (allow small variations for rounding)
        if (Math.abs(calculatedTotal - order.totalAmount) > 5) {
            return res.status(400).json({ success: false, message: 'Total amount mismatch' });
        }

        orders.push(order);
        
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: {
                orderId: order.id,
                estimatedDelivery: order.estimatedDelivery,
                totalAmount: order.totalAmount,
                currency: 'KES'
            }
        });
    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get order status
app.get('/api/orders/:id', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            data: {
                id: order.id,
                status: order.status,
                createdAt: order.createdAt,
                estimatedDelivery: order.estimatedDelivery,
                totalAmount: order.totalAmount,
                currency: 'KES'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Contact form submission
app.post('/api/contact', [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').matches(/^\+254\d{9}$/).withMessage('Valid Kenyan phone number required'),
    body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters'),
    body('subject').optional().trim().isLength({ max: 100 }).withMessage('Subject must be less than 100 characters')
], validateRequest, (req, res) => {
    try {
        const contact = {
            id: contacts.length + 1,
            ...req.body,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        contacts.push(contact);
        
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: { contactId: contact.id }
        });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get shop info
app.get('/api/shop-info', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                name: 'Nakuru Coffee House',
                address: 'Moi Avenue, Nakuru CBD, Next to Nakuru Mall, Nakuru, Kenya 20100',
                phone: '+254 712 345 678',
                email: 'hello@nakurucoffee.co.ke',
                hours: {
                    weekdays: '6:00 AM - 9:00 PM',
                    weekends: '6:30 AM - 10:00 PM'
                },
                currency: 'KES',
                location: {
                    lat: -0.3031,
                    lng: 36.0695
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve static files
app.use(express.static('.'));

// Catch all handler for SPA
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: '.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
    }
    
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Nakuru Coffee House server running on port ${PORT}`);
    console.log(`📍 Server ready at http://localhost:${PORT}`);
    console.log(`☕ Serving premium Kenyan coffee from Nakuru!`);
});

module.exports = app;
