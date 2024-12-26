import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';

const NavMenu: React.FC = () => {
  return (
    <Navbar expand="lg">
      <Navbar.Brand href="/">friendly</Navbar.Brand>

      {/* Toggle button for collapsible navbar (appears on smaller screens) */}
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      
      {/* Navbar.Collapse wraps the nav items that should collapse on smaller screens */}
      <Navbar.Collapse id="basic-navbar-nav">
        {/* The Nav component defines the navigation items */}
        <Nav className="me-auto">
          {/* Nav.Link is used for individual navigation links */}
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/posts">Posts</Nav.Link>
          <Nav.Link href="/users">Users</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavMenu;