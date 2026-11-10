
const express = require('express')
const db = require('../config/database')

const router = express.Router()

// Mengambil seluruh data project yang aktif
router.get('/', async (req, res) => {
  try {
    // Mengambil daftar project yang aktif
    const [projects] = await db.query(
      `SELECT *
       FROM projects
       WHERE is_active = TRUE
       ORDER BY display_order ASC, id DESC`
    )

    // Mengambil seluruh foto dari project yang aktif
    const [projectImages] = await db.query(
      `SELECT
         project_images.id,
         project_images.project_id,
         project_images.image_path,
         project_images.image_type,
         project_images.alt_text,
         project_images.display_order,
         project_images.position_x,
         project_images.position_y
       FROM project_images
       INNER JOIN projects
         ON project_images.project_id = projects.id
       WHERE projects.is_active = TRUE
       ORDER BY project_images.display_order ASC, project_images.id ASC`
    )

    // Mengambil seluruh spesifikasi dari project yang aktif
    const [projectSpecs] = await db.query(
      `SELECT
         project_specs.id,
         project_specs.project_id,
         project_specs.category,
         project_specs.specification,
         project_specs.display_order
       FROM project_specs
       INNER JOIN projects
         ON project_specs.project_id = projects.id
       WHERE projects.is_active = TRUE
       ORDER BY project_specs.display_order ASC, project_specs.id ASC`
    )

    // Menggabungkan data project, foto, dan spesifikasi
    const formattedProjects = projects.map((project) => {
      const images = projectImages.filter(
        (image) => image.project_id === project.id
      )

      const specifications = projectSpecs.filter(
        (spec) => spec.project_id === project.id
      )

      return {
        ...project,
        cover: images.find((image) => image.image_type === 'cover') || null,
        gallery: images.filter((image) => image.image_type === 'detail'),
        specifications,
      }
    })

    // Mengirimkan data project kepada frontend
    res.status(200).json({
      success: true,
      data: formattedProjects,
    })
  } catch (error) {
    console.error('Gagal mengambil data Projects:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

module.exports = router
