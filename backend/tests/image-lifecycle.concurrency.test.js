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
    status: 'attached',
    usageCount: 0,
    fileExists: true,
    unlinkCalls: 0,
    deleteAttempts: 0,
    deleteAffectedRows: [],
    released: 0,
    activeLock: false,
    lockQueue: [],
    firstUnlinkStarted: null,
    continueFirstUnlink: null,
  })

  state.firstUnlinkStarted = new Promise((resolve) => {
    state.signalFirstUnlink = resolve
  })

  state.continueFirstUnlink = new Promise((resolve) => {
    state.releaseFirstUnlink = resolve
  })
}

async function acquireLock() {
  if (!state.activeLock) {
    state.activeLock = true
    return
  }

  await new Promise((resolve) => state.lockQueue.push(resolve))
}

function releaseLock() {
  const next = state.lockQueue.shift()

  if (next) {
    next()
  } else {
    state.activeLock = false
  }
}

const fakeFs = {
  async unlink() {
    state.unlinkCalls += 1

    if (state.unlinkCalls === 1) {
      state.signalFirstUnlink()
      await state.continueFirstUnlink
    }

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
    let ownsLock = false

    return {
      async beginTransaction() {},

      async execute(sql) {
        if (sql.includes('SELECT id, status')) {
          await acquireLock()
          ownsLock = true

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
        if (ownsLock) {
          ownsLock = false
          releaseLock()
        }

        state.released += 1
      },
    }
  },

  async execute(sql) {
    if (sql.includes('DELETE FROM image_uploads')) {
      state.deleteAttempts += 1

      const affectedRows = state.trackingExists ? 1 : 0

      if (affectedRows === 1) {
        state.trackingExists = false
      }

      state.deleteAffectedRows.push(affectedRows)

      return [{ affectedRows }]
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
  deleteUnusedImage,
  markImageAttached,
} = require('../services/image-lifecycle.service')

Module._load = originalLoad

beforeEach(() => {
  resetState()
})

test('dua penghapusan gambar yang sama diproses melalui lock transaksi', async () => {
  const firstDelete = deleteUnusedImage(IMAGE_PATH)

  await state.firstUnlinkStarted

  const secondDelete = deleteUnusedImage(IMAGE_PATH)

  // Proses pertama masih menunggu filesystem.
  // Proses kedua dapat mengambil lock setelah commit pertama.
  const secondResult = await secondDelete

  state.releaseFirstUnlink()

  const firstResult = await firstDelete

  assert.equal(firstResult, 'deleted')
  assert.equal(secondResult, 'deleted')
  assert.equal(state.unlinkCalls, 2)
  assert.equal(state.deleteAttempts, 2)
  assert.deepEqual(state.deleteAffectedRows, [1, 0])
  assert.equal(state.trackingExists, false)
  assert.equal(state.released, 2)
})

test('markImageAttached menolak gambar yang berstatus deleting', async () => {
  state.status = 'deleting'

  const connection = await fakeDb.getConnection()

  await assert.rejects(
    markImageAttached(connection, IMAGE_PATH),
    /Gambar sedang dalam proses penghapusan/
  )

  assert.equal(state.status, 'deleting')
  assert.equal(state.fileExists, true)
  assert.equal(state.released, 0)

  connection.release()

  assert.equal(state.released, 1)
})
