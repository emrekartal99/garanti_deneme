# Garanti BBVA Account Transactions API Specification

## Overview

The Account Transactions service of Electronic Bank Statement is used to get transactions with enriched information of given accounts within a specified time interval.

**API Category**: Cash Management  
**Version**: V1  
**Environment**: Development Sandbox Service

## Authentication

**Method**: OAuth 2.0 with Client Credentials Flow

### Important Notes
- Access tokens **can only be used ONCE** per documentation
- Fresh token required for each API call
- No approval required for sandbox testing

### OAuth 2.0 Flow

#### Token Request
```http
POST /auth/oauth/v2/token HTTP/1.1
Host: apis.garantibbva.com.tr:443
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&scope=oob
```

#### Token Response
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "oob"
}
```

## API Endpoints

### Base URL
```
https://apis.garantibbva.com.tr:443
```

### Account Transactions Endpoint
```
POST /balancesandmovements/accountinformation/transaction/v1/gettransactions
```

## Request Format

### Headers
```
Content-Type: application/json
Authorization: Bearer {ACCESS_TOKEN}
Accept: application/json
```

### Request Body
```json
{
  "consentId": "string (required)",
  "unitNum": "string (optional)",
  "accountNum": "string (optional)", 
  "IBAN": "string (optional)",
  "startDate": "string (required) - ISO 8601 format",
  "endDate": "string (required) - ISO 8601 format",
  "transactionId": "string (optional)",
  "pageIndex": "integer (optional)",
  "pageSize": "integer (optional, max 500)"
}
```

### Field Descriptions

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `consentId` | String | Consent ID obtained after enrollment process | ✅ Yes |
| `unitNum` | Integer | Branch number of account | ❓ Optional |
| `accountNum` | Integer | Account number for which details are requested | ❓ Optional |
| `IBAN` | String | IBAN of the account | ❓ Optional |
| `startDate` | Timestamp | Start date of transaction period (ISO 8601) | ✅ Yes |
| `endDate` | Timestamp | End date of transaction period (ISO 8601) | ✅ Yes |
| `transactionId` | String | Category code of transaction | ❓ Optional |
| `pageIndex` | Integer | Page index number | ❓ Optional |
| `pageSize` | Integer | Number of transactions per page (max 500) | ❓ Optional |

### Constraints
- **Date Range**: Maximum 30 days between startDate and endDate
- **Page Size**: Maximum 500 transactions per page
- **Date Format**: ISO 8601 format (YYYY-MM-DDTHH:mm:ss.fff)

## Response Format

### Success Response (200)
```json
{
  "result": {
    "returnCode": 200,
    "reasonCode": 1,
    "messageText": "Başarılı"
  },
  "transactions": [
    {
      "customerNum": 45245447,
      "customerName": "DURU LTD",
      "VKN": 1194136989,
      "TCKN": null,
      "productId": "9d5de526-e32c-5cc7-81ce-545b93ade759",
      "unitNum": 295,
      "accountNum": 6291296,
      "currencyCode": "TL",
      "IBAN": "TR620006200029500006291296",
      "activityDate": "2020-12-25",
      "valueDate": "2020-12-28", 
      "txnCreditDebitIndicator": "A",
      "amount": 1250.67,
      "balanceAfterTransaction": 9836180.2,
      "explanation": "Transaction description",
      "transactionId": "WPDT",
      "clasificationCode": "NDTS",
      "corrVKN": "1518410029",
      "corrTCKN": null,
      "corrCustomerNum": 45271413,
      "transactionReferenceId": "2020-12-25T16:13:36.688516",
      "transactionInstanceId": "2020-12-25T16:13:36.862988",
      "enrichmentInformation": [...]
    }
  ]
}
```

### Transaction Fields

| Field | Type | Description |
|-------|------|-------------|
| `customerNum` | Integer | Customer number |
| `customerName` | String | Customer name |
| `VKN` | Integer | Tax number |
| `TCKN` | Integer | Identity number |
| `txnCreditDebitIndicator` | String | "A" = Credit, "B" = Debit |
| `amount` | Number | Transaction amount |
| `balanceAfterTransaction` | Number | Account balance after transaction |
| `explanation` | String | Transaction description |

## Error Responses

### HTTP Error Codes

| Code | Description |
|------|-------------|
| 200 | OK - Success |
| 400 | Invalid Request |
| 401 | Invalid Credentials |
| 405 | Method Not Allowed |
| 429 | API Plan Limit Exceeded |
| 500 | Internal Server Error |

### Business Error Codes (reasonCode)

| Code | Description (Turkish) | Description (English) |
|------|----------------------|----------------------|
| 2 | Consent id bilgisi zorunludur | Consent ID is required |
| 4 | ClientId-consentId bilgileri hatalıdır | Client/Consent ID mismatch |
| 5 | Şube ve Hesap numaraları birlikte gönderilmelidir | Branch and Account numbers must be sent together |
| 6 | Hesap bilgisi hatalıdır | Account information is incorrect |
| 13 | Hesap bilgisi ile İban bilgisi uyumsuzdur | Account and IBAN information mismatch |
| 15 | Transactionid bilgisi hatalıdır | Transaction ID information is incorrect |
| 18 | Başlangıç-Bitiş tarih aralığı 30 günden fazla olamaz | Date range cannot exceed 30 days |
| 19 | Tarih bilgisi hatalıdır | Date information is incorrect |
| 21 | Tarih bilgileri formatı hatalıdır | Date format is incorrect |
| 30 | Page Size alanı 500 den büyük olamaz | Page size cannot exceed 500 |

## Enrichment Information

The API provides enriched transaction data through various modules:

### Available Enrichment Codes

| Code | Description |
|------|-------------|
| `CORRACNT` | Corresponding account information |
| `MUS` | Customer name information |
| `HES` | Account type and product information |
| `DTS` | Firm and invoice information |
| `DEK` | Detail text information |
| `MAAS` | Salary payment information |
| `THE` | Money transfer information |
| `DIM` | International money transfer information |
| `DOV` | Foreign exchange information |
| `EFT` | Electronic funds transfer information |

## Sample Test Data

### Valid Test Request
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

## Integration Notes

### Prerequisites
1. Valid Garanti BBVA Developer Account
2. OAuth 2.0 Client Credentials (Client ID & Secret)
3. Application enabled for Account Transactions API

### Best Practices
1. Always use fresh tokens (single-use requirement)
2. Implement proper error handling for all response codes
3. Respect rate limits and implement retry logic
4. Validate date ranges before making requests
5. Handle network timeouts appropriately

### Common Issues
1. **Invalid Client**: Check OAuth credentials and application status
2. **401 Unauthorized**: Ensure fresh token usage and valid consent ID
3. **Date Range Errors**: Verify 30-day limit and ISO 8601 format
4. **IBAN Mismatch**: Ensure account number matches IBAN

## Support

- **Developer Portal**: https://developers.garantibbva.com.tr
- **Support Email**: ETicaretDestek@garantibbva.com.tr
- **Documentation**: This repository `/docs` folder

---

**Last Updated**: December 2024  
**API Version**: V1  
**Environment**: Development Sandbox