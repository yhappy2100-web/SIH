# NabhaLearn

A Progressive Web App (PWA) built with React, Vite, and TailwindCSS for modern learning experiences.

## Features

- ⚡ **Vite** - Lightning fast build tool
- ⚛️ **React 18** - Modern React with TypeScript
- 🎨 **TailwindCSS** - Utility-first CSS framework
- 📱 **PWA** - Progressive Web App capabilities
- 🔧 **ESLint + Prettier** - Code quality and formatting
- 🛠️ **TypeScript** - Type safety and better developer experience

## PWA Features

- ✅ Service Worker for offline functionality
- ✅ Web App Manifest for installability
- ✅ Responsive design for all devices
- ✅ Auto-update notifications
- ✅ Caching strategies for optimal performance

## Getting Started

### Prerequisites

Make sure you have Node.js (version 16 or higher) installed on your system.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier

## PWA Installation

1. Open the app in a supported browser (Chrome, Edge, Firefox, Safari)
2. Look for the install button in the address bar or browser menu
3. Click "Install" to add the app to your home screen
4. The app will work offline after installation

## Project Structure

```
src/
├── main.tsx          # Application entry point
├── App.tsx           # Main App component
├── App.css           # App-specific styles
├── index.css         # Global styles with TailwindCSS
└── sw.ts            # Service Worker (handled by Vite PWA plugin)

public/
├── manifest.json     # PWA manifest
├── vite.svg         # App icon
└── ...              # Other static assets

Configuration files:
├── vite.config.ts    # Vite configuration with PWA plugin
├── tailwind.config.js # TailwindCSS configuration
├── tsconfig.json     # TypeScript configuration
├── .eslintrc.cjs     # ESLint configuration
├── .prettierrc       # Prettier configuration
└── postcss.config.js # PostCSS configuration
```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Vite PWA Plugin** - PWA functionality
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Browser Support

This PWA works in all modern browsers that support:
- Service Workers
- Web App Manifest
- ES6+ features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting
5. Submit a pull request

## License

MIT License - feel free to use this project for your own learning apps!
