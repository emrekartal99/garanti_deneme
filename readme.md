# Garanti BBVA API Integration Testing

A Node.js test client for Garanti BBVA Account Transactions API integration, specifically designed for the **Development Sandbox Environment**.

## 📋 Project Overview

This project tests the Garanti BBVA Account Transactions API using the official documentation and sandbox environment. The API allows retrieving enriched transaction information for specified accounts within a given time interval.

## 🎯 Current Status: TESTING SANDBOX ENVIRONMENT

- ✅ **Environment**: Development Sandbox Service  
- ✅ **Credentials**: Valid OAuth 2.0 Client Credentials obtained
- ✅ **Documentation**: API specifications reviewed and implemented
- ⚠️ **Issue**: Receiving "invalid_client" error despite valid credentials

## 📁 Repository Structure

```
garanti-api-integration/
├── README.md                 # This file
├── package.json              # Node.js dependencies
├── .gitignore               # Git ignore rules
├── src/
│   ├── api-client.js        # Main API test client
│   └── config.js            # Configuration constants
├── docs/
│   ├── api-specification.md # Original API documentation
│   ├── api.json            # OpenAPI specification
│   └── credentials.md       # Credentials documentation
├── tests/
│   └── test-results.log    # Latest test execution logs
└── .env.example            # Environment variables template
```

## 🔧 Technical Details

### API Endpoints
- **Base URL**: `https://apis.garantibbva.com.tr:443`
- **Token Endpoint**: `/auth/oauth/v2/token`
- **API Endpoint**: `/balancesandmovements/accountinformation/transaction/v1/gettransactions`

### Authentication
- **Method**: OAuth 2.0 Client Credentials Flow
- **Grant Type**: `client_credentials`
- **Scope**: `oob` (Out of Band for authorized developers)
- **Key Requirement**: Access tokens can only be used **once** per documentation

### Request Format
```json
{
  "consentId": "3e09da8a-ae9c-50bc-b34a-c61531729dbe",
  "unitNum": "295", 
  "accountNum": "6291296",
  "IBAN": "TR620006200029500006291296",
  "startDate": "2020-12-25T12:53:07.867",
  "endDate": "2020-12-25T17:53:07.867",
  "transactionId": "",
  "pageIndex": 1,
  "pageSize": 100
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Valid Garanti BBVA Developer Account
- OAuth 2.0 Client Credentials

### Installation
```bash
git clone <repository-url>
cd garanti-api-integration
npm install
```

### Configuration
1. Copy `.env.example` to `.env`
2. Add your OAuth credentials:
   ```
   OAUTH_CLIENT_ID=your_client_id_here
   OAUTH_CLIENT_SECRET=your_client_secret_here
   ```

### Run Tests
```bash
npm test
```
or
```bash
node src/api-client.js
```

## 📊 Current Test Results

### Latest Execution
```
🔑 Getting fresh OAuth token from: https://apis.garantibbva.com.tr/auth/oauth/v2/token
📋 Client ID: l73f77bcc8c7714d8783db8d321a001ed6
📡 Token Response Status: 401
❌ Token request failed
📄 Response: {
  "error": "invalid_client",
  "error_description": "The given client credentials were not valid"
}
```

## 🔍 Issue Analysis

### Problem Description
- **Error**: `invalid_client` with description "The given client credentials were not valid"
- **Context**: Testing in Development Sandbox Environment (no approval required)
- **Credentials**: Valid and obtained from developer portal
- **API Status**: Enabled in UI dashboard

### Investigation Steps Taken
1. ✅ Verified credentials are correct
2. ✅ Confirmed sandbox environment doesn't require approval
3. ✅ Implemented fresh token for each request (per documentation)
4. ✅ Used exact request format from API specification
5. ✅ Tested multiple authentication methods

### Potential Causes
1. **Application Status**: Credentials might be inactive despite UI showing enabled
2. **Environment Configuration**: Possible sandbox configuration issue
3. **API Access**: Service might require additional activation steps
4. **Documentation Gap**: Missing sandbox-specific requirements

## 📞 Next Steps

### Immediate Actions Needed
1. **Verify Application Status**: Check if sandbox access is properly activated
2. **Contact Garanti BBVA Support**: Escalate credential validation issue
3. **Alternative Testing**: Try different sandbox endpoints if available
4. **Documentation Review**: Request sandbox-specific setup guide

### Contact Information
- **Developer Portal**: https://developers.garantibbva.com.tr
- **Support Email**: ETicaretDestek@garantibbva.com.tr (from documentation)

## 🛠️ Development

### Dependencies
- `https` (Node.js built-in)
- `querystring` (Node.js built-in)

### Code Quality
- ✅ Clean, readable code structure
- ✅ Comprehensive error handling  
- ✅ Detailed logging for debugging
- ✅ Based on official API documentation

### Testing Strategy
- Unit tests for API client functions
- Integration tests with mock responses
- Documentation of test cases and results

## 📝 Documentation

All API documentation and specifications are stored in the `/docs` folder:
- Original Garanti BBVA documentation
- OpenAPI specification (api.json)
- Credentials and setup information

## 🔐 Security

- Credentials are stored in environment variables
- No sensitive information committed to repository
- Secure HTTPS communication only
- OAuth 2.0 compliant authentication flow

---

**Last Updated**: December 2024  
**Status**: In Development - Investigating Authentication Issues  
**Priority**: High - Required for integration project