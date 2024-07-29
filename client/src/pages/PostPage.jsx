
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

import { Button, Spinner, Alert } from 'flowbite-react';
import CallToAction from '../components/CallToAction';
import PostCard from '../components/PostCard';

const PostPage = () => {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.token;


  
  // Fetch the post details
  useEffect(() => {
    const getPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setPost(response.data);
      } catch (error) {
        setError('Failed to fetch post.');
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getPost();
    }
  }, [id, token]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`, {
          params: { limit: 3 },
        });
        setRecentPosts(response.data.posts);
      } catch (error) {
        setError('Failed to fetch recent posts.');
        console.error('Error fetching recent posts:', error);
      }
    };

    fetchRecentPosts();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Alert color='failure'>
          <span>{error}</span>
        </Alert>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className='p-5 flex flex-col max-w-4xl mx-auto min-h-screen'>
      <h1 className='text-3xl lg:text-4xl font-serif text-center mb-6'>{post?.title}</h1>
      <Link to={`/search?category=${post?.category}`} className='self-center mb-5'>
      <Button outline gradientDuoTone="greenToBlue" pill size='xs'>
          {post?.category}
        </Button>
      </Link>

      <div className='flex justify-between p-3 border-b border-slate-300 text-xs mb-6'>
        <span>{formattedDate}</span>
        <span className='italic'>{post ? `${(post.description.length / 1000).toFixed(0)} mins read` : ''}</span>
      </div>
      <div className='p-3 post-content mb-6' dangerouslySetInnerHTML={{ __html: post?.description }} />
      <CallToAction />
      <div className='flex flex-col items-center mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Bài viết gần đây</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
          {recentPosts &&
            recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
    </main>
  );
};

export default PostPage;

