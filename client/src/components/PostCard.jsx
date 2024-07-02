import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  return (
    <div className='group relative w-full h-[400px] overflow-hidden rounded-lg border border-teal-500 bg-white dark:bg-gray-800 dark:border-gray-600 transition-all duration-300 hover:border-2'>
      <Link to={`/post/${post._id}`}>
        <img
          src={`${process.env.REACT_APP_ASSET_URL}/uploads/${post.thumbnail}`}
          alt='post cover'
          className='h-[200px] w-full object-cover transition-transform duration-300 group-hover:scale-110'
        />
      </Link>
      <div className='p-3 flex flex-col gap-2'>
        <p className='text-lg font-semibold line-clamp-2 text-gray-900 dark:text-white'>{post.title}</p>
        <span className='italic text-sm text-gray-600 dark:text-gray-400'>{post.category}</span>
        <Link
          to={`/post/${post._id}`}
          className='absolute bottom-3 left-1/2 transform -translate-x-1/2 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-teal-600 transition-all duration-300 text-center py-2 px-4 rounded-md'
        >
          Read article
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
