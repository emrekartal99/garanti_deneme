/**
 * Garanti BBVA Account Transactions API Client
 * 
 * This client tests the Garanti BBVA Account Transactions API
 * in the Development Sandbox Environment.
 * 
 * Key Requirements:
 * - OAuth 2.0 Client Credentials authentication
 * - Fresh token required for each API call (single-use tokens)
 * - Development Sandbox Service environment
 */

const https = require('https');
const querystring = require('querystring');
const config = require('./config');

class GarantiBBVAApiClient {
  constructor() {
    this.config = config;
    this.currentToken = null;
  }

  /**
   * Get a fresh OAuth 2.0 access token
   * Note: Tokens can only be used once per documentation
   */
  async getOAuthToken() {
    return new Promise((resolve, reject) => {
      const postData = querystring.stringify({
        grant_type: this.config.OAUTH_CONFIG.GRANT_TYPE,
        client_id: this.config.OAUTH_CONFIG.CLIENT_ID,
        client_secret: this.config.OAUTH_CONFIG.CLIENT_SECRET,
        scope: this.config.OAUTH_CONFIG.SCOPE
      });

      const tokenUrl = new URL(this.config.API_CONFIG.BASE_URL + this.config.API_CONFIG.TOKEN_ENDPOINT);
      const options = {
        hostname: tokenUrl.hostname,
        port: tokenUrl.port || 443,
        path: tokenUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': this.config.HEADERS.FORM_CONTENT_TYPE,
          'Content-Length': Buffer.byteLength(postData),
          'Accept': this.config.HEADERS.ACCEPT
        },
        timeout: this.config.APP_CONFIG.REQUEST_TIMEOUT
      };

      this.log(`🔑 Requesting OAuth token from: ${tokenUrl.href}`);
      this.log(`📋 Client ID: ${this.config.OAUTH_CONFIG.CLIENT_ID}`);
      this.log(`🎯 Scope: ${this.config.OAUTH_CONFIG.SCOPE}`);

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          this.log(`📡 Token Response Status: ${res.statusCode}`);
          
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === this.config.API_RESPONSE_CODES.SUCCESS && response.access_token) {
              this.currentToken = response.access_token;
              this.log('✅ Fresh OAuth token obtained successfully');
              this.log(`🎫 Token: ${response.access_token.substring(0, 20)}...`);
              
              if (response.expires_in) {
                this.log(`⏰ Token expires in: ${response.expires_in} seconds`);
              }
              
              resolve(response.access_token);
            } else {
              this.log('❌ OAuth token request failed');
              this.logError('Token Response', response);
              reject(new Error(`OAuth token request failed: ${JSON.stringify(response)}`));
            }
          } catch (error) {
            this.log('❌ Failed to parse token response');
            this.log('📄 Raw response:', data);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        this.log('❌ Token request network error:', error.message);
        reject(error);
      });

      req.on('timeout', () => {
        this.log('❌ Token request timeout');
        req.destroy();
        reject(new Error('Token request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Call Account Transactions API with fresh token
   */
  async getAccountTransactions(customData = null) {
    return new Promise((resolve, reject) => {
      // Use custom data or default test data
      const requestData = customData || {
        consentId: this.config.TEST_DATA.CONSENT_ID,
        unitNum: this.config.TEST_DATA.UNIT_NUM,
        accountNum: this.config.TEST_DATA.ACCOUNT_NUM,
        IBAN: this.config.TEST_DATA.IBAN,
        startDate: this.config.TEST_DATA.START_DATE,
        endDate: this.config.TEST_DATA.END_DATE,
        transactionId: this.config.TEST_DATA.TRANSACTION_ID,
        pageIndex: this.config.TEST_DATA.PAGE_INDEX,
        pageSize: this.config.TEST_DATA.PAGE_SIZE
      };

      const postData = JSON.stringify(requestData);
      const apiUrl = new URL(this.config.API_CONFIG.BASE_URL);
      
      const options = {
        hostname: apiUrl.hostname,
        port: apiUrl.port || 443,
        path: this.config.API_CONFIG.ACCOUNT_TRANSACTIONS_ENDPOINT,
        method: 'POST',
        headers: {
          'Content-Type': this.config.HEADERS.CONTENT_TYPE,
          'Authorization': `Bearer ${this.currentToken}`,
          'Content-Length': Buffer.byteLength(postData),
          'Accept': this.config.HEADERS.ACCEPT
        },
        timeout: this.config.APP_CONFIG.REQUEST_TIMEOUT
      };

      this.log(`\n🌐 Making API call to: ${this.config.API_CONFIG.BASE_URL}${this.config.API_CONFIG.ACCOUNT_TRANSACTIONS_ENDPOINT}`);
      this.log(`🔐 Using Bearer token: ${this.currentToken.substring(0, 20)}...`);
      this.log(`📋 Request Data:`, requestData);

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          this.log(`📡 API Response Status: ${res.statusCode}`);
          
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === this.config.API_RESPONSE_CODES.SUCCESS) {
              this.log('✅ API call successful!');
              resolve(response);
            } else {
              this.log('❌ API call failed');
              this.logError('API Response', response);
              this.analyzeError(res.statusCode, response);
              reject(new Error(`API call failed with status ${res.statusCode}: ${JSON.stringify(response)}`));
            }
          } catch (error) {
            this.log('❌ Failed to parse API response');
            this.log('📄 Raw response:', data);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        this.log('❌ API request network error:', error.message);
        reject(error);
      });

      req.on('timeout', () => {
        this.log('❌ API request timeout');
        req.destroy();
        reject(new Error('API request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Analyze and provide specific error guidance
   */
  analyzeError(statusCode, response) {
    this.log('\n🔍 Error Analysis:');
    
    switch (statusCode) {
      case this.config.API_RESPONSE_CODES.UNAUTHORIZED:
        this.log('🚫 401 Unauthorized - Authentication failed');
        this.log('💡 Possible causes:');
        this.log('   • OAuth credentials are invalid or inactive');
        this.log('   • Access token expired or already used (single-use requirement)');
        this.log('   • Application not approved for API access');
        break;
        
      case this.config.API_RESPONSE_CODES.BAD_REQUEST:
        this.log('🚫 400 Bad Request - Invalid request parameters');
        if (response && response.result && response.result.reasonCode) {
          const reasonCode = response.result.reasonCode;
          const errorMessage = this.config.BUSINESS_ERROR_CODES[reasonCode];
          if (errorMessage) {
            this.log(`💡 Reason Code ${reasonCode}: ${errorMessage}`);
          }
        }
        break;
        
      case this.config.API_RESPONSE_CODES.FORBIDDEN:
        this.log('🚫 403 Forbidden - Access denied');
        this.log('💡 Your application may not have permission for this API');
        break;
        
      case this.config.API_RESPONSE_CODES.RATE_LIMIT:
        this.log('🚫 429 Rate Limit - Too many requests');
        this.log('💡 Wait before making additional requests');
        break;
        
      case this.config.API_RESPONSE_CODES.INTERNAL_ERROR:
        this.log('🚫 500 Internal Server Error - Server-side issue');
        this.log('💡 This is likely a temporary server problem');
        break;
        
      default:
        this.log(`🚫 HTTP ${statusCode} - Unexpected error`);
    }
  }

  /**
   * Display API response results
   */
  displayResults(response) {
    this.log('\n🎉 SUCCESS! API Response:');
    this.log('='.repeat(60));
    
    if (response.result) {
      this.log(`📊 Return Code: ${response.result.returnCode}`);
      this.log(`📊 Reason Code: ${response.result.reasonCode}`);
      this.log(`📊 Message: ${response.result.messageText}`);
    }
    
    if (response.transactions && response.transactions.length > 0) {
      this.log(`\n💰 Found ${response.transactions.length} transactions:\n`);
      
      response.transactions.forEach((transaction, index) => {
        this.log(`Transaction ${index + 1}:`);
        this.log(`  👤 Customer: ${transaction.customerName}`);
        this.log(`  📅 Date: ${transaction.activityDate} (Value: ${transaction.valueDate})`);
        this.log(`  💵 Amount: ${transaction.amount} ${transaction.currencyCode || 'TL'}`);
        this.log(`  📈 Type: ${transaction.txnCreditDebitIndicator === 'A' ? 'Credit' : 'Debit'}`);
        this.log(`  📝 Description: ${transaction.explanation}`);
        this.log(`  💰 Balance After: ${transaction.balanceAfterTransaction}`);
        this.log(`  🔖 Transaction ID: ${transaction.transactionId}`);
        this.log(`  🏷️  Classification: ${transaction.clasificationCode}`);
        
        // Display enrichment information if available
        if (transaction.enrichmentInformation && transaction.enrichmentInformation.length > 0) {
          this.log(`  ℹ️  Enrichment Data:`);
          transaction.enrichmentInformation.forEach(enrichment => {
            this.log(`    • ${enrichment.enrichmentCode}: ${JSON.stringify(enrichment.enrichmentValue, null, 4).replace(/\n/g, '\n      ')}`);
          });
        }
        this.log('  ' + '-'.repeat(50));
      });
    } else {
      this.log('\n📋 No transactions found');
      this.log('💡 This might be expected for test data or the specified date range');
    }
  }

  /**
   * Logging utility
   */
  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data && this.config.APP_CONFIG.ENABLE_DEBUG_LOGS) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Error logging utility
   */
  logError(title, error) {
    this.log(`❌ ${title}:`);
    console.log(JSON.stringify(error, null, 2));
  }
}

/**
 * Main test execution function
 */
async function runTest() {
  const client = new GarantiBBVAApiClient();
  
  client.log('🚀 Starting Garanti BBVA Account Transactions API Test');
  client.log('📋 Environment: DEVELOPMENT SANDBOX SERVICE');
  client.log('⚠️  Note: Access tokens are single-use only (per documentation)');
  client.log('🔧 Configuration loaded from config.js\n');
  
  try {
    // Step 1: Get fresh OAuth token (required for each API call)
    const accessToken = await client.getOAuthToken();
    
    // Step 2: Call Account Transactions API
    const response = await client.getAccountTransactions();
    
    // Step 3: Display results
    client.displayResults(response);
    
    client.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    client.log('\n💥 Test failed:', error.message);
    
    client.log('\n🔧 Troubleshooting Guide:');
    client.log('1. Verify your OAuth credentials in the developer portal');
    client.log('2. Check if your application is approved and active');
    client.log('3. Ensure you\'re using the correct sandbox environment');
    client.log('4. Confirm the consent ID is valid for your account');
    client.log('5. Check network connectivity and firewall settings');
    
    client.log('\n📞 Support Resources:');
    client.log('• Developer Portal: https://developers.garantibbva.com.tr');
    client.log('• Support Email: ETicaretDestek@garantibbva.com.tr');
    client.log('• API Documentation: Available in /docs folder');
    
    // Exit with error code for CI/CD
    process.exit(1);
  }
}

// Export for use as module
module.exports = {
  GarantiBBVAApiClient,
  runTest
};

// Run test if called directly
if (require.main === module) {
  runTest();
}