import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Alert, Button, FileInput, Select, TextInput, Spinner } from 'flowbite-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Khuyến mãi');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState('');
  const [publishError, setPublishError] = useState(null);
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate();
  const token = currentUser?.token;

  // Redirect to login page for any user who isn't logged in
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);


  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image',
  ];

  const POST_CATEGORIES = ["Khuyến mãi", "Tài chính", "Tín dụng", "Đầu tư", "Doanh nghiệp", "Sự kiện"];

  const createPost = async (e) => {
    e.preventDefault();
    setLoading(true);

    const postData = new FormData();

    postData.append('title', title);
    postData.append('category', category);
    postData.append('description', description);
    postData.append('thumbnail', thumbnail);

    postData.set('title', title);
    postData.set('category', category);
    postData.set('description', description);
    postData.set('thumbnail', thumbnail);


    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/posts`, postData, {
        withCredentials: true,

        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Đảm bảo gửi dữ liệu dưới dạng FormData
        }
      });

      if (response.status === 200) {
        navigate('/');
      }
    } catch (error) {

      setPublishError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Tạo bài viết mới</h1>
      <form className='flex flex-col gap-4' onSubmit={createPost}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            required
            id='title'
            className='flex-1'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select
            id='category'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {POST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>

        </div>
        <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
          <FileInput
            type='file'
            accept='image/*'
            onChange={handleUploadImage}
          />
        </div>
        <ReactQuill
          theme='snow'
          placeholder='Write something...'
          className='h-72 mb-12'
          modules={modules}
          formats={formats}
          value={description}
          onChange={setDescription}
        />
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
            'Tạo bài viết'
          )}
        </Button>
        {publishError && (
          <Alert className='mt-5' color='failure'>
            {publishError}
          </Alert>
        )}
      </form>
    </div>





  );
};

export default CreatePost;
