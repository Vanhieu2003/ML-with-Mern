const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const HttpError = require('../models/errorModel');
const User = require('../models/userModel');

//============ Sign up a new user
//POST : api/users/signup
//UNPROTECTED
const signupUser = async (req, res, next) => {
    try {
        const { name, email, password, password2, phone, address, home, sex, dob, nationality, id } = req.body;
        const cccdImage = req.files?.cccdImage;

        // Kiểm tra dữ liệu đầu vào
        if (!name || !email || !password || !phone || !address || !id || !home || !sex || !dob || !nationality || !cccdImage) {
            return next(new HttpError('Fill in all fields', 422));
        }

        // Kiểm tra email và phone
        const newEmail = email.toLowerCase();
        const emailExists = await User.findOne({ email: newEmail });
        if (emailExists) {
            return next(new HttpError("Email already exists.", 422));
        }
        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return next(new HttpError('Phone number already exists.', 422));
        }

        // Kiểm tra ID
        const idExists = await User.findOne({ id });
        if (idExists) {
            return next(new HttpError('ID already exists.', 422));
        }

        // Kiểm tra password
        if (password.trim().length < 6) {
            return next(new HttpError("Password should be at least 6 characters.", 422));
        }

        if (password !== password2) {
            return next(new HttpError("Passwords don't match.", 422));
        }

        // Kiểm tra kích thước và lưu ảnh CCCD
        if (cccdImage.size > 5 * 1024 * 1024) { // 5 MB
            return next(new HttpError("CCCD image too big. File should be less than 5MB", 422));
        }

        // Đổi tên file
        let fileName = cccdImage.name;
        let splittedFilename = fileName.split('.');
        let newFilename = splittedFilename[0] + '-' + uuid() + "." + splittedFilename[splittedFilename.length - 1];
        const uploadPath = path.join(__dirname, '..', 'uploads', newFilename);

        cccdImage.mv(uploadPath, async (err) => {
            if (err) {
                return next(new HttpError('Failed to upload image.', 500));
            }

            // Tạo người dùng mới với thông tin
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(password, salt);
            const newUser = await User.create({
                name,
                email: newEmail,
                password: hashedPass,
                phone,
                id,
                sex,
                dob,
                nationality,
                home,
                address,
                cccdImage: newFilename // Lưu tên file ảnh CCCD vào cơ sở dữ liệu
            });

            if (!newUser) {
                return next(new HttpError("User couldn't be created", 422));
            }

            res.status(201).json({ message: `User ${newUser.email} signed up` });
        });
    } catch (error) {
        return next(new HttpError("User Sign Up failed.", 422));
    }
};
//============ Login a user
//POST : api/users/login
//UNPROTECTED
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new HttpError("Fill in all fields.", 422));
        }
        const newEmail = email.toLowerCase();

        const user = await User.findOne({ email: newEmail });
        if (!user) {
            return next(new HttpError("Invalid credentials.", 422));
        }

        const comparePass = await bcrypt.compare(password, user.password);
        if (!comparePass) {
            return next(new HttpError("Invalid credentials.", 422));
        }

        const { _id: id, name, isAdmin, isKYC } = user;
        const token = jwt.sign({ id, name, isAdmin, isKYC }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(200).json({ token, id, name, isAdmin, isKYC });

    } catch (error) {
        return next(new HttpError("Login failed. Please check your credentials.", 422));
    }
};

//============ User profile
//GET : api/users/:id
//UNPROTECTED
const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return next(new HttpError("User not found", 404));
        }
        res.status(200).json(user);
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

//============ Change Avatar User profile
//POST : api/users/change-avatar
//UNPROTECTED
const changeAvatar = async (req, res, next) => {
    try {
        if (!req.files || !req.files.avatar) {
            return next(new HttpError("Please choose an image.", 422));
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new HttpError("User not found.", 404));
        }

        if (user.avatar) {
            fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) => {
                if (err) {
                    return next(new HttpError(err.message, 500));
                }
            });
        }

        const { avatar } = req.files;
        if (avatar.size > 500000) {
            return next(new HttpError("Profile picture too big. Should be less than 500kb", 422));
        }

        const fileName = avatar.name;
        const splittedFilename = fileName.split('.');
        const newFilename = splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length - 1];
        avatar.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
            if (err) {
                return next(new HttpError(err.message, 500));
            }

            const updateAvatar = await User.findByIdAndUpdate(req.user.id, { avatar: newFilename }, { new: true });
            if (!updateAvatar) {
                return next(new HttpError("Avatar couldn't be changed.", 422));
            }
            res.status(200).json(updateAvatar);
        });

    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

//============ Edit User details
//POST : api/users/edit-user
//PROTECTED
const editUser = async (req, res, next) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        id, 
        sex,
        dob, 
        nationality,
        home,
        currentPassword,
        newPassword,
        confirmNewPassword,
      } = req.body;
  
      // Tìm người dùng theo ID
      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new HttpError("Người dùng không tồn tại.", 403));
      }
  
      // Kiểm tra sự tồn tại của email
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== req.user.id) {
          return next(new HttpError("Email đã tồn tại", 422));
        }
      }
  
      // Kiểm tra sự tồn tại của số điện thoại
      if (phone && phone !== user.phone) {
        const phoneExists = await User.findOne({ phone });
        if (phoneExists && phoneExists._id.toString() !== req.user.id) {
          return next(new HttpError("Số điện thoại đã tồn tại", 422));
        }
      }
  
      // Kiểm tra mã số CCCD
      if (id && id !== user.id) {
        const idExists = await User.findOne({ id });
        if (idExists && idExists._id.toString() !== req.user.id) {
          return next(new HttpError("Mã số CCCD đã tồn tại", 422));
        }
      }
  
      // Tạo đối tượng chứa các trường cần cập nhật
      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      if (address) updateFields.address = address;
      if (id) updateFields.id = id; // cập nhật mã số CCCD
      if (sex) updateFields.sex = sex;
      if (dob) updateFields.dob = dob;
      if (home) updateFields.home = home; 
      if (nationality) updateFields.nationality = nationality;
  
      // Xử lý cập nhật mật khẩu nếu có

      if (currentPassword && newPassword && confirmNewPassword) {
        const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validateUserPassword) {
          return next(new HttpError("Invalid current password", 422));
        }
  
        if (newPassword !== confirmNewPassword) {
          return next(new HttpError("New passwords don't match.", 422));
        }
  
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        updateFields.password = hash;
      } else if (currentPassword || newPassword || confirmNewPassword) {
        return next(new HttpError("To change the password, all password fields must be filled.", 422));
      }
  
      const newInfo = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true });
  
      res.status(200).json(newInfo);
    } catch (error) {
      return next(new HttpError(error.message, 500));
    }
  };

  

//============ Get Authors
//GET : api/users/authors
//UNPROTECTED
const getAuthors = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        const users = await User.find().select('-password')
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit);
        
        const totalUsers = await User.countDocuments();
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastMonthUsers = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });

        res.status(200).json({
            users,
            totalUsers,
            lastMonthUsers,
        });

    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

//============ Logout User
//POST : api/users/logout
//UNPROTECTED
const logoutUser = (req, res, next) => {
    try {
        // Implement logout logic if required
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return next(new HttpError("Logout failed.", 500));
    }
};

//============ Delete User
//DELETE : api/users/delete-user/:id
//PROTECTED
const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return next(new HttpError("User unavailable.", 400));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new HttpError("User not found.", 404));
        }

        const fileName = user.avatar;

        if (req.user.id === userId || req.user.isAdmin) {
            if (fileName) {
                fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
                    if (err) {
                        return next(new HttpError(err.message, 500));
                    } else {
                        await User.findByIdAndDelete(userId);
                        res.json(`User ${userId} deleted successfully`);
                    }
                });
            } else {
                await User.findByIdAndDelete(userId);
                res.json(`User ${userId} deleted successfully`);
            }
        } else {
            return next(new HttpError("User couldn't be deleted.", 403));
        }
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

module.exports = { signupUser, loginUser, editUser, changeAvatar, getAuthors, getUser, logoutUser, deleteUser };
