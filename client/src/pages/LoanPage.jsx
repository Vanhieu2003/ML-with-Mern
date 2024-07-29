import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Label, TextInput, Select, Button, Modal, Tooltip, Checkbox } from 'flowbite-react';
import { Stepper, Step, StepLabel, Button as MuiButton, Box } from '@mui/material';
import CallToAction from '../components/CallToAction';

const LoanPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        loan_amnt: 0,
        term: '',
        int_rate: 0,
        installment: 0,
        grade: '',
        emp_length: 0,
        home_ownership: 'RENT',
        annual_inc: 0,
        verification_status: 'Verified',
        fico_score: 0, // Default điểm FICO theo cấp hạng 'A'
        purpose: '',
        dti: 0,
        open_acc: 0,
        pub_rec: 0,
        pub_rec_bankruptcies: 0,
        revol_bal: 0,
        revol_util: 0,
        total_acc: 0
    });

    const gradeToIntRate = {
        A: 7.1,
        B: 10.6,
        C: 14.0,
        D: 17.7,
        E: 21.1,
        F: 24.9,
        G: 27.7
    };

    const gradeToFico = {
        A: 729,
        B: 698,
        C: 689,
        D: 684,
        E: 683,
        F: 681,
        G: 680
    };

    const [predictionResult, setPredictionResult] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [user, setUser] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [id, setId] = useState('');
    const [nationality, setNationality] = useState('');
    const [sex, setSex] = useState('');
    const [home, setHome] = useState('');
    const [dob, setDOB] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const token = currentUser?.token;

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/users/${currentUser.id}`,
                    { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
                );
                const { name, email, phone, address, sex, nationality, dob, home, id } = response.data;
                setName(name);
                setEmail(email);
                setPhone(phone);
                setAddress(address);
                setSex(sex);
                setNationality(nationality);
                setHome(home);
                setDOB(dob);
                setId(id);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        getUser();
    }, [currentUser, token]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else if (currentUser?.isKYC === false && currentUser?.isAdmin === false) {
            navigate('/unauthorized');
        }
    }, [token, currentUser, navigate]);

    useEffect(() => {
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
        const monthlyIncome = formData.annual_inc / 12;
        const dti = (formData.installment / monthlyIncome) * 100;
        setFormData((prevFormData) => ({
            ...prevFormData,
            dti: dti.toFixed(2)
        }));
    }, [formData.installment, formData.annual_inc]);

    useEffect(() => {
        const intRate = gradeToIntRate[formData.grade];
        setFormData((prevFormData) => ({
            ...prevFormData,
            int_rate: intRate
        }));
    }, [formData.grade]);

    useEffect(() => {
        const ficoScore = gradeToFico[formData.grade];
        setFormData((prevFormData) => ({
            ...prevFormData,
            fico_score: ficoScore
        }));
    }, [formData.grade]);

    useEffect(() => {
        const revol_bal = formData.annual_inc * formData.dti / 100;
        const revol_util = (revol_bal / (formData.annual_inc * 0.50)) * 100;
        setFormData((prevFormData) => ({
            ...prevFormData,
            revol_bal: revol_bal.toFixed(2),
            revol_util: revol_util.toFixed(2)
        }));
    }, [formData.annual_inc, formData.dti]);

    const getGrade = (loanAmount) => {
        if (loanAmount >= 25000) return 'G'; // G
        if (loanAmount >= 20000) return 'F'; // F
        if (loanAmount >= 17000) return 'E'; // E
        if (loanAmount >= 15000) return 'D'; // D
        if (loanAmount >= 12500) return 'C'; // C
        if (loanAmount >= 10000) return 'B'; // B
        return 'A'; // A
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => {
            const newFormData = { ...prevFormData, [name]: value };

            if (name === 'loan_amnt') {
                const grade = getGrade(value);
                newFormData.grade = grade;
                const intRate = gradeToIntRate[grade];
                newFormData.int_rate = intRate;
                const ficoScore = gradeToFico[grade];
                newFormData.fico_score = ficoScore;
            }

            if (name === 'annual_inc' || name === 'dti') {
                // Calculate revol_bal and revol_util
                const revol_bal = newFormData.annual_inc * newFormData.dti / 100;
                const revol_util = (revol_bal / (newFormData.annual_inc * 0.50)) * 100;
                newFormData.revol_bal = revol_bal.toFixed(2);
                newFormData.revol_util = revol_util.toFixed(2);
            }

            return newFormData;
        });
    };
    const [agreed, setAgreed] = useState(false);

    const handleAgreementChange = () => {
        setAgreed(!agreed);
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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
            handleReset();

        } catch (error) {
            console.error('Prediction submission failed:', error);
            alert('Prediction submission failed!');
        }
    };
    const steps = [
        {
            label: 'Kiểm tra thông tin', content: (
                <>
                    <h3 className="text-xl text-center font-semibold mb-4">Kiểm tra thông tin</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="mb-4">
                            <Label htmlFor="cccdImage" value="Mã số căn cước công dân:" />
                            <Tooltip content="Mã số căn cước công dân:">
                                <TextInput
                                    type="text"
                                    id="id"
                                    placeholder="Mã số CCCD"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    maxLength="12"
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                    readOnly
                                />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="term" value="Họ và tên:" />
                            <Tooltip content="Họ và tên">
                                <TextInput
                                    type="text"
                                    id="name"
                                    placeholder="Họ và tên"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength="12"
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                    readOnly
                                />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="dob" value="Ngày sinh:" />
                            <Tooltip content="Ngày sinh ">
                                <TextInput
                                    type="text"
                                    id="dob"
                                    placeholder="Ngày sinh"
                                    value={dob}
                                    onChange={(e) => setDOB(e.target.value)}
                                    maxLength="12"
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                    readOnly
                                />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="sex" value="Giới tính:" />
                            <Tooltip content="Giới tính ">
                                <TextInput
                                    type="text"
                                    id="sex"
                                    placeholder="Giới tính"
                                    value={sex}
                                    onChange={(e) => setSex(e.target.value)}
                                    maxLength="12"
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                    readOnly
                                />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="home" value="Quê quán:" />
                            <Tooltip content="Quê quán ">
                                <TextInput
                                    type="text"
                                    id="home"
                                    placeholder="Quê quán"
                                    value={home}
                                    onChange={(e) => setHome(e.target.value)}
                                    maxLength="12"
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                    readOnly
                                />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="address" value="Địa chỉ:" />
                            <Tooltip content="Địa chỉ">
                                <TextInput
                                    type="text"
                                    id="address"
                                    placeholder="Địa chỉ"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    maxLength="12"
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                    readOnly
                                />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="phone" value="Điện thoại:" />
                            <Tooltip content="Điện thoại">
                                <TextInput
                                    type="text"
                                    id="phone"
                                    placeholder="Điện thoại"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    maxLength="12"
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                    readOnly
                                />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="email" value="Email:" />
                            <Tooltip content="Email">
                                <TextInput
                                    type="text"
                                    id="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    maxLength="12"
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                    readOnly
                                />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="nationality" value="Quốc tịch:" />
                            <Tooltip content="Quốc tịch">
                                <TextInput
                                    type="text"
                                    id="nationality"
                                    placeholder="Quốc tịch"
                                    value={nationality}
                                    onChange={(e) => setNationality(e.target.value)}
                                    maxLength="12"
                                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                                    readOnly
                                />
                            </Tooltip>
                        </div>
                    </div>
                </>
            )
        },
        {
            label: 'Hồ sơ vay', content: (
                <>
                    <h3 className="text-xl text-center font-semibold mb-4">Hồ sơ vay</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        <div className="mb-4">
                            <Label htmlFor="loan_amnt" value="Số tiền vay:" />
                            <Tooltip content="Giá trị khoản vay từ 1.000 USD đến 40.000 USD">
                                <div className="flex items-center">
                                    <input
                                        type="range"
                                        name="loan_amnt"
                                        min="1000"
                                        max="40000"
                                        step="500"
                                        value={formData.loan_amnt}
                                        onChange={handleChange}
                                        className="w-full"
                                    />
                                    <span className="ml-3">{formData.loan_amnt} USD</span>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="term" value="Thời hạn:" />
                            <Tooltip content="Thời hạn vay (tháng)">
                                <Select name="term" value={formData.term} onChange={handleChange} required>
                                    <option value={0}>Chọn thời hạn vay</option>
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
                                <Select name="grade" value={formData.grade} onChange={handleChange} required disabled >
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
                            <Tooltip content="Tình trạng xác minh ">
                                <Select name="verification_status" value={formData.verification_status} onChange={handleChange} required disabled>
                                    <option value="Verified">Đã xác minh</option>
                                    <option value="Not Verified">Chưa xác minh</option>
                                    <option value="Source Verified">Nguồn đã được xác minh</option>
                                </Select>
                            </Tooltip>
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="purpose" value="Mục đích vay:" />
                            <Tooltip content="Lý do vay tiền">
                                <Select name="purpose" value={formData.purpose} onChange={handleChange} required>
                                    <option value="category">Chọn mục đích vay</option>
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
                            <Label htmlFor="total_acc" value="Tổng số tài khoản:" />
                            <Tooltip content="Tổng số tài khoản tín dụng bạn đang có">
                                <TextInput type="number" name="total_acc" value={formData.total_acc} onChange={handleChange} required />
                            </Tooltip>
                        </div>
                    </div>
                </>
            )
        },


        {
            label: 'Hiển thị lại thông tin', content: (
                <>
                    <h2 className="mt-3 text-xl font-semibold mb-4 text-center">Hiển thị lại thông tin</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="mb-4">
                            <Label htmlFor="loan_amnt" value="Số tiền vay:" />
                            <Tooltip content="Giá trị khoản vay từ 1.000 USD đến 40.000 USD">
                                <div className="flex items-center">
                                    <input
                                        type="range"
                                        name="loan_amnt"
                                        min="1000"
                                        max="40000"
                                        step="500"
                                        value={formData.loan_amnt}
                                        onChange={handleChange}
                                        className="w-full"
                                        disabled
                                    />
                                    <span className="ml-3">{formData.loan_amnt} USD</span>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="term" value="Thời hạn:" />
                            <Tooltip content="Thời hạn vay (tháng)">
                                <Select name="term" value={formData.term} onChange={handleChange} required disabled>
                                    <option value={0}>Chọn thời hạn vay</option>
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
                                <Select name="grade" value={formData.grade} onChange={handleChange} required disabled >
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
                                <Select name="emp_length" value={formData.emp_length} onChange={handleChange} required disabled>
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
                                <Select name="home_ownership" value={formData.home_ownership} onChange={handleChange} required disabled>
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
                                <TextInput type="number" name="annual_inc" value={formData.annual_inc} onChange={handleChange} required readOnly />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="verification_status" value="Tình trạng xác minh:" />
                            <Tooltip content="Tình trạng xác minh thu nhập">
                                <Select name="verification_status" value={formData.verification_status} onChange={handleChange} required disabled>
                                    <option value="Verified">Đã xác minh</option>
                                    <option value="Not Verified">Chưa xác minh</option>
                                    <option value="Source Verified">Nguồn đã được xác minh</option>
                                </Select>
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="purpose" value="Mục đích vay:" />
                            <Tooltip content="Lý do vay tiền">
                                <Select name="purpose" value={formData.purpose} onChange={handleChange} required disabled>
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
                            <Label htmlFor="open_acc" value="Số tài khoản mở:" />
                            <Tooltip content="Số tài khoản mở hiện tại của bạn">
                                <TextInput type="number" name="open_acc" value={formData.open_acc} onChange={handleChange} required readOnly />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="pub_rec" value="Số hồ sơ công cộng:" />
                            <Tooltip content="Số hồ sơ công cộng liên quan đến tài chính của bạn">
                                <TextInput type="number" name="pub_rec" value={formData.pub_rec} onChange={handleChange} required readOnly />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="pub_rec_bankruptcies" value="Số hồ sơ phá sản công khai:" />
                            <Tooltip content="Số hồ sơ phá sản công khai liên quan đến tài chính của bạn">
                                <TextInput type="number" name="pub_rec_bankruptcies" value={formData.pub_rec_bankruptcies} onChange={handleChange} required readOnly />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="total_acc" value="Tổng số tài khoản:" />
                            <Tooltip content="Tổng số tài khoản tài chính của bạn">
                                <TextInput type="number" name="total_acc" value={formData.total_acc} onChange={handleChange} required readOnly />
                            </Tooltip>
                        </div>
                    </div>
                    <div className="mb-4 flex items-center">
                        <Checkbox id="agreement" checked={agreed} onChange={handleAgreementChange} />
                        <Label htmlFor="agreement" className="ml-2">
                            Đọc và xem <a href="https://drive.google.com/uc?export=download&id=1FkiVl8_XxonGzTlO_7Ot6PPDyxm0DjbN" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">điều khoản vay</a>
                        </Label>
                    </div>

                </>
            )
        }
    ];

    const handleNext = (event) => {
        event.preventDefault(); // Ngăn chặn hành vi gửi form tự động

        if (activeStep < steps.length - 1) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = (event) => {
        event.preventDefault(); // Ngăn chặn hành vi gửi form tự động

        if (activeStep > 0) {
            setActiveStep((prevActiveStep) => prevActiveStep - 1);
        }
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <h2 className="text-2xl font-bold mb-4 text-center">Đăng ký hồ sơ vay</h2>
                <Box sx={{ width: '100%' }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((step) => (
                            <Step key={step.label}>
                                <StepLabel>{step.label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <div className="flex justify-center">
                        <div>
                            {activeStep === steps.length ? (
                                <div>
                                    <p>All steps completed</p>
                                    <MuiButton onClick={handleReset}>Reset</MuiButton>
                                </div>
                            ) : (
                                <div>
                                    <form onSubmit={handleSubmit}>
                                        {steps[activeStep].content}
                                        <div className="flex justify-between mt-4">
                                            {activeStep > 0 && (
                                                <MuiButton onClick={handleBack}>Quay lại</MuiButton>
                                            )}
                                            {activeStep < steps.length - 1 ? (
                                                <MuiButton onClick={handleNext}>Tiếp theo</MuiButton>
                                            ) : (
                                                <MuiButton type="submit" disabled={!agreed} onClick={handleSubmit}>Gửi hồ sơ</MuiButton>
                                            )}
                                        </div>

                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </Box>
            </Card>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <Modal.Header>Thông báo</Modal.Header>
                <Modal.Body>
                    <div className="text-green-600">
                        Cám ơn bạn đã đăng ký vay tại SmartLending. Quá trình duyệt hồ sơ sẽ mất đến 60 phút. Bạn hãy theo dõi điện thoại tổng đài viên, chúng tôi sẽ liên hệ bạn để hoàn tất hồ sơ khi có kết quả hoặc theo dõi tại đây.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setShowModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
            <CallToAction />
        </div>
    );
};

export default LoanPage;
