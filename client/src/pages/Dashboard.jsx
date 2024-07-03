
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import DashPost from '../components/DashPost';
import DashUsers from '../components/DashUsers';
import DashboardComp from '../components/DashboardComp';
import DashLoans from '../components/DashLoans';
import DashUserLoan from '../components/DashUserLoan';



export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className='min-h-screen flex flex-col md:flex-row '>
      <div className=''>
        {/*SideBar*/}
        <DashSidebar />
      </div>
      {/*Profile*/}
      {tab === 'profile' && <DashProfile />}
      {/*Posts*/}
      {tab === 'posts' && <DashPost />}
      {/*Users*/}
      {tab === 'users' && <DashUsers />}
      {/*Dash Compo*/}
      {tab === 'dash' && <DashboardComp />}
      {/*Dash Loans*/}
      {tab === 'loans' && <DashLoans />}
      {/*Dash Loan-id*/}
      {tab === 'loan-id' && <DashUserLoan />}


    </div>
  );

}
