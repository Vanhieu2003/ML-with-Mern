import { Button, Select, TextInput, Spinner } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import axios from 'axios';

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: 'uncategorized',
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // Thêm state cho trạng thái tải thêm
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');
    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl || '',
        sort: sortFromUrl || 'desc',
        category: categoryFromUrl || 'uncategorized',
      });
    }

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      console.log('Fetching posts with query:', searchQuery); // Kiểm tra query

      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts?${searchQuery}`);
        console.log('Response:', res.data); // Kiểm tra response

        setPosts(res.data.posts);
        setLoading(false);
        if (res.data.posts.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch posts", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === 'searchTerm') {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    }
    if (e.target.id === 'sort') {
      const order = e.target.value || 'desc';
      setSidebarData({ ...sidebarData, sort: order });
    }
    if (e.target.id === 'category') {
      const category = e.target.value || 'uncategorized';
      setSidebarData({ ...sidebarData, category });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', sidebarData.searchTerm);
    urlParams.set('sort', sidebarData.sort);
    urlParams.set('category', sidebarData.category);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    setLoadingMore(true); // Bắt đầu tải thêm
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();

    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts?${searchQuery}`);
      const data = res.data; // Đối với Axios, sử dụng res.data để lấy dữ liệu trả về
      setPosts([...posts, ...data.posts]);
      if (data.posts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch more posts", error);
    } finally {
      setLoadingMore(false); // Kết thúc tải thêm
    }
  };

  return (
    <div className='flex flex-col md:flex-row'>
      <div className='p-7 border-b md:border-r md:min-h-screen border-gray-500'>
        <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
          <div className='flex items-center gap-2'>
            <label className='whitespace-nowrap font-semibold'>
              Từ khóa:
            </label>
            <TextInput
              placeholder='Search...'
              id='searchTerm'
              type='text'
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Lọc theo:</label>
            <Select onChange={handleChange} value={sidebarData.sort} id='sort'>
              <option value='desc'>Bài viết mới</option>
              <option value='asc'>Bài viết cũ</option>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Loại bài viết:</label>
            <Select
              onChange={handleChange}
              value={sidebarData.category}
              id='category'
            >
              <option value='uncategorized'>Uncategorized</option>
              <option value='Khuyến mãi'>Khuyến mãi</option>
              <option value='Tài chính'>Tài chính</option>
              <option value='Tín dụng'>Tín dụng</option>
              <option value='Đầu tư'>Đầu tư</option>
              <option value='Doanh nghiệp'>Doanh nghiệp</option>
              <option value='Sự kiện'>Sự kiện</option>
            </Select>
          </div>
          <Button type='submit' outline gradientDuoTone='greenToBlue'>
            Lọc
          </Button>
        </form>
      </div>
      <div className='w-full'>
        <h1 className='text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5'>
          Kết quả tìm kiếm:
        </h1>
        <div className='p-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {loading ? (
            <div className='flex justify-center items-center col-span-full'>
              <Spinner size="lg" />
            </div>
          ) : posts.length === 0 ? (
            <p className='text-xl text-gray-500 col-span-full'>Không có bài viết nào được tìm thấy.</p>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
          <div className='flex justify-center mt-4'>
            {loadingMore ? (
              <Spinner size="lg" />
            ) : (
              showMore && (
                <button
                  onClick={handleShowMore}
                  className='text-teal-500 text-lg hover:underline p-7'
                >
                  Show More
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
