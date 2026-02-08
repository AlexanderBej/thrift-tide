import React from 'react';
import { IconType } from 'react-icons';
import clsx from 'clsx';

import './icon.styles.scss';

interface TTIconProps {
  icon: IconType;
  color?: string;
  size?: number;
  className?: string;
  containerClass?: string;
}

const TTIcon: React.FC<TTIconProps> = ({
  icon: Icon,
  color = 'black',
  size = 24,
  className,
  containerClass,
}) => (
  <div className={clsx('icon-container', containerClass)}>
    {React.createElement(Icon as React.FC<{ size: number; color: string; className?: string }>, {
      size: size,
      color: color,
      className: className,
    })}
  </div>
);

export default TTIcon;
