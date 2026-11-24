const { test, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')

const { processImage } = require('../middleware/upload.middleware')

const uploadDirectory = path.join(__dirname, '../uploads')
const generatedFiles = []

function createResponse() {
  return {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code
      return this
    },

    json(data) {
      this.body = data
      return this
    },
  }
}

afterEach(async () => {
  // Hanya menghapus file WebP yang dibuat oleh test ini sendiri.
  for (const filename of generatedFiles.splice(0)) {
    if (!/^[0-9a-f-]{36}\.webp$/i.test(filename)) {
      continue
    }

    await fs.unlink(path.join(uploadDirectory, filename)).catch((error) => {
      if (error.code !== 'ENOENT') {
        throw error
      }
    })
  }
})

test('menolak request ketika gambar tidak dikirim', async () => {
  const req = {}
  const res = createResponse()
  let nextCalled = false

  await processImage(req, res, () => {
    nextCalled = true
  })

  assert.equal(res.statusCode, 400)
  assert.equal(res.body.success, false)
  assert.equal(res.body.message, 'Gambar wajib diunggah.')
  assert.equal(nextCalled, false)
})

test('menolak file yang bukan gambar valid', async () => {
  const req = {
    file: {
      buffer: Buffer.from('Ini bukan file gambar.'),
    },
  }

  const res = createResponse()
  let nextCalled = false

  await processImage(req, res, () => {
    nextCalled = true
  })

  assert.equal(res.statusCode, 400)
  assert.equal(res.body.success, false)
  assert.equal(nextCalled, false)
})

test('mengonversi JPEG menjadi WebP dan meneruskan request', async () => {
  const inputBuffer = await sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: { r: 120, g: 80, b: 40 },
    },
  })
    .jpeg()
    .toBuffer()

  const req = {
    file: {
      buffer: inputBuffer,
    },
  }

  const res = createResponse()
  let nextCalled = false

  await processImage(req, res, () => {
    nextCalled = true
  })

  assert.equal(nextCalled, true)
  assert.ok(req.uploadedImage)
  assert.match(
    req.uploadedImage.filename,
    /^[0-9a-f-]{36}\.webp$/i
  )
  assert.equal(
    req.uploadedImage.path,
    `/uploads/${req.uploadedImage.filename}`
  )

  generatedFiles.push(req.uploadedImage.filename)

  const outputPath = path.join(
    uploadDirectory,
    req.uploadedImage.filename
  )

  const outputMetadata = await sharp(outputPath).metadata()

  assert.equal(outputMetadata.format, 'webp')
  assert.equal(outputMetadata.width, 800)
  assert.equal(outputMetadata.height, 600)
})

test('membatasi hasil gambar menjadi maksimal 1920 piksel', async () => {
  const inputBuffer = await sharp({
    create: {
      width: 2400,
      height: 1200,
      channels: 3,
      background: { r: 40, g: 80, b: 120 },
    },
  })
    .png()
    .toBuffer()

  const req = {
    file: {
      buffer: inputBuffer,
    },
  }

  const res = createResponse()
  let nextCalled = false

  await processImage(req, res, () => {
    nextCalled = true
  })

  assert.equal(nextCalled, true)
  assert.ok(req.uploadedImage)

  generatedFiles.push(req.uploadedImage.filename)

  const outputPath = path.join(
    uploadDirectory,
    req.uploadedImage.filename
  )

  const outputMetadata = await sharp(outputPath).metadata()

  assert.equal(outputMetadata.format, 'webp')
  assert.ok(outputMetadata.width <= 1920)
  assert.ok(outputMetadata.height <= 1920)
  assert.equal(outputMetadata.width, 1920)
  assert.equal(outputMetadata.height, 960)
})
