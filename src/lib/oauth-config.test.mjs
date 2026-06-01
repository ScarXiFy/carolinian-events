import test from "node:test";
import assert from "node:assert/strict";

import {
  getConfiguredOAuthProviders,
  isGithubAuthConfigured,
  isGoogleAuthConfigured,
} from "./oauth-config.mjs";

test("isGithubAuthConfigured requires both GitHub OAuth values", () => {
  assert.equal(isGithubAuthConfigured({}), false);
  assert.equal(isGithubAuthConfigured({ AUTH_GITHUB_ID: "id" }), false);
  assert.equal(isGithubAuthConfigured({ AUTH_GITHUB_SECRET: "secret" }), false);
  assert.equal(
    isGithubAuthConfigured({
      AUTH_GITHUB_ID: "id",
      AUTH_GITHUB_SECRET: "secret",
    }),
    true,
  );
});

test("isGoogleAuthConfigured requires both Google OAuth values", () => {
  assert.equal(isGoogleAuthConfigured({}), false);
  assert.equal(
    isGoogleAuthConfigured({
      AUTH_GOOGLE_ID: "id",
      AUTH_GOOGLE_SECRET: "secret",
    }),
    true,
  );
});

test("getConfiguredOAuthProviders only returns configured providers", () => {
  assert.deepEqual(getConfiguredOAuthProviders({}), {
    github: false,
    google: false,
  });
  assert.deepEqual(
    getConfiguredOAuthProviders({
      AUTH_GITHUB_ID: "github-id",
      AUTH_GITHUB_SECRET: "github-secret",
      AUTH_GOOGLE_ID: "google-id",
      AUTH_GOOGLE_SECRET: "google-secret",
    }),
    {
      github: true,
      google: true,
    },
  );
});
