const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const express = require('express')
const { uploadImage, processImage } = require('../middleware/upload.middleware')

const app = express()
let server
let baseUrl

app.post('/upload/processed', uploadImage, processImage, (req, res) => {
  res.status(200).json({
    success: true,
    image: req.uploadedImage,
  })
})

app.post('/upload', uploadImage, (req, res) => {
  res.status(200).json({
    success: true,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  })
})

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  baseUrl = `http://127.0.0.1:${address.port}`
})

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }
})

async function uploadFile(buffer, mimetype, filename = 'test-image') {
  const form = new FormData()

  form.append(
    'image',
    new Blob([buffer], { type: mimetype }),
    filename
  )

  return fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: form,
  })
}

test('menerima file dengan MIME type gambar yang didukung', async () => {
  const response = await uploadFile(
    Buffer.from('dummy image content'),
    'image/png',
    'test.png'
  )

  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.success, true)
  assert.equal(body.filename, 'test.png')
  assert.equal(body.mimetype, 'image/png')
})

test('menolak MIME type yang tidak didukung', async () => {
  const response = await uploadFile(
    Buffer.from('plain text'),
    'text/plain',
    'test.txt'
  )

  const body = await response.json()

  assert.equal(response.status, 400)
  assert.equal(body.success, false)
})

test('menolak file yang ukurannya melebihi 5 MB', async () => {
  const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1)

  const response = await uploadFile(
    oversizedBuffer,
    'image/png',
    'oversized.png'
  )

  const body = await response.json()

  assert.equal(response.status, 413)
  assert.equal(body.success, false)
})


test('menolak isi file palsu meskipun MIME type mengaku PNG', async () => {
  const form = new FormData()

  form.append(
    'image',
    new Blob([Buffer.from('Ini sebenarnya teks, bukan gambar PNG.')], {
      type: 'image/png',
    }),
    'fake.png'
  )

  const response = await fetch(`${baseUrl}/upload/processed`, {
    method: 'POST',
    body: form,
  })

  const body = await response.json()

  assert.equal(response.status, 400)
  assert.equal(body.success, false)
})
