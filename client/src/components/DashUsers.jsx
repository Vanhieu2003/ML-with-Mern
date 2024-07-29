import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Table, Button, Spinner, Toast, Dropdown,Carousel  } from 'flowbite-react';
import { FaCheck, FaSearch, FaTimes } from 'react-icons/fa';
import { HiOutlineExclamationCircle, HiX } from 'react-icons/hi';

export default function DashPUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'verified', label: 'Đã xác minh' },
    { value: 'unverified', label: 'Chưa xác minh' }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/users`, {
          params: { userId: currentUser._id },
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        if (res.status === 200) {
          setUsers(res.data.users);
          if (res.data.users.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.isAdmin) {
      fetchUsers();
    }
  }, [currentUser?._id, currentUser?.isAdmin, currentUser?.token]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/users`, {
        params: { userId: currentUser._id, startIndex },
        withCredentials: true,
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      if (res.status === 200) {
        setUsers((prev) => [...prev, ...res.data.users]);
        if (res.data.users.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowDeleteModal(false);
    const userToDelete = users.find((user) => user._id === userIdToDelete);
    if (userToDelete.isKYC) {
      setToastMessage('Không thể xóa người dùng đã xác minh');
      setShowToast(true);
      return;
    }
    try {
      const res = await axios.delete(`${process.env.REACT_APP_BASE_URL}/users/delete-user/${userIdToDelete}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      if (res.status === 200) {
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
        setToastMessage('Xóa người dùng thành công');
        setShowToast(true);
      } else {
        console.error(res.data.message);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleVerifyUser = async () => {
    try {
      const res = await axios.patch(`${process.env.REACT_APP_BASE_URL}/users/verify-user/${selectedUser._id}`, {}, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      if (res.status === 200) {
        setUsers((prev) => prev.map((user) =>
          user._id === selectedUser._id ? { ...user, isKYC: true } : user
        ));
        setSelectedUser(null);
        setShowUserModal(false);
        setToastMessage('Người dùng đã được xác minh');
        setShowToast(true);
      } else {
        console.error(res.data.message);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {loading ? (
        <Spinner size="lg" className="self-center" />
      ) : currentUser.isAdmin && users.length > 0 ? (
        <>
          {showToast && (
            <Toast onClick={() => setShowToast(false)}>
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                <HiX className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">{toastMessage}</div>
              <Toast.Toggle />
            </Toast>
          )}
          <Dropdown
            button
            align="left"
            color="primary"
            label={filterOptions.find(option => option.value === filterType)?.label}
            className="mb-4"
          >
            {filterOptions.map(option => (
              <Dropdown.Item key={option.value} onClick={() => handleFilterChange(option.value)}>
                {option.label}
              </Dropdown.Item>
            ))}
          </Dropdown>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Ngày tạo</Table.HeadCell>
              <Table.HeadCell>Ảnh đại diện</Table.HeadCell>
              <Table.HeadCell>Tên người dùng</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Xác minh</Table.HeadCell>
              <Table.HeadCell>Xem</Table.HeadCell>
              <Table.HeadCell>Xóa</Table.HeadCell>
            </Table.Head>
            <Table.Body className='divide-y'>
              {users.map((user) => {
                if (
                  (filterType === 'all') ||
                  (filterType === 'verified' && user.isKYC) ||
                  (filterType === 'unverified' && !user.isKYC)
                ) {
                  return (
                    <Table.Row key={user._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                      <Table.Cell>{new Date(user.createdAt).toLocaleDateString()}</Table.Cell>
                      <Table.Cell>
                        <img
                          src={`${process.env.REACT_APP_ASSET_URL}/uploads/${user.avatar}`}
                          alt={user.name}
                          className='w-10 h-10 object-cover bg-gray-500 rounded-full'
                        />
                      </Table.Cell>
                      <Table.Cell>
                        {user.name}
                      </Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>{user.isKYC ? (<FaCheck className='text-green-500' />) : (<FaTimes className='text-red-500' />)}</Table.Cell>
                      <Table.Cell>
                        <Button onClick={() => { setSelectedUser(user); setShowUserModal(true); }}>
                          Xem
                        </Button>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          onClick={() => {
                            setShowDeleteModal(true);
                            setUserIdToDelete(user._id);
                          }}
                          className='font-medium text-red-500 hover:underline cursor-pointer'
                        >
                          Xóa
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  );
                }
                return null;
              })}
            </Table.Body>
          </Table>
          {showMore && (
            <button onClick={handleShowMore} className='w-full text-teal-500 self-center text-sm py-7'>
              Xem thêm
            </button>
          )}
        </>
      ) : (
        <p>Bạn chưa có người dùng nào!</p>
      )}

      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Bạn có chắc chắn muốn xóa người dùng này?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeleteUser}>
                Có, Tôi chắc chắn
              </Button>
              <Button color='gray' onClick={() => setShowDeleteModal(false)}>
                Không, hủy bỏ
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {selectedUser && (
        <Modal show={showUserModal} onClose={() => setShowUserModal(false)} popup size='medium-modal'>
          <Modal.Header> Thông tin người dùng</Modal.Header>
          <Modal.Body>
            <div className='flex flex-col md:flex-row md:justify-between '>
              <div className='md:w-1/2'>
                <div className='h-56 sm:h-64 xl:h-80 2xl:h-96'>
                <Carousel>
                <img
                    src={`${process.env.REACT_APP_ASSET_URL}/uploads/${selectedUser.cccdImage}`}
                    alt="CCCD"
                    className='w-full h-auto object-cover rounded-lg cursor-pointer'
                    onClick={() => window.open(`${process.env.REACT_APP_ASSET_URL}/uploads/${selectedUser.cccdImage}`, '_blank')}
                  />
        <img
                    src={`${process.env.REACT_APP_ASSET_URL}/uploads/${selectedUser.cccdImage_behind}`}
                    alt="Another Image"
                    className='w-full h-auto object-cover rounded-lg cursor-pointer'
                    onClick={() => window.open(`${process.env.REACT_APP_ASSET_URL}/uploads/${selectedUser.cccdImage_behind}`, '_blank')}
                  />

      </Carousel>
                  
                </div>
     
              </div>
              <div className='md:w-1/2 md:pl-8'>
                <img
                  src={`${process.env.REACT_APP_ASSET_URL}/uploads/${selectedUser.avatar}`}
                  alt={selectedUser.name}
                  className='w-20 h-20 object-cover bg-gray-500 rounded-full mb-4 mx-auto'
                />
                <h3 className='text-lg font-semibold mb-4'>{selectedUser.name}</h3>
                <div className='grid grid-cols-2 gap-x-4'>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                    <strong>Mã số CCCD:</strong> {selectedUser.id}
                  </p>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                    <strong>Ngày cấp:</strong> {selectedUser.issue_date}
                  </p>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>

                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                    <strong>Số điện thoại:</strong> {selectedUser.phone}
                  </p>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                    <strong>Quê quán:</strong> {selectedUser.home}
                  </p>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                    <strong>Địa chỉ:</strong> {selectedUser.address}
                  </p>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                    <strong>Ngày sinh:</strong> {selectedUser.dob}
                  </p>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                    <strong>Giới tính:</strong> {selectedUser.sex}
                  </p>
                  <p className={`mb-5 text-sm ${selectedUser.isKYC ? 'text-green-500' : 'text-red-500'} dark:text-gray-400`}>
                    <strong>Xác minh:</strong> {selectedUser.isKYC ? 'Đã xác minh' : 'Chưa xác minh'}
                  </p>
                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                    <strong>Ngày tạo:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!selectedUser.isKYC && (
                  <Button color='success' onClick={handleVerifyUser}>
                    Xác minh
                  </Button>
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}
