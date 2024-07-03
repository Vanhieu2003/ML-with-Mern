import React, {  useState } from 'react'
import { Sidebar } from 'flowbite-react';
import {
    HiUser,
    HiArrowSmRight,
    HiDocumentText,
    HiUserGroup,
    HiChartPie,
    HiCreditCard
} from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { logoutUser } from '../redux/user/userSlice';


export default function DashSidebar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    const [tab, setTab] = useState('');
    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            localStorage.removeItem("persist:root");
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <Sidebar className='w-full md:w-56'>
            <Sidebar.Items>
                <Sidebar.ItemGroup className='flex flex-col gap-1'>

                    {currentUser && currentUser.isAdmin && (
                        <Link to='/dashboard?tab=dash'>
                            <Sidebar.Item
                                active={tab === 'dash' || !tab}
                                icon={HiChartPie}
                                as='div'
                            >
                                Dashboard
                            </Sidebar.Item>
                        </Link>
                    )}
                    <Link to='/dashboard?tab=profile'>
                        <Sidebar.Item
                            active={tab === 'profile'}
                            icon={HiUser}
                            label={currentUser.isAdmin ? 'Admin' : 'User'}
                            labelColor="dark"
                            as='div'
                        >
                            Profile
                        </Sidebar.Item>
                    </Link>
                    {currentUser.isAdmin && (
                        <Link to='/dashboard?tab=posts'>
                            <Sidebar.Item
                                active={tab === 'posts'}
                                icon={HiDocumentText}
                                as='div'
                            >
                                Post
                            </Sidebar.Item>
                        </Link>

                    )}

                    {currentUser.isAdmin && (
                        <Link to='/dashboard?tab=users'>
                            <Sidebar.Item
                                active={tab === 'users'}
                                icon={HiUserGroup}
                                as='div'
                            >
                                User
                            </Sidebar.Item>
                        </Link>

                    )}

                    {currentUser.isAdmin && (
                        <Link to='/dashboard?tab=loans'>
                            <Sidebar.Item
                                active={tab === 'loans'}
                                icon={HiCreditCard}
                                labelColor="dark"
                                as='div'
                            >
                                Loans
                            </Sidebar.Item>
                        </Link>

                    )}

                    {!currentUser.isAdmin && (
                        <Link to='/dashboard?tab=loan-id'>
                            <Sidebar.Item
                                active={tab === 'loan-id'}
                                icon={HiCreditCard}
                                labelColor="dark"
                                as='div'
                            >
                                Loan
                            </Sidebar.Item>
                        </Link>

                    )}

                    <Sidebar.Item
                        active={tab === 'signout'}
                        icon={HiArrowSmRight}
                        className='cursor-pointer'
                        onClick={handleLogout}
                    >
                        Sign Out
                    </Sidebar.Item>
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>
    )
}
