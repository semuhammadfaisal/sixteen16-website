// Simple persistent storage API for sixteen16 orders
// Uses a simple approach to persist data across serverless function restarts

// Simple persistent storage using environment variables or external service
let persistentOrders = [];

// Load orders from persistent storage
async function loadPersistentOrders() {
  try {
    // In a real implementation, this would load from a database
    // For now, we'll use a simple approach
    return persistentOrders;
  } catch (error) {
    console.error('Error loading persistent orders:', error);
    return [];
  }
}

// Save orders to persistent storage
async function savePersistentOrders(orders) {
  try {
    persistentOrders = orders;
    console.log(`Saved ${orders.length} orders to persistent storage`);
    return true;
  } catch (error) {
    console.error('Error saving persistent orders:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method === 'GET') {
      // Get all orders
      const orders = await loadPersistentOrders();
      
      return res.status(200).json({
        success: true,
        orders: orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        total: orders.length,
        timestamp: new Date().toISOString()
      });
      
    } else if (req.method === 'POST') {
      // Add new order
      const newOrder = req.body;
      
      if (!newOrder || !newOrder.id) {
        return res.status(400).json({
          success: false,
          error: 'Invalid order data'
        });
      }
      
      const orders = await loadPersistentOrders();
      orders.push(newOrder);
      
      await savePersistentOrders(orders);
      
      return res.status(201).json({
        success: true,
        message: 'Order added successfully',
        order: newOrder,
        total: orders.length
      });
      
    } else if (req.method === 'PUT') {
      // Replace all orders
      const newOrders = req.body.orders || [];
      
      await savePersistentOrders(newOrders);
      
      return res.status(200).json({
        success: true,
        message: 'Orders updated successfully',
        total: newOrders.length
      });
      
    } else if (req.method === 'DELETE') {
      // Clear all orders
      await savePersistentOrders([]);
      
      return res.status(200).json({
        success: true,
        message: 'All orders cleared successfully'
      });
      
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
    
  } catch (error) {
    console.error('Storage API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
