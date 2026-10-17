# E-Sign (simple DocuSign-like)

Admin (abdul, kholoud) log in → upload PDF → drag boxes per signer → share ONE link.
Anyone with the link picks their name, draws a signature, submits. Only admins can download the signed PDF.

## Deploy
1. Push this folder to GitHub.
2. Create a free Neon database; copy the connection string.
3. Import the repo in Vercel and set env vars (see `.env.example`):
   `DATABASE_URL`, `SESSION_SECRET` (long random), `ADMIN_USERS` (`abdul:pass1,kholoud:pass2`).
4. Deploy. Tables are created automatically on first use.

## Notes
- PDFs are stored in Postgres (base64). Keep files under ~3 MB (Vercel's 4.5 MB request limit).
- The shared link is unguessable but anyone holding it can pick any unsigned name.
