const https = require('https');
const querystring = require('querystring');

/**
 * Garanti BBVA API Test - Based on provided documentation
 * KEY: Access tokens can only be used ONCE per documentation
 */

// From your credentials file
const CLIENT_ID = 'l73f77bcc8c7714d8783db8d321a001ed6';
const CLIENT_SECRET = 'aa656a56918e4e9898d199d87f1d35ef';

// From your documentation - DEVELOPMENT SANDBOX SERVICE
const BASE_URL = 'apis.garantibbva.com.tr';
const TOKEN_URL = 'https://apis.garantibbva.com.tr/auth/oauth/v2/token';
const API_PATH = '/balancesandmovements/accountinformation/transaction/v1/gettransactions';

// EXACT request data from your api.json
const TEST_REQUEST = {
  "consentId": "3e09da8a-ae9c-50bc-b34a-c61531729dbe",
  "unitNum": "295",
  "accountNum": "6291296",
  "IBAN": "TR620006200029500006291296",
  "startDate": "2020-12-25T12:53:07.867",
  "endDate": "2020-12-25T17:53:07.867",
  "transactionId": "",
  "pageIndex": 1,
  "pageSize": 100
};

// Get fresh OAuth token (must be fresh for each API call per documentation)
function getOAuthToken() {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      'grant_type': 'client_credentials',
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET,
      'scope': 'oob'
    });

    const url = new URL(TOKEN_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`🔑 Getting fresh OAuth token from: ${TOKEN_URL}`);
    console.log(`📋 Client ID: ${CLIENT_ID}`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📡 Token Response Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 && response.access_token) {
            console.log('✅ Fresh token obtained successfully');
            console.log(`🎫 Token: ${response.access_token.substring(0, 20)}...`);
            resolve(response.access_token);
          } else {
            console.log('❌ Token request failed');
            console.log('📄 Response:', JSON.stringify(response, null, 2));
            reject(new Error(`Token request failed: ${JSON.stringify(response)}`));
          }
        } catch (error) {
          console.log('❌ Failed to parse token response');
          console.log('📄 Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Token request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Call API with fresh token
function callAPIWithFreshToken(accessToken) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(TEST_REQUEST);

    const options = {
      hostname: BASE_URL,
      port: 443,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // Fresh token for this call
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n🌐 Making API call to: https://${BASE_URL}${API_PATH}`);
    console.log(`🔐 Using fresh Bearer token: ${accessToken.substring(0, 20)}...`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📡 API Response Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ API call successful!');
            resolve(response);
          } else {
            console.log('❌ API call failed');
            console.log('📄 Response:', JSON.stringify(response, null, 2));
            reject(new Error(`API call failed: ${JSON.stringify(response)}`));
          }
        } catch (error) {
          console.log('❌ Failed to parse API response');
          console.log('📄 Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ API request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Display results
function displayResults(response) {
  console.log('\n🎉 SUCCESS! API Response:');
  console.log('='.repeat(50));
  
  if (response.result) {
    console.log(`Return Code: ${response.result.returnCode}`);
    console.log(`Reason Code: ${response.result.reasonCode}`);
    console.log(`Message: ${response.result.messageText}`);
  }
  
  if (response.transactions && response.transactions.length > 0) {
    console.log(`\n💰 Found ${response.transactions.length} transactions:\n`);
    
    response.transactions.forEach((transaction, index) => {
      console.log(`Transaction ${index + 1}:`);
      console.log(`  Customer: ${transaction.customerName}`);
      console.log(`  Date: ${transaction.activityDate}`);
      console.log(`  Amount: ${transaction.amount} ${transaction.currencyCode || 'TL'}`);
      console.log(`  Type: ${transaction.txnCreditDebitIndicator === 'A' ? 'Credit' : 'Debit'}`);
      console.log(`  Description: ${transaction.explanation}`);
      console.log(`  Balance: ${transaction.balanceAfterTransaction}`);
      console.log('  ---');
    });
  } else {
    console.log('\n📋 No transactions found (this might be expected for test data)');
  }
}

// Main test function
async function testAPI() {
  console.log('🚀 Testing Garanti BBVA Account Transactions API');
  console.log('📋 DEVELOPMENT SANDBOX SERVICE (from your documentation)');
  console.log('⚠️  KEY: Getting fresh token for each call (tokens used only once)\n');
  
  try {
    // Step 1: Get fresh OAuth token
    const accessToken = await getOAuthToken();
    
    // Step 2: Call API with fresh token
    const response = await callAPIWithFreshToken(accessToken);
    
    // Step 3: Display results
    displayResults(response);
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    
    console.log('\n🔍 Troubleshooting:');
    if (error.message.includes('invalid_client')) {
      console.log('❌ Invalid client credentials');
      console.log('✓ Double-check your CLIENT_ID and CLIENT_SECRET');
      console.log('✓ Verify credentials are active in developer portal');
      console.log('✓ Check if application status changed');
    } else if (error.message.includes('401')) {
      console.log('❌ Unauthorized - possible credential or consent issues');
      console.log('✓ Your credentials might be correct but inactive');
      console.log('✓ The consent ID might be invalid for your account');
    } else {
      console.log('✓ Check network connectivity');
      console.log('✓ Verify API endpoints are accessible');
    }
    
    console.log('\n📞 Support: developers.garantibbva.com.tr');
  }
}

// Run the test
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI, getOAuthToken, callAPIWithFreshToken, displayResults };