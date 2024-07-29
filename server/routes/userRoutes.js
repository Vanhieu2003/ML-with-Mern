
const { Router } = require('express');
const {
  signupUser,
  loginUser,
  editUser,
  changeAvatar,
  getAuthors,
  getUser,
  logoutUser,
  deleteUser,
  verifyUser // Thêm deleteUser vào đây
} = require('../controllers/userControllers');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');

const router = Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout',  logoutUser);
router.get('/:id', authMiddleware, getUser);
router.get('/', authMiddleware, roleCheck(true), getAuthors); // Chỉ admin mới được truy cập
router.post('/change-avatar', authMiddleware, changeAvatar);
router.patch('/edit-user/:id', authMiddleware, roleCheck(false), editUser); // Người dùng có thể chỉnh sửa thông tin của chính họ
router.delete('/delete-user/:id', authMiddleware, roleCheck(true), deleteUser);
router.patch('/verify-user/:id', authMiddleware, roleCheck(true), verifyUser); // Thêm route để xóa người dùng

module.exports = router;

