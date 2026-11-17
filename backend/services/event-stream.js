const clients = new Set()

const MAX_SSE_CLIENTS = 20

const allowedSections = new Set([
  'home',
  'about',
  'projects',
  'achievements',
  'media-coverage',
  'workshop',
])

function handleEventStream(req, res) {
  // Membersihkan koneksi yang sudah tidak aktif sebelum menghitung kapasitas.
  for (const client of clients) {
    if (client.destroyed || client.writableEnded) {
      clients.delete(client)
    }
  }

  // Menolak koneksi baru secara sementara jika kapasitas sudah penuh.
  if (clients.size >= MAX_SSE_CLIENTS) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    res.flushHeaders()

    // Browser akan mencoba kembali setelah 15 detik.
    res.write('retry: 15000\n\n')
    res.end()
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  res.flushHeaders()

  // Memberi tahu browser agar mencoba koneksi ulang setelah 5 detik.
  res.write('retry: 5000\n\n')

  clients.add(res)

  const heartbeat = setInterval(() => {
    if (!res.destroyed && !res.writableEnded) {
      res.write(': keep-alive\n\n')
    }
  }, 25000)

  // Menghapus koneksi dan timer ketika browser terputus atau mengalami error.
  function cleanup() {
    clearInterval(heartbeat)
    clients.delete(res)
  }

  res.once('close', cleanup)
  res.once('error', cleanup)
}

function publishContentUpdate(section) {
  if (!allowedSections.has(section)) {
    return
  }

  const message = `event: content-updated\ndata: ${JSON.stringify({
    section,
  })}\n\n`

  for (const client of clients) {
    if (client.destroyed || client.writableEnded) {
      clients.delete(client)
      continue
    }

    client.write(message)
  }
}

function closeAllEventStreams() {
  for (const client of clients) {
    if (!client.destroyed && !client.writableEnded) {
      client.end()
    }
  }

  clients.clear()
}

module.exports = {
  handleEventStream,
  publishContentUpdate,
  closeAllEventStreams,
  MAX_SSE_CLIENTS,
}
