import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import HomePage from './home/HomePage';
import UsersListPage from './users/UsersListPage';
import NavMenu from './shared/NavMenu';
import PostListPage from './posts/PostListPage';
import PostCreatePage from './posts/PostCreatePage';
import CommentUpdatePage from './comments/CommentUpdatePage';
import PostUpdatePage from './posts/PostUpdatePage';
import PostDeletePage from './posts/PostDeletePage';
import UserDetails from './users/UserDetails';

const App: React.FC = () => {
    return (
    <Router>
      <Container>
        <NavMenu />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts" element={<PostListPage/>} />
          <Route path="/users" element={<UsersListPage />} />
          <Route path="/commentupdate/:commentId" element={<CommentUpdatePage />} />
          <Route path="/postupdate/:postId" element={<PostUpdatePage />} />
          <Route path="/postdelete/:postId" element={<PostDeletePage />} />
          <Route path="/user/details/:id" element={<UserDetails />} />
          <Route path="/postcreate" element={<PostCreatePage  />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;