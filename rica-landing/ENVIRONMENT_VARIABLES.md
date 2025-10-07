# Environment Variables in Rica Landing

## Overview

This document explains how environment variables are handled in the Rica Landing application.

## Browser Environment Variables

Since the browser doesn't have direct access to Node.js environment variables (`process.env`), we've implemented a solution using a global `window.env` object.

### How It Works

1. Environment variables are defined in `/env.js` which creates a global `window.env` object
2. This file is placed in the project root directory to be served at the root path
3. The file is loaded before any application code in `index.html`
4. The application code accesses environment variables via `window.env` instead of `process.env`

> **Important**: In Vite, files in the public directory are served at the root path. For example, `/public/env.js` should be accessed as `/env.js` in the browser.

### Current Environment Variables

- `REACT_APP_CLICKPESA_API_KEY`: API key for ClickPesa payment integration
- `NODE_ENV`: Environment mode (development, production, test)

## For Production Deployment

For production deployment, you should:

1. Generate the `/public/env.js` file during your build process
2. Set proper production values for all environment variables
3. Consider using a more secure approach for sensitive values like API keys

## Adding New Environment Variables

To add new environment variables:

1. Add them to `/public/env.js`
2. Access them in your code using `window.env.YOUR_VARIABLE_NAME`
3. Always include a fallback value using the OR operator: `(window.env && window.env.YOUR_VARIABLE_NAME) || 'fallback'`

## Troubleshooting

If you encounter "process is not defined" errors:
1. Check if you're trying to access `process.env` directly in browser code
2. Replace with `window.env` access pattern
3. Ensure `/public/env.js` is loaded before your application code
