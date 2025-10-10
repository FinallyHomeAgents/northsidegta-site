const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'public', 'data', 'events')
const ENTITY_PATTERN = /&(?:#[0-9]+|#x[0-9a-f]+|[a-z]+);/i

test('event JSON does not contain HTML entities', () => {
  const files = collectJsonFiles(DATA_DIR)
  const failures = []

  for (const file of files) {
    const contents = fs.readFileSync(file, 'utf8')
    let data

    try {
      data = JSON.parse(contents)
    } catch (error) {
      failures.push({ file, reason: `Invalid JSON (${error.message})` })
      continue
    }

    const issues = findEntityMatches(data)
    if (issues.length > 0) {
      failures.push({ file, reason: `Found HTML entities in ${issues.join(', ')}` })
    }
  }

  const message = failures
    .map((failure) => `${path.relative(path.join(__dirname, '..'), failure.file)}: ${failure.reason}`)
    .join('\n')

  assert.equal(failures.length, 0, message)
})

function collectJsonFiles(directory) {
  if (!fs.existsSync(directory)) {
    return []
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const resolved = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectJsonFiles(resolved))
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(resolved)
    }
  }

  return files
}

function findEntityMatches(value, trail = []) {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findEntityMatches(item, [...trail, `[${index}]`]))
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => findEntityMatches(item, [...trail, `.${key}`]))
  }

  if (typeof value === 'string' && ENTITY_PATTERN.test(value)) {
    const pathLabel = trail.length > 0 ? trail.join('') : '(root)'
    return [pathLabel]
  }

  return []
}
