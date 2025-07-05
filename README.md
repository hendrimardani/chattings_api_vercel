# Deploy API with vercel + supabase

# How to install eslint dicoding-academy style guide

## Step 1
```bash
npm init @eslint/config@latest
```
## Step 2
```bash
npm install --save-dev eslint-config-dicodingacademy
```
## Step 3
There will be an eslint.config.mjs folder, then change inside the code:
```bash
import daStyle from 'eslint-config-dicodingacademy';
export default [
  daStyle,
  // other config style
];
```
