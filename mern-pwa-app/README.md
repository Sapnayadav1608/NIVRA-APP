# MERN PWA Application

This is a Progressive Web Application (PWA) built using the MERN stack (MongoDB, Express, React, Node.js). The application is designed to provide a seamless user experience with offline capabilities and responsive design.

## Project Structure

```
mern-pwa-app
├── client                # Client-side application
│   ├── public            # Public assets
│   │   ├── manifest.json # PWA manifest file
│   │   ├── service-worker.js # Service worker for offline support
│   │   └── index.html    # Main HTML file
│   ├── src               # Source files for React application
│   │   ├── components     # React components
│   │   ├── pages          # Main page components
│   │   ├── services       # API service functions
│   │   ├── App.jsx        # Main application component
│   │   └── index.jsx      # Entry point for React application
│   ├── package.json       # Client-side dependencies and scripts
│   └── tsconfig.json      # TypeScript configuration
├── server                # Server-side application
│   ├── models            # Data models
│   ├── routes            # API routes
│   ├── controllers       # Request handling logic
│   ├── middleware        # Middleware functions
│   ├── server.js         # Entry point for server application
│   └── package.json      # Server-side dependencies and scripts
├── .gitignore            # Files to ignore in version control
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mern-pwa-app
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Install client dependencies:
   ```
   cd client
   npm install
   ```

### Running the Application

1. Start the server:
   ```
   cd server
   npm start
   ```

2. Start the client:
   ```
   cd client
   npm start
   ```

### Building for Production

To build the client for production, run:
```
cd client
npm run build
```

### License

This project is licensed under the MIT License.