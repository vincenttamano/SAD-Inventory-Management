# Dental IMS

Dental Inventory Management System built with React, TypeScript, Create React App, and Tailwind CSS. 

This application provides a comprehensive suite of tools for managing dental clinic operations, blending a modern **Grey and Gold** design aesthetic with robust functionality.

## Features

- **Inventory Management**: Track product quantities, unit types, expiry dates, and categories. Custom categories can be dynamically created.
- **Role-based Access**: Dual view for `Admin` and `Staff`. Admins have full access, while staff have a restricted view.
- **Usage Tracking**: Record items consumed during procedures, including patient consent tracking. Admins can edit or delete usage records, automatically refunding inventory quantities.
- **Patient Management (Admin)**: Full CRUD capabilities for tracking patient visits and item usage.
- **Real-time Notifications**: A bell notification icon instantly alerts staff to low stock and expiring inventory items.
- **Analytics Dashboard**: Interactive Recharts components visualizing monthly costs and inventory distribution.
- **Premium UI/UX**: Features glassmorphism modals, dynamic backdrop blurs, fluid animations, and a cohesive dark/gold aesthetic.

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

## Architecture & Data

Currently, the application relies on the browser's `localStorage` for data persistence. An Entity-Relationship Diagram (ERD) defining the data models (Users, Inventory Items, Usage Records) has been documented in `dental_system_erd.md`.

## Troubleshooting

- If styles do not appear, ensure dependencies are installed and restart the dev server.
- If npm says it cannot find `package.json`, make sure your terminal is inside this project folder before running commands.
- If data appears to reset, check if your browser is clearing `localStorage`.
