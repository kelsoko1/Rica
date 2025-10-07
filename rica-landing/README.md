# Rica Landing Page

This is the landing page for Rica, an advanced security intelligence platform. The landing page showcases the features, pricing, and benefits of Rica to potential customers. It includes comprehensive payment processing, analytics tracking, and subscription management features.

## Features

- Modern, responsive design
- Beautiful animations with Framer Motion
- Material UI components
- React Router for navigation
- Vite for fast development and optimized builds
- Global payment processing with ClickPesa (mobile money, cards, digital wallets)
- Recurring payments for automated subscription billing
- Analytics tracking and visualization
- Subscription management system
- Payment history tracking
- Receipt generation and management

## Pages

- Home Page: Main landing page with feature highlights
- Features Page: Detailed information about Rica's features
- Pricing Page: Subscription plans and pricing information
- About Page: Company information and team
- Login Page: User authentication
- Signup Page: New user registration with multi-step form
- Checkout Page: Multi-step checkout process with payment options
- Payment History Page: View and manage payment transactions
- Subscription Page: Manage subscription plans and billing
- Analytics Page: View payment and subscription analytics
- Recurring Payments Page: Set up and manage automated recurring payments

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

This will start the development server at [http://localhost:3030](http://localhost:3030).

### Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with the compiled assets.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
rica-landing/
├── src/
│   ├── assets/        # Images, SVGs, and other static assets
│   ├── components/    # Reusable React components
│   │   ├── analytics/    # Analytics components
│   │   ├── payments/     # Payment components
│   │   └── subscriptions/ # Subscription components
│   ├── context/       # React context providers
│   ├── pages/         # Page components
│   ├── services/      # Service modules
│   │   ├── analyticsService.js    # Analytics tracking service
│   │   ├── paymentService.js      # Payment processing service
│   │   ├── paymentHistoryService.js # Payment history service
│   │   └── subscriptionService.js # Subscription management service
│   ├── config/        # Configuration files
│   ├── styles/        # Global styles
│   ├── App.jsx        # Main App component
│   └── main.jsx       # Entry point
├── server/           # Mock server for payment webhooks
├── index.html        # HTML template
├── vite.config.js    # Vite configuration
├── PAYMENT_INTEGRATION_GUIDE.md  # Payment integration documentation
├── CLICKPESA_GLOBAL_PAYMENT.md    # ClickPesa global payment documentation
├── ANALYTICS_SUBSCRIPTION_GUIDE.md # Analytics and subscription documentation
├── RECEIPT_GENERATION_GUIDE.md   # Receipt generation documentation
├── RECURRING_PAYMENTS_GUIDE.md   # Recurring payments documentation
└── package.json      # Project dependencies and scripts
```

## Technologies Used

- [React](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [Material UI](https://mui.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vite](https://vitejs.dev/)
- [Styled Components](https://styled-components.com/)
- [ClickPesa](https://clickpesa.com/) - Global payment processing (mobile money, cards, wallets)
- [Express](https://expressjs.com/) - Mock server for payment webhooks
- [jsPDF](https://github.com/MrRio/jsPDF) - PDF generation for receipts

## Payment Integration

The landing page includes comprehensive payment integration with ClickPesa as the sole payment provider supporting multiple payment methods:

- **Mobile Money**: For payments in East Africa (Tanzania, Kenya, Uganda)
- **Credit/Debit Cards**: For global card payments (Visa, Mastercard, Amex)
- **Digital Wallets**: For wallet payments (PayPal, Apple Pay, Google Pay)
- **Receipt Generation**: PDF receipts for completed payments

See `PAYMENT_INTEGRATION_GUIDE.md`, `CLICKPESA_GLOBAL_PAYMENT.md`, and `RECEIPT_GENERATION_GUIDE.md` for detailed documentation.

## Analytics System

The analytics system tracks various events related to payments and subscriptions:

- Payment started/completed/failed events
- Subscription created/updated/cancelled events
- Page view tracking
- Conversion rate calculation

See `ANALYTICS_SUBSCRIPTION_GUIDE.md` for detailed documentation.

## Subscription Management

The subscription management system allows users to:

- Create new subscriptions
- Change subscription plans
- Update billing cycles
- Cancel subscriptions
- View subscription history

See `ANALYTICS_SUBSCRIPTION_GUIDE.md` for detailed documentation.

## Recurring Payments

The recurring payments system enables automated billing for subscriptions:

- Set up recurring payments with flexible frequencies (weekly, monthly, quarterly, annual)
- Support for multiple payment methods (mobile money, cards, digital wallets)
- Pause, resume, or cancel recurring payments
- View payment history and upcoming schedule
- Automatic payment processing

See `RECURRING_PAYMENTS_GUIDE.md` for detailed documentation.

## License

ISC
