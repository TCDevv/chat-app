# Web Chat Application

A modern, high-performance web chat application similar to Telegram/WhatsApp, built with React, TypeScript, and Web Workers. Features include real-time messaging, local storage persistence, virtual scrolling for 1000+ messages, and comprehensive testing.

![Chat Application](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![Vite](https://img.shields.io/badge/Vite-7.1.7-purple) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Real-time Chat Interface**: Clean, intuitive UI inspired by modern messaging apps
- **Local Storage Persistence**: All messages are stored in browser's local storage
- **Web Worker Integration**: Off-thread message processing for better performance
- **PostMessage API Support**: Receive messages from external sources
- **Virtual Scrolling**: Efficiently handles 1000+ messages using react-window
- **Deep Linking**: Scroll to specific messages via URL parameters
- **Responsive Design**: Mobile-friendly interface using React Bootstrap
- **Dependency Injection**: Clean architecture with Inversify
- **Comprehensive Testing**: Unit tests (Vitest + RTL) and E2E tests (Playwright)
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for modern, maintainable styles

## Tech Stack

### Core
- **React 19.1.1** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.1.7** - Build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework

### Architecture
- **Inversify 6.0.2** - Dependency injection
- **React Window 1.8.10** - Virtual scrolling for performance

### Testing
- **Vitest 3.2.0** - Unit testing framework
- **React Testing Library 16.0.1** - Component testing
- **Playwright 1.49.0** - E2E testing
- **Testing Library Jest DOM 6.6.3** - DOM matchers

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS transformation
- **Autoprefixer** - Vendor prefix automation

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run unit tests
npm run test:ui         # Run unit tests with UI
npm run test:coverage   # Run tests with coverage
npm run test:e2e        # Run integration tests
npm run test:e2e:ui     # Run integration tests with UI

# Code Quality
npm run lint            # Run ESLint
```

## Project Structure

```
chat-app/
├── src/
│   ├── components/           # React components
│   │   ├── ChatList/        # Chat list sidebar
│   │   ├── MessageArea/     # Message display area
│   │   ├── MessageInput/    # Message input component
│   │   └── ChatLayout/      # Main layout container
│   ├── services/            # Business logic services
│   │   ├── interfaces/      # Service interfaces
│   │   ├── LocalStorageService.ts
│   │   ├── MessageService.ts
│   │   └── PostMessageService.ts
│   ├── workers/             # Web Workers
│   │   └── transport.worker.ts
│   ├── models/              # TypeScript interfaces
│   │   ├── Message.ts
│   │   └── Chat.ts
│   ├── di/                  # Dependency injection
│   │   ├── container.ts
│   │   └── types.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useMessages.ts
│   │   └── useScrollToMessage.ts
│   ├── utils/               # Utility functions
│   │   └── mockData.ts
│   ├── styles/              # SCSS styles
│   │   ├── variables.scss
│   │   └── global.scss
│   ├── test/                # Test setup
│   │   └── setup.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── integration/         # Playwright E2E tests
│   │   ├── chat.spec.ts
│   │   └── message-loading.spec.ts
│   └── test-cases/          # Test case documentation
│       └── TEST_CASES.md
├── playwright.config.ts     # Playwright configuration
├── vitest.config.ts        # Vitest configuration
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Features Explained

### 1. Local Storage Persistence
All chats and messages are stored in browser's localStorage, ensuring data persists across sessions.

### 2. Web Worker for Performance
Heavy message processing happens in a Web Worker to keep the main thread responsive:
- Load and process 1000+ messages
- Simulate incoming messages
- Background data processing

### 3. Virtual Scrolling
Using react-window for efficient rendering of large message lists. Only visible messages are rendered to the DOM.

### 4. PostMessage Integration
Receive messages from external sources via the PostMessage API:

```javascript
window.postMessage({
  type: 'NEW_MESSAGE',
  payload: {
    id: 'msg_123',
    chatId: 'chat_1',
    content: 'Message from external app',
    sender: 'External',
    timestamp: Date.now(),
    isOwn: false,
    status: 'delivered'
  }
}, '*');
```

### 5. Deep Linking to Messages
Navigate directly to a specific message using URL parameters:
```
http://localhost:5173/?messageId=msg_chat_1_5
```

### 6. Dependency Injection
Clean architecture using Inversify for better testability and maintainability.

## Testing

### Unit Tests
Component tests using Vitest and React Testing Library:
```bash
npm run test
```

### Integration Tests
E2E tests using Playwright covering:
- Chat selection and message display
- Sending messages
- Loading 1000+ messages
- Worker message simulation
- LocalStorage persistence
- Scroll to message functionality

```bash
npm run test:e2e
```

## Performance Optimizations

1. **Virtual Scrolling**: Only renders visible messages
2. **Web Workers**: Off-thread processing for heavy operations
3. **Memoization**: React.memo and useMemo for expensive computations
4. **Code Splitting**: Dynamic imports for better load times
5. **SCSS**: Optimized CSS with variables and mixins

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Guidelines

### Adding a New Component
1. Create component folder in `src/components/`
2. Add `.tsx`, `.scss`, and `.test.tsx` files
3. Export from component folder
4. Add tests for the component

### Adding a New Service
1. Create interface in `src/services/interfaces/`
2. Implement service in `src/services/`
3. Register in DI container (`src/di/container.ts`)
4. Add service type to `src/di/types.ts`

## Troubleshooting

See [CLI_COMMANDS.md](./CLI_COMMANDS.md) for detailed troubleshooting steps.

## Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [CLI Commands](./CLI_COMMANDS.md) - Quick reference for commands
- [Test Cases](./tests/test-cases/TEST_CASES.md) - Comprehensive test documentation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by Telegram and WhatsApp
- Built with modern React and TypeScript best practices
- Uses industry-standard testing tools and frameworks
