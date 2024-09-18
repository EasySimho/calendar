import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import { useUser } from './UserContext';

function Navbar() {
  const { user } = useUser();
  const initial = user.username ? user.username.charAt(0).toUpperCase() : '?';

  return (
    <nav className="navbar">
      <div className="profile-circle">{initial}</div>
      <NavLink to="/calendar" className="nav-item" activeClassName="active">
        <FontAwesomeIcon icon={faCalendar} />
      </NavLink>
      <NavLink to="/personal-calendar" className="nav-item" activeClassName="active">
        <FontAwesomeIcon icon={faUser} />
      </NavLink>
      <NavLink to="/partner-calendar" className="nav-item" activeClassName="active">
        <FontAwesomeIcon icon={faHeart} />
      </NavLink>
    </nav>
  );
}

export default Navbar;