# Technical decisions

- `pilot_requests` holds pricing-page pilot/waitlist submissions. Writes go through the server client only (service role); the table has RLS enabled with zero policies, so neither anon nor authenticated users can select, update or delete rows. Owner notification emails are not wired until an email domain is verified.
- Form submissions run through Sentinel (`consumeRateLimit`, `inspect`, `sanitiseText`) and include a honeypot field (`website`); a filled honeypot returns success without inserting, so bots cannot probe the endpoint.
