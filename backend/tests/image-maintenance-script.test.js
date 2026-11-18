const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

const scriptPath = path.resolve(
  __dirname,
  '../scripts/image-maintenance.js'
)

const scriptSource = fs
  .readFileSync(scriptPath, 'utf8')
  .replace(/\nmain\(\)\s*$/, '')

async function runScript({
  cleanupResult = {
    checked: 2,
    deleted: 1,
    inUse: 0,
    untracked: 0,
    failed: 0,
  },
  reconcileResult = {
    checked: 3,
    deleted: 2,
    inUse: 0,
    untracked: 0,
    failed: 0,
  },
  cleanupError = null,
  reconcileError = null,
} = {}) {
  const calls = []
  const logs = []
  const errors = []

  const db = {
    async end() {
      calls.push('db.end')
    },
  }

  const services = {
    async cleanupPendingImages() {
      calls.push('cleanupPendingImages')

      if (cleanupError) {
        throw cleanupError
      }

      return cleanupResult
    },

    async reconcileAttachedImages() {
      calls.push('reconcileAttachedImages')

      if (reconcileError) {
        throw reconcileError
      }

      return reconcileResult
    },
  }

  const sandbox = {
    require(request) {
      if (request === 'dotenv') {
        return {
          config() {
            calls.push('dotenv.config')
          },
        }
      }

      if (request === '../config/database') {
        return db
      }

      if (request === '../services/image-lifecycle.service') {
        return services
      }

      throw new Error(`Module tidak dikenal: ${request}`)
    },

    console: {
      log(...args) {
        logs.push(args)
      },

      error(...args) {
        errors.push(args)
      },
    },

    process: {
      exitCode: 0,
    },
  }

  vm.runInNewContext(scriptSource, sandbox, {
    filename: scriptPath,
  })

  await sandbox.main()

  return {
    calls,
    logs,
    errors,
    exitCode: sandbox.process.exitCode,
  }
}

test('menjalankan cleanup sebelum reconcile dan menutup database', async () => {
  const result = await runScript()

  assert.ok(
    result.calls.indexOf('cleanupPendingImages') <
      result.calls.indexOf('reconcileAttachedImages')
  )

  assert.equal(result.calls.at(-1), 'db.end')
  assert.equal(result.exitCode, 0)
})

test('mencatat hasil cleanup, reconcile, dan summary total', async () => {
  const result = await runScript()

  const summary = result.logs.find(
    ([message]) => message === '[IMAGE MAINTENANCE] Summary:'
  )

  assert.ok(
    result.logs.some(
      ([message]) => message === '[IMAGE MAINTENANCE] Pending cleanup:'
    )
  )

  assert.ok(
    result.logs.some(
      ([message]) =>
        message === '[IMAGE MAINTENANCE] Attached reconciliation:'
    )
  )

  assert.deepEqual(
    JSON.parse(JSON.stringify(summary[1])),
    {
      totalDeleted: 3,
      totalFailed: 0,
    }
  )
})

test('mengatur exit code 1 ketika proses maintenance melaporkan kegagalan', async () => {
  const result = await runScript({
    cleanupResult: {
      checked: 1,
      deleted: 0,
      inUse: 0,
      untracked: 0,
      failed: 1,
    },
  })

  assert.equal(result.exitCode, 1)
  assert.ok(result.calls.includes('reconcileAttachedImages'))
  assert.equal(result.calls.at(-1), 'db.end')
})

test('tetap menutup database dan mengatur exit code 1 ketika service melempar error', async () => {
  const result = await runScript({
    cleanupError: new Error('Simulasi kegagalan cleanup'),
  })

  assert.equal(result.exitCode, 1)
  assert.ok(result.errors.length > 0)
  assert.ok(!result.calls.includes('reconcileAttachedImages'))
  assert.equal(result.calls.at(-1), 'db.end')
})
