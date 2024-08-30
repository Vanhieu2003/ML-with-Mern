import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Table, Button, Spinner, Select } from 'flowbite-react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function DashLoans() {
  const { currentUser } = useSelector((state) => state.user);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loanIdToUpdate, setLoanIdToUpdate] = useState('');
  const [loanStatusToUpdate, setLoanStatusToUpdate] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/loan/get-loan`, {
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
        console.error('Error fetching loans:', error.message);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.isAdmin) {
      fetchLoans();
    }
  }, [currentUser._id, currentUser?.isAdmin, currentUser.token]);

  const handleShowMore = async () => {
    const startIndex = loans.length;
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/loan/get-loan`, {
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

  const handleUpdateLoanStatus = async () => {
    try {
      const res = await axios.patch(`${process.env.REACT_APP_BASE_URL}/loan/update-loan-status/${loanIdToUpdate}`,
        { loan_status: loanStatusToUpdate },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });

      if (res.status === 200) {
        setLoans((prevLoans) =>
          prevLoans.map((loan) =>
            loan._id === loanIdToUpdate ? { ...loan, loan_status: loanStatusToUpdate } : loan
          )
        );
        setShowConfirmModal(false);
        setShowModal(false);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true);
  };

  const handleViewLoan = (loan) => {
    setSelectedLoan(loan);
    setShowModal(true);
    setLoanIdToUpdate(loan._id);
    setLoanStatusToUpdate(true);
  };

  const formatPredictionProba = (proba) => {
    if (!proba || !Array.isArray(proba) || !Array.isArray(proba[0])) {
      return 'N/A';
    }
    // Convert [[Number]] to a string with numbers separated by commas
    return proba[0].map((num) => num.toFixed(2)).join(',  ');
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const filteredLoans = loans.filter(loan => {
    if (filterStatus === 'all') return true;
    return filterStatus === 'approved' ? loan.loan_status : !loan.loan_status;
  });


  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {loading ? (
        <Spinner size='lg' className='self-center' />
      ) : currentUser.isAdmin && loans.length > 0 ? (
        <>
        <div className="mb-4">
          <Select
            value={filterStatus}
            onChange={handleFilterChange}
            className='w-48'
          >
            <option value="all">Tất cả</option>
            <option value="approved">Cho phép</option>
            <option value="rejected">Từ chối</option>
          </Select>
        </div>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Ngày tạo</Table.HeadCell>
              <Table.HeadCell>Ảnh đại diện</Table.HeadCell>
              <Table.HeadCell>Tên người dùng</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Kết quả dự đoán</Table.HeadCell>
              <Table.HeadCell>Trạng thái vay</Table.HeadCell>
              <Table.HeadCell>Chi tiết</Table.HeadCell>
            </Table.Head>
            <Table.Body className='divide-y'>
              {filteredLoans.map((loan) => {
                console.log('Loan Status:', loan.loan_status); // Log giá trị loan_status để kiểm tra
                return (
                  <Table.Row key={loan._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell>{new Date(loan.createdAt).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>
                      <img
                        src={`${process.env.REACT_APP_ASSET_URL}/uploads/${loan.user.avatar}`}
                        alt={loan.user.name}
                        className='w-10 h-10 object-cover bg-gray-500 rounded-full'
                      />
                    </Table.Cell>
                    <Table.Cell>{loan.user.name}</Table.Cell>
                    <Table.Cell>{loan.user.email}</Table.Cell>
                    <Table.Cell>{loan.random_forest.prediction === 'Charged-Off' ? <FaTimes className='text-red-500' /> : <FaCheck className='text-green-500' />}</Table.Cell>
                    <Table.Cell>
                      {loan.loan_status ? (
                        <FaCheck className='text-green-500' />
                      ) : (
                        <FaTimes
                          className='text-red-500 cursor-pointer'

                        />
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Button color='info' onClick={() => handleViewLoan(loan)}>Xem chi tiết</Button>
                    </Table.Cell>
                  </Table.Row>
                );
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
        <p>Bạn không có khoản vay mới nào được đăng ký!</p>
      )}
  <Modal show={showModal} onClose={() => setShowModal(false)} popup size='medium'>
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
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Thu nhập:</strong> {selectedLoan.annual_inc} USD</p>
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Tổng tài khoản đã mở:</strong> {selectedLoan.total_acc}</p>
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Số lượng hồ sơ công cộng:</strong> {selectedLoan.pub_rec}</p>
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Số lượng hồ sơ phá sản công cộng:</strong> {selectedLoan.pub_rec_bankruptcies}</p>
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Số dư tín dụng:</strong> {selectedLoan.revol_bal}</p>
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Tỷ lệ sử dụng tín dụng:</strong> {selectedLoan.revol_util}%</p>
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Kết quả dự đoán (Logistic Regression):</strong> {selectedLoan.logistic_regression.prediction}</p>
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Xác suất (Logistic Regression):</strong> {formatPredictionProba(selectedLoan.logistic_regression.prediction_proba)}</p>
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Kết quả dự đoán (Random Forest):</strong> {selectedLoan.random_forest.prediction}</p>
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Xác suất (Random Forest):</strong> {formatPredictionProba(selectedLoan.random_forest.prediction_proba)}</p>
    <p className='text-sm text-gray-500 dark:text-gray-400'><strong>Trạng thái khoản vay:</strong> {selectedLoan.loan_status ? 'Cho phép' : 'Từ chối'}</p>
                </div>
                <div className='flex items-center justify-center gap-4 mt-6'>
                  <Button color="success" onClick={handleOpenConfirmModal}>Cập nhật trạng thái vay</Button>
                  <Button color='failure' onClick={() => setShowModal(false)}>Đóng</Button>
                </div>
              </div>
            </div>
          ) : (
            
            <p>Không có thông tin khoản vay nào được chọn</p>
          )}
         
        </Modal.Body>
      </Modal>
      <Modal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
           <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Bạn có chắc chắn duyệt khoản vay này không?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="success" onClick={handleUpdateLoanStatus}>
                {"Có tôi chắc chắn"}
              </Button>
              <Button color="gray" onClick={() => setShowConfirmModal(false)}>Hủy</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

