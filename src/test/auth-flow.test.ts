import { describe, expect, it } from 'vitest';
import { authSearchSchema, confirmationRedirect, authErrorMessage } from '@/features/account/auth-flow';

describe('Account confirmation', () => {
  it('returns confirmation links to the same site public sign-in page', () => {
    expect(confirmationRedirect('https://pixel-perfect-echo-0927.lovable.app')).toBe('https://pixel-perfect-echo-0927.lovable.app/auth?mode=login');
  });
  it('allows redirects to sign-in without mandatory search parameters', () => {
    expect(authSearchSchema.parse({})).toEqual({ mode: 'login' });
  });
  it('does not treat an unconfirmed account as signed in', () => {
    expect(authErrorMessage({ code: 'email_not_confirmed' })).toContain('Confirma o teu email antes de entrar');
  });
});