import React from 'react';
import { useSelector } from 'react-redux';

import ProfileSettings from '../../settings-sections/profile-settings.component';
import { useSettingsFormContext } from '../../settings-form-context';
import { selectAuthUser } from '@store/auth-store';

import './profile-page.styles.scss';

const ProfilePage: React.FC = () => {
  const user = useSelector(selectAuthUser);

  const { formData, setFormData, handleChange, runSave, resetField } = useSettingsFormContext();

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
    <div className="user-details">
      {user?.photoURL ? (
        <img
          className="cover-img user-avatar"
          src={user.photoURL}
          alt={`${user.displayName} profile`}
        />
      ) : (
        <div className="cover-img initials-box">{getInitials(user?.displayName ?? '')}</div>
      )}
      <ProfileSettings
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        runSave={runSave}
        resetData={resetField}
        withBackground={true}
      />
    </div>
  );
};

export default ProfilePage;
