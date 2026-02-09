import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useSelector } from 'react-redux';

import { ensureUserProfile, signInWithGooglePopup } from '@api/services';
import { Button, TTIcon } from '@shared/ui';
import { selectAuthStatus } from '@store/auth-store';
import { selectSettingOnboardingState, selectSettingsAppTheme } from '@store/settings-store';

import './login.styles.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const userStatus = useSelector(selectAuthStatus);
  const onboardingCompleted = useSelector(selectSettingOnboardingState);
  const theme = useSelector(selectSettingsAppTheme);

  useEffect(() => {
    if (userStatus === 'authenticated') {
      if (onboardingCompleted) navigate('/');
      else navigate('/onboarding');
    }
  });

  const logGoogleUser = async () => {
    const { user } = await signInWithGooglePopup();
    await ensureUserProfile(user);
  };

  return (
    <div className={`login-container login-container__${theme}`}>
      <h2>Login</h2>
      <hr></hr>
      <div className="login-btn-container">
        <Button buttonType="primary" customContainerClass="login-btn" onClick={logGoogleUser}>
          <>
            <TTIcon icon={FcGoogle} size={28} />
            <span>Login with Google</span>
          </>
        </Button>
      </div>
    </div>
  );
};

export default Login;
