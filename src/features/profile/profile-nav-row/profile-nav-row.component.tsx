import React from 'react';
import { NavLink } from 'react-router-dom';

import { ProfileRowContentProps, ProfileRowContent } from '../profile-row-content';

import './profile-nav-row.styles.scss';

interface ProfileNavRowProps extends ProfileRowContentProps {
  to: string;
}

const ProfileNavRow: React.FC<ProfileNavRowProps> = ({ to, ...content }) => (
  <NavLink className="profile-row profile-row--link" to={to}>
    <ProfileRowContent {...content} />
  </NavLink>
);

export default ProfileNavRow;
