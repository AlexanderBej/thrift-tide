import React from 'react';
import clsx from 'clsx';
import { IoIosInformationCircle } from 'react-icons/io';

import { TTIcon } from '../icon';
import { getCssVar } from '@shared/utils';

import './info-block.styles.scss';

interface InfoBlockProps {
  children: React.ReactNode;
  className?: string;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ children, className }) => {
  return (
    <div className={clsx('info-block', className)}>
      <TTIcon icon={IoIosInformationCircle} size={28} color={getCssVar('--cat-1')} />
      <div className="info-block-content">{children}</div>
    </div>
  );
};

export default InfoBlock;
