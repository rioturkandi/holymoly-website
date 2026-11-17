require('dotenv').config()

const db = require('../config/database')
const {
  cleanupPendingImages,
  reconcileAttachedImages,
} = require('../services/image-lifecycle.service')

async function main() {
  try {
    console.log('[IMAGE MAINTENANCE] Starting...')

    const pendingResults = await cleanupPendingImages()
    console.log('[IMAGE MAINTENANCE] Pending cleanup:', pendingResults)

    const reconcileResults = await reconcileAttachedImages()
    console.log('[IMAGE MAINTENANCE] Attached reconciliation:', reconcileResults)

    const totalDeleted =
      pendingResults.deleted + reconcileResults.deleted

    const totalFailed =
      pendingResults.failed + reconcileResults.failed

    console.log('[IMAGE MAINTENANCE] Summary:', {
      totalDeleted,
      totalFailed,
    })

    if (totalFailed > 0) {
      process.exitCode = 1
    }
  } catch (error) {
    console.error('[IMAGE MAINTENANCE] Failed:', error.message)
    process.exitCode = 1
  } finally {
    await db.end()
  }
}

main()
