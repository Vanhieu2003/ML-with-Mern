import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner } from 'flowbite-react';
import PostCard from '../components/PostCard';
import CallToAction from '../components/CallToAction';

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const fetchPosts = async (startIndex = 0) => {
    if (startIndex === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts?startIndex=${startIndex}`);
      const fetchedPosts = res.data.posts;
      console.log('Response:', fetchedPosts);

      if (startIndex === 0) {
        setPosts(fetchedPosts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
      }

      if (fetchedPosts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleShowMore = () => {
    fetchPosts(posts.length);
  };

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

      
      {loadingMore && (
        <div className="flex justify-center items-center py-7">
          <Spinner size="lg" />
        </div>
      )}
      
      {!loadingMore && showMore && (
        <div className="flex justify-center items-center py-7">
          <button
            onClick={handleShowMore}
            className='text-teal-500 text-lg hover:underline'
          >
            Show More
          </button>
        </div>
      )}
            <div className='p-3  dark:bg-slate-700'>
        <CallToAction />
      </div>
    </div>
    
  );
}
