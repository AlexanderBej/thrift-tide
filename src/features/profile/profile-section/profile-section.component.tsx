import React from 'react';

import './profile-section.styles.scss';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => (
  <section className="profile-section">
    <h2 className="profile-section__title">{title}</h2>
    <div className="profile-section__rows">{children}</div>
  </section>
);

export default ProfileSection;
