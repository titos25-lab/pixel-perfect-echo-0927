# Security Policy

## Reporting a vulnerability

Do not publish passwords, access tokens, API keys, database URLs, private keys, or personal data in GitHub issues or pull requests.

For a suspected vulnerability, contact the repository owner privately through the GitHub profile and include:
- A concise description of the issue.
- Steps to reproduce it.
- The potential impact.

## Secrets and environment variables

- Never commit `.env`, `.env.*`, `.dev.vars`, credentials, or private keys.
- Keep production secrets in Lovable/Supabase secret management or the relevant hosting provider's secret store.
- Use only public, restricted client configuration in browser code.
- Keep service-role keys and privileged credentials on the server.
- If a secret was committed or exposed, revoke or rotate it immediately. Deleting the file in a later commit does not remove it from Git history.
- Review repository history and deployment logs after an exposure.

## Supported versions

Security fixes are applied to the current default branch (`main`).
