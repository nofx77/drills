export const ADMIN_EMAIL = 'martinantel@me.com'

export const isAdmin = (user) => user?.email?.toLowerCase() === ADMIN_EMAIL

const MESSAGES = {
  invalid_credentials: 'Courriel ou mot de passe invalide.',
  email_not_confirmed: 'Ton courriel n’est pas encore confirmé : ouvre le lien reçu par courriel.',
  weak_password: 'Mot de passe trop faible : au moins 6 caractères.',
  user_already_exists: 'Un compte existe déjà avec ce courriel : connecte-toi.',
  over_email_send_rate_limit: 'Trop de courriels envoyés : réessaie dans quelques minutes.',
  same_password: 'Ce mot de passe est déjà le tien.',
}

export const authErrorMessage = (error) => MESSAGES[error?.code] ?? error?.message ?? 'Une erreur est survenue.'
