# Preview Project Workflow

This workflow describes the step-by-step process of running the local development server for the `SalleDeVente.sn` Next.js application.

## Prerequisites

- **Node.js**: Ensure Node.js v20+ (recommended v22+) is installed.
- **Dependencies**: Ensure dependencies are installed (`npm install`).

## Step 1: Start the Development Server

To start the Next.js local development server (using Turbopack as configured), run:

```bash
npm run dev
```

This starts the development server on port `9002` as configured in `package.json`.

## Step 2: Open Preview in Browser

Once the terminal output shows `✓ Ready`, open your browser and navigate to:

```
http://localhost:9002
```

This will load the homepage of `SalleDeVente.sn`. You can navigate to other pages such as `/sell` (Vendre) to create listings.
