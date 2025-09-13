/**
 * Configuration for Garanti BBVA API Integration
 * 
 * This file contains all configuration constants and settings
 * for the Garanti BBVA Account Transactions API testing.
 */

// Load environment variables if .env file exists
try {
  require('dotenv').config();
} catch (error) {
  // dotenv not installed or .env file doesn't exist - use defaults
}

// OAuth 2.0 Configuration
const OAUTH_CONFIG = {
  CLIENT_ID: process.env.OAUTH_CLIENT_ID || 'l73f77bcc8c7714d8783db8d321a001ed6',
  CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET || 'aa656a56918e4e9898d199d87f1d35ef',
  GRANT_TYPE: process.env.OAUTH_GRANT_TYPE || 'client_credentials',
  SCOPE: process.env.OAUTH_SCOPE || 'oob'
};

// API Endpoints Configuration
const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'https://apis.garantibbva.com.tr:443',
  TOKEN_ENDPOINT: process.env.TOKEN_ENDPOINT || '/auth/oauth/v2/token',
  ACCOUNT_TRANSACTIONS_ENDPOINT: process.env.API_ENDPOINT || '/balancesandmovements/accountinformation/transaction/v1/gettransactions'
};

// Test Data Configuration (from API documentation)
const TEST_DATA = {
  CONSENT_ID: process.env.TEST_CONSENT_ID || '3e09da8a-ae9c-50bc-b34a-c61531729dbe',
  UNIT_NUM: process.env.TEST_UNIT_NUM || '295',
  ACCOUNT_NUM: process.env.TEST_ACCOUNT_NUM || '6291296',
  IBAN: process.env.TEST_IBAN || 'TR620006200029500006291296',
  START_DATE: '2020-12-25T12:53:07.867',
  END_DATE: '2020-12-25T17:53:07.867',
  TRANSACTION_ID: '',
  PAGE_INDEX: 1,
  PAGE_SIZE: 100
};

// Application Configuration
const APP_CONFIG = {
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_DEBUG_LOGS: process.env.ENABLE_DEBUG_LOGS === 'true',
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
  RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS) || 3
};

// HTTP Headers Configuration
const HEADERS = {
  CONTENT_TYPE: 'application/json',
  FORM_CONTENT_TYPE: 'application/x-www-form-urlencoded',
  ACCEPT: 'application/json'
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CLIENT: 'OAuth client credentials are invalid',
  TOKEN_EXPIRED: 'Access token has expired or been used',
  CONSENT_INVALID: 'Consent ID is invalid or expired',
  ACCOUNT_NOT_FOUND: 'Account information not found or incorrect',
  DATE_RANGE_INVALID: 'Date range exceeds 30 day limit or format is incorrect',
  NETWORK_ERROR: 'Network connection error',
  UNKNOWN_ERROR: 'An unknown error occurred'
};

// API Response Codes (from documentation)
const API_RESPONSE_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  METHOD_NOT_ALLOWED: 405,
  RATE_LIMIT: 429,
  INTERNAL_ERROR: 500
};

// Business Logic Error Codes (from Garanti BBVA documentation)
const BUSINESS_ERROR_CODES = {
  2: 'Consent ID is required',
  4: 'Client/Consent ID mismatch', 
  5: 'Branch and Account numbers must be sent together',
  6: 'Account information is incorrect',
  13: 'Account and IBAN information mismatch',
  15: 'Transaction ID information is incorrect',
  18: 'Date range cannot exceed 30 days',
  19: 'Date information is incorrect',
  21: 'Date format is incorrect',
  30: 'Page size cannot exceed 500'
};

module.exports = {
  OAUTH_CONFIG,
  API_CONFIG,
  TEST_DATA,
  APP_CONFIG,
  HEADERS,
  ERROR_MESSAGES,
  API_RESPONSE_CODES,
  BUSINESS_ERROR_CODES
};