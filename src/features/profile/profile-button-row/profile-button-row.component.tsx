import React from 'react';

import { ProfileRowContentProps, ProfileRowContent } from '../profile-row-content';

import './profile-button-row.styles.scss';

interface ProfileButtonRowProps extends ProfileRowContentProps {
  onClick: () => void;
}

const ProfileButtonRow: React.FC<ProfileButtonRowProps> = ({ onClick, ...content }) => (
  <button
    type="button"
    className="profile-row profile-row--button"
    data-tone={content.tone ?? 'default'}
    onClick={onClick}
  >
    <ProfileRowContent {...content} />
  </button>
);

export default ProfileButtonRow;
