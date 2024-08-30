import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Table, Button, Spinner, ModalFooter } from 'flowbite-react';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function DashUserLoan() {
  const { currentUser } = useSelector((state) => state.user);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/loan/get-loans/user/${currentUser.id}`, {
          params: { userId: currentUser._id },
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        if (res.status === 200) {
          setLoans(res.data.loans);
          if (res.data.loans.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (!currentUser?.isAdmin) {
      fetchLoans();
    }
  }, [currentUser._id, !currentUser?.isAdmin, currentUser.token]);

  const handleShowMore = async () => {
    const startIndex = loans.length;
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/loan/get-loans/user/${currentUser.id}`, {
        params: { userId: currentUser._id, startIndex },
        withCredentials: true,
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      if (res.status === 200) {
        setLoans((prev) => [...prev, ...res.data.loans]);
        if (res.data.loans.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleViewLoan = (loan) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };



  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {loading ? (
        <Spinner size="lg" className="self-center" />
      ) : !currentUser.isAdmin && loans.length > 0 ? (
        <>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Ngày tạo</Table.HeadCell>
              <Table.HeadCell>Ảnh đại diện</Table.HeadCell>
              <Table.HeadCell>Tên người dùng</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Tình thái khoản vay</Table.HeadCell>
              <Table.HeadCell>Xem chi tiết</Table.HeadCell>
            </Table.Head>
            <Table.Body className='divide-y'>
              {loans.map((loan) => (
                <Table.Row key={loan._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                  <Table.Cell>{new Date(loan.createdAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <img
                      src={`${process.env.REACT_APP_ASSET_URL}/uploads/${loan.user.avatar}`}
                      alt={loan.user.name}
                      className='w-10 h-10 object-cover bg-gray-500 rounded-full'
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {loan.user.name}
                  </Table.Cell>
                  <Table.Cell>{loan.user.email}</Table.Cell>
                  <Table.Cell>
                    {loan.loan_status ? <FaCheck className='text-green-500' /> : <FaTimes className='text-red-500' />}
                  </Table.Cell>
                  <Table.Cell>
                    <Button color='info' onClick={() => handleViewLoan(loan)}>Xem chi tiết</Button>
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
        <p>You have no loan yet!</p>
      )}

      {/* Modal View */}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='medium-modal'>
        <Modal.Header />
        <Modal.Body>
        {selectedLoan ? (
            <div className='grid grid-cols-3 gap-4'>
              {/* Thông tin người vay */}
              <div className='col-span-3 md:col-span-1'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-gray-300 mb-4'>
                  Thông tin người vay
                </h3>
                <div className='space-y-4'>
                  <img
                    src={`${process.env.REACT_APP_ASSET_URL}/uploads/${selectedLoan.user.avatar}`}
                    alt={selectedLoan.user.name}
                    className='w-20 h-20 object-cover bg-gray-500 rounded-full mb-4 mx-auto'
                  />
                  <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Họ và tên:</strong> {selectedLoan.user.name}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Mã số CCCD:</strong> {selectedLoan.user.id}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Ngày cấp:</strong> {selectedLoan.user.issue_date}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Email:</strong> {selectedLoan.user.email}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Số điện thoại:</strong> {selectedLoan.user.phone}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Quê quán:</strong> {selectedLoan.user.home}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Địa chỉ:</strong> {selectedLoan.user.address}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Ngày sinh:</strong> {selectedLoan.user.dob}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Giới tính:</strong> {selectedLoan.user.sex}</p>
                </div>
              </div>
                {/* Thông tin khoản vay */}
                <div className='col-span-3 md:col-span-2'>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-gray-300 mb-4'>
                    Thông tin khoản vay
                  </h3>

                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Số tiền vay: </strong>{selectedLoan.loan_amnt}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Thời hạn vay:</strong> {selectedLoan.term} tháng</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Lãi suất:</strong> {selectedLoan.int_rate}%</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Khoản trả góp hàng tháng:</strong> {selectedLoan.installment} USD</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Xếp hạng:</strong> {selectedLoan.grade}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Kinh nghiệm làm việc:</strong> {selectedLoan.emp_length} năm</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Tình trạng nhà ở:</strong> {selectedLoan.home_ownership}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Điểm FICO:</strong> {selectedLoan.fico_score}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Mục đích vay:</strong> {selectedLoan.purpose}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Tỷ lệ nợ trên thu nhập:</strong> {selectedLoan.dti}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Số tài khoản đã mở:</strong> {selectedLoan.open_acc}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Tổng tài khoản đã mở:</strong> {selectedLoan.total_acc}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Số lượng hồ sơ công cộng:</strong> {selectedLoan.pub_rec}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Số lượng hồ sơ phá sản công cộng:</strong> {selectedLoan.pub_rec_bankruptcies}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Số dư tín dụng:</strong> {selectedLoan.revol_bal}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Tỷ lệ sử dụng tín dụng:</strong> {selectedLoan.revol_util}%</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Trạng thái khoản vay:</strong> {selectedLoan.loan_status ? 'Cho phép' : 'Từ chối'}</p>
                  </div>
                </div>
              </div>

          ) : (
            <p className='text-gray-500 dark:text-gray-400'>No details available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
