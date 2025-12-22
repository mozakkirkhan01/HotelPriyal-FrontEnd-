# 🏨 Multi-Hotel Management System

A comprehensive web application for managing multiple hotels with separate staff access, bookings, billing, and expense tracking.

## ✨ Features

### 🏢 Multi-Hotel Management
- Manage multiple hotels from a single centralized platform
- Hotel-wise data segregation and access control
- Individual hotel configurations and settings

### 👥 Role-Based Access Control
- **Admin Panel**: Full system access across all hotels
- **Hotel Manager**: Hotel-specific management access
- **Staff**: Limited access based on assigned hotel and role

### 📋 Master Data Management
- Room types and pricing configuration
- Staff details and role assignments
- Hotel amenities and facilities
- Rate plans and seasonal pricing

### 🛎️ Booking System
- Real-time room availability checking
- Guest information management
- Booking creation and modifications
- Booking history and search functionality
- Status tracking (Confirmed, Check-in, Check-out, Cancelled)

### 💰 Billing Module
- Automated bill generation from bookings
- Multiple payment methods support
- Invoice generation and printing
- Billing history and reports
- Tax calculation and management

### 📊 Expense Management
- Track hotel-wise expenses
- Expense categories (Utilities, Maintenance, Supplies, etc.)
- Vendor management
- Monthly expense reports and analytics

### 📈 Analytics & Reports
- Occupancy rates and trends
- Revenue analytics
- Expense tracking
- Staff performance metrics
- Custom date range reports

<!-- ## 🚀 Technology Stack

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5 / Tailwind CSS
- Chart.js for analytics visualization

### Backend
- Node.js with Express / PHP / Python (specify your choice)
- RESTful API architecture
- JWT-based authentication

### Database
- MySQL / PostgreSQL
- Redis for caching (optional) -->

## 📦 Installation

<!-- ### Prerequisites
- Node.js v14+ (or PHP 7.4+ / Python 3.8+)
- MySQL 8.0+ / PostgreSQL 12+
- npm or yarn -->

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/Priyal/hotel-management-system.git
cd hotel-management-system
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. **Run database migrations**
```bash
npm run migrate
# or
php artisan migrate
```

5. **Seed initial data (optional)**
```bash
npm run seed
```

6. **Start the development server**
```bash
npm run dev
# or
php artisan serve
```

7. **Access the application**
```
http://localhost:3000
```

## 🗄️ Database Schema

### Main Tables
- `hotels` - Hotel information
- `users` - System users (admin, managers, staff)
- `rooms` - Room inventory
- `bookings` - Booking records
- `billing` - Bills and invoices
- `expenses` - Expense records
- `guests` - Guest information

## 🔐 Default Login Credentials

**Admin Account**
- Email: admin
- Password: admin123





## 🎯 Usage

### For Admins
1. Login to the admin panel
2. Add hotels and configure settings
3. Create staff accounts for each hotel
4. Monitor overall system performance

### For Hotel Managers
1. Login with hotel-specific credentials
2. Manage bookings and room availability
3. Generate bills and track payments
4. Record and monitor expenses

### For Staff
1. Login with assigned credentials
2. Create new bookings
3. Check-in/Check-out guests
4. Generate bills



## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "Booking"
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Priyal**
- GitHub: [@Priyal](https://github.com/Priyal)
<!-- - Email: priyal@pathlogics.com -->
<!-- 
## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by modern hotel management needs
- Built with ❤️ for the hospitality industry -->

<!-- ## 📞 Support

For support, email support@yourhotel.com or join our Slack channel.

--- -->

⭐ Star this repo if you find it helpful!

**Made with ❤️ for Hotel Management**