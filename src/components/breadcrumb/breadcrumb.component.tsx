import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import './breadcrumb.styles.scss';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  const pathnames = location.pathname.split('/').filter((x) => x);
  if (pathnames.length < 2) {
    return null;
  }

  const toCamelCase = (segment: string): string => {
    if (segment && !segment.includes('-')) {
      return segment;
    }
    const words = segment.split('-');
    return words
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  };

  // const labelMap: Record<string, string> = {
  //   dashboard: 'Overview',
  //   products: 'Products',
  //   new: 'New',
  //   myPagePreview: 'My Page Preview',
  //   edit: 'Edit Product',
  // };

  const editIndex = pathnames.findIndex((segment) => toCamelCase(segment) === 'edit');
  const filteredPathnames = editIndex >= 0 ? pathnames.slice(0, editIndex + 1) : pathnames;

  return (
    <nav aria-label="breadcrumb">
      <ul className="breadcrumb-list">
        {filteredPathnames.map((segment, index) => {
          // Build the path up to this segment
          const to = '/' + filteredPathnames.slice(0, index + 1).join('/');

          // Check if this is the last segment (no link)
          const isLast = index === filteredPathnames.length - 1;
          const label = toCamelCase(segment);
          // const label = labelMap[toCamelCase(segment)] || segment;

          return (
            <li key={segment}>
              {isLast ? (
                <span className="breadcrumb-current">{label}</span>
              ) : (
                <Link to={to} className="breadcrumb-element">
                  {label}
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
