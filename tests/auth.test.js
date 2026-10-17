import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ADMIN_EMAIL, isAdmin, authErrorMessage } from '../src/lib/auth.js'

test('isAdmin ne reconnaît que le compte de Martin, sans tenir compte de la casse', () => {
  assert.equal(ADMIN_EMAIL, 'martinantel@me.com')
  assert.equal(isAdmin({ email: 'MartinAntel@me.com' }), true)
  assert.equal(isAdmin({ email: 'coach@exemple.com' }), false)
  assert.equal(isAdmin(null), false)
})

test('authErrorMessage traduit les erreurs courantes', () => {
  assert.equal(authErrorMessage({ code: 'invalid_credentials', message: 'Invalid login credentials' }), 'Courriel ou mot de passe invalide.')
  assert.equal(authErrorMessage({ code: 'email_not_confirmed' }), 'Ton courriel n’est pas encore confirmé : ouvre le lien reçu par courriel.')
  assert.equal(authErrorMessage({ code: 'weak_password' }), 'Mot de passe trop faible : au moins 6 caractères.')
  assert.equal(authErrorMessage({ code: 'user_already_exists' }), 'Un compte existe déjà avec ce courriel : connecte-toi.')
  assert.equal(authErrorMessage({ code: 'over_email_send_rate_limit' }), 'Trop de courriels envoyés : réessaie dans quelques minutes.')
  assert.equal(authErrorMessage({ code: 'email_exists' }), 'Ce coach a déjà un compte.')
  assert.equal(authErrorMessage({ message: 'Autre chose' }), 'Autre chose')
})

test('parseAuthHash lit un lien d’invitation', async () => {
  const { parseAuthHash } = await import('../src/lib/auth.js')
  assert.deepEqual(parseAuthHash('#access_token=aaa&expires_in=3600&refresh_token=bbb&token_type=bearer&type=invite'), {
    access_token: 'aaa',
    refresh_token: 'bbb',
    type: 'invite',
  })
  assert.deepEqual(parseAuthHash('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'), {
    error: 'otp_expired',
  })
  assert.equal(parseAuthHash('#/plan'), null)
  assert.equal(parseAuthHash('#/partage?p=abc'), null)
  assert.equal(parseAuthHash(''), null)
})
