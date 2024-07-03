import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorPage from './pages/ErrorPage';
import Home from './pages/Home';

import Login from './pages/Login';
import SignUp from './pages/SignUp';

import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';

import Dashboard from './pages/Dashboard';

import PostPage from './pages/PostPage';
import LoanPage from './pages/LoanPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import Search from './pages/Search';
import Projects from './pages/Project';
import ScrollToTop from './components/ScrollToTop';
import NewsPage from './pages/NewsPage';


const App = () => {
  return (
  
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/project" element={<Projects />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/search" element={<Search />} />
            <Route element={<PrivateRoute />}>
              <Route path='/dashboard' element={<Dashboard />} />
            </Route>
            <Route element={<AdminPrivateRoute />}>
              <Route path='/create-post' element={<CreatePost />} />
              <Route path="/update-post/:id" element={<EditPost />} />
            </Route>
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/loan" element={<LoanPage />} />
            <Route path="/contactPage" element={<ContactPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </Router>
 
  );
};

export default App;
