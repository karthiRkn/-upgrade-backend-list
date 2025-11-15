#!/usr/bin/env bash
# This script is automatically detected by Render and used as the build command

echo "Running custom build script for Render deployment"

# Install dependencies including dev dependencies
npm install --include=dev

# Run TypeScript build
npm run build

echo "Build completed successfully"