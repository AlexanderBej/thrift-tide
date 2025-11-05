import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { AppDispatch } from '../../store/store';
import { selectAuthUser } from '../../store/auth-store/auth.selectors';
import { signOutUser } from '../../api/services/auth.service';
import { userSignedOut } from '../../store/auth-store/auth.slice';
import Dropdown from '../../components-ui/dropdowns/dropdown.component';

import './user-dropdown.styles.scss';
import Button from '../../components-ui/button/button.component';

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
    <Dropdown
      customClassName="user-profile-nav"
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
          <div className="dropdown-item">
            <h3>{user.displayName}</h3>
          </div>
          <div className="dropdown-item">
            <span>{user.email}</span>
          </div>
          <hr />
          <Button customContainerClass="dropdown-item logout-btn" onClick={handleLogout}>
            <span>Logout</span>
          </Button>
        </>
      )}
    />
  );
};

export default UserDropdown;
