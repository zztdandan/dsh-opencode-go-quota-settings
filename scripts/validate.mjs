#!/usr/bin/env node
// Manifest checks that must pass before a release is published.
import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const problems = []
const note = (ok, message) => { if (!ok) problems.push(message) }

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
note(typeof pkg.name === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(pkg.name), 'package name must be a lowercase npm-safe slug')
note(typeof pkg.version === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version), 'version must be semver')
note(pkg.private !== true, 'package must not be private')
note(typeof pkg.repository === 'string' && pkg.repository.length > 0, 'repository is required for npm provenance')
note(Array.isArray(pkg.files) && pkg.files.includes('lib'), 'files must include lib/')

const patch = pkg.dsh?.bundle?.patch
note(typeof patch === 'string' && patch.length > 0, 'dsh.bundle.patch is required')
if (typeof patch === 'string' && patch.length > 0) {
  note(existsSync(patch), `dsh.bundle.patch points to a missing file: ${patch}`)
  if (existsSync(patch)) {
    const text = readFileSync(patch, 'utf8')
    note(text.includes(pkg.name), `bundle patch does not reference the package name (${pkg.name})`)
  }
}

if (pkg.dsh?.client) {
  note(pkg.exports?.['./client'] !== undefined, 'dsh.client requires exports["./client"]')
  note(existsSync('lib/client.js'), 'lib/client.js is missing')
}

for (const file of ['lib/index.js', 'lib/client.js']) {
  if (existsSync(file)) {
    try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }) }
    catch { problems.push(`${file} failed node --check`) }
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`✗ ${problem}`)
  process.exit(1)
}
console.log(`✓ ${pkg.name}@${pkg.version} manifest looks releasable`)
