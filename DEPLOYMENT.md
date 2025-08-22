# sixteen16 Website Deployment Guide

## Backend Architecture

This website now includes a proper serverless backend using Vercel's API routes.

### API Endpoints

1. **POST /api/orders** - Submit new order
2. **GET /api/orders** - Get all orders (admin)
3. **GET /api/test** - Test API connectivity

### File Structure
```
sixteen16-web-f/
├── api/
│   ├── orders.js      # Main orders API
│   └── test.js        # Test endpoint
├── index.html         # Main website
├── admin.html         # Admin dashboard
├── package.json       # Dependencies
├── vercel.json        # Vercel configuration
└── DEPLOYMENT.md      # This file
```

## Deployment Steps

### 1. Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from your project directory
```bash
cd "C:\Users\AGC\Downloads\sixteen16-web-f"
vercel
```

### 4. Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → sixteen16-website (or your choice)
- **Directory?** → ./ (current directory)
- **Override settings?** → No

### 5. Your site will be deployed!
Vercel will provide URLs like:
- **Production**: https://sixteen16-website.vercel.app
- **Admin**: https://sixteen16-website.vercel.app/admin.html
- **API Test**: https://sixteen16-website.vercel.app/api/test

## Testing the Backend

### 1. Test API connectivity:
Visit: `https://your-site.vercel.app/api/test`

Should return:
```json
{
  "success": true,
  "message": "sixteen16 API is working!",
  "timestamp": "2025-01-23T...",
  "environment": "production"
}
```

### 2. Test order submission:
1. Go to your website
2. Fill out the order form
3. Submit order
4. Check admin panel for the order

### 3. Test admin panel:
Visit: `https://your-site.vercel.app/admin.html`

## Features

### Order Management
- ✅ **Proper API**: Real backend with validation
- ✅ **Data Persistence**: Orders stored in temporary files
- ✅ **Error Handling**: Proper error messages
- ✅ **Admin Dashboard**: View all orders
- ✅ **Order Validation**: Phone number and required field validation

### Security
- ✅ **CORS Enabled**: Cross-origin requests allowed
- ✅ **Input Validation**: Server-side validation
- ✅ **Error Handling**: Safe error responses
- ✅ **Pakistani Phone Validation**: Proper phone format checking

## Upgrading to Database (Optional)

For production use, consider upgrading to a database:

### Option 1: Vercel KV (Redis)
```bash
npm install @vercel/kv
```

### Option 2: PlanetScale (MySQL)
```bash
npm install @planetscale/database
```

### Option 3: Supabase (PostgreSQL)
```bash
npm install @supabase/supabase-js
```

## Environment Variables

For production, you may want to add:
- `ADMIN_PASSWORD` - Protect admin panel
- `WEBHOOK_URL` - Send order notifications
- `DATABASE_URL` - Database connection

Add these in Vercel dashboard under Settings → Environment Variables.

## Support

If you encounter issues:
1. Check Vercel function logs
2. Test API endpoints directly
3. Verify CORS settings
4. Check browser console for errors

## Next Steps

1. **Deploy to Vercel** using the steps above
2. **Test thoroughly** on the live site
3. **Monitor orders** through admin panel
4. **Consider database upgrade** for production scale
