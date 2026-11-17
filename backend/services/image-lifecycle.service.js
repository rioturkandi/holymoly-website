const fs = require('node:fs/promises')
const path = require('node:path')
const db = require('../config/database')

// Direktori tempat seluruh gambar upload disimpan.
const UPLOAD_DIRECTORY = path.resolve(__dirname, '../uploads')

// Hanya menerima path UUID dengan ekstensi WebP.
const IMAGE_PATH_PATTERN =
  /^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i

// Menghitung seluruh referensi gambar pada sembilan kolom database.
const IMAGE_USAGE_QUERY = `
  SELECT
    (SELECT COUNT(*) FROM home_content WHERE image_path = ?) +
    (SELECT COUNT(*) FROM home_content WHERE original_image_path = ?) +
    (SELECT COUNT(*) FROM home_services WHERE image_path = ?) +
    (SELECT COUNT(*) FROM project_images WHERE image_path = ?) +
    (SELECT COUNT(*) FROM workshop_images WHERE image_path = ?) +
    (SELECT COUNT(*) FROM achievements WHERE trophy_image_path = ?) +
    (SELECT COUNT(*) FROM achievements WHERE vehicle_image_path = ?) +
    (SELECT COUNT(*) FROM media_coverage WHERE image_path = ?) +
    (SELECT COUNT(*) FROM media_coverage WHERE original_image_path = ?)
    AS usage_count
`

// Memastikan path berasal dari endpoint upload dan berada di direktori uploads.
function resolveUploadPath(imagePath) {
  if (
    typeof imagePath !== 'string' ||
    !IMAGE_PATH_PATTERN.test(imagePath)
  ) {
    throw new Error('Format path gambar tidak valid.')
  }

  const filePath = path.resolve(
    UPLOAD_DIRECTORY,
    path.basename(imagePath)
  )

  if (path.dirname(filePath) !== UPLOAD_DIRECTORY) {
    throw new Error('Path gambar berada di luar direktori uploads.')
  }

  return filePath
}

// Mengubah status gambar menjadi attached dalam transaksi pemanggil.
async function markImageAttached(connection, imagePaths) {
  const uniquePaths = [
    ...new Set(
      (Array.isArray(imagePaths) ? imagePaths : [imagePaths])
        .filter((imagePath) => imagePath !== null && imagePath !== undefined)
    ),
  ]

  for (const imagePath of uniquePaths) {
    resolveUploadPath(imagePath)

    const [rows] = await connection.execute(
      `SELECT id, status
       FROM image_uploads
       WHERE image_path = ?
       FOR UPDATE`,
      [imagePath]
    )

    if (rows.length === 0) {
      throw new Error('Catatan gambar tidak ditemukan di image_uploads.')
    }

    if (rows[0].status === 'deleting') {
      throw new Error('Gambar sedang dalam proses penghapusan.')
    }

    await connection.execute(
      `UPDATE image_uploads
       SET status = 'attached', pending_since = NULL
       WHERE id = ?`,
      [rows[0].id]
    )
  }
}

// Menghapus file hanya jika tidak lagi digunakan oleh data website.
async function deleteUnusedImage(imagePath) {
  const filePath = resolveUploadPath(imagePath)
  const connection = await db.getConnection()

  let transactionStarted = false
  let imageId = null

  try {
    await connection.beginTransaction()
    transactionStarted = true

    const [rows] = await connection.execute(
      `SELECT id, status
       FROM image_uploads
       WHERE image_path = ?
       FOR UPDATE`,
      [imagePath]
    )

    if (rows.length === 0) {
      await connection.commit()
      transactionStarted = false
      return 'untracked'
    }

    imageId = rows[0].id

    const [usageRows] = await connection.execute(
      IMAGE_USAGE_QUERY,
      Array(9).fill(imagePath)
    )

    const usageCount = Number(usageRows[0]?.usage_count ?? 0)

    if (usageCount > 0) {
      await connection.execute(
        `UPDATE image_uploads
         SET status = 'attached', pending_since = NULL
         WHERE id = ?`,
        [imageId]
      )

      await connection.commit()
      transactionStarted = false
      return 'in-use'
    }

    await connection.execute(
      `UPDATE image_uploads
       SET status = 'deleting', pending_since = NULL
       WHERE id = ?`,
      [imageId]
    )

    await connection.commit()
    transactionStarted = false
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback()
    }

    throw error
  } finally {
    connection.release()
  }

  // Status deleting sudah tersimpan sebelum file dihapus.
  try {
    await fs.unlink(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }

  // Hapus tracking hanya setelah file berhasil dihapus atau tidak ditemukan.
  await db.execute(
    `DELETE FROM image_uploads
     WHERE id = ? AND status = 'deleting'`,
    [imageId]
  )

  return 'deleted'
}

// Membersihkan gambar pending yang melewati masa tenggang 24 jam
// dan mencoba kembali penghapusan yang sebelumnya gagal.
async function cleanupPendingImages() {
  const [rows] = await db.execute(
    `SELECT image_path
     FROM image_uploads
     WHERE
       (status = 'pending'
        AND pending_since < DATE_SUB(NOW(), INTERVAL 24 HOUR))
       OR status = 'deleting'
     ORDER BY created_at ASC
     LIMIT 100`
  )

  const results = {
    checked: rows.length,
    deleted: 0,
    inUse: 0,
    untracked: 0,
    failed: 0,
  }

  for (const row of rows) {
    try {
      const result = await deleteUnusedImage(row.image_path)

      if (result === 'deleted') results.deleted += 1
      else if (result === 'in-use') results.inUse += 1
      else if (result === 'untracked') results.untracked += 1
    } catch (error) {
      results.failed += 1
    }
  }

  return results
}


// Mencari gambar berstatus attached yang sudah tidak direferensikan
// oleh tabel konten, lalu menyerahkan penghapusan ke fungsi terpusat.
async function reconcileAttachedImages() {
  const [rows] = await db.execute(
    `SELECT iu.image_path
     FROM image_uploads iu
     WHERE iu.status = 'attached'
       AND NOT EXISTS (
         SELECT 1 FROM home_content
         WHERE image_path = iu.image_path
            OR original_image_path = iu.image_path
       )
       AND NOT EXISTS (
         SELECT 1 FROM home_services
         WHERE image_path = iu.image_path
       )
       AND NOT EXISTS (
         SELECT 1 FROM project_images
         WHERE image_path = iu.image_path
       )
       AND NOT EXISTS (
         SELECT 1 FROM workshop_images
         WHERE image_path = iu.image_path
       )
       AND NOT EXISTS (
         SELECT 1 FROM achievements
         WHERE trophy_image_path = iu.image_path
            OR vehicle_image_path = iu.image_path
       )
       AND NOT EXISTS (
         SELECT 1 FROM media_coverage
         WHERE image_path = iu.image_path
            OR original_image_path = iu.image_path
       )
     ORDER BY iu.created_at ASC
     LIMIT 100`
  )

  const results = {
    checked: rows.length,
    deleted: 0,
    inUse: 0,
    untracked: 0,
    failed: 0,
  }

  for (const row of rows) {
    try {
      const result = await deleteUnusedImage(row.image_path)

      if (result === 'deleted') results.deleted += 1
      else if (result === 'in-use') results.inUse += 1
      else if (result === 'untracked') results.untracked += 1
    } catch (error) {
      results.failed += 1
    }
  }

  return results
}

module.exports = {
  resolveUploadPath,
  markImageAttached,
  deleteUnusedImage,
  cleanupPendingImages,
  reconcileAttachedImages,
}
