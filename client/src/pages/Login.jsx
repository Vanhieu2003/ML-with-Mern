import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useDispatch } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice'; // Điều chỉnh đường dẫn tùy theo cấu trúc dự án của bạn

const Login = () => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeInputHandler = (e) => {
    setUserData(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      dispatch(signInStart()); // Bắt đầu action sign in (bật loading)
      
      // Gửi yêu cầu đăng nhập đến server
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users/login`, userData);
      const user = response.data;
      localStorage.setItem('token', user.token);
      // Xử lý kết quả đăng nhập thành công
      dispatch(signInSuccess(user)); // Cập nhật trạng thái người dùng
      navigate(user.role === 'admin' ? '/admin-dashboard' : '/'); // Điều hướng đến trang tương ứng với vai trò người dùng
      
    } catch (err) {
      // Xử lý lỗi đăng nhập thất bại
      dispatch(signInFailure(err.response?.data?.message || 'An error occurred'));
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false); // Kết thúc quá trình đăng nhập (tắt loading)
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
              Smart
            </span>
            Lending
          </Link>
          <p className="text-sm mt-5">
            Create a new account to start using our services.
          </p>
        </div>
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={loginUser}>
            {error && (
              <Alert className="form__error-message" color="failure">
                {error}
              </Alert>
            )}
            <div>
              <Label value="Email" />
              <TextInput
                type="email"
                placeholder="Email"
                name="email"
                value={userData.email}
                onChange={changeInputHandler}
                autoFocus
              />
            </div>
            <div>
              <Label value="Password" />
              <TextInput
                type="password"
                placeholder="Password"
                name="password"
                value={userData.password}
                onChange={changeInputHandler}
              />
            </div>
            <Button
              gradientDuoTone="greenToBlue"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span>Already have an account?</span>
            <Link to="/signup" className="text-blue-500">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
