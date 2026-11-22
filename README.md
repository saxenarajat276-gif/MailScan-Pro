# MailScan Pro

A professional, privacy-conscious email exposure checker.

## What it does

- Validates an email address.
- Sends the address only from your server to the configured breach-data provider.
- Checks known breaches using the Have I Been Pwned (HIBP) API.
- Calculates a transparent MailScan risk score from returned data classes.
- Shows breach name, domain, date, exposed data categories and severity.
- Does NOT attempt login, password reset, signup, account enumeration, or access to private accounts.

## Important scope

No public service can reliably tell you every website where an email has an account. MailScan therefore reports **known breach/exposure records available through its configured data sources**, not a claim of "every account on the internet."

## Setup

1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run:

   npm install

4. Copy `.env.example` to `.env`.
5. Add your HIBP API key to `HIBP_API_KEY`.
6. Start:

   npm start

7. Open http://localhost:3000

### Testing without a paid key

HIBP documents a test API key for test accounts. Use:

- Email: `account-exists@hibp-integration-tests.com`
- Test key: `00000000000000000000000000000000`

Do not use the test key for real addresses.

## API

`POST /api/scan`

Body:

```json
{ "email": "person@example.com" }
```

Response:

```json
{
  "email": "person@example.com",
  "found": true,
  "riskScore": 72,
  "riskLevel": "High",
  "summary": {
    "breaches": 3,
    "exposures": 8,
    "uniqueDomains": 3
  },
  "breaches": []
}
```

## Production checklist

- Put the app behind HTTPS.
- Keep HIBP_API_KEY server-side.
- Add persistent rate limiting (Redis or your platform's edge limiter).
- Add structured logging without storing submitted email addresses.
- Add a privacy policy and terms before public launch.
- Review the HIBP API license/attribution requirements.
- Do not cache raw email lookup responses unless your provider terms permit it.
