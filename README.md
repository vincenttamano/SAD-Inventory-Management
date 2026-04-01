# Dental IMS

Dental Inventory Management System built with React, TypeScript, Create React App, and Tailwind CSS.

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+

## Setup

1. Clone the repository.
2. Open a terminal in the project folder.
3. Install dependencies:

```bash
npm install
```

## Run in Development

Start the app:

```bash
npm start
```

Default URL: http://localhost:3000

### Run on a Different Port

Windows PowerShell:

```powershell
$env:PORT=3002
npm start
```

macOS/Linux:

```bash
PORT=3002 npm start
```

## Production Build

Create an optimized build:

```bash
npm run build
```

The output is generated in the `build/` folder.

## Useful Scripts

- `npm start`: Run development server
- `npm run build`: Build for production
- `npm test`: Run tests

## Troubleshooting

- If styles do not appear, ensure dependencies are installed and restart the dev server.
- If npm says it cannot find `package.json`, make sure your terminal is inside this project folder before running commands.
