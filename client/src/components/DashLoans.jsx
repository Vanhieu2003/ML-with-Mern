import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Table, Button, Spinner } from 'flowbite-react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashLoans() {
  const { currentUser } = useSelector((state) => state.user);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [loanIdToUpdate, setLoanIdToUpdate] = useState('');
  const [loanStatusToUpdate, setLoanStatusToUpdate] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

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
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/loan/get-prediction`, {
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
      console.error('Error loading more loans:', error.message);
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
          setShowModal(false);
      }
    } catch (error) {
        console.error('Error updating loan status:', error.message);
    }
  };

  const handleViewLoan = (loan) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  const formatPredictionProba = (proba) => {
    if (!proba || !Array.isArray(proba) || !Array.isArray(proba[0])) {
      return 'N/A';
    }
    // Convert [[Number]] to a string with numbers separated by commas
    return proba[0].map(num => num.toFixed(2)).join(', ');
  };

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {loading ? (
        <Spinner size="lg" className="self-center" />
      ) : currentUser.isAdmin && loans.length > 0 ? (
        <>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>User Avatar</Table.HeadCell>
              <Table.HeadCell>User Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Prediction</Table.HeadCell>
              <Table.HeadCell>Loan Status</Table.HeadCell>
              <Table.HeadCell>View</Table.HeadCell>
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
                  <Table.Cell>{loan.prediction === 'Charged-Off' ? <FaTimes className='text-red-500' /> : <FaCheck className='text-green-500' />}</Table.Cell>
                  <Table.Cell>
                    {loan.loan_status ? (
                      <FaCheck className='text-green-500' />
                    ) : (
                      <FaTimes className='text-red-500 cursor-pointer' />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Button color='info' onClick={() => handleViewLoan(loan)}>View</Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {showMore && (
            <button onClick={handleShowMore} className='w-full text-teal-500 self-center text-sm py-7'>
              Show more
            </button>
          )}
        </>
      ) : (
        <p>You have no loans yet!</p>
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          {selectedLoan ? (
            <div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-gray-300 mb-4'>
                Loan Details
              </h3>
              <div className='space-y-4'>
                {/* Thông tin người vay */}
                <div>
                <h4 className='text-md font-semibold text-gray-900 dark:text-gray-300 mb-2'>Thông tin người vay</h4>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Name: {selectedLoan.user.name}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Email: {selectedLoan.user.email}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Phone: {selectedLoan.user.phone}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Address: {selectedLoan.user.address}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Date Created: {new Date(selectedLoan.createdAt).toLocaleDateString()}</p>
                </div>
                {/* Thông tin khoản vay */}
                <div>
                  <h4 className='text-md font-semibold text-gray-900 dark:text-gray-300 mb-2'>Thông tin khoản vay</h4>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Loan Amount: {selectedLoan.loan_amnt}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Term: {selectedLoan.term}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Interest Rate: {selectedLoan.int_rate}%</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Installment: {selectedLoan.installment}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Grade: {selectedLoan.grade}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Employment Length: {selectedLoan.emp_length} years</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Home Ownership: {selectedLoan.home_ownership}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Annual Income: {selectedLoan.annual_inc}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Verification Status: {selectedLoan.verification_status}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>FICO Score: {selectedLoan.fico_score}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Delinquent 2 Years: {selectedLoan.delinq_2yrs}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Purpose: {selectedLoan.purpose}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>DTI: {selectedLoan.dti}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Open Accounts: {selectedLoan.open_acc}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Public Records: {selectedLoan.pub_rec}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Public Record Bankruptcies: {selectedLoan.pub_rec_bankruptcies}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Revolving Balance: {selectedLoan.revol_bal}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Revolving Utilization: {selectedLoan.revol_util}%</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Total Accounts: {selectedLoan.total_acc}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>tot_cur_bal: {selectedLoan.tot_cur_bal}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Prediction: <strong>{selectedLoan.prediction}</strong></p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Prediction Probability: {formatPredictionProba(selectedLoan.prediction_proba)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className='text-gray-500 dark:text-gray-400'>No loan details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Close</Button>
          {selectedLoan && !selectedLoan.loan_status && (
            <Button color='success' onClick={handleUpdateLoanStatus}>
              Approve Loan
            </Button>
          )}
          {selectedLoan && selectedLoan.loan_status && (
            <Button color='failure' onClick={() => {
              setLoanStatusToUpdate(false);
              handleUpdateLoanStatus();
            }}>
              Reject Loan
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
