/**
 * Configuration for Garanti BBVA API Integration
 * Uses environment variables with secure fallbacks
 */

// Load environment variables from .env file
require('dotenv').config();

// Your OAuth 2.0 Credentials (with environment variable support)
const CLIENT_ID = process.env.OAUTH_CLIENT_ID || 'l73f77bcc8c7714d8783db8d321a001ed6';
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || 'aa656a56918e4e9898d199d87f1d35ef';

// API Configuration (with environment variable support)
const API_BASE_URL = process.env.API_BASE_URL || 'https://apis.garantibbva.com.tr:443';
const TOKEN_ENDPOINT = process.env.TOKEN_ENDPOINT || '/auth/oauth/v2/token';
const TRANSACTIONS_ENDPOINT = process.env.TRANSACTIONS_ENDPOINT || '/balancesandmovements/accountinformation/transaction/v1/gettransactions';

// Test Data (exact from your api.json with environment variable support)
const TEST_DATA = {
  consentId: process.env.TEST_CONSENT_ID || '3e09da8a-ae9c-50bc-b34a-c61531729dbe',
  unitNum: process.env.TEST_UNIT_NUM || '295',
  accountNum: process.env.TEST_ACCOUNT_NUM || '6291296', 
  IBAN: process.env.TEST_IBAN || 'TR620006200029500006291296',
  startDate: process.env.TEST_START_DATE || '2020-12-25T12:53:07.867',
  endDate: process.env.TEST_END_DATE || '2020-12-25T17:53:07.867',
  transactionId: process.env.TEST_TRANSACTION_ID || '',
  pageIndex: parseInt(process.env.TEST_PAGE_INDEX) || 1,
  pageSize: parseInt(process.env.TEST_PAGE_SIZE) || 100
};

// OAuth Settings (with environment variable support)
const OAUTH_SETTINGS = {
  grantType: process.env.OAUTH_GRANT_TYPE || 'client_credentials',
  scope: process.env.OAUTH_SCOPE || 'oob'
};

// Application Settings
const APP_SETTINGS = {
  environment: process.env.NODE_ENV || 'development',
  enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === 'true' || false,
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000
};

// Business Error Codes (from Garanti documentation)  
const ERROR_CODES = {
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

// HTTP Response Codes
const HTTP_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  METHOD_NOT_ALLOWED: 405,
  RATE_LIMIT: 429,
  INTERNAL_ERROR: 500
};

module.exports = {
  CLIENT_ID,
  CLIENT_SECRET,
  API_BASE_URL,
  TOKEN_ENDPOINT, 
  TRANSACTIONS_ENDPOINT,
  TEST_DATA,
  OAUTH_SETTINGS,
  APP_SETTINGS,
  ERROR_CODES,
  HTTP_CODES
};