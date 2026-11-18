const assert = require('node:assert/strict')
const { test, beforeEach } = require('node:test')
const Module = require('node:module')
const path = require('node:path')

const IMAGE_PATH =
  '/uploads/12345678-1234-1234-1234-123456789abc.webp'

const state = {}

function resetState() {
  Object.assign(state, {
    cleanupCandidates: [],
    reconcileCandidates: [],
    cleanupQuery: '',
    reconcileQuery: '',
    released: 0,
  })
}

const fakeFs = {
  async unlink() {},
}

const fakeDb = {
  async execute(sql) {
    if (
      sql.includes('SELECT image_path') &&
      sql.includes('FROM image_uploads')
    ) {
      state.cleanupQuery = sql
      return [state.cleanupCandidates]
    }

    if (
      sql.includes('SELECT iu.image_path') &&
      sql.includes('FROM image_uploads iu')
    ) {
      state.reconcileQuery = sql
      return [state.reconcileCandidates]
    }

    throw new Error(`Query database mock tidak dikenal: ${sql}`)
  },

  async getConnection() {
    return {
      async beginTransaction() {},

      async execute(sql) {
        if (sql.includes('SELECT id, status')) {
          return [[]]
        }

        throw new Error(`Query koneksi mock tidak dikenal: ${sql}`)
      },

      async commit() {},
      async rollback() {},

      release() {
        state.released += 1
      },
    }
  },
}

const originalLoad = Module._load
const servicePath = path.resolve(
  __dirname,
  '../services/image-lifecycle.service.js'
)

Module._load = function (request, parent, isMain) {
  if (request === 'node:fs/promises') {
    return fakeFs
  }

  if (
    request === '../config/database' &&
    parent?.filename === servicePath
  ) {
    return fakeDb
  }

  return originalLoad.call(this, request, parent, isMain)
}

const {
  cleanupPendingImages,
  reconcileAttachedImages,
} = require('../services/image-lifecycle.service')

Module._load = originalLoad

beforeEach(() => {
  resetState()
})

test('cleanupPendingImages memilih pending lebih dari 24 jam dan deleting', async () => {
  state.cleanupCandidates = [{ image_path: IMAGE_PATH }]

  const result = await cleanupPendingImages()

  assert.match(state.cleanupQuery, /status = 'pending'/)
  assert.match(
    state.cleanupQuery,
    /pending_since < DATE_SUB\(NOW\(\), INTERVAL 24 HOUR\)/
  )
  assert.match(state.cleanupQuery, /OR status = 'deleting'/)
  assert.match(state.cleanupQuery, /ORDER BY created_at ASC/)
  assert.match(state.cleanupQuery, /LIMIT 100/)

  assert.deepEqual(result, {
    checked: 1,
    deleted: 0,
    inUse: 0,
    untracked: 1,
    failed: 0,
  })

  assert.equal(state.released, 1)
})

test('cleanupPendingImages mengembalikan hasil kosong ketika tidak ada kandidat', async () => {
  const result = await cleanupPendingImages()

  assert.deepEqual(result, {
    checked: 0,
    deleted: 0,
    inUse: 0,
    untracked: 0,
    failed: 0,
  })
})

test('reconcileAttachedImages hanya memilih attached yang tidak direferensikan', async () => {
  state.reconcileCandidates = [{ image_path: IMAGE_PATH }]

  const result = await reconcileAttachedImages()

  assert.match(state.reconcileQuery, /iu\.status = 'attached'/)
  assert.equal(
    (state.reconcileQuery.match(/NOT EXISTS/g) || []).length,
    6
  )
  assert.match(state.reconcileQuery, /ORDER BY iu\.created_at ASC/)
  assert.match(state.reconcileQuery, /LIMIT 100/)

  assert.deepEqual(result, {
    checked: 1,
    deleted: 0,
    inUse: 0,
    untracked: 1,
    failed: 0,
  })

  assert.equal(state.released, 1)
})

test('reconcileAttachedImages mengembalikan hasil kosong ketika tidak ada kandidat', async () => {
  const result = await reconcileAttachedImages()

  assert.deepEqual(result, {
    checked: 0,
    deleted: 0,
    inUse: 0,
    untracked: 0,
    failed: 0,
  })
})
