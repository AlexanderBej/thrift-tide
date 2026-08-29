import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as LogoDark } from '../../../assets/thrift_tide_logo-dark.svg';
import { ReactComponent as LogoLight } from '../../../assets/thrift_tide_logo-light.svg';
import { LocalSpinner } from '../spinners';

import './v3-app-loader.styles.scss';

interface V3AppLoaderProps {
  leaving?: boolean;
}

const V3AppLoader: React.FC<V3AppLoaderProps> = ({ leaving = false }) => {
  const { t } = useTranslation('common');
  const message = t('appLoader.message');

  return (
    <section
      className="v3-app-loader"
      data-leaving={leaving ? 'true' : 'false'}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="v3-app-loader__content">
        <div className="v3-app-loader__brand" aria-hidden="true">
          <span className="v3-app-loader__mark">
            <LogoLight className="v3-app-loader__logo v3-app-loader__logo--light" />
            <LogoDark className="v3-app-loader__logo v3-app-loader__logo--dark" />
          </span>
          <span className="v3-app-loader__wordmark">Thrift Tide</span>
        </div>
        <p>{message}</p>
        <div className="v3-app-loader__spinner" aria-hidden="true">
          <LocalSpinner isSmall />
        </div>
      </div>
    </section>
  );
};

export default V3AppLoader;
