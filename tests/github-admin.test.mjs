import test from 'node:test'
import assert from 'node:assert/strict'

import pkg from '../lib/github-admin.js'

const { getGithubEnvConfig, getGithubSyncCapability } = pkg

function withEnv(overrides, fn) {
  const keys = Object.keys(overrides)
  const backup = {}
  for (const key of keys) {
    backup[key] = Object.prototype.hasOwnProperty.call(process.env, key) ? process.env[key] : undefined
    const value = overrides[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }

  try {
    return fn()
  } finally {
    for (const key of keys) {
      const value = backup[key]
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
}

test('getGithubEnvConfig returns null when repo metadata or token is missing', () => {
  withEnv(
    {
      GITHUB_TOKEN: undefined,
      GH_TOKEN: undefined,
      GITHUB_REPO: undefined,
      GITHUB_REPOSITORY: undefined,
    },
    () => {
      assert.equal(getGithubEnvConfig(), null)
    }
  )
})

test('getGithubEnvConfig prefers GH_TOKEN fallback', () => {
  withEnv(
    {
      GITHUB_TOKEN: undefined,
      GH_TOKEN: 'classic-token',
      GITHUB_REPO: 'finallyhome/northsidegta-site',
    },
    () => {
      const config = getGithubEnvConfig()
      assert.ok(config)
      assert.equal(config.owner, 'finallyhome')
      assert.equal(config.repo, 'northsidegta-site')
      assert.equal(config.token, 'classic-token')
    }
  )
})

test('getGithubSyncCapability derives metadata from Vercel environment', () => {
  withEnv(
    {
      GITHUB_TOKEN: undefined,
      GH_TOKEN: undefined,
      GITHUB_REPO: undefined,
      GITHUB_REPOSITORY: undefined,
      GITHUB_REPO_OWNER: undefined,
      GITHUB_REPO_NAME: undefined,
      VERCEL_GIT_REPO_OWNER: 'FinallyHomeAgents',
      VERCEL_GIT_REPO_SLUG: 'northsidegta-site',
      GITHUB_REF_NAME: undefined,
      VERCEL_GIT_COMMIT_REF: 'preview-branch',
    },
    () => {
      const capability = getGithubSyncCapability()
      assert.equal(capability.owner, 'FinallyHomeAgents')
      assert.equal(capability.repo, 'northsidegta-site')
      assert.equal(capability.ref, 'preview-branch')
      assert.equal(capability.hasRepoMetadata, true)
      assert.equal(capability.hasToken, false)
    }
  )
})

test('getGithubSyncCapability falls back to main ref', () => {
  withEnv(
    {
      GITHUB_TOKEN: undefined,
      GH_TOKEN: undefined,
      GITHUB_REPO: 'FinallyHomeAgents/northsidegta-site',
      GITHUB_REF_NAME: undefined,
      VERCEL_GIT_COMMIT_REF: undefined,
    },
    () => {
      const capability = getGithubSyncCapability()
      assert.equal(capability.ref, 'main')
    }
  )
})
