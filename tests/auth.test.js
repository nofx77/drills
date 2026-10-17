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
  assert.equal(authErrorMessage({ message: 'Autre chose' }), 'Autre chose')
})
