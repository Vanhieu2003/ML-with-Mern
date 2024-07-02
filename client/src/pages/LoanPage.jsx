import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CallToAction from '../components/CallToAction';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput, Label, Select, Card, Modal } from 'flowbite-react';

const LoanPage = () => {
    const [formData, setFormData] = useState({
        loan_amnt: 10000,
        term: 60,
        int_rate: 14.65,
        installment: 337.86,
        sub_grade: 'C1',
        emp_length: 10,
        home_ownership: 'RENT',
        annual_inc: 24000,
        verification_status: 'Verified',
        fico_score: 682,
        delinq_2yrs: 0,
        purpose: 'credit_card',
        dti: 27.65,
        open_acc: 3,
        pub_rec: 0,
        pub_rec_bankruptcies: 0,
        revol_bal: 13648,
        revol_util: 83.7,
        total_acc: 9
    });

    const [predictionResult, setPredictionResult] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { currentUser } = useSelector((state) => state.user)
    const navigate = useNavigate();
    const token = currentUser?.token; // Lấy userId từ Redux store
    useEffect(() => {
        if (!token) {
          navigate('/login');
        }
      }, [token, navigate]);
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Prediction result:', response.data);
    
            const predictionText = response.data.prediction[0] === 1 ? 'Charged-Off' : 'Fully-Paid';
            setPredictionResult(predictionText);
            setShowModal(true);
    
            const saveData = {
                ...formData,
                userId: currentUser?._id,
                prediction: predictionText
            };
    
            const saveResponse = await axios.post('http://localhost:5000/api/loan/save-prediction', saveData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Save prediction result:', saveResponse.data);
    
        } catch (error) {
            console.error('Prediction submission failed:', error);
            alert('Prediction submission failed!');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    return (
        <div className="loan-page p-4 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Prediction Form</h2>
            <Card className="w-full max-w-4xl">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Các trường dữ liệu ở đây */}
                        <div className="mb-4">
                            <Label htmlFor="loan_amnt" value="Loan Amount:" />
                            <TextInput type="number" name="loan_amnt" value={formData.loan_amnt} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="term" value="Term:" />
                            <TextInput type="number" name="term" value={formData.term} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="int_rate" value="Interest Rate:" />
                            <TextInput type="number" step="0.01" name="int_rate" value={formData.int_rate} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="installment" value="Installment:" />
                            <TextInput type="number" name="installment" value={formData.installment} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="sub_grade" value="Sub Grade:" />
                            <TextInput type="text" name="sub_grade" value={formData.sub_grade} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="emp_length" value="Employment Length:" />
                            <TextInput type="number" name="emp_length" value={formData.emp_length} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="home_ownership" value="Home Ownership:" />
                            <Select name="home_ownership" value={formData.home_ownership} onChange={handleChange} required>
                                <option value="RENT">Rent</option>
                                <option value="OWN">Own</option>
                                <option value="MORTGAGE">Mortgage</option>
                                <option value="OTHER">Other</option>
                            </Select>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="annual_inc" value="Annual Income:" />
                            <TextInput type="number" name="annual_inc" value={formData.annual_inc} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="verification_status" value="Verification Status:" />
                            <Select name="verification_status" value={formData.verification_status} onChange={handleChange} required>
                                <option value="Verified">Verified</option>
                                <option value="Not Verified">Not Verified</option>
                            </Select>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="fico_score" value="FICO Score:" />
                            <TextInput type="number" name="fico_score" value={formData.fico_score} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="delinq_2yrs" value="Delinquencies in 2 Years:" />
                            <TextInput type="number" name="delinq_2yrs" value={formData.delinq_2yrs} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="purpose" value="Purpose:" />
                            <TextInput type="text" name="purpose" value={formData.purpose} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="dti" value="Debt-to-Income Ratio (DTI):" />
                            <TextInput type="number" step="0.01" name="dti" value={formData.dti} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="open_acc" value="Open Accounts:" />
                            <TextInput type="number" name="open_acc" value={formData.open_acc} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="pub_rec" value="Public Records:" />
                            <TextInput type="number" name="pub_rec" value={formData.pub_rec} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="pub_rec_bankruptcies" value="Public Record Bankruptcies:" />
                            <TextInput type="number" name="pub_rec_bankruptcies" value={formData.pub_rec_bankruptcies} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="revol_bal" value="Revolving Balance:" />
                            <TextInput type="number" name="revol_bal" value={formData.revol_bal} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="revol_util" value="Revolving Utilization:" />
                            <TextInput type="number" step="0.01" name="revol_util" value={formData.revol_util} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="total_acc" value="Total Accounts:" />
                            <TextInput type="number" name="total_acc" value={formData.total_acc} onChange={handleChange} required />
                        </div>
                    </div>
                    <Button type="submit" className="w-full">Submit Prediction</Button>
                </form>
            </Card>
            
            <div className='p-10 dark:bg-slate-700'>
        <CallToAction />
      </div>

            {/* Modal */}
            {showModal && (
                <Modal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                >
                    <Modal.Header>Prediction Result</Modal.Header>
                    <Modal.Body>
                        <p className="text-xl font-semibold">Prediction: {predictionResult}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button color="gray" onClick={() => setShowModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default LoanPage;
