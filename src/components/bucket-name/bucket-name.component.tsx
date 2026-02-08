import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconType } from 'react-icons';
import { TbHomeStar } from 'react-icons/tb';
import { CiSquareQuestion } from 'react-icons/ci';
import { GiWantedReward } from 'react-icons/gi';
import { MdDataSaverOn } from 'react-icons/md';

import { TTIcon } from '@shared/ui';
import { Bucket } from '@api/types';

import './bucket-name.styles.scss';

interface BucketNameProps {
  bucket: Bucket;
}

const BucketName: React.FC<BucketNameProps> = ({ bucket }) => {
  const { t } = useTranslation('budget');

  const getBucketIcon = (c: string): IconType => {
    switch (c) {
      case 'needs':
        return TbHomeStar;
      case 'wants':
        return GiWantedReward;
      case 'savings':
        return MdDataSaverOn;
      default:
        return CiSquareQuestion;
    }
  };

  const getBucketColor = (c: string): string => {
    switch (c) {
      case 'needs':
        return 'var(--needs)';
      case 'wants':
        return 'var(--wants)';
      case 'savings':
        return 'var(--savings)';
      default:
        return 'var(--needs)';
    }
  };

  return (
    <div className="bucket-name">
      <div className="bucket-icon-wrapper" style={{ background: getBucketColor(bucket) }}>
        {bucket && <TTIcon icon={getBucketIcon(bucket)} size={22} color="white" />}
      </div>
      <span className="bucket-value">{t(`bucketNames.${bucket}`)}</span>
    </div>
  );
};

export default BucketName;
