import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';

const SignUp = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    phone: '',
    address: '',
    home: '',
    sex: '',
    dob: '',
    nationality: '',
    id: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cccdImage, setCccdImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [imageError, setImageError] = useState('');
  const [preview, setPreview] = useState(''); // State lưu URL ảnh tạm thời
  const [currentStep, setCurrentStep] = useState(1); // Bước hiện tại
  const navigate = useNavigate();

  const changeInputHandler = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      // Kiểm tra kích thước file
      if (selectedFile.size > 5 * 1024 * 1024) { // 5 MB
        setImageError('File size exceeds 5 MB.');
        return;
      }

      // Kiểm tra độ phân giải
      const img = new Image();
      img.onload = () => {
        if (img.width < 640 || img.height < 480) {
          setImageError('Image resolution is below the minimum requirement of 640x480.');
        } else {
          setCccdImage(selectedFile);
          setImageError('');
          // Tạo URL để hiển thị ảnh tạm thời
          setPreview(URL.createObjectURL(selectedFile));
        }
      };
      img.src = URL.createObjectURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!cccdImage) {
      setError('No file selected');
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', cccdImage);

      const response = await axios.post('https://api.fpt.ai/vision/idr/vnm/', formData, {
        headers: {
          'api-key': 'nfWvOTe9Ggz2ovIwZ61ky7mkLdkOgbBV', // Thay thế bằng API key thực tế
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = response.data;
      setImageData(data); // Lưu dữ liệu hình ảnh
      if (data.errorCode === 0 && data.data.length > 0) {
        const info = data.data[0];
        setUserData({
          ...userData,
          id: info.id || userData.id,
          name: info.name || userData.name,
          home: info.home || userData.home,
          address: info.address || userData.address,
          sex: info.sex || userData.sex,
          dob: info.dob || userData.dob,
          nationality: info.nationality || userData.nationality,
        });
        setCurrentStep(2); // Chuyển sang bước 2 sau khi upload thành công
      } else {
        setError('Unable to process image');
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setProcessing(false);
    }
  };

  const validateData = () => {
    const { id, dob } = userData;
    let isValid = true;

    // Kiểm tra định dạng ID
    if (id && (!/^\d{1,12}$/.test(id) || id.length > 12)) {
      setError('ID must be a number with a maximum length of 12 digits.');
      isValid = false;
    }

    // Kiểm tra định dạng DOB
    if (dob && !/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
      setError('Date of Birth must be in DD/MM/YYYY format.');
      isValid = false;
    }

    return isValid;
  };

  const signupUser = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateData()) return; // Dừng nếu dữ liệu không hợp lệ

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('id', userData.id);
      formData.append('name', userData.name);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('password2', userData.password2);
      formData.append('phone', userData.phone);
      formData.append('address', userData.address);
      formData.append('home', userData.home);
      formData.append('sex', userData.sex);
      formData.append('dob', userData.dob);
      formData.append('nationality', userData.nationality);
      formData.append('cccdImage', cccdImage); // Thêm file ảnh vào form data

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/signup`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const newUser = response.data;
      console.log(newUser);

      if (!newUser) {
        setError('Unable to create account');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-bold mb-4">Sign Up</h2>
          {error && <Alert color="failure">{error}</Alert>}

          {currentStep === 1 && (
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <Label htmlFor="file">Upload CCCD Image</Label>
                <input
                  type="file"
                  id="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
                {imageError && <p className="text-red-500 text-sm mt-2">{imageError}</p>}
              </div>

              {preview && (
                <div className="mb-4">
                  <Label>Preview</Label>
                  <img src={preview} alt="Preview" className="w-full max-h-64 object-cover rounded" />
                </div>
              )}

              <Button type="button" onClick={handleUpload} disabled={processing}>
                {processing ? (
                  <>
                    <Spinner aria-label="Processing" />
                    <span className="pl-3">Processing...</span>
                  </>
                ) : (
                  'Upload Image'
                )}
              </Button>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={signupUser}>
              <div className="mb-4">
                <Label htmlFor="id">Mã số CCCD</Label>
                <TextInput
                  id="id"
                  name="id"
                  value={userData.id}
                  onChange={changeInputHandler}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="name">Name</Label>
                <TextInput
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={changeInputHandler}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="email">Email</Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={changeInputHandler}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="password">Password</Label>
                <TextInput
                  id="password"
                  name="password"
                  type="password"
                  value={userData.password}
                  onChange={changeInputHandler}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="password2">Confirm Password</Label>
                <TextInput
                  id="password2"
                  name="password2"
                  type="password"
                  value={userData.password2}
                  onChange={changeInputHandler}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="phone">Phone</Label>
                <TextInput
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={changeInputHandler}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="address">Address</Label>
                <TextInput
                  id="address"
                  name="address"
                  value={userData.address}
                  onChange={changeInputHandler}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="home">Home</Label>
                <TextInput
                  id="home"
                  name="home"
                  value={userData.home}
                  onChange={changeInputHandler}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="sex">Sex</Label>
                <TextInput
                  id="sex"
                  name="sex"
                  value={userData.sex}
                  onChange={changeInputHandler}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="dob">Date of Birth</Label>
                <TextInput
                  id="dob"
                  name="dob"
                  value={userData.dob}
                  onChange={changeInputHandler}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="nationality">Nationality</Label>
                <TextInput
                  id="nationality"
                  name="nationality"
                  value={userData.nationality}
                  onChange={changeInputHandler}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner aria-label="Loading" />
                    <span className="pl-3">Signing Up...</span>
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          )}
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center">
          <img
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/authentication/illustration.svg"
            alt="Illustration"
            className="max-w-full h-auto"
          />
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
