# Store privacy forms

Answers for App Store Connect "App Privacy" and Google Play "Data safety", taken from what the code does
today. Re-check when adding an SDK (analytics, crash reporting, ads) or a new data type.

Shared answers: no tracking, no ads, nothing sold, data encrypted in transit, users can delete their account
in the app (Profile → Delete account). Privacy policy URL: [PUBLIC URL OF privacy-policy.md].

| Data type (Apple / Google) | Collected | Linked to user | Purpose | Optional |
|---|---|---|---|---|
| Contact info: name, email | Yes | Yes | App functionality, account management | No |
| Photos | Yes (receipts, documents, profile photo) | Yes | App functionality | Yes |
| Location: precise | Yes, only while recording a trip | Yes | App functionality | Yes (trips off by default) |
| User content: other (vehicles, records, notes) | Yes | Yes | App functionality | No |
| Purchases / financial info | No (costs typed in are user content, not payment data) | | | |
| Identifiers: user ID | Yes | Yes | App functionality | No |
| Diagnostics, usage data, contacts, browsing | No | | | |

Notes for reviewers:

- Google Play: "shared with third parties" = No for everything. Hosting providers are processors, and price
  reports appear without name or account.
- Apple: the IP address in sign-in sessions is used for security only, not tracking.
- Location: when-in-use only, no background location; purpose strings live in `apps/mobile/app.json`.
- Receipt text recognition runs on the device; no photo leaves it for OCR.
- Account deletion is in the app, as both stores require.
