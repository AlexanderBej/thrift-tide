import React from 'react';
import { useSelector } from 'react-redux';

import { selectAuthUser } from '@store/auth-store';

import './user-avatar.styles.scss';
import clsx from 'clsx';

const UserAvatar: React.FC<{ large?: boolean; medium?: boolean }> = ({
  large = false,
  medium = false,
}) => {
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

  return (
    <div className={clsx('user-avatar', { large: large, medium: medium })}>
      {user?.photoURL ? (
        <img className="cover-img" src={user.photoURL} alt={`${user.displayName} profile`} />
      ) : (
        <div className="cover-img initials-box">{getInitials(user?.displayName ?? '')}</div>
      )}
    </div>
  );
};

export default UserAvatar;
