const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const CONTENT_ROOT = path.join(__dirname, '..', 'public', 'content')

function readFrontMatterSlug(dirPath) {
  const indexPath = path.join(dirPath, 'index.md')
  assert.ok(
    fs.existsSync(indexPath),
    `Expected index.md to exist for ${dirPath}`
  )

  const file = fs.readFileSync(indexPath, 'utf8')
  const match = file.match(/^---[\s\S]*?\nslug:\s*(.+)\n/i)
  assert.ok(match, `Slug field missing in front matter for ${indexPath}`)

  let slugValue = match[1].trim()
  if ((slugValue.startsWith('"') && slugValue.endsWith('"')) || (slugValue.startsWith("'") && slugValue.endsWith("'"))) {
    slugValue = slugValue.slice(1, -1).trim()
  }

  assert.ok(slugValue !== '', `Slug cannot be empty in ${indexPath}`)

  return slugValue
}

test('insight slugs stay in sync with their directories', () => {
  const insightsPath = path.join(CONTENT_ROOT, 'insights')
  const entries = fs.readdirSync(insightsPath, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const folderName = entry.name
    const folderPath = path.join(insightsPath, folderName)
    const slug = readFrontMatterSlug(folderPath)

    assert.equal(
      slug,
      folderName,
      `Slug mismatch: front matter slug "${slug}" must match directory name "${folderName}"`
    )
  }
})
