# WOODORA Full-Stack Furniture Store — expanded edition

## Included features
- Editorial responsive furniture storefront with premium visual styling
- Hero background video with poster image fallback
- Floating bubble decoration, ticker strip, smooth anchor scrolling
- Scroll progress indicator and scroll-triggered reveal animations
- Image-led category tiles: living room, bedroom and dining
- Product catalogue with photos, ratings, prices and sale prices
- Category filtering: Sofas, Beds, Tables, Chairs and Storage
- Product search and sorting (featured, price, rating, name)
- Working slide-out cart: add, quantity change, remove, cart count and subtotal
- Newsletter signup saved by the backend
- Story, values, journal, contact and footer sections
- Express REST API and JSON persistence

## Run locally
Requires Node.js 18+.

```bash
npm install
npm start
```
Open http://localhost:3000.

Do not open `public/index.html` directly or use Live Server. The frontend calls the Express API, so use the Node server.

## API
- GET `/api/health`
- GET `/api/products?category=Sofas&search=cloud&sort=price-low`
- GET `/api/cart`
- POST `/api/cart` with `{ "productId": "p1" }`
- PATCH `/api/cart/:productId` with `{ "quantity": 2 }` (0 removes)
- DELETE `/api/cart/:productId`
- POST `/api/newsletter` with `{ "email": "you@example.com" }`
- POST `/api/contact` with `{ "name": "Name", "email": "you@example.com", "message": "Hello there..." }`

## Before publishing
This is a learning/demo storefront. Cart/newsletter data is stored in a local JSON file and is not separated by customer account. The checkout button is a demo and does not collect payment. For production, add MongoDB, authentication, order management, server-side validation, secure payment-provider integration, privacy/terms pages and deployment configuration. Images, video and fonts are loaded from external providers and need internet access; verify their licensing and replace sample business details before launch.
