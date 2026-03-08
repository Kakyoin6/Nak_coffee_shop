# Nakuru Coffee House - Premium Coffee Website

A secure, modern coffee shop website with backend API, located in Nakuru, Kenya. Features online ordering, contact forms, and a beautiful responsive design with animations.

## 🌟 Features

### Frontend
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Beautiful Animations**: Smooth scroll animations, floating coffee beans, parallax effects
- **Modern UI**: Clean, professional design with coffee-themed colors
- **Interactive Menu**: Dynamic menu with real coffee varieties
- **Order System**: Online ordering with quantity selection and order tracking
- **Contact Forms**: Secure contact form with validation
- **Kenyan Context**: Located in Nakuru, prices in Kenyan Shillings (Ksh)

### Backend
- **Node.js/Express API**: RESTful API with full CRUD operations
- **Security Features**:
  - CSRF Protection
  - Rate Limiting
  - Input Validation & Sanitization
  - Helmet.js for security headers
  - CORS configuration
- **Order Management**: Complete order processing system
- **Contact Form Handling**: Secure message processing
- **API Endpoints**: Well-documented REST API

### Coffee Menu
- Kenyan Espresso - Ksh 450
- Cappuccino - Ksh 550
- Latte - Ksh 600
- Americano - Ksh 400
- Mocha - Ksh 650
- Caramel Macchiato - Ksh 700
- Matcha Latte - Ksh 750
- Hibiscus Tea - Ksh 350
- Flat White - Ksh 580
- Turkish Coffee - Ksh 480
- Cold Brew - Ksh 520
- Affogato - Ksh 680

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nakuru-coffee-house
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   # Start backend server
   npm start
   
   # Or for development with auto-reload
   npm run dev
   ```

5. **Open the website**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

## 📡 API Endpoints

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:category` - Get items by category

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order status

### Contact
- `POST /api/contact` - Submit contact form

### Shop Info
- `GET /api/shop-info` - Get shop information
- `GET /api/health` - Health check

### Security
- `GET /api/csrf-token` - Get CSRF token

## 🔒 Security Features

- **CSRF Protection**: All form submissions protected with CSRF tokens
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation on all inputs
- **Security Headers**: Helmet.js provides security headers
- **CORS**: Configured for secure cross-origin requests
- **Phone Validation**: Kenyan phone number format validation
- **SQL Injection Prevention**: Parameterized queries (when using database)

## 📱 Mobile Responsive

The website is fully responsive with:
- Hamburger menu for mobile navigation
- Touch-friendly interface
- Optimized layouts for all screen sizes
- Mobile-optimized forms

## 🎨 Design Features

- **Animations**: 
  - Fade-in effects on scroll
  - Floating coffee beans
  - Parallax scrolling
  - Hover effects
- **Typography**: Google Fonts (Playfair Display + Poppins)
- **Color Scheme**: Coffee-themed browns and creams
- **Icons**: Emoji icons for universal compatibility

## 📍 Location

**Nakuru Coffee House**
- Moi Avenue, Nakuru CBD
- Next to Nakuru Mall
- Nakuru, Kenya 20100
- Phone: +254 712 345 678
- Email: hello@nakurucoffee.co.ke

## 🛠️ Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive CSS Grid & Flexbox
- CSS Animations & Transitions
- Fetch API for backend communication

### Backend
- Node.js
- Express.js
- Security middleware (Helmet, CSRF, Rate Limiting)
- Input validation (express-validator)
- CORS support

### Development
- NPM for package management
- Environment variables for configuration
- Modular code structure

## 📝 Environment Variables

Create a `.env` file with:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:8080
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🔧 Development

### Running in Development
```bash
npm run dev  # Uses nodemon for auto-reload
```

### Running Tests
```bash
npm test  # Run test suite
```

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure proper environment variables
3. Use HTTPS in production
4. Set up proper database connection
5. Configure email service

## 📄 License

MIT License - feel free to use this for your own coffee shop!

## ☕ Support

For support or questions:
- Email: hello@nakurucoffee.co.ke
- Phone: +254 712 345 678

---

**Proudly serving premium Kenyan coffee in the heart of Nakuru!**
