import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, TextInput, Toast, Modal } from 'flowbite-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { HiCheck, HiX, HiOutlineExclamationCircle } from 'react-icons/hi';
import { logoutUser } from '../redux/user/userSlice';

const DashProfile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [id, setId] = useState('');
  const [nationality, setNationality] = useState('');
  const [sex, setSex] = useState('');
  const [home, setHome] = useState('');
  const [dob, setDOB] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');

  const token = currentUser?.token;
  const navigate = useNavigate();
  const filePickerRef = useRef(null);
  const dispatch = useDispatch();

  // Redirect to login page for any user who isn't logged in
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch user details on component mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/${currentUser.id}`,
          { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
        );
        const { name, email, phone, address, avatar, sex, nationality, dob, home, id } = response.data;
        setName(name);
        setEmail(email);
        setPhone(phone);
        setAddress(address);
        setAvatar(avatar);
        setSex(sex);
        setNationality(nationality);
        setHome(home);
        setDOB(dob);
        setId(id);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    getUser();
  }, [currentUser, token]);

  // Handle avatar change
  const changeAvatarHandler = async (file) => {
    try {
      const postData = new FormData();
      postData.set('avatar', file);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/change-avatar`,
        postData,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setAvatar(response?.data.avatar);
    } catch (error) {
      console.error('Error changing avatar:', error);
    }
  };

  // Handle user details update
  const updateUserDetails = async (e) => {
    e.preventDefault();
    try {
      const userData = {};
      if (name) userData.name = name;
      if (email) userData.email = email;
      if (phone) userData.phone = phone;
      if (address) userData.address = address;
      if (currentPassword && newPassword && confirmNewPassword) {
        userData.currentPassword = currentPassword;
        userData.newPassword = newPassword;
        userData.confirmNewPassword = confirmNewPassword;
      }
      if (id) userData.id = id;
      if (home) userData.home = home;
      if (sex) userData.sex = sex;
      if (nationality) userData.nationality = nationality;

      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/users/edit-user/${currentUser.id}`,
        userData,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        if (currentPassword && newPassword && confirmNewPassword) {
          setShowModal(true);
        } else {
          setToastMessage('Thông tin đã được cập nhật thành công');
          setToastType('success');
          setShowToast(true);
        }
      }
    } catch (error) {
      setToastMessage(error.response.data.message);
      setToastType('error');
      setShowToast(true);
    }
  };

  // Handle file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      changeAvatarHandler(file);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      localStorage.removeItem("persist:root");
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const validateInput = () => {
    // Regex cho ngày sinh (dd/mm/yyyy)
    const dobPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/; // dd/mm/yyyy
    const idPattern = /^\d{12}$/; // 12 chữ số
  
    // Kiểm tra định dạng ngày sinh
    if (dob && !dobPattern.test(dob)) {
      setError('Ngày sinh phải theo định dạng dd/mm/yyyy');
      return false;
    }
  
    // Kiểm tra định dạng mã số CCCD
    if (id && !idPattern.test(id)) {
      setError('Mã số CCCD phải là 12 số');
      return false;
    }
  
    setError('');
    return true;
  };

  return (
     <div className="max-w-6xl mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Thông tin cá nhân</h1>
      <form className="flex flex-col items-center gap-4" onSubmit={updateUserDetails}>
        <div className="flex flex-col items-center">
          <div
            className="w-32 h-32 cursor-pointer shadow-md overflow-hidden rounded-full relative"
            onClick={() => filePickerRef.current.click()}
          >
            <img
              src={avatar ? `${process.env.REACT_APP_ASSET_URL}/uploads/${avatar}` : ''}
              alt="User Avatar"
              className="rounded-full w-full h-full object-cover border-8 border-gray-300"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={filePickerRef}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">Nhấp để thay đổi ảnh đại diện</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="space-y-4">
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
              Mã số CCCD
            </label>
            <TextInput
              type="text"
              id="id"
              placeholder="Mã số CCCD"
              value={id}
              onChange={(e) => setId(e.target.value)}
              maxLength="12"
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
              readOnly
            />

            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Tên đầy đủ
            </label>
            <TextInput
              type="text"
              id="username"
              placeholder="Tên đầy đủ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
              readOnly
            />

            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <TextInput
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
              readOnly
            />

            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <TextInput
              type="text"
              id="phone"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength="15"
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
    
            />

            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Địa chỉ
            </label>
            <TextInput
              type="text"
              id="address"
              placeholder="Địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"

            />

            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
              Quốc tịch
            </label>
            <TextInput
              type="text"
              id="nationality"
              placeholder="Quốc tịch"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
              readOnly
            />
          </div>

          <div className="space-y-4">
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
              Giới tính
            </label>
            <TextInput
              type="text"
              id="sex"
              placeholder="Giới tính"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
              readOnly
            />

            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
              Ngày sinh
            </label>
            <TextInput
              type="text"
              id="dob"
              placeholder="Ngày sinh (dd/mm/yyyy)"
              value={dob}
              onChange={(e) => setDOB(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
              readOnly
            />

            <label htmlFor="home" className="block text-sm font-medium text-gray-700">
              Quê quán
            </label>
            <TextInput
              type="text"
              id="home"
              placeholder="Quê quán"
              value={home}
              onChange={(e) => setHome(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
              readOnly
            />

            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Mật khẩu hiện tại
            </label>
            <TextInput
          type="password"
          id="currentPassword"
          placeholder="Mật khẩu hiện tại"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Mật khẩu mới
            </label>
            <TextInput
          type="password"
          id="newPassword"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu mới
            </label>
            <TextInput
          type="password"
          id="confirmNewPassword"
          placeholder="Xác nhận mật khẩu mới"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
          </div>
        </div>

        {error && (
          <div className="text-red-500 font-medium text-sm mt-2">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 w-full">
          <Button type="submit" gradientDuoTone="purpleToBlue" onClick={updateUserDetails} className="btn bg-purple-500 text-white hover:bg-purple-600 mt-2">
            Cập nhật
          </Button>
          {currentUser.isAdmin && (
            <Link to={'/create-post'}>
              <Button
                type='button'
                gradientDuoTone='purpleToPink'
                className='w-full'
              >
                Create a post
              </Button>
            </Link>
          )}
        </div>
      </form>

      {showToast && (
        <Toast
          className="fixed bottom-4 right-4"
          onClick={() => setShowToast(false)}
        >
          {toastType === 'success' ? (
            <>
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                <HiCheck className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">{toastMessage}</div>
            </>
          ) : (
            <>
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                <HiX className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">{toastMessage}</div>
            </>
          )}
          <Toast.Toggle />
        </Toast>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Bạn đã thay đổi mật khẩu thành công
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleLogout}>
                {"Đăng xuất"}
              </Button>
              <Link to='/'>
              <Button color="gray" onClick={() => setShowModal(false)}>
                Duy trì đăng nhập
              </Button>
              </Link>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashProfile;