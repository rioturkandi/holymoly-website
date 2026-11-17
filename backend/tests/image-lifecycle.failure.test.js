const assert = require('node:assert/strict')
const { test, beforeEach } = require('node:test')
const Module = require('node:module')
const path = require('node:path')

const IMAGE_PATH =
  '/uploads/12345678-1234-1234-1234-123456789abc.webp'

// Kondisi database dan filesystem palsu untuk pengujian.
const state = {}

function resetState() {
  Object.assign(state, {
    trackingExists: true,
    status: 'attached',
    usageCount: 0,
    fileExists: true,
    unlinkError: null,
    deleteError: null,
    unlinkCalls: 0,
    deleteAttempts: 0,
    released: 0,
  })
}

// Menggantikan operasi penghapusan file asli.
const fakeFs = {
  async unlink() {
    state.unlinkCalls += 1

    if (state.unlinkError) {
      throw state.unlinkError
    }

    if (!state.fileExists) {
      const error = new Error('File tidak ditemukan')
      error.code = 'ENOENT'
      throw error
    }

    state.fileExists = false
  },
}

// Menggantikan koneksi database.
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

        if (sql.includes("SET status = 'deleting'")) {
          state.status = 'deleting'
          return [{ affectedRows: 1 }]
        }

        if (sql.includes("SET status = 'attached'")) {
          state.status = 'attached'
          return [{ affectedRows: 1 }]
        }

        throw new Error(`Query mock tidak dikenal: ${sql}`)
      },

      async commit() {},

      async rollback() {},

      release() {
        state.released += 1
      },
    }
  },

  async execute(sql) {
    if (sql.includes('DELETE FROM image_uploads')) {
      state.deleteAttempts += 1

      if (state.deleteError) {
        throw state.deleteError
      }

      state.trackingExists = false
      return [{ affectedRows: 1 }]
    }

    throw new Error(`Query database mock tidak dikenal: ${sql}`)
  },
}

// Mengarahkan dependency service ke mock, bukan database/filesystem asli.
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

const { deleteUnusedImage } = require('../services/image-lifecycle.service')
Module._load = originalLoad

beforeEach(() => {
  resetState()
})

test('mempertahankan status deleting ketika penghapusan file gagal', async () => {
  const error = new Error('Permission denied')
  error.code = 'EACCES'
  state.unlinkError = error

  await assert.rejects(
    deleteUnusedImage(IMAGE_PATH),
    /Permission denied/
  )

  assert.equal(state.status, 'deleting')
  assert.equal(state.trackingExists, true)
  assert.equal(state.deleteAttempts, 0)
  assert.equal(state.released, 1)
})

test('dapat memulihkan tracking ketika file sudah terhapus tetapi DELETE database gagal', async () => {
  state.deleteError = new Error('Database unavailable')

  await assert.rejects(
    deleteUnusedImage(IMAGE_PATH),
    /Database unavailable/
  )

  assert.equal(state.fileExists, false)
  assert.equal(state.trackingExists, true)
  assert.equal(state.status, 'deleting')

  // Simulasikan database kembali tersedia.
  state.deleteError = null

  const result = await deleteUnusedImage(IMAGE_PATH)

  assert.equal(result, 'deleted')
  assert.equal(state.fileExists, false)
  assert.equal(state.trackingExists, false)
  assert.equal(state.unlinkCalls, 2)
  assert.equal(state.deleteAttempts, 2)
})
