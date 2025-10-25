import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { selectAuthUser } from '../../../store/auth-store/auth.selectors';
import Dropdown from '../dropdown.component';
import { AppDispatch } from '../../../store/store';
import { signOutUser } from '../../../utils/firebase.util';
import { userSignedOut } from '../../../store/auth-store/auth.slice';

import './user-dropdown.styles.scss';

const UserDropdown: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector(selectAuthUser);

  if (!user) return null;

  const handleLogout = () => {
    signOutUser();
    dispatch(userSignedOut());
    navigate('/login');
  };

  const getInitials = (name: string | null) => {
    if (!name) return '';
    const names = name.split(' ');
    return names
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    // <div className="user-dropdown">
    <Dropdown
      customClassName="galactica-nav"
      trigger={({ toggle }) => (
        <button onClick={toggle} className="user-profile-button">
          {user.photoURL ? (
            <img
              className="cover-img user-avatar"
              src={user.photoURL}
              alt={`${user.displayName} profile`}
            />
          ) : (
            <div className="cover-img initials-box">{getInitials(user.displayName)}</div>
          )}
          <span className="user-display-name">{user.displayName}</span>
        </button>
      )}
      menu={() => (
        <>
          <Link to={user.photoURL ?? ''}>Link</Link>
          <div className="dropdown-item">
            <h3>{user.displayName}</h3>
          </div>
          <div className="dropdown-item">
            <span>{user.email}</span>
          </div>
          <div className="dropdown-item"></div>
          <div className="dropdown-item dev-items">
            <Link to="/">Dashboard</Link>
          </div>
          <hr />
          <div className="dropdown-item logout-btn" onClick={handleLogout}>
            Logout
          </div>
        </>
      )}
    />
    // </div>
  );
};

export default UserDropdown;
