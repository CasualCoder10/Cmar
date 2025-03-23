CodeMarket - Buy and Sell Code
CodeMarket is a platform where developers can buy and sell code snippets, components, and full applications. This marketplace connects code creators with developers looking for ready-made solutions to accelerate their projects.
Features
User Authentication: Secure JWT-based authentication system
Code Listings: Browse, search, and filter code listings by category and tags
Secure Payments: Integrated with Razorpay for secure payment processing
Download Management: Secure download links for purchased code
Seller Dashboard: Track sales and manage listings
Reviews and Ratings: Leave feedback on purchased code
Tech Stack
Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express.js
Database: MongoDB
Authentication: JWT (JSON Web Tokens)
Payment Processing: Razorpay
File Storage: Local storage (can be configured for cloud storage)
Getting Started
Prerequisites
Node.js (v14 or higher)
MongoDB (local or Atlas)
Razorpay account for payment processing
Installation
Clone the repository:
2. Install backend dependencies:
Configure environment variables:
Create a .env file in the server directory
Add the following variables:
Start the server:
5. Open the client:
Navigate to the client directory
Open index.html in your browser or use a local server
Project Structure
API Endpoints
Authentication
POST /api/auth/register - Register a new user
POST /api/auth/login - Login and get JWT token
GET /api/auth/me - Get current user info
Listings
GET /api/listings - Get all listings
GET /api/listings/:id - Get a specific listing
POST /api/listings - Create a new listing (authenticated)
PUT /api/listings/:id - Update a listing (seller only)
DELETE /api/listings/:id - Delete a listing (seller only)
Payments
POST /api/payments/create-order - Create a Razorpay order
POST /api/payments/verify - Verify a Razorpay payment
Purchases
GET /api/purchases/my-purchases - Get user's purchases
GET /api/purchases/download/:token - Download purchased file
Frontend Pages
Home: Browse featured listings
Search Results: View filtered listings
Listing Details: View code details and purchase
User Account: Manage profile and purchases
Seller Dashboard: Manage listings and view sales
Payment Flow
User clicks "Buy Now" on a listing
Frontend creates a Razorpay order via API
Razorpay payment modal opens
User completes payment
5. Frontend verifies payment with backend
Backend creates purchase record and download link
User receives download link
Security Features
Passwords are hashed using bcrypt
JWT authentication for protected routes
Payment verification using Razorpay signatures
Secure download links with expiration
Deployment
Backend
Set up a MongoDB Atlas cluster
Deploy the Node.js backend to a service like Heroku, Render, or DigitalOcean
Configure environment variables on the hosting platform
Frontend
Deploy the static HTML/CSS/JS to a service like Netlify, Vercel, or GitHub Pages
Update the API_URL in the frontend code to point to your deployed backend
Contributing
1. Fork the repository
Create a feature branch: git checkout -b feature-name
Commit your changes: git commit -m 'Add some feature'
Push to the branch: git push origin feature-name
Submit a pull request
License
This project is licensed under the MIT License - see the LICENSE file for details.
Acknowledgments
Express.js
MongoDB
Razorpay
JWT
---
Created with ❤️ by CasualCoders
