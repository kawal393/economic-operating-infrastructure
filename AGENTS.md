# Technical decisions

- `pilot_requests` holds pricing-page pilot/waitlist submissions. Writes go through the server client only (service role); the table has RLS enabled with zero policies, so neither anon nor authenticated users can select, update or delete rows. Owner notification emails are not wired until an email domain is verified.
- Form submissions run through Sentinel (`consumeRateLimit`, `inspect`, `sanitiseText`) and include a honeypot field (`website`); a filled honeypot returns success without inserting, so bots cannot probe the endpoint.
- Each stored pilot request is self-sealed (`src/lib/pilot-seal*.ts`): the platform key signs an Apex PSI receipt over SHA-256 of a salted RFC 8785 opening document, published via `publishToLedger` and anchored best-effort. Only the digest is public; the salt stays in the private row so deleting row + salt crypto-shreds the link (privacy/erasure). Sealing failure never fails the submission.
- Tests use vitest (`bunx vitest run`); pure logic lives in server-free modules so it can be tested without the backend.
