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
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [imageError, setImageError] = useState('');
  const [preview, setPreview] = useState(''); // State lưu URL ảnh tạm thời
  const [currentStep, setCurrentStep] = useState(1); // Bước hiện tại
  const navigate = useNavigate();

  // Cập nhật state khi bước hiện tại thay đổi
  useEffect(() => {
    // Code cập nhật hoặc kiểm tra dữ liệu khi bước hiện tại thay đổi
  }, [currentStep]);

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
          setFile(selectedFile);
          setImageError('');
          // Tạo URL để hiển thị ảnh tạm thời
          setPreview(URL.createObjectURL(selectedFile));
        }
      };
      img.src = URL.createObjectURL(selectedFile);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('https://api.fpt.ai/vision/idr/vnm/', formData, {
        headers: {
          'api-key': 'nfWvOTe9Ggz2ovIwZ61ky7mkLdkOgbBV', // Thay thế bằng API key thực tế
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload and process image:', error);
      throw new Error('Failed to upload and process image');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('No file selected');
      return;
    }

    setProcessing(true);
    try {
      const data = await uploadImage(file);
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
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/signup`,
        userData
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
          {currentStep === 1 && (
            <form className="flex flex-col gap-4">
              {error && (
                <Alert className="form__error-message" color="failure">
                  {error}
                </Alert>
              )}
              {imageError && (
                <Alert className="form__error-message" color="failure">
                  {imageError}
                </Alert>
              )}
              <div>
                <Label value="Upload CCCD Image" />
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <Button
                  gradientDuoTone="greenToBlue"
                  type="button"
                  onClick={handleUpload}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Spinner size="sm" />
                      <span className="pl-3">Processing...</span>
                    </>
                  ) : (
                    'Upload Image'
                  )}
                </Button>
              </div>
              {preview && (
                <div className="mt-4">
                  <Label value="Image Preview" />
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto border rounded-lg"
                  />
                </div>
              )}
              <div>
                <Label value="ID" />
                <TextInput
                  type="text"
                  placeholder="ID"
                  name="id"
                  value={userData.id}
                  onChange={changeInputHandler}
                  pattern="\d{1,12}"
                  title="ID must be a number with a maximum length of 12 digits"
                />
              </div>
              <div>
                <Label value="Full Name" />
                <TextInput
                  type="text"
                  placeholder="Full Name"
                  name="name"
                  value={userData.name}
                  onChange={changeInputHandler}
                />
              </div>
              <div>
                <Label value="Sex" />
                <TextInput
                  type="text"
                  placeholder="Sex"
                  name="sex"
                  value={userData.sex}
                  onChange={changeInputHandler}
                />
              </div>
              <div>
                <Label value="Date of Birth" />
                <TextInput
                  type="text"
                  placeholder="Date of Birth (DD/MM/YYYY)"
                  name="dob"
                  value={userData.dob}
                  onChange={changeInputHandler}
                  pattern="\d{2}/\d{2}/\d{4}"
                  title="Date of Birth must be in DD/MM/YYYY format"
                />
              </div>
              <div>
                <Label value="Nationality" />
                <TextInput
                  type="text"
                  placeholder="Nationality"
                  name="nationality"
                  value={userData.nationality}
                  onChange={changeInputHandler}
                />
              </div>
              <div>
                <Label value="Home" />
                <TextInput
                  type="text"
                  placeholder="Home"
                  name="home"
                  value={userData.home}
                  onChange={changeInputHandler}
                />
              </div>
              <div>
                <Label value="Address" />
                <TextInput
                  type="text"
                  placeholder="Address"
                  name="address"
                  value={userData.address}
                  onChange={changeInputHandler}
                />
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  gradientDuoTone="greenToBlue"
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={processing}
                >
                  Next
                </Button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form className="flex flex-col gap-4" onSubmit={signupUser}>
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
                />
              </div>
              <div>
                <Label value="Phone" />
                <TextInput
                  type="text"
                  placeholder="Phone"
                  name="phone"
                  value={userData.phone}
                  onChange={changeInputHandler}
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
              <div>
                <Label value="Confirm Password" />
                <TextInput
                  type="password"
                  placeholder="Confirm Password"
                  name="password2"
                  value={userData.password2}
                  onChange={changeInputHandler}
                />
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  gradientDuoTone="greenToBlue"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span className="pl-3">Signing Up...</span>
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </Button>
                <Button
                  color='light'
                  type="button"
                  onClick={() => setCurrentStep(1)} // Quay lại bước 1
                >
                  Back
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
