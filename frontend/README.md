# Frontend Application

## Prerequisites

### Install Node.js (Windows)

1. Download Node.js from https://nodejs.org/
2. Choose LTS version (recommended)
3. Run the installer
4. Verify installation:
   ```
   node --version
   npm --version
   ```

## Setup Instructions

### 1. Install Dependencies

Open PowerShell or Command Prompt in the `frontend` folder and run:

```bash
npm install
```

### 2. Configure Backend URL

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env` file and set your backend URL:

```
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### 4. Login

Use the default credentials:
- Username: `admin`
- Password: `admin123`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
frontend/
├── src/
│   ├── api/          # API client and endpoints
│   ├── auth/         # Authentication logic
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components
│   ├── layouts/      # Layout components
│   ├── hooks/        # Custom React hooks
│   ├── context/      # React context providers
│   ├── routes/       # Route configuration
│   ├── lib/          # Utility functions
│   └── App.tsx       # Main app component
├── public/           # Static assets
└── index.html        # HTML entry point
```

## Troubleshooting

### Backend Connection Error

Make sure:
1. Backend server is running on http://localhost:8000
2. `.env` file has correct `VITE_API_BASE_URL`
3. Restart dev server after changing `.env`

### Port Already in Use

If port 5173 is busy, Vite will automatically use the next available port.
