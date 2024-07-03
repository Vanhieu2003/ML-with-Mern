import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { logoutUser } from '../redux/user/userSlice';
import axios from 'axios';

export default function Header() {
    const { pathname } = useLocation();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.theme);
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useSelector((state) => state.user);
    const [avatar, setAvatar] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const token = currentUser?.token;

    // Fetch user details on component mount
    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/users/${currentUser.id}`,
                    { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
                );
                const { name, email, avatar } = response.data;
                setName(name);
                setEmail(email);
                setAvatar(avatar);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        if (currentUser && token) {
            getUser();
        }
    }, [currentUser, token]);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        if (searchTermFromUrl) {
            setSearchTerm(searchTermFromUrl);
        }
    }, [location.search]);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            localStorage.removeItem("persist:root");
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('searchTerm', searchTerm);
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
    };

    return (
        <Navbar className='border-b-2 '>
            <Link to="/" className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'>
                <span className='px-2 py-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white'>Smart</span>
                Lending
            </Link>
            <form onSubmit={handleSubmit} className='hidden lg:flex items-center'>
                <TextInput
                    type='text'
                    placeholder='Search...'
                    rightIcon={AiOutlineSearch}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </form>
            <Button className='w-12 h-10 lg:hidden' color='gray'>
                <AiOutlineSearch />
            </Button>

            <div className='flex gap-2 md:order-2'>
                <Button className='w-12 h-10 hidden sm:inline' color='gray' pill onClick={() => dispatch(toggleTheme())}>
                    {theme === 'light' ? <FaSun /> : <FaMoon />}
                </Button>
                {currentUser ? (
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            <Avatar
                                alt='user'
                                img={avatar ? `${process.env.REACT_APP_ASSET_URL}/uploads/${avatar}` : ''}
                                rounded
                            />
                        }
                    >
                        <Dropdown.Header>
                            <span className='block text-sm'>{name}</span>
                            <span className='block text-sm font-medium truncate'>{email}</span>
                        </Dropdown.Header>
                        <Link to='/dashboard?tab=profile'>
                            <Dropdown.Item>Profile</Dropdown.Item>
                        </Link>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                    </Dropdown>
                ) : (
                    <Link to="/login">
                        <Button gradientDuoTone="greenToBlue" outline>
                            Login
                        </Button>
                    </Link>
                )}
                <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
                <Navbar.Link active={pathname === "/"} as='div'>
                    <Link to='/'>Home</Link>
                </Navbar.Link>
                <Navbar.Link active={pathname === "/about"} as='div'>
                    <Link to='/about'>About</Link>
                </Navbar.Link>
                <Navbar.Link active={pathname === "/project"} as='div'>
                    <Link to='/project'>Project</Link>
                </Navbar.Link>
                <Navbar.Link active={pathname === "/loan"} as='div'>
                    <Link to='/loan'>Loan</Link>
                </Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    );
}
