/**
 * Garanti BBVA Account Transactions API Client
 * 
 * Professional implementation using environment variables for security
 * Uses the exact requirements from documentation
 */

const https = require('https');
const querystring = require('querystring');
const config = require('./config');

class GarantiBBVAApiClient {
  constructor() {
    this.currentToken = null;
    this.logEnvironmentInfo();
  }

  /**
   * Log environment configuration (for debugging)
   */
  logEnvironmentInfo() {
    if (config.APP_SETTINGS.enableDebugLogs) {
      console.log('🔧 Configuration loaded:');
      console.log(`   Environment: ${config.APP_SETTINGS.environment}`);
      console.log(`   Client ID: ${config.CLIENT_ID}`);
      console.log(`   Client Secret: ${config.CLIENT_SECRET.substring(0, 8)}...`);
      console.log(`   API Base URL: ${config.API_BASE_URL}`);
      console.log(`   Debug Logs: ${config.APP_SETTINGS.enableDebugLogs}`);
    }
  }

  /**
   * Get fresh OAuth token (required for each API call per documentation)
   */
  async getOAuthToken() {
    return new Promise((resolve, reject) => {
      const postData = querystring.stringify({
        grant_type: config.OAUTH_SETTINGS.grantType,
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
        scope: config.OAUTH_SETTINGS.scope
      });

      const tokenUrl = new URL(config.API_BASE_URL + config.TOKEN_ENDPOINT);
      const options = {
        hostname: tokenUrl.hostname,
        port: tokenUrl.port || 443,
        path: tokenUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: config.APP_SETTINGS.requestTimeout
      };

      console.log(`🔑 Getting OAuth token from: ${tokenUrl.href}`);
      console.log(`📋 Client ID: ${config.CLIENT_ID}`);
      console.log(`🎯 Scope: ${config.OAUTH_SETTINGS.scope}`);

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`📡 Token Response Status: ${res.statusCode}`);
          
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === config.HTTP_CODES.SUCCESS && response.access_token) {
              this.currentToken = response.access_token;
              console.log('✅ Fresh token obtained successfully');
              console.log(`🎫 Token: ${response.access_token.substring(0, 20)}...`);
              if (response.expires_in) {
                console.log(`⏰ Token expires in: ${response.expires_in} seconds`);
              }
              resolve(response.access_token);
            } else {
              console.log('❌ Token request failed');
              console.log('Response:', JSON.stringify(response, null, 2));
              reject(new Error(`Token request failed: ${JSON.stringify(response)}`));
            }
          } catch (error) {
            console.log('❌ Failed to parse token response');
            console.log('Raw response:', data);
            reject(error);
          }
        });
      });

      req.on('error', error => {
        console.log('❌ Token request error:', error.message);
        reject(error);
      });

      req.on('timeout', () => {
        console.log('❌ Token request timeout');
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
  async getAccountTransactions() {
    return new Promise((resolve, reject) => {
      const requestData = config.TEST_DATA;
      const postData = JSON.stringify(requestData);
      
      const apiUrl = new URL(config.API_BASE_URL);
      const options = {
        hostname: apiUrl.hostname,
        port: apiUrl.port || 443,
        path: config.TRANSACTIONS_ENDPOINT,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.currentToken}`,
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: config.APP_SETTINGS.requestTimeout
      };

      console.log(`\n🌐 Making API call to: ${config.API_BASE_URL}${config.TRANSACTIONS_ENDPOINT}`);
      console.log(`🔐 Using Bearer token: ${this.currentToken.substring(0, 20)}...`);
      
      if (config.APP_SETTINGS.enableDebugLogs) {
        console.log('📋 Request data:', JSON.stringify(requestData, null, 2));
      }

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`📡 API Response Status: ${res.statusCode}`);
          
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === config.HTTP_CODES.SUCCESS) {
              console.log('✅ API call successful!');
              resolve(response);
            } else {
              console.log('❌ API call failed');
              console.log('Response:', JSON.stringify(response, null, 2));
              this.analyzeError(res.statusCode, response);
              reject(new Error(`API call failed: ${JSON.stringify(response)}`));
            }
          } catch (error) {
            console.log('❌ Failed to parse API response');
            console.log('Raw response:', data);
            reject(error);
          }
        });
      });

      req.on('error', error => {
        console.log('❌ API request error:', error.message);
        reject(error);
      });

      req.on('timeout', () => {
        console.log('❌ API request timeout');
        req.destroy();
        reject(new Error('API request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Analyze errors and provide guidance
   */
  analyzeError(statusCode, response) {
    console.log('\n🔍 Error Analysis:');
    
    switch (statusCode) {
      case config.HTTP_CODES.UNAUTHORIZED:
        console.log('🚫 401 Unauthorized - Authentication failed');
        console.log('💡 Possible causes:');
        console.log('   • OAuth credentials invalid or inactive');
        console.log('   • Application not approved for API access');
        console.log('   • Consent ID invalid for your account');
        console.log('   • Access token expired or already used (single-use requirement)');
        break;
        
      case config.HTTP_CODES.BAD_REQUEST:
        const reasonCode = response?.result?.reasonCode;
        const errorMessage = config.ERROR_CODES[reasonCode];
        console.log(`🚫 400 Bad Request - Reason Code ${reasonCode}`);
        if (errorMessage) {
          console.log(`💡 ${errorMessage}`);
        }
        break;
        
      case config.HTTP_CODES.FORBIDDEN:
        console.log('🚫 403 Forbidden - Access denied');
        console.log('💡 Your application may not have permission for this API');
        break;
        
      case config.HTTP_CODES.RATE_LIMIT:
        console.log('🚫 429 Rate Limit - Too many requests');
        console.log('💡 Wait before making additional requests');
        break;
        
      case config.HTTP_CODES.INTERNAL_ERROR:
        console.log('🚫 500 Internal Server Error - Server-side issue');
        console.log('💡 This is likely a temporary server problem');
        break;
        
      default:
        console.log(`🚫 HTTP ${statusCode} - Unexpected error`);
    }
  }

  /**
   * Display API results
   */
  displayResults(response) {
    console.log('\n🎉 SUCCESS! API Response:');
    console.log('='.repeat(50));
    
    if (response.result) {
      console.log(`📊 Return Code: ${response.result.returnCode}`);
      console.log(`📊 Reason Code: ${response.result.reasonCode}`);
      console.log(`📊 Message: ${response.result.messageText}`);
    }
    
    if (response.transactions && response.transactions.length > 0) {
      console.log(`\n💰 Found ${response.transactions.length} transactions:\n`);
      
      response.transactions.forEach((transaction, index) => {
        console.log(`Transaction ${index + 1}:`);
        console.log(`  👤 Customer: ${transaction.customerName}`);
        console.log(`  📅 Date: ${transaction.activityDate} (Value: ${transaction.valueDate})`);
        console.log(`  💵 Amount: ${transaction.amount} ${transaction.currencyCode || 'TL'}`);
        console.log(`  📈 Type: ${transaction.txnCreditDebitIndicator === 'A' ? 'Credit' : 'Debit'}`);
        console.log(`  📝 Description: ${transaction.explanation}`);
        console.log(`  💰 Balance: ${transaction.balanceAfterTransaction}`);
        console.log(`  🔖 Transaction ID: ${transaction.transactionId}`);
        
        // Show enrichment data if debug mode
        if (config.APP_SETTINGS.enableDebugLogs && transaction.enrichmentInformation) {
          console.log(`  ℹ️  Enrichment:`, JSON.stringify(transaction.enrichmentInformation, null, 4));
        }
        console.log('  ---');
      });
    } else {
      console.log('\n📋 No transactions found (might be expected for test data)');
    }
  }
}

/**
 * Main test function
 */
async function runTest() {
  const client = new GarantiBBVAApiClient();
  
  console.log('🚀 Testing Garanti BBVA Account Transactions API');
  console.log('📋 Environment: DEVELOPMENT SANDBOX SERVICE');
  console.log('⚠️  Note: Using fresh token for each call (single-use requirement)\n');
  
  try {
    // Step 1: Get fresh OAuth token
    await client.getOAuthToken();
    
    // Step 2: Call API with fresh token
    const response = await client.getAccountTransactions();
    
    // Step 3: Display results
    client.displayResults(response);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.log('\n💥 Test failed:', error.message);
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Verify OAuth credentials in developer portal');
    console.log('2. Check application approval status');
    console.log('3. Confirm sandbox environment access');
    console.log('4. Validate .env configuration');
    console.log('5. Contact support: ETicaretDestek@garantibbva.com.tr');
    
    // Exit with error for CI/CD
    process.exit(1);
  }
}

// Export for use as module
module.exports = {
  GarantiBBVAApiClient,
  runTest
};

// Run if called directly
if (require.main === module) {
  runTest();
}