import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { RiArrowRightSLine } from 'react-icons/ri';

import { signOutUser } from '@api/services';
import { getCssVar } from '@shared/utils';
import { Button, TTIcon } from '@shared/ui';
import { selectAuthUser, userSignedOut } from '@store/auth-store';
import { AppDispatch } from '@store/store';

import './mobile-settings-page.styles.scss';

const MobileSettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector(selectAuthUser);

  const getInitials = (name: string | null) => {
    if (!name) return '';
    const names = name.split(' ');
    return names
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    signOutUser();
    dispatch(userSignedOut());
    navigate('/login');
  };

  const paths = [
    {
      key: 'profile',
      url: 'profile',
      label: 'Profile',
    },
    {
      key: 'budget',
      url: 'budget',
      label: 'Budget',
    },
    {
      key: 'app',
      url: 'app',
      label: 'Language & Theme',
    },
  ];

  return (
    <>
      <div className="user-info">
        {user?.photoURL ? (
          <img
            className="cover-img user-avatar"
            src={user.photoURL}
            alt={`${user.displayName} profile`}
          />
        ) : (
          <div className="cover-img initials-box">{getInitials(user?.displayName ?? '')}</div>
        )}
        <h2>{user?.displayName}</h2>
      </div>
      <ul className="settings-links">
        {paths.map((path) => (
          <li key={path.key} className="settings-link-container">
            <NavLink className="settings-link" to={path.url}>
              <span>{path.label}</span>
              <TTIcon
                icon={RiArrowRightSLine}
                size={24}
                color={getCssVar('--color-text-primary')}
              />
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="logout-container">
        <Button buttonType="neutral" onClick={handleLogout} customContainerClass="logout-btn">
          <span>Logout</span>
        </Button>
      </div>
    </>
  );
};

export default MobileSettingsPage;
