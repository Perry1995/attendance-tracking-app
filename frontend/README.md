# Attendance Tracking Frontend

Next.js 14+ frontend application for the attendance tracking system.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand (ready for implementation)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Dashboard page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components (to be implemented)
│   └── forms/            # Form components (to be implemented)
├── hooks/                # Custom React hooks (to be implemented)
├── lib/                  # Utility libraries
│   ├── api/             # API client and endpoints
│   └── utils/           # Utility functions
├── types/               # TypeScript type definitions
├── styles/              # Global styles
│   └── globals.css      # Global CSS with Tailwind
├── public/              # Static assets
├── components.json      # shadcn/ui configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── next.config.js       # Next.js configuration
```

## Setup

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building

Build the production version:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Code Quality

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Formatting

```bash
npm run format
```

## shadcn/ui Components

This project uses shadcn/ui for UI components. The configuration is in `components.json`.

### Adding New Components

To add new shadcn/ui components:

```bash
npx shadcn-ui@latest add [component-name]
```

For example:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
```

## Pages

### Public Pages

- **Home (`/`)**: Landing page with login/register options
- **Login (`/auth/login`)**: User login page
- **Register (`/auth/register`)**: New user registration

### Protected Pages (To be implemented)

- **Dashboard (`/dashboard`)**: Main dashboard with attendance overview
- **Classes**: Class management
- **Students**: Student management
- **Attendance**: Attendance tracking and reports
- **Profile**: User profile settings

## API Integration

The API client is configured in `lib/api/client.ts` and automatically:

- Adds authentication tokens to requests
- Handles token refresh
- Redirects to login on 401 errors
- Provides consistent error handling

Example usage:

```typescript
import { authApi } from '@/lib/api';

const response = await authApi.login({
  email: 'user@example.com',
  password: 'password',
});
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Application version

## Styling

### Tailwind CSS

The project uses Tailwind CSS with a custom theme configured for shadcn/ui components.

### CSS Variables

Global CSS variables are defined in `styles/globals.css` for consistent theming.

### Dark Mode

Dark mode is configured and can be enabled by adding the `dark` class to the root element.

## State Management

Zustand is included for state management. Example store structure:

```typescript
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

## Forms

React Hook Form with Zod validation is included for form handling.

Example usage:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

## Docker

Build the Docker image:

```bash
docker build -t attendance-frontend .
```

Run with Docker Compose:

```bash
docker-compose up frontend
```

## Contributing

1. Follow TypeScript and ESLint rules
2. Use Prettier for code formatting
3. Follow Next.js App Router conventions
4. Use shadcn/ui components when available
5. Write meaningful commit messages

## Future Enhancements

- [ ] Implement authentication state management
- [ ] Add protected route middleware
- [ ] Create reusable form components
- [ ] Add data tables for lists
- [ ] Implement real-time updates with WebSockets
- [ ] Add unit and integration tests
- [ ] Implement error boundaries
- [ ] Add loading states and skeletons
- [ ] Implement offline support
- [ ] Add PWA capabilities

## License

ISC
