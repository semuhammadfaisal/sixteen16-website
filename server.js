const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Store orders in memory (in a real app, use a database)
let orders = [];

// API endpoint to handle form submission
app.post('/api/orders', (req, res) => {
    try {
        const order = req.body;
        order.id = Date.now().toString();
        order.status = 'Received';
        order.timestamp = new Date().toISOString();
        
        // Store the order
        orders.push(order);
        
        console.log('New order received:', order);
        
        res.status(201).json({
            success: true,
            message: 'Order received successfully!',
            orderId: order.id
        });
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process order'
        });
    }
});

// API endpoint to get all orders (for admin view)
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// Serve the main HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'order.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
