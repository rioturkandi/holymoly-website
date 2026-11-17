const test = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')

const {
  handleEventStream,
  publishContentUpdate,
  closeAllEventStreams,
  MAX_SSE_CLIENTS,
} = require('../services/event-stream')

class FakeResponse extends EventEmitter {
  constructor() {
    super()
    this.statusCode = null
    this.headers = null
    this.writes = []
    this.destroyed = false
    this.writableEnded = false
    this.flushed = false
  }

  writeHead(statusCode, headers) {
    this.statusCode = statusCode
    this.headers = headers
  }

  flushHeaders() {
    this.flushed = true
  }

  write(data) {
    this.writes.push(data)
    return true
  }

  end() {
    this.writableEnded = true
    this.emit('close')
  }

  disconnect() {
    this.destroyed = true
    this.emit('close')
  }
}

function createConnection() {
  const response = new FakeResponse()
  handleEventStream({}, response)
  return response
}

test.afterEach(() => {
  closeAllEventStreams()
})

test('membatasi koneksi aktif dan menerima koneksi baru setelah kapasitas tersedia', () => {
  assert.equal(MAX_SSE_CLIENTS, 20)

  const connections = []

  for (let i = 0; i < MAX_SSE_CLIENTS; i += 1) {
    connections.push(createConnection())
  }

  for (const connection of connections) {
    assert.equal(connection.statusCode, 200)
    assert.equal(connection.writableEnded, false)
    assert.ok(connection.writes.includes('retry: 5000\n\n'))
  }

  const rejectedConnection = createConnection()

  assert.equal(rejectedConnection.statusCode, 200)
  assert.equal(rejectedConnection.writableEnded, true)
  assert.ok(rejectedConnection.writes.includes('retry: 15000\n\n'))

  connections[0].disconnect()

  const replacementConnection = createConnection()

  assert.equal(replacementConnection.statusCode, 200)
  assert.equal(replacementConnection.writableEnded, false)
  assert.ok(replacementConnection.writes.includes('retry: 5000\n\n'))
})

test('hanya mengirim broadcast untuk section yang diizinkan', () => {
  const connection = createConnection()

  publishContentUpdate('projects')

  assert.equal(
    connection.writes.filter((message) =>
      message.includes('event: content-updated')
    ).length,
    1
  )

  assert.ok(
    connection.writes.includes(
      'event: content-updated\ndata: {"section":"projects"}\n\n'
    )
  )

  publishContentUpdate('unknown-section')

  assert.equal(
    connection.writes.filter((message) =>
      message.includes('event: content-updated')
    ).length,
    1
  )
})

test('menutup seluruh koneksi aktif saat closeAllEventStreams dipanggil', () => {
  const firstConnection = createConnection()
  const secondConnection = createConnection()

  closeAllEventStreams()

  assert.equal(firstConnection.writableEnded, true)
  assert.equal(secondConnection.writableEnded, true)
})
