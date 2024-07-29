import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Table, Button } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`, {
          params: { userId: currentUser._id },
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        if (res.status === 200) {
          console.log(res.data.posts); // Debugging line
          setUserPosts(res.data.posts);
          if (res.data.posts.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser?.isAdmin) {
      fetchPosts();
    }
  }, [currentUser._id, currentUser?.isAdmin, currentUser.token]);

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`, {
        params: { userId: currentUser._id, startIndex },
        withCredentials: true,
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      if (res.status === 200) {
        setUserPosts((prev) => [...prev, ...res.data.posts]);
        if (res.data.posts.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await axios.delete(`${process.env.REACT_APP_BASE_URL}/posts/${postIdToDelete}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      if (res.status === 200) {
        setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
      } else {
        console.log(res.data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substr(0, maxLength) + '...' : text;
  };

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {currentUser.isAdmin && userPosts.length > 0 ? (
        <>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Ngày đăng</Table.HeadCell>
              <Table.HeadCell>Ảnh bài đăng</Table.HeadCell>
              <Table.HeadCell>Tiêu đề</Table.HeadCell>
              <Table.HeadCell>Loại </Table.HeadCell>
              <Table.HeadCell>Xóa</Table.HeadCell>
              <Table.HeadCell>Chỉnh sửa</Table.HeadCell>
            </Table.Head>
            <Table.Body className='divide-y'>
              {userPosts.map((post) => (
                <Table.Row key={post._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                  <Table.Cell>{new Date(post.updatedAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Link to={`/post/${post._id}`}>
                      <img
                        src={`${process.env.REACT_APP_ASSET_URL}/uploads/${post.thumbnail}`}
                        alt={post.title}
                        className='w-20 h-10 object-cover bg-gray-500'
                      />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link className='font-medium text-gray-900 dark:text-white' to={`/post/${post._id}`}>
                      {truncateText(post.title, 30)}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{truncateText(post.category, 20)}</Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setPostIdToDelete(post._id);
                      }}
                      className='font-medium text-red-500 hover:underline cursor-pointer'
                    >
                      Xóa
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link className='text-teal-500 hover:underline' to={`/update-post/${post._id}`}>
                      <span>Chỉnh sửa</span>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {showMore && (
            <button onClick={handleShowMore} className='w-full text-teal-500 self-center text-sm py-7'>
              Xem thêm
            </button>
          )}
        </>
      ) : (
        <p>Bạn chưa đăng bài báo nào!</p>
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Bạn có chắc chắn muốn xóa bài viết này?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeletePost}>
               Có, tôi chắc chắn
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
