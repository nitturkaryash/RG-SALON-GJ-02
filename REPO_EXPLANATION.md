# 📘 Repository Explanation - RG-SALON-GJ-02

## 🎯 Overview

**RG-SALON-GJ-02** is a comprehensive, enterprise-grade **Salon Management System** built as a modern web application. It's designed to help salon businesses manage their entire operations including appointments, inventory, point-of-sale (POS), client management, staff scheduling, and business analytics.

This is a **Single Page Application (SPA)** built with React, TypeScript, and Material-UI, using Supabase as the backend database and authentication service.

---

## 🏗️ Architecture

### **Technology Stack**

#### **Frontend Framework**
- **React 18.2.0** - Modern React with hooks and concurrent features
- **TypeScript 5.8.3** - Type-safe development with strict checking
- **Vite 5.0.8** - Lightning-fast build tool and development server
- **React Router DOM 6.30.1** - Client-side routing

#### **UI & Styling**
- **Material-UI (MUI) 5.11.12** - Comprehensive React component library
- **@mui/icons-material** - Material Design icons
- **Tailwind CSS 3.4.4** - Utility-first CSS framework
- **DaisyUI 5.0.9** - Tailwind CSS component library
- **Framer Motion 11.0.3** - Animation library
- **Emotion** - CSS-in-JS styling solution

#### **State Management & Data Fetching**
- **React Query (@tanstack/react-query 5.17.19)** - Server state management
- **React Context API** - Global state management for holidays, themes, etc.
- **Local Storage** - Offline data persistence

#### **Backend & Database**
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
- **Express.js 4.21.2** - API server (server.js)

#### **Additional Libraries**
- **date-fns** - Date manipulation
- **FullCalendar** - Calendar and scheduling UI
- **Chart.js / Recharts** - Data visualization
- **ExcelJS / jsPDF** - Export functionality
- **React Toastify** - Notifications
- **UUID** - Unique identifier generation

---

## 📂 Project Structure

```
RG-SALON-GJ-02/
├── src/                          # Main application source code
│   ├── app/                      # App initialization and routing
│   ├── components/               # Reusable React components
│   │   ├── calendar-styles.css  # Calendar styling
│   │   ├── charts/              # Chart components
│   │   ├── common/              # Common UI components
│   │   ├── dashboard/           # Dashboard-specific components
│   │   ├── forms/               # Form components
│   │   ├── inventory/           # Inventory management UI
│   │   ├── membership/          # Membership system UI
│   │   ├── modals/              # Modal dialogs
│   │   ├── navigation/          # Navigation components
│   │   ├── products/            # Product management UI
│   │   ├── stylists/            # Staff management UI
│   │   ├── ui/                  # Base UI components
│   │   └── whatsapp/            # WhatsApp integration UI
│   ├── contexts/                # React Context providers
│   ├── hooks/                   # Custom React hooks
│   │   ├── appointments/        # Appointment management hooks
│   │   ├── inventory/           # Inventory hooks
│   │   ├── products/            # Product and service hooks
│   │   └── ...                  # Other custom hooks
│   ├── lib/                     # Core libraries
│   │   └── supabase.ts         # Supabase client configuration
│   ├── models/                  # TypeScript type definitions
│   │   ├── orderTypes.ts
│   │   ├── serviceTypes.ts
│   │   ├── productTypes.ts
│   │   ├── inventoryTypes.ts
│   │   └── ...
│   ├── pages/                   # Main application pages
│   │   ├── Dashboard.tsx        # Analytics dashboard
│   │   ├── POS.tsx              # Point of Sale system
│   │   ├── Appointments.tsx     # Appointment scheduling
│   │   ├── Clients.tsx          # Client management
│   │   ├── Stylists.tsx         # Staff management
│   │   ├── ServiceOverview.tsx  # Service catalog
│   │   ├── InventoryManager.tsx # Inventory control
│   │   ├── Orders.tsx           # Order history
│   │   ├── MembershipTiers.tsx  # Membership management
│   │   ├── Login.tsx            # Authentication
│   │   └── ...
│   ├── styles/                  # Global styles
│   ├── utils/                   # Utility functions
│   │   ├── printUtils.ts        # Billing and printing
│   │   ├── gstCalculations.ts   # Tax calculations
│   │   ├── export/              # Export utilities
│   │   ├── network/             # Network and sync services
│   │   └── ...
│   ├── App.tsx                  # Main App component
│   ├── main.tsx                 # Application entry point
│   └── theme.ts                 # MUI theme configuration
├── public/                       # Static assets
├── server.js                     # Express API server
├── package.json                  # Project dependencies
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── vercel.json                  # Vercel deployment configuration
```

---

## 🎨 Core Features & Modules

### 1. **Dashboard & Analytics** (`src/pages/Dashboard.tsx`)
- **Revenue tracking** - Daily, weekly, monthly revenue analytics
- **Payment method breakdown** - Cash, card, UPI, split payments
- **Service performance** - Top performing services
- **Appointment statistics** - Booking trends and patterns
- **Staff performance** - Individual stylist metrics
- **Downloadable reports** - Export to Excel, PDF, CSV
- **Date range filtering** - Custom date range selection
- **Real-time updates** - Live data synchronization

### 2. **Point of Sale (POS)** (`src/pages/POS.tsx`)
- **Service selection** - Browse and add salon services
- **Product selection** - Add retail products to cart
- **Multi-expert support** - Assign multiple stylists to services
- **Client management** - Link orders to existing or walk-in clients
- **Membership discounts** - Automatic discount application
- **Split payment** - Multiple payment methods per transaction
- **GST calculations** - Automatic tax computation
- **Bill printing** - Thermal printer support
- **Order history** - View recent transactions
- **Inventory updates** - Automatic stock deduction

### 3. **Appointment Management** (`src/pages/Appointments.tsx`)
- **Calendar view** - FullCalendar integration with day/week/month views
- **Appointment booking** - Create new appointments
- **Conflict detection** - Prevent double-booking
- **Stylist assignment** - Assign specific staff members
- **Service selection** - Multi-service appointments
- **Client linking** - Associate with client records
- **Status tracking** - Pending, confirmed, completed, cancelled
- **WhatsApp notifications** - Automated appointment reminders
- **Recurring appointments** - Schedule repeat bookings
- **Appointment history** - View past appointments

### 4. **Client Management** (`src/pages/Clients.tsx`)
- **Client database** - Comprehensive customer records
- **Contact information** - Phone, email, address
- **Visit history** - Track all salon visits
- **Service preferences** - Favorite services and stylists
- **Membership status** - Track membership tier and benefits
- **Loyalty points** - Point accumulation and redemption
- **Birthday tracking** - Special occasion reminders
- **Notes and preferences** - Store custom client information
- **Search and filter** - Quick client lookup
- **Export capabilities** - Client data export

### 5. **Inventory Management** (`src/pages/InventoryManager.tsx`)
- **Stock tracking** - Real-time inventory levels
- **Product master** - Central product database
- **Purchase orders** - Track product purchases
- **Salon consumption** - Internal product usage
- **Low stock alerts** - Automated reorder notifications
- **Batch tracking** - Expiry date management
- **Stock adjustments** - Manual inventory corrections
- **Supplier management** - Vendor information
- **Cost tracking** - COGS and pricing
- **Inventory reports** - Stock movement analytics

### 6. **Service Management** (`src/pages/ServiceOverview.tsx`)
- **Service catalog** - Complete service listing
- **Collections** - Group services by category
- **Sub-collections** - Nested service organization
- **Pricing management** - Service price configuration
- **Duration settings** - Service time allocation
- **Gender-based services** - Male/female/unisex categorization
- **Membership eligibility** - Discount-eligible services
- **Active/inactive status** - Enable/disable services
- **GST configuration** - Tax settings per service
- **Table and card views** - Multiple display options

### 7. **Staff Management** (`src/pages/Stylists.tsx`)
- **Stylist profiles** - Staff information and photos
- **Skill levels** - Junior, senior, expert categorization
- **Commission tracking** - Service-based earnings
- **Shift scheduling** - Work hour management
- **Holiday management** - Leave and time-off tracking
- **Performance metrics** - Service counts and ratings
- **Availability calendar** - Real-time availability status
- **Service specialization** - Specific service assignments
- **Multi-expert support** - Team service assignments

### 8. **Membership System** (`src/pages/MembershipTiers.tsx`)
- **Tier management** - Bronze, Silver, Gold, Platinum, Diamond
- **Discount configuration** - Percentage-based discounts
- **Validity periods** - Membership duration tracking
- **Benefits tracking** - Member-exclusive perks
- **Upgrade/downgrade** - Tier management
- **Renewal automation** - Auto-renewal reminders
- **Member dashboard** - View active members
- **Revenue analysis** - Membership revenue tracking

### 9. **Order History** (`src/pages/Orders.tsx`)
- **Transaction log** - Complete order history
- **Order details** - Itemized service and product breakdown
- **Payment tracking** - Payment method and amount
- **Expert information** - Stylist assignments
- **Reprint bills** - Regenerate past invoices
- **Refunds** - Order cancellation and refund processing
- **Search and filter** - Date range, client, payment method filters
- **Export options** - Excel, CSV, PDF export

### 10. **Authentication** (`src/pages/Login.tsx`, `src/pages/Register.tsx`)
- **Email/password login** - Secure authentication
- **Protected routes** - Role-based access control
- **Session management** - Persistent login state
- **Registration disabled** - Contact admin for account creation
- **Password reset** - Email-based password recovery
- **Multi-tenant support** - Salon-specific data isolation

---

## 🔧 Key Technical Features

### **1. Offline Support**
- **Local storage caching** - Store data locally for offline access
- **Sync service** - Automatic background synchronization
- **Offline indicators** - Visual status display
- **Queue management** - Pending operations queue
- **Conflict resolution** - Handle concurrent updates

### **2. Real-time Updates**
- **Supabase subscriptions** - Live data changes
- **WebSocket connections** - Real-time notifications
- **Optimistic updates** - Immediate UI feedback
- **Auto-refresh** - Periodic data polling

### **3. Payment Processing**
- **Multiple payment methods** - Cash, Card, UPI, Digital Wallet
- **Split payments** - Distribute across multiple methods
- **GST calculations** - Inclusive and exclusive tax handling
- **Receipt generation** - Thermal and PDF receipts
- **Payment history** - Transaction audit trail

### **4. Export Capabilities**
- **Excel export** - ExcelJS for spreadsheet generation
- **PDF export** - jsPDF for PDF documents
- **CSV export** - React-CSV for comma-separated values
- **Report templates** - Customizable export formats
- **Bulk export** - Export large datasets

### **5. WhatsApp Integration**
- **Appointment reminders** - Automated notifications
- **Booking confirmations** - Instant confirmations
- **Promotional messages** - Marketing campaigns
- **Birthday wishes** - Customer engagement
- **Custom templates** - Configurable message formats

### **6. Security Features**
- **Row Level Security (RLS)** - Database-level access control
- **JWT authentication** - Secure token-based auth
- **Protected routes** - Frontend route protection
- **Input validation** - Form validation and sanitization
- **SQL injection prevention** - Parameterized queries
- **HTTPS enforcement** - Secure data transmission

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 20.x or higher
- npm 9+ or yarn 1.22+
- Supabase account (free tier available)
- Git

### **Installation Steps**

1. **Clone the repository**
```bash
git clone https://github.com/nitturkaryash/RG-SALON-GJ-02.git
cd RG-SALON-GJ-02
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

5. **Build for production**
```bash
npm run build
# or
yarn build
```

---

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following key tables:

### **Core Tables**
- `clients` - Customer information
- `appointments` - Booking records
- `orders` - Transaction history
- `services` - Service catalog
- `product_master` - Product inventory
- `stylists` - Staff information
- `service_collections` - Service categories
- `service_sub_collections` - Service subcategories
- `membership_tiers` - Membership plans
- `members` - Active members
- `stock_transactions` - Inventory movements
- `salon_consumption` - Internal product usage
- `purchase_orders` - Product purchases

### **Supporting Tables**
- `stylist_holidays` - Staff leave tracking
- `payment_methods` - Payment configurations
- `settings` - Application settings

---

## 🎨 UI/UX Features

### **Design Principles**
- **Modern and Clean** - Professional salon aesthetic
- **Responsive Design** - Mobile, tablet, and desktop support
- **Dark/Light Themes** - User preference support
- **Accessibility** - WCAG 2.1 AA compliance
- **Intuitive Navigation** - Easy-to-use interface
- **Fast Performance** - Optimized loading and rendering

### **Color Scheme**
- **Primary Color**: Olive Green (#6B8E23) - Represents growth and nature
- **Accent Colors**: Gold, Black, White
- **Material-UI Theme** - Consistent component styling

---

## 🔌 API Integration

### **Supabase API**
- **REST API** - Standard CRUD operations
- **Realtime API** - WebSocket subscriptions
- **Auth API** - User authentication
- **Storage API** - File uploads (if configured)

### **Express Server** (`server.js`)
Provides additional API endpoints:
- `/api/products` - Product management
- `/api/clients` - Client operations
- `/health` - Health check endpoint
- Authorization middleware for secure access

---

## 📱 Deployment

### **Vercel (Recommended)**
The project is configured for Vercel deployment:
```bash
npm install -g vercel
vercel --prod
```

Configuration is in `vercel.json`:
- Automatic builds on git push
- Environment variable management
- Edge network distribution
- Automatic HTTPS

### **Manual Deployment**
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Configure environment variables on the server
4. Set up HTTPS and custom domain

---

## 🔨 Development Commands

```bash
# Start development server
npm run dev

# Start Express API server
npm run dev:server

# Start both frontend and backend
npm run dev:full

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

---

## 👥 User Roles

### **Admin**
- Full system access
- Configure services and products
- Manage staff and memberships
- View all analytics and reports

### **Stylist**
- View appointments
- Process POS transactions
- Update client information
- View personal performance metrics

### **Receptionist**
- Manage appointments
- Process POS transactions
- Manage clients
- Limited admin access

---

## 📈 Business Intelligence

### **Key Metrics Tracked**
- **Revenue**: Total, average, trends
- **Appointments**: Bookings, completions, cancellations
- **Client Retention**: New vs returning clients
- **Service Performance**: Popular services, revenue by service
- **Staff Performance**: Services performed, revenue generated
- **Inventory**: Stock levels, consumption rates
- **Membership**: Active members, tier distribution

### **Reporting Capabilities**
- Custom date ranges
- Downloadable reports (Excel, PDF, CSV)
- Graphical visualizations (charts and graphs)
- Payment method breakdowns
- GST reports for tax filing

---

## 🛠️ Customization

### **Adding New Services**
1. Navigate to Services Overview
2. Click "Add Service"
3. Fill in service details (name, price, duration, GST)
4. Assign to collection/sub-collection
5. Set membership eligibility

### **Configuring Membership Tiers**
1. Navigate to Membership Tiers
2. Create or edit tier
3. Set discount percentage
4. Configure benefits
5. Set validity period

### **Adding Staff Members**
1. Navigate to Stylists
2. Click "Add Stylist"
3. Enter staff information
4. Set skill level and commission
5. Configure availability

---

## 🐛 Troubleshooting

### **Common Issues**

**1. Supabase Connection Error**
- Verify `.env.local` has correct credentials
- Check Supabase project is active
- Verify RLS policies are configured

**2. Authentication Issues**
- Clear browser cache and cookies
- Check Supabase Auth is enabled
- Verify email/password in database

**3. Build Errors**
- Run `npm install` to ensure dependencies are installed
- Clear `node_modules` and reinstall
- Check Node.js version (should be 20.x+)

**4. Data Not Loading**
- Check browser console for errors
- Verify network connection
- Check Supabase table permissions

---

## 📞 Support & Contact

**Developer**: Yash Nitturkar  
**Email**: nitturkaryash@gmail.com  
**Repository**: https://github.com/nitturkaryash/RG-SALON-GJ-02

For account creation or access issues, contact the administrator directly.

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

- Material-UI for the component library
- Supabase for backend infrastructure
- FullCalendar for scheduling UI
- The React and TypeScript communities

---

**Built with ❤️ for salon businesses worldwide**
