#!/usr/bin/env node

/**
 * Email Setup Script for SkinVault
 * This script helps configure email settings for password reset functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 SkinVault Email Setup');
console.log('========================\n');

// Email provider options
const providers = {
  sendgrid: {
    name: 'SendGrid',
    description: 'Easy setup, great deliverability (100 emails/day free)',
    envVars: {
      EMAIL_PROVIDER: 'sendgrid',
      EMAIL_API_KEY: 'SG.your_sendgrid_api_key_here',
      EMAIL_FROM: 'noreply@skinvault.app',
      EMAIL_FROM_NAME: 'SkinVault'
    }
  },
  resend: {
    name: 'Resend',
    description: 'Modern API, good for developers (3,000 emails/month free)',
    envVars: {
      EMAIL_PROVIDER: 'resend',
      EMAIL_API_KEY: 're_your_resend_api_key_here',
      EMAIL_FROM: 'noreply@skinvault.app',
      EMAIL_FROM_NAME: 'SkinVault'
    }
  },
  'aws-ses': {
    name: 'AWS SES',
    description: 'Cost-effective for high volume',
    envVars: {
      EMAIL_PROVIDER: 'aws-ses',
      AWS_ACCESS_KEY_ID: 'your_aws_access_key_id',
      AWS_SECRET_ACCESS_KEY: 'your_aws_secret_access_key',
      AWS_REGION: 'us-east-1',
      EMAIL_FROM: 'noreply@skinvault.app',
      EMAIL_FROM_NAME: 'SkinVault'
    }
  },
  nodemailer: {
    name: 'SMTP (Nodemailer)',
    description: 'Any SMTP provider (Gmail, Outlook, etc.)',
    envVars: {
      EMAIL_PROVIDER: 'nodemailer',
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USER: 'your_email@gmail.com',
      SMTP_PASS: 'your_app_password',
      EMAIL_FROM: 'noreply@skinvault.app',
      EMAIL_FROM_NAME: 'SkinVault'
    }
  }
};

// Display provider options
console.log('Choose your email provider:\n');
Object.entries(providers).forEach(([key, provider], index) => {
  console.log(`${index + 1}. ${provider.name}`);
  console.log(`   ${provider.description}`);
  console.log('');
});

// Generate environment variables template
function generateEnvTemplate(providerKey) {
  const provider = providers[providerKey];
  if (!provider) {
    console.error('❌ Invalid provider selected');
    process.exit(1);
  }

  console.log(`\n📧 ${provider.name} Configuration`);
  console.log('================================\n');

  // Generate .env template
  const envContent = `# SkinVault Email Configuration
# Provider: ${provider.name}

# Required Environment Variables
${Object.entries(provider.envVars).map(([key, value]) => `${key}=${value}`).join('\n')}

# Optional Variables
VITE_APP_URL=https://skinvault.app
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
`;

  // Write to .env.example
  const envPath = path.join(process.cwd(), '.env.example');
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Generated .env.example with ${provider.name} configuration`);
  console.log(`📁 File: ${envPath}\n`);

  // Display setup instructions
  console.log('📋 Setup Instructions:');
  console.log('=====================\n');

  switch (providerKey) {
    case 'sendgrid':
      console.log('1. Go to https://sendgrid.com and create an account');
      console.log('2. Verify your domain or use a verified sender');
      console.log('3. Go to Settings → API Keys');
      console.log('4. Create a new API Key with "Mail Send" permissions');
      console.log('5. Copy the API key and update EMAIL_API_KEY in .env.example');
      break;
    
    case 'resend':
      console.log('1. Go to https://resend.com and create an account');
      console.log('2. Verify your domain');
      console.log('3. Go to API Keys in your dashboard');
      console.log('4. Create a new API key');
      console.log('5. Copy the key and update EMAIL_API_KEY in .env.example');
      break;
    
    case 'aws-ses':
      console.log('1. Create an AWS account');
      console.log('2. Go to SES (Simple Email Service)');
      console.log('3. Verify your email address or domain');
      console.log('4. Create an IAM user with SES permissions');
      console.log('5. Generate access keys and update AWS_* variables');
      break;
    
    case 'nodemailer':
      console.log('1. Choose your SMTP provider (Gmail, Outlook, etc.)');
      console.log('2. For Gmail: Enable 2FA and generate an app password');
      console.log('3. Update SMTP_* variables in .env.example');
      console.log('4. Test the connection');
      break;
  }

  console.log('\n🚀 Next Steps:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Update the values with your actual credentials');
  console.log('3. Add the variables to your Vercel environment');
  console.log('4. Deploy and test the password reset functionality');
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/setup-email.js <provider>');
  console.log('Providers: sendgrid, resend, aws-ses, nodemailer');
  console.log('\nExample: node scripts/setup-email.js sendgrid');
  process.exit(0);
}

const selectedProvider = args[0];
if (!providers[selectedProvider]) {
  console.error('❌ Invalid provider. Available options:');
  Object.keys(providers).forEach(key => {
    console.error(`  - ${key}`);
  });
  process.exit(1);
}

generateEnvTemplate(selectedProvider); 