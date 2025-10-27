import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

import TTIcon from '../../components-ui/icon/icon.component';

import './login.styles.scss';
import Button from '../../components-ui/button/button.component';
import { useSelector } from 'react-redux';
import { selectAuthStatus } from '../../store/auth-store/auth.selectors';
import { ensureUserProfile, signInWithGooglePopup } from '../../api/services/auth.service';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const userStatus = useSelector(selectAuthStatus);

  useEffect(() => {
    if (userStatus === 'authenticated') navigate('/');
  });

  const logGoogleUser = async () => {
    const { user } = await signInWithGooglePopup();
    await ensureUserProfile(user);
    navigate('/');
  };

  return (
    <div className="login-contaier">
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
