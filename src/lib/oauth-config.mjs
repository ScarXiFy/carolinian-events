export function isGithubAuthConfigured(env = process.env) {
  return Boolean(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET);
}

export function isGoogleAuthConfigured(env = process.env) {
  return Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
}

export function getConfiguredOAuthProviders(env = process.env) {
  return {
    github: isGithubAuthConfigured(env),
    google: isGoogleAuthConfigured(env),
  };
}
