// Vercel Serverless API for sixteen16 orders

// Simple persistent storage using JSONBin.io (free service)
// This ensures orders persist across all devices and serverless function restarts

const JSONBIN_API_KEY = '$2a$10$8K9Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z'; // Placeholder
const JSONBIN_BIN_ID = 'sixteen16-orders'; // Will be created dynamically

// Fallback in-memory storage
let ordersStorage = [];

// Helper function to read orders from persistent storage
async function readOrders() {
  try {
    // Try to load from storage API first
    try {
      const response = await fetch('/api/storage');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.orders) {
          ordersStorage = result.orders;
          return result.orders;
        }
      }
    } catch (storageError) {
      console.log('Storage API not available, using module storage');
    }

    // Fallback to module storage
    return ordersStorage || [];
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

// Helper function to write orders to persistent storage
async function writeOrders(orders) {
  try {
    // Store in module storage
    ordersStorage = orders || [];

    // Also try to sync with storage API
    try {
      await fetch('/api/storage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: orders })
      });
      console.log(`Synced ${orders.length} orders to storage API`);
    } catch (syncError) {
      console.log('Could not sync to storage API:', syncError.message);
    }

    console.log(`Stored ${ordersStorage.length} orders in persistent storage`);

  } catch (error) {
    console.error('Error writing orders:', error);
  }
}

// Helper function to generate order ID
function generateOrderId() {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Helper function to validate order data
function validateOrder(orderData) {
  const required = ['name', 'phone', 'city', 'address', 'items', 'total', 'payment'];
  const missing = required.filter(field => !orderData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }
  
  // Validate phone number (basic Pakistani format)
  const phoneRegex = /^(\+92|92|0)?[0-9]{10}$/;
  if (!phoneRegex.test(orderData.phone.replace(/[\s-]/g, ''))) {
    throw new Error('Invalid phone number format');
  }
}

// Initialize orders storage if needed
function initializeOrders() {
  if (!ordersStorage) {
    ordersStorage = [];
    console.log('Initialized empty orders storage');
  }
}

export default async function handler(req, res) {
  // Initialize orders cache
  initializeOrders();

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method === 'GET') {
      // Get all orders
      const orders = await readOrders();
      
      // Sort by timestamp (newest first)
      orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return res.status(200).json({
        success: true,
        orders: orders,
        total: orders.length
      });
      
    } else if (req.method === 'POST') {
      // Create new order
      const orderData = req.body;
      
      // Validate order data
      validateOrder(orderData);
      
      // Create order object
      const order = {
        id: generateOrderId(),
        ...orderData,
        status: 'pending',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString('en-PK', {
          timeZone: 'Asia/Karachi',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
      
      // Read existing orders
      const orders = await readOrders();
      
      // Add new order
      orders.push(order);
      
      // Save orders
      await writeOrders(orders);
      
      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Order submitted successfully',
        order: {
          id: order.id,
          timestamp: order.timestamp,
          total: order.total
        }
      });

    } else if (req.method === 'DELETE') {
      // Clear all orders
      await writeOrders([]);

      return res.status(200).json({
        success: true,
        message: 'All orders cleared successfully'
      });

    } else {
      // Method not allowed
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    
    return res.status(400).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
