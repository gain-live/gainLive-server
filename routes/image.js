const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { uploadPost, afterUploadImage } = require('../controller');

const router = express.Router();

// 파일 없을 시 생성.
try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

// 멀터
const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        cb(null, 'uploads/');
      },
      filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

router.post('/', uploadPost, afterUploadImage);

//POST /img/upload
router.post('/upload', upload.single('image'), afterUploadImage);

module.exports = router;



// // 파일
// exports.afterUploadImage = (req, res) => {
//     console.log(req.file);
//     res.json({ url: `/img/${req.file.filename}` });
//   };
  
//   // 파일 업로드 시 
//   exports.uploadPost = async (req, res, next) => {
//     try {
//       const post = await Post.create({
//         content: req.body.content,
//         img: req.body.url,
//         UserId: req.user.id,
//       });
//       const hashtags = req.body.content.match(/#[^\s#]*/g);
//       if (hashtags) {
//         const result = await Promise.all(
//           hashtags.map(tag => {
//             return Hashtag.findOrCreate({
//               where: { title: tag.slice(1).toLowerCase() },
//             })
//           }),
//         );
        
//         await post.addHashtags(result.map(r => r[0]));
//       }
//       res.redirect('/');
  
//     } catch (error) {
//       console.error(error);
//       next(error);
//     }
//   };
