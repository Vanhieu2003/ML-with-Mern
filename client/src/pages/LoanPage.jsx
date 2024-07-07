import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Label, TextInput, Select, Button, Modal, Tooltip } from 'flowbite-react';
import CallToAction from '../components/CallToAction';

const LoanPage = () => {
    const [formData, setFormData] = useState({
        loan_amnt: 0,
        term: 36,
        int_rate: 0,
        installment: 0,
        grade: 'A',
        emp_length: 0,
        home_ownership: 'RENT',
        annual_inc: 0,
        verification_status: 'Verified',
        fico_score: 0,
        delinq_2yrs: 0,
        purpose: 'credit_card',
        dti: 0,
        open_acc: 0,
        pub_rec: 0,
        pub_rec_bankruptcies: 0,
        revol_bal: 0,
        revol_util: 0,
        total_acc: 0,
        tot_cur_bal: 0
    });

    const gradeToIntRate = {
        A: 7.113039,
        B: 10.679129,
        C: 14.021234,
        D: 17.721618,
        E: 21.138086,
        F: 24.934785,
        G: 27.725938
    };


    const [predictionResult, setPredictionResult] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const token = currentUser?.token;
    useEffect(() => {
        if (!token) {
            // Nếu không có token, chuyển hướng đến trang đăng nhập
            navigate('/login');
        } else if (currentUser?.isKYC === false && currentUser?.isAdmin === false) {
            // Nếu người dùng không hoàn tất KYC và không phải là quản trị viên
            navigate('/unauthorized');
        }
    }, [token, currentUser, navigate]);

    useEffect(() => {
        // Tính toán khoản trả góp hàng tháng

        const { loan_amnt, term, int_rate } = formData;
        if (loan_amnt && term && int_rate) {
            const monthlyRate = int_rate / 100 / 12;
            const numPayments = term;
            const installment = (loan_amnt * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));
            setFormData((prevFormData) => ({
                ...prevFormData,
                installment: installment.toFixed(2)
            }));
        }

    }, [formData.loan_amnt, formData.term, formData.int_rate]);

    useEffect(() => {
        // Tính toán DTI (tỷ lệ nợ trên thu nhập)
        const monthlyIncome = formData.annual_inc / 12;
        const dti = (formData.installment / monthlyIncome) * 100;
        setFormData((prevFormData) => ({
            ...prevFormData,
            dti: dti.toFixed(2)
        }));
    }, [formData.installment, formData.annual_inc]);


    useEffect(() => {
        // Cập nhật lãi suất khi thay đổi grade
        const intRate = gradeToIntRate[formData.grade];
        setFormData((prevFormData) => ({
            ...prevFormData,
            int_rate: intRate
        }));
    }, [formData.grade]);


    useEffect(() => {
        // Tính toán tỷ lệ sử dụng revolving
        if (formData.tot_cur_bal > 0) {
            const revol_util = (formData.revol_bal / formData.tot_cur_bal) * 100;
            setFormData((prevFormData) => ({
                ...prevFormData,
                revol_util: revol_util.toFixed(2)
            }));
        }
    }, [formData.revol_bal, formData.tot_cur_bal]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra điểm FICO
        if (formData.fico_score < 660) {
            setErrorMessage('Chỉ những người đi vay có điểm tín dụng FICO từ 660 trở lên mới được phê duyệt.');
            return;
        } else {
            setErrorMessage('');
        }

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
                prediction: predictionText,
                prediction_proba: response.data.prediction_proba
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
                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <Label htmlFor="loan_amnt" value="Số tiền vay:" />
                            <Tooltip content="Giá trị khoản vay từ 1.000 USD đến 40.000 USD">
                                <TextInput type="number" name="loan_amnt" value={formData.loan_amnt} onChange={handleChange} required min="1000" max="40000" />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="term" value="Thời hạn:" />
                            <Tooltip content="Thời hạn vay (tháng)">
                                <Select name="term" value={formData.term} onChange={handleChange} required>
                                    <option value={36}>36 tháng</option>
                                    <option value={60}>60 tháng</option>
                                </Select>
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="int_rate" value="Lãi suất:" />
                            <Tooltip content="Mức lãi suất trung bình từ 7.6% đến 25%">
                                <TextInput type="number" step="0.01" name="int_rate" value={formData.int_rate} onChange={handleChange} required readOnly />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="installment" value="Khoản trả góp:" />
                            <Tooltip content="Khoản tiền phải trả hàng tháng">
                                <TextInput type="number" name="installment" value={formData.installment} onChange={handleChange} required readOnly />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="grade" value="Cấp hạng:" />
                            <Tooltip content="Cấp hạng từ A đến G">
                                <Select name="grade" value={formData.grade} onChange={handleChange} required>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                    <option value="E">E</option>
                                    <option value="F">F</option>
                                    <option value="G">G</option>
                                </Select>
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="emp_length" value="Thời gian làm việc:" />
                            <Tooltip content="Số năm làm việc">
                                <Select name="emp_length" value={formData.emp_length} onChange={handleChange} required>
                                    <option value="0">Ít hơn 1 năm </option>
                                    <option value="1">1 năm</option>
                                    <option value="2">2 năm</option>
                                    <option value="3">3 năm</option>
                                    <option value="4">4 năm</option>
                                    <option value="5">5 năm</option>
                                    <option value="6">6 năm</option>
                                    <option value="7">7 năm</option>
                                    <option value="8">8 năm</option>
                                    <option value="9">9 năm</option>
                                    <option value="10">10 năm trở lên</option>
                                </Select>
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="home_ownership" value="Quyền sở hữu nhà:" />
                            <Tooltip content="Tình trạng nhà ở">
                                <Select name="home_ownership" value={formData.home_ownership} onChange={handleChange} required>
                                    <option value="RENT">Thuê</option>
                                    <option value="OWN">Sở hữu</option>
                                    <option value="MORTGAGE">Thế chấp</option>
                                    <option value="OTHER">Khác</option>
                                </Select>
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="annual_inc" value="Thu nhập hàng năm:" />
                            <Tooltip content="Thu nhập hàng năm của bạn">
                                <TextInput type="number" name="annual_inc" value={formData.annual_inc} onChange={handleChange} required />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="verification_status" value="Tình trạng xác minh:" />
                            <Tooltip content="Tình trạng xác minh thu nhập">
                                <Select name="verification_status" value={formData.verification_status} onChange={handleChange} required>
                                    <option value="Verified">Đã xác minh</option>
                                    <option value="Not Verified">Chưa xác minh</option>
                                    <option value="Source Verified">Nguồn đã được xác minh</option>
                                </Select>
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="fico_score" value="Điểm tín dụng FICO:" />
                            <Tooltip content="Chỉ những người đi vay có điểm tín dụng FICO từ 660 trở lên mới được phê duyệt">
                                <TextInput type="number" name="fico_score" value={formData.fico_score} onChange={handleChange} required />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="delinq_2yrs" value="Số lần vỡ nợ trong 2 năm:" />
                            <Tooltip content="Số lần vỡ nợ trong 2 năm qua">
                                <TextInput type="number" name="delinq_2yrs" value={formData.delinq_2yrs} onChange={handleChange} required />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="purpose" value="Mục đích vay:" />
                            <Tooltip content="Lý do vay tiền">
                                <Select name="purpose" value={formData.purpose} onChange={handleChange} required>
                                    <option value="debt_consolidation">Tập hợp nợ</option>
                                    <option value="credit_card">Thẻ tín dụng</option>
                                    <option value="home_improvement">Cải thiện nhà ở</option>
                                    <option value="major_purchase">Mua sắm lớn</option>
                                    <option value="medical">Chi phí y tế</option>
                                    <option value="small_business">Kinh doanh nhỏ</option>
                                    <option value="car">Xe hơi</option>
                                    <option value="moving">Di chuyển</option>
                                    <option value="vacation">Kỳ nghỉ</option>
                                    <option value="house">Nhà cửa</option>
                                    <option value="wedding">Đám cưới</option>
                                    <option value="renewable_energy">Năng lượng tái tạo</option>
                                    <option value="educational">Giáo dục</option>
                                    <option value="other">Khác</option>
                                </Select>
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="dti" value="Tỷ lệ nợ trên thu nhập (DTI):" />
                            <Tooltip content="Tính toán tỷ lệ nợ trên thu nhập">
                                <TextInput type="number" step="0.01" name="dti" value={formData.dti} onChange={handleChange} required readOnly />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="open_acc" value="Số tài khoản mở:" />
                            <Tooltip content="Số tài khoản mở hiện tại của bạn">
                                <TextInput type="number" name="open_acc" value={formData.open_acc} onChange={handleChange} required />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="pub_rec" value="Số hồ sơ công cộng:" />
                            <Tooltip content="Số hồ sơ công cộng liên quan đến tài chính của bạn">
                                <TextInput type="number" name="pub_rec" value={formData.pub_rec} onChange={handleChange} required />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="pub_rec_bankruptcies" value="Số hồ sơ phá sản công cộng:" />
                            <Tooltip content="Số hồ sơ phá sản công cộng trong tài khoản của bạn">
                                <TextInput type="number" name="pub_rec_bankruptcies" value={formData.pub_rec_bankruptcies} onChange={handleChange} required />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="revol_bal" value="Số dư revolving:" />
                            <Tooltip content="Số dư tài khoản tín dụng revolving của bạn">
                                <TextInput type="number" name="revol_bal" value={formData.revol_bal} onChange={handleChange} required />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="revol_util" value="Tỷ lệ sử dụng revolving:" />
                            <Tooltip content="Tỷ lệ sử dụng tín dụng revolving của bạn">
                                <TextInput type="number" step="0.01" name="revol_util" value={formData.revol_util} onChange={handleChange} required readOnly />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="total_acc" value="Tổng số tài khoản:" />
                            <Tooltip content="Tổng số tài khoản tín dụng bạn đang có">
                                <TextInput type="number" name="total_acc" value={formData.total_acc} onChange={handleChange} required />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="tot_cur_bal" value="Tổng số dư tất cả tài khoản:" />
                            <Tooltip content="Tổng số dư hiện tại của tất cả các tài khoản">
                                <TextInput type="number" name="tot_cur_bal" value={formData.tot_cur_bal} onChange={handleChange} required />
                            </Tooltip>
                        </div>
                    </div>
                    <Button type="submit" className="w-full">Gửi Dự Đoán</Button>
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
                    <Modal.Header>Kết quả dự đoán</Modal.Header>
                    <Modal.Body>
                        <p className="text-xl font-semibold">Dự đoán: {predictionResult}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button color="gray" onClick={() => setShowModal(false)}>
                            Đóng
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default LoanPage;

