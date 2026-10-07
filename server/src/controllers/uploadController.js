const supabase = require('../config/supabase');
const path = require('path');
const fs = require('fs');

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'buylog-uploads';

class UploadController {
  static async uploadPhoto(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada file yang diunggah'
        });
      }

      const ext = path.extname(req.file.originalname) || '.jpg';
      const fileName = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

      // 1. If Supabase client is configured, upload directly to Supabase Storage
      if (supabase) {
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
          });

        if (error) {
          console.error('Supabase Storage Upload Error:', error);
          return res.status(500).json({
            success: false,
            message: 'Gagal mengunggah file ke Supabase Storage: ' + error.message
          });
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;

        return res.status(200).json({
          success: true,
          message: 'Foto berhasil diunggah ke Supabase Storage!',
          data: {
            filename: fileName,
            url: publicUrl,
            size: req.file.size,
            mimetype: req.file.mimetype,
            storage: 'supabase'
          }
        });
      }

      // 2. Fallback to local disk storage if Supabase credentials are missing
      const uploadDir = path.resolve(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const localPath = path.join(uploadDir, fileName);
      fs.writeFileSync(localPath, req.file.buffer);

      const host = req.get('host');
      const protocol = req.protocol;
      const fileUrl = `${protocol}://${host}/uploads/${fileName}`;

      res.status(200).json({
        success: true,
        message: 'Foto berhasil diunggah ke penyimpanan lokal server',
        data: {
          filename: fileName,
          url: fileUrl,
          size: req.file.size,
          mimetype: req.file.mimetype,
          storage: 'local'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UploadController;
