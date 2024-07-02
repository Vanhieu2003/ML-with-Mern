
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import PostCard from '../components/PostCard';
import axios from 'axios';

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`);
      const data = await res.data;
      setPosts(data.posts);
    };
    fetchPosts();
  }, []);

  return (
    <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto'>
      <h1 className='text-3xl font-bold lg:text-6xl'>Chào mừng bạn đến với Smart Lending</h1>
      <p className='text-gray-500 text-xs sm:text-sm'>
        Tài chính thông minh - tương lai vững vàng.
        Nơi đây chúng tôi cung cấp kiến thức tài chính và 
        cung cấp các dịch vụ cho vay với nhiều ưu đãi hấp dẫn.
        Hãy đăng ký thử ở đây và trải nghiệm dịch vụ của chúng tôi.
      </p>
      <Link
        to='/search'
        className='text-xs sm:text-sm text-teal-500 font-bold hover:underline'
      >
        View all posts
      </Link>
      <div className='p-3 bg-amber-100 dark:bg-slate-700'>
        <CallToAction />
      </div>

      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7'>
        {posts && posts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold text-center'>Recent Posts</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {posts.slice(0, 3).map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link
              to={'/search'}
              className='text-lg text-teal-500 hover:underline text-center'
            >
              View all posts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
