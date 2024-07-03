import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner } from 'flowbite-react';
import PostCard from '../components/PostCard';

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`);
      console.log('Response:', res.data); // Kiểm tra response
      setPosts(res.data.posts);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch posts", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className='p-7'>
      <h1 className='text-3xl font-bold text-center mb-7'>News</h1>
      {loading && posts.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <p className='text-xl text-gray-500'>No posts found.</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      )}
      {loading && posts.length > 0 && (
        <div className="flex justify-center items-center py-7">
          <Spinner size="lg" />
        </div>
      )}
    </div>
  );
}
