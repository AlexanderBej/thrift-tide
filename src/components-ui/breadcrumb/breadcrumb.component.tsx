import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BucketType } from '../../api/types/bucket.types';

import './breadcrumb.styles.scss';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation(['common', 'budget']);

  const pathnames = location.pathname.split('/').filter((x) => x);
  if (pathnames.length < 2) {
    return null;
  }

  const getTranslatedRoute = (segment: string) => {
    if (segment === 'buckets') return t('pages.buckets').toLowerCase();
    if (Object.values(BucketType).includes(segment as BucketType)) {
      const lowerCaseSegment = segment.toLowerCase();
      return t(`budget:bucketNames.${lowerCaseSegment}`);
    }
    return segment;
  };

  return (
    <nav aria-label="breadcrumb">
      <ul className="breadcrumb-list">
        {pathnames.map((segment, index) => {
          // Build the path up to this segment
          const to = '/' + pathnames.slice(0, index + 1).join('/');

          // Check if this is the last segment (no link)
          const isLast = index === pathnames.length - 1;
          // const label = toCamelCase(segment);

          return (
            <li key={segment}>
              {isLast ? (
                <span className="breadcrumb-current">{getTranslatedRoute(segment)}</span>
              ) : (
                <Link to={to} className="breadcrumb-element">
                  {getTranslatedRoute(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
