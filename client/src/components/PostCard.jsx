import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';

const PostCard = ({ post }) => {
  const shortDescription = post.description.length > 50 ? post.description.substr(0, 50) + '...' : post.description;
  const postTitle = post.title.length > 40 ? post.title.substr(0, 40) + '...' : post.title;

  // Chuyển đổi định dạng ngày tháng
  const formattedDate = new Date(post.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
      <Link to={`/post/${post._id}`}>
        <p className='text-lg font-semibold line-clamp-2 text-gray-900 dark:text-white'>{postTitle}</p>
        </Link>
        <Link to={`/search?category=${post.category}`}>
          <Button outline gradientDuoTone="greenToBlue" className='w-auto self-start '>
            {post.category}
          </Button>
        </Link>
        <p dangerouslySetInnerHTML={{ __html: shortDescription }} />
        <p className='p-3 text-sm text-gray-600 dark:text-gray-400'>{formattedDate}</p>

      </div>
    </div>
  );
};

export default PostCard;
