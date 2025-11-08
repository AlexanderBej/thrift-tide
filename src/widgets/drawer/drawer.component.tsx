import React from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { MdKeyboardDoubleArrowLeft } from 'react-icons/md';

import { ReactComponent as Logo } from '../../assets/logo.svg';
import { TTIcon } from '@shared/ui';
import { AppDispatch } from '@store/store';
import { selectUIDrawerOpen, drawerClose } from '@store/ui-store';
import SidebarContent from 'components/sidebar-content/sidebar-content.component';

import './drawer.styles.scss';

const Drawer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const open = useSelector(selectUIDrawerOpen);

  const drawerClass = clsx('drawer', {
    drawer__open: open,
  });

  const onClose = () => {
    dispatch(drawerClose());
  };

  return (
    <div className={drawerClass}>
      <div onClick={onClose} className="backdrop" />
      <div className="panel">
        <div className="logo-row">
          <Logo className="logo" height={80} />

          {/* <button onClick={onClose} aria-label="Close menu" className="close-drawer-btn">
            <TTIcon icon={MdKeyboardDoubleArrowLeft} size={32} />
          </button> */}
        </div>
        <hr />
        <SidebarContent />

        {open && (
          <div className="close-drawer-container">
            <button onClick={onClose} aria-label="Close menu" className="close-drawer-btn">
              <TTIcon icon={MdKeyboardDoubleArrowLeft} size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
