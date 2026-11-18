const assert = require('node:assert/strict')
const { test, beforeEach } = require('node:test')
const Module = require('node:module')
const path = require('node:path')

const IMAGE_PATH =
  '/uploads/12345678-1234-1234-1234-123456789abc.webp'

const state = {}

function resetState() {
  Object.assign(state, {
    candidates: [{ image_path: IMAGE_PATH }],
    trackingExists: true,
    status: 'pending',
    usageCount: 0,
    fileExists: true,
    unlinkError: null,
    unlinkCalls: 0,
    trackingDeletes: 0,
    attachedUpdates: 0,
    deletingUpdates: 0,
    released: 0,
  })
}

const fakeFs = {
  async unlink() {
    state.unlinkCalls += 1

    if (state.unlinkError) {
      throw state.unlinkError
    }

    state.fileExists = false
  },
}

const fakeDb = {
  async execute(sql) {
    if (
      sql.includes('SELECT image_path') &&
      sql.includes('FROM image_uploads')
    ) {
      return [state.candidates]
    }

    if (sql.includes('DELETE FROM image_uploads')) {
      state.trackingDeletes += 1
      state.trackingExists = false
      return [{ affectedRows: 1 }]
    }

    throw new Error(`Query database mock tidak dikenal: ${sql}`)
  },

  async getConnection() {
    return {
      async beginTransaction() {},

      async execute(sql) {
        if (sql.includes('SELECT id, status')) {
          return [
            state.trackingExists
              ? [{ id: 1, status: state.status }]
              : [],
          ]
        }

        if (sql.includes('AS usage_count')) {
          return [[{ usage_count: state.usageCount }]]
        }

        if (sql.includes("SET status = 'attached'")) {
          state.status = 'attached'
          state.attachedUpdates += 1
          return [{ affectedRows: 1 }]
        }

        if (sql.includes("SET status = 'deleting'")) {
          state.status = 'deleting'
          state.deletingUpdates += 1
          return [{ affectedRows: 1 }]
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

const { cleanupPendingImages } = require(
  '../services/image-lifecycle.service'
)

Module._load = originalLoad

beforeEach(() => {
  resetState()
})

test('maintenance berhasil menghapus gambar yang tidak digunakan', async () => {
  const result = await cleanupPendingImages()

  assert.deepEqual(result, {
    checked: 1,
    deleted: 1,
    inUse: 0,
    untracked: 0,
    failed: 0,
  })

  assert.equal(state.status, 'deleting')
  assert.equal(state.deletingUpdates, 1)
  assert.equal(state.unlinkCalls, 1)
  assert.equal(state.fileExists, false)
  assert.equal(state.trackingDeletes, 1)
  assert.equal(state.trackingExists, false)
  assert.equal(state.released, 1)
})

test('maintenance mempertahankan gambar yang masih digunakan', async () => {
  state.usageCount = 2

  const result = await cleanupPendingImages()

  assert.deepEqual(result, {
    checked: 1,
    deleted: 0,
    inUse: 1,
    untracked: 0,
    failed: 0,
  })

  assert.equal(state.status, 'attached')
  assert.equal(state.attachedUpdates, 1)
  assert.equal(state.unlinkCalls, 0)
  assert.equal(state.fileExists, true)
  assert.equal(state.trackingDeletes, 0)
  assert.equal(state.released, 1)
})

test('maintenance mencatat kegagalan dan mempertahankan tracking deleting', async () => {
  const error = new Error('Akses file ditolak')
  error.code = 'EACCES'
  state.unlinkError = error

  const result = await cleanupPendingImages()

  assert.deepEqual(result, {
    checked: 1,
    deleted: 0,
    inUse: 0,
    untracked: 0,
    failed: 1,
  })

  assert.equal(state.status, 'deleting')
  assert.equal(state.unlinkCalls, 1)
  assert.equal(state.trackingDeletes, 0)
  assert.equal(state.trackingExists, true)
  assert.equal(state.released, 1)
})
