import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Button, Table } from 'flowbite-react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { HiArrowNarrowUp, HiOutlineUserGroup,HiDocumentText,HiMiniBanknotes, HiCreditCard } from 'react-icons/hi';

export default function DashboardComp() {
  const [users, setUsers] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [loans,setLoans] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalLoans, setTotalLoans] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthLoans, setLastMonthLoans] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const startIndex = users.length;
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/users`, {
          params: { userId: currentUser._id, startIndex },
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });

        const data = res.data; // Truy cập dữ liệu trực tiếp từ res.data
        setUsers(data.users);
        setTotalUsers(data.totalUsers);
        setLastMonthUsers(data.lastMonthUsers);
      } catch (error) {
        console.log(error.message);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`, {
          params: { userId: currentUser._id },
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });

        const data = res.data; // Truy cập dữ liệu trực tiếp từ res.data
        setPosts(data.posts);
        setTotalPosts(data.totalPosts);
        setLastMonthPosts(data.lastMonthPosts);
      } catch (error) {
        console.log(error.message);
      }
    };
    

    const fetchLoans = async () => {
      try {
        const startIndex = loans.length;
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/loan/get-loan`, {
          params: { userId: currentUser._id, startIndex },
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });

        const data = res.data; // Truy cập dữ liệu trực tiếp từ res.data
        setLoans(data.loans);
        setTotalLoans(data.totalLoans);
        setLastMonthLoans(data.lastMonthLoans);
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser?.isAdmin) {
      fetchUsers();
      fetchPosts();
      fetchLoans();
    }
  }, [currentUser]);


  // Lọc các khoản vay có dự đoán là 'Charged-Off'
  const filteredLoansFalse = loans.filter((loan) => loan.loan_status == false);
  // Lọc các khoản vay có dự đoán là 'Fully Paid'
  const filteredLoansTrue = loans.filter((loan) => loan.loan_status == true);

  return (
    <div className='p-3 md:mx-auto'>
      <div className='flex-wrap flex gap-4 justify-center '>
        <div className='flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md'>
          <div className='flex justify-between'>
            <div>
              <h3 className='text-gray-500 text-md uppercase'>Tổng người dùng </h3>
              <p className='text-2xl'>{totalUsers}</p>
            </div>
            <HiOutlineUserGroup className='bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg' />
          </div>
          <div className='flex gap-2 text-sm'>
            <span className='text-green-500 flex items-center'>
              <HiArrowNarrowUp />
              {lastMonthUsers}
            </span>
            <div className='text-gray-500'>Được cập nhật </div>
          </div>
        </div>
        <div className='flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md'>
          <div className='flex justify-between'>
            <div>
              <h3 className='text-gray-500 text-md uppercase'>Tổng bài viết</h3>
              <p className='text-2xl'>{totalPosts}</p>
            </div>
            <HiDocumentText className='bg-lime-600 text-white rounded-full text-5xl p-3 shadow-lg' />
          </div>
          <div className='flex gap-2 text-sm'>
            <span className='text-green-500 flex items-center'>
              <HiArrowNarrowUp />
              {lastMonthPosts}
            </span>
            <div className='text-gray-500'>Được cập nhật</div>
          </div>
        </div>
        <div className='flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md'>
          <div className='flex justify-between'>
            <div>
              <h3 className='text-gray-500 text-md uppercase'>Tổng khoản vay</h3>
              <p className='text-2xl'>{totalLoans}</p>
            </div>
            <HiCreditCard className='bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg' />
          </div>
          <div className='flex gap-2 text-sm'>
            <span className='text-green-500 flex items-center'>
              <HiArrowNarrowUp />
              {lastMonthLoans}
            </span>
            <div className='text-gray-500'>Được cập nhật</div>
          </div>
        </div>
      </div>
      <div className='flex flex-wrap gap-4 py-3 mx-auto justify-center'>
        <div className='flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800'>
          <div className='flex justify-between  p-3 text-sm font-semibold'>
            <h1 className='text-center p-2'>Người dùng gần đây</h1>
            <Button outline gradientDuoTone='greenToBlue'>
              <Link to={'/dashboard?tab=users'}>Xem tất cả</Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Ảnh đại diện</Table.HeadCell>
              <Table.HeadCell>Tên người dùng</Table.HeadCell>
            </Table.Head>
            {users &&
              users.map((user) => (
                <Table.Body key={user._id} className='divide-y'>
                  <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell>
                      <img
                        src={`${process.env.REACT_APP_ASSET_URL}/uploads/${user.avatar}`}
                        alt='user'
                        className='w-10 h-10 rounded-full bg-gray-500'
                      />
                    </Table.Cell>
                    <Table.Cell>{user.name}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
          </Table>
        </div>
        <div className='flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800'>
          <div className='flex justify-between  p-3 text-sm font-semibold'>
            <h1 className='text-center p-2'>Khoản vay gần đây</h1>
            <Button outline gradientDuoTone='greenToBlue'>
              <Link to={'/dashboard?tab=loans'}>Xem tất cả</Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Tên người dùng</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Dự đoán</Table.HeadCell>
            </Table.Head>
            {loans &&
              loans.map((loans) => (
                <Table.Body key={loans._id} className='divide-y'>
                  <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell>
                      {loans.user.name}
                    </Table.Cell>
                    <Table.Cell>
                      {loans.user.email}
                    </Table.Cell>
                    <Table.Cell>{loans.prediction === 'Charged-Off' ? <FaTimes className='text-red-500' /> : <FaCheck className='text-green-500' />}</Table.Cell>

                  </Table.Row>
                </Table.Body>
              ))}
          </Table>
        </div>
        <div className='flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800'>
          <div className='flex justify-between  p-3 text-sm font-semibold'>
            <h1 className='text-center p-2'>Khoản vay chưa được duyệt</h1>
            <Button outline gradientDuoTone='greenToBlue'>
              <Link to={'/dashboard?tab=loans'}>Xem tất cả</Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Tên người dùng</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Tình trạng</Table.HeadCell>
            </Table.Head>
            {filteredLoansFalse &&
              filteredLoansFalse.map((loan) => (
                <Table.Body key={loan._id} className='divide-y'>
                  <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell>{loan.user.name}</Table.Cell>
                    <Table.Cell>{loan.user.email}</Table.Cell>
                    <Table.Cell>
                      {loan.loan_status === false ? <FaTimes className='text-red-500' /> : <FaCheck className='text-green-500' />}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
          </Table>
        </div>
        <div className='flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800'>
          <div className='flex justify-between  p-3 text-sm font-semibold'>
            <h1 className='text-center p-2'>Khoản vay được duyệt</h1>
            <Button outline gradientDuoTone='greenToBlue'>
              <Link to={'/dashboard?tab=loans'}>Xem tất cả</Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Tên người dùng</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Tình trạng</Table.HeadCell>
            </Table.Head>
            {filteredLoansTrue &&
              filteredLoansTrue.map((loan) => (
                <Table.Body key={loan._id} className='divide-y'>
                  <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell>{loan.user.name}</Table.Cell>
                    <Table.Cell>{loan.user.email}</Table.Cell>
                    <Table.Cell>
                      {loan.loan_status === false ? <FaTimes className='text-red-500' /> : <FaCheck className='text-green-500' />}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
          </Table>
        </div>
       
        <div className='flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800'>
          <div className='flex justify-between  p-3 text-sm font-semibold'>
            <h1 className='text-center p-2'>Bài viết gần đây</h1>
            <Button outline gradientDuoTone='greenToBlue'>
              <Link to={'/dashboard?tab=posts'}>Xem tất cả</Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Ảnh bài viết</Table.HeadCell>
              <Table.HeadCell>Tiêu đề</Table.HeadCell>
              <Table.HeadCell>Loại</Table.HeadCell>
            </Table.Head>
            {posts &&
              posts.map((post) => (
                <Table.Body key={post._id} className='divide-y'>
                  <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell>
                      <img
                         src={`${process.env.REACT_APP_ASSET_URL}/uploads/${post.thumbnail}`}
                        alt='user'
                        className='w-14 h-10 rounded-md bg-gray-500'
                      />
                    </Table.Cell>
                    <Table.Cell className='w-96'>{post.title}</Table.Cell>
                    <Table.Cell className='w-5'>{post.category}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
          </Table>
        </div>
      </div>
    </div>
  );
}
