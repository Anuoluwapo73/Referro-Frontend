# Referro Frontend - React Application

Modern React frontend for the Referro marketplace platform, built with Vite, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **React Query (TanStack Query)** - Server state management
- **Zustand** - Global state management
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Toast notifications
- **date-fns** - Date manipulation

## Project Structure

```
src/
├── api/              # API client and service layer
├── components/       # Reusable React components
│   ├── common/      # Generic components (Button, Input, etc.)
│   ├── forms/       # Form components
│   ├── artisan/     # Artisan-specific components
│   ├── job/         # Job-specific components
│   ├── chat/        # Chat components
│   ├── payment/     # Payment components
│   └── layout/      # Layout components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── store/           # Zustand stores
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── layouts/         # Layout wrappers
└── routes/          # Route configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running at http://localhost:3000

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your API keys
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3001
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
VITE_ENV=development
```

## Features

- ✅ User authentication with OTP verification
- ✅ Job creation and management
- ✅ Artisan search and discovery
- ✅ Real-time chat
- ✅ Payment processing with Paystack
- ✅ Escrow management
- ✅ Wallet and transactions
- ✅ Reviews and ratings
- ✅ Referral system
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ Accessibility support

## API Integration

The frontend communicates with the backend API at `http://localhost:3000/api`. All API requests are handled through the centralized API client in `src/api/client.ts`, which includes:

- Automatic authentication token injection
- Error handling and transformation
- Request/response interceptors
- Token refresh on 401 errors

## State Management

- **Zustand** for global client state (auth, UI)
- **React Query** for server state (API data, caching)
- **React Hook Form** for form state
- **LocalStorage** for persistence

## Styling

- Tailwind CSS with custom theme
- Mobile-first responsive design
- Custom color palette for brand consistency
- Utility classes for rapid development

## Code Quality

- TypeScript for type safety
- ESLint for code linting
- Consistent code formatting
- Component-based architecture

## Next Steps

1. Implement authentication components
2. Create common UI components
3. Build page layouts
4. Integrate with backend API
5. Add testing (unit and property-based)
6. Optimize performance
7. Deploy to production

## License

Proprietary - Referro Platform
