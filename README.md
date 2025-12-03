# Granalysis Frontend

A modern, responsive React application for data analysis and insights visualization. Built with TypeScript, React, and Tailwind CSS.

## Features

- **Modern UI/UX**: Beautiful, theme-aware interface with dark/light mode
- **Real-time Analytics**: Interactive charts and visualizations
- **AI-Powered Insights**: AI chat assistant for data analysis
- **File Management**: Upload, view, and analyze CSV, JSON, Excel, SQL, and PHP files
- **User Authentication**: Secure session-based authentication
- **Progressive Web App**: Offline support and installable
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running (see `../node/README.md`)
- Python service running (see `../python/README.md`)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (if needed):
   ```bash
   # Create .env file
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_PYTHON_API_URL=http://localhost:8000
   ```

## Running the Application

### Development
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
```

The optimized build will be in the `build/` directory.

### Testing
```bash
npm test
```

## Project Structure

```
granalysis/
├── public/              # Static assets
├── src/
│   ├── components/     # React components
│   │   ├── authcomponents/    # Authentication components
│   │   ├── common/             # Shared components
│   │   ├── dashboard-components/  # Dashboard components
│   │   ├── home/               # Homepage components
│   │   └── ui/                  # UI primitives
│   ├── contexts/       # React contexts (Theme, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Key Technologies

- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Recharts**: Chart library
- **Lucide React**: Icon library

## Features by Tier

### Free Tier
- Basic file upload and analysis
- Standard insights
- Limited file size

### Startup Tier
- Advanced analytics
- Export functionality
- Priority support

### Business Tier
- AI chat assistant
- Scheduled exports
- API access
- Webhook integrations

### Enterprise Tier
- All Business features
- Database linking
- Custom integrations
- Dedicated support

## Development

### Code Style
- Use TypeScript for all new files
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries

### Theme System
The app uses a centralized theme system. See `src/components/home/theme.ts` for theme configuration.

### API Integration
API calls are made through `src/utils/axios.ts`. The service worker handles offline caching.

## Building for Production

1. Update environment variables
2. Run build: `npm run build`
3. Deploy the `build/` directory to your hosting service

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

See [LICENSE](LICENSE) file for details.

## Contributing

1. Follow the existing code style
2. Add TypeScript types for all new code
3. Test your changes in both light and dark themes
4. Ensure mobile responsiveness

## Support

For issues and questions, please refer to the main project documentation.
