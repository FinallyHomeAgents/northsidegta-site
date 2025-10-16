import test from 'node:test'
import assert from 'node:assert/strict'

import pkg from '../lib/github-admin.js';
const { getGithubEnvConfig, getGithubSyncCapability } = pkg;

const TOKEN_KEYS = ['GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_ADMIN_TOKEN']
const REPO_KEYS = [
  'GITHUB_REPO',
  'GITHUB_REPOSITORY',
  'GITHUB_REPO_FULL_NAME',
  'GITHUB_REPOSITORY_FULL_NAME',
  'GITHUB_REPO_OWNER',
  'GITHUB_REPO_NAME',
  'GITHUB_REPOSITORY_OWNER',
  'GITHUB_REPOSITORY_NAME',
  'GITHUB_OWNER',
  'VERCEL_GIT_REPO_OWNER',
  'VERCEL_GIT_REPO_SLUG',
  'VERCEL_GIT_ORG',
]

const ALL_ENV_KEYS = [...new Set([...TOKEN_KEYS, ...REPO_KEYS])]

async function withGithubEnv(overrides, fn) {
  const original = new Map()
  for (const key of ALL_ENV_KEYS) {
    original.set(key, process.env[key])
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const value = overrides[key]
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    } else {
      delete process.env[key]
    }
  }

  try {
    await fn()
  } finally {
    for (const [key, value] of original.entries()) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
}

test('GitHub capability reports missing configuration when nothing is set', async () => {
  await withGithubEnv({}, async () => {
    assert.equal(getGithubEnvConfig(), null)
    const capability = getGithubSyncCapability()
    assert.equal(capability.ok, false)
    assert.match(capability.hint, /GITHUB_TOKEN/i)
  })
})

test('GitHub env config resolves GH_TOKEN and GITHUB_REPOSITORY', async () => {
  await withGithubEnv({ GH_TOKEN: 'abc123', GITHUB_REPOSITORY: 'north/side' }, async () => {
    const config = getGithubEnvConfig()
    assert.deepEqual(config, { owner: 'north', repo: 'side', token: 'abc123' })
    const capability = getGithubSyncCapability()
    assert.equal(capability.ok, true)
  })
})

test('GitHub env config infers repository from Vercel env vars', async () => {
  await withGithubEnv(
    {
      GITHUB_TOKEN: 'secret-token',
      VERCEL_GIT_REPO_OWNER: 'northside',
      VERCEL_GIT_REPO_SLUG: 'events',
    },
    async () => {
      const config = getGithubEnvConfig()
      assert.deepEqual(config, { owner: 'northside', repo: 'events', token: 'secret-token' })
    }
  )
})

test('GitHub capability surfaces missing token hint when repository exists', async () => {
  await withGithubEnv({ GITHUB_REPOSITORY: 'north/side' }, async () => {
    const capability = getGithubSyncCapability()
    assert.equal(capability.ok, false)
    assert.match(capability.hint, /token/i)
  })
})
