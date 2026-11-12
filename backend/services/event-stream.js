const clients = new Set()

const allowedSections = new Set([
  'home',
  'about',
  'projects',
  'achievements',
  'media-coverage',
  'workshop',
])

function handleEventStream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  res.flushHeaders()

  // Memberi tahu browser agar mencoba koneksi ulang setelah 5 detik.
  res.write('retry: 5000\n\n')

  // Mendaftarkan koneksi browser yang sedang aktif.
  clients.add(res)

  // Menjaga koneksi tetap aktif ketika tidak ada perubahan konten.
  const heartbeat = setInterval(() => {
    if (!res.destroyed && !res.writableEnded) {
      res.write(': keep-alive\n\n')
    }
  }, 25000)

  // Menghapus koneksi dan timer ketika browser terputus.
  res.on('close', () => {
    clearInterval(heartbeat)
    clients.delete(res)
  })
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

module.exports = {
  handleEventStream,
  publishContentUpdate,
}
