// Vercel Serverless API for sixteen16 orders
import { promises as fs } from 'fs';
import path from 'path';

// Simple file-based storage (for production, use a database)
const ORDERS_FILE = '/tmp/orders.json';

// Helper function to read orders
async function readOrders() {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    return [];
  }
}

// Helper function to write orders
async function writeOrders(orders) {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
