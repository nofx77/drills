export const ADMIN_EMAIL = 'martinantel@me.com'

export const isAdmin = (user) => user?.email?.toLowerCase() === ADMIN_EMAIL

const MESSAGES = {
  invalid_credentials: 'Courriel ou mot de passe invalide.',
  email_not_confirmed: 'Ton courriel n’est pas encore confirmé : ouvre le lien reçu par courriel.',
  weak_password: 'Mot de passe trop faible : au moins 6 caractères.',
  user_already_exists: 'Un compte existe déjà avec ce courriel : connecte-toi.',
  over_email_send_rate_limit: 'Trop de courriels envoyés : réessaie dans quelques minutes.',
  same_password: 'Ce mot de passe est déjà le tien.',
  email_exists: 'Ce coach a déjà un compte.',
  otp_expired: 'Ce lien a expiré ou a déjà servi. Demande un nouveau lien ou une nouvelle invitation.',
  signup_disabled: 'Aucun compte pour ce courriel. Demande une invitation à ton administrateur.',
  otp_disabled: 'Aucun compte pour ce courriel. Demande une invitation à ton administrateur.',
}

export const authErrorMessage = (error) => MESSAGES[error?.code] ?? error?.message ?? 'Une erreur est survenue.'

export function parseAuthHash(hash) {
  if (!hash || hash.startsWith('#/')) return null
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  if (params.get('error') || params.get('error_code')) return { error: params.get('error_code') || params.get('error') }
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  if (!access_token || !refresh_token) return null
  return { access_token, refresh_token, type: params.get('type') }
}
