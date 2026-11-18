const assert = require('node:assert/strict')
const { test, beforeEach } = require('node:test')
const Module = require('node:module')
const path = require('node:path')

const IMAGE_PATH =
  '/uploads/12345678-1234-1234-1234-123456789abc.webp'

const state = {}

function resetState() {
  Object.assign(state, {
    trackingExists: true,
    status: 'pending',
    usageCount: 0,
    fileExists: true,
    unlinkCalls: 0,
    attachedUpdates: 0,
    deletingUpdates: 0,
    trackingDeletes: 0,
    released: 0,
    committed: 0,
  })
}

const fakeFs = {
  async unlink() {
    state.unlinkCalls += 1

    if (!state.fileExists) {
      const error = new Error('File tidak ditemukan')
      error.code = 'ENOENT'
      throw error
    }

    state.fileExists = false
  },
}

const fakeDb = {
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

        throw new Error(`Query mock tidak dikenal: ${sql}`)
      },

      async commit() {
        state.committed += 1
      },

      async rollback() {},

      release() {
        state.released += 1
      },
    }
  },

  async execute(sql) {
    if (sql.includes('DELETE FROM image_uploads')) {
      state.trackingDeletes += 1
      state.trackingExists = false
      return [{ affectedRows: 1 }]
    }

    throw new Error(`Query database mock tidak dikenal: ${sql}`)
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
  resolveUploadPath,
  markImageAttached,
  deleteUnusedImage,
} = require('../services/image-lifecycle.service')

Module._load = originalLoad

beforeEach(() => {
  resetState()
})

test('menerima path gambar UUID WebP yang valid', () => {
  const resolvedPath = resolveUploadPath(IMAGE_PATH)

  assert.equal(
    resolvedPath,
    path.resolve(__dirname, '../uploads', path.basename(IMAGE_PATH))
  )
})

test('menolak path gambar yang tidak valid', () => {
  const invalidPaths = [
    '/etc/passwd',
    '../uploads/image.webp',
    '/uploads/image.jpg',
    '/uploads/../../secret.webp',
    '',
    null,
  ]

  for (const imagePath of invalidPaths) {
    assert.throws(
      () => resolveUploadPath(imagePath),
      /Format path gambar tidak valid/
    )
  }
})

test('tidak menghapus file ketika tracking gambar tidak ditemukan', async () => {
  state.trackingExists = false

  const result = await deleteUnusedImage(IMAGE_PATH)

  assert.equal(result, 'untracked')
  assert.equal(state.unlinkCalls, 0)
  assert.equal(state.trackingDeletes, 0)
  assert.equal(state.released, 1)
})

test('tidak menghapus gambar yang masih digunakan konten', async () => {
  state.status = 'attached'
  state.usageCount = 2

  const result = await deleteUnusedImage(IMAGE_PATH)

  assert.equal(result, 'in-use')
  assert.equal(state.status, 'attached')
  assert.equal(state.fileExists, true)
  assert.equal(state.unlinkCalls, 0)
  assert.equal(state.trackingDeletes, 0)
  assert.equal(state.attachedUpdates, 1)
  assert.equal(state.released, 1)
})

test('berhasil menandai gambar sebagai attached', async () => {
  const connection = await fakeDb.getConnection()

  await markImageAttached(connection, IMAGE_PATH)

  assert.equal(state.status, 'attached')
  assert.equal(state.attachedUpdates, 1)
})
