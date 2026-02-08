import React from 'react';
import { Drawer } from 'vaul';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import clsx from 'clsx';

import { Button } from '../button';

import './base-sheet.styles.scss';
import { useTranslation } from 'react-i18next';

interface BaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  titleHidden?: boolean;
  description?: string;
  className?: string;
  variant?: 'default' | 'compact';
  children: React.ReactNode;

  /** If you ever want to close on outside click/drag behavior consistently */
  dismissible?: boolean;
  dismissLabel?: string;
  handleOnly?: boolean; // default true is a good idea for your app

  btnLabel?: string;
  btnDisabled?: boolean;
  onButtonClick?: () => void;

  secondaryButtonLabel?: string;
  handleSecondaryClick?: () => void;
}

const BaseSheet: React.FC<BaseSheetProps> = ({
  open,
  onOpenChange,
  title,
  titleHidden = false,
  description,
  className,
  children,
  dismissible = true,
  dismissLabel = 'Dismiss',
  handleOnly = true,
  btnLabel,
  btnDisabled = false,
  variant = 'default',
  onButtonClick,
  secondaryButtonLabel,
  handleSecondaryClick,
}) => {
  const { t } = useTranslation('common');
  if (dismissLabel === 'Dismiss') dismissLabel = t('actions.dismiss');
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      dismissible={dismissible}
      handleOnly={handleOnly}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="sheet-overlay" />

        <Drawer.Content className={clsx('sheet-content-wrapper', className, `sheet-${variant}`)}>
          {/* <div className="sheet-handle" /> */}

          <div className="sheet-header">
            {/* Spacer to keep handle centered */}
            <div className="header-spacer">
              {secondaryButtonLabel && (
                <button className="header-btn" onClick={handleSecondaryClick}>
                  {secondaryButtonLabel}
                </button>
              )}
            </div>

            {/* Handle centered */}
            <div className="handle-wrap">
              {/* <div className="sheet-handle" /> */}
              <Drawer.Handle />
            </div>

            <button type="button" className="header-btn" onClick={() => onOpenChange(false)}>
              {dismissLabel}
            </button>
          </div>

          {titleHidden ? (
            <VisuallyHidden>
              <Drawer.Title className="sheet-title">{title}</Drawer.Title>
              {description ? <Drawer.Description>{description}</Drawer.Description> : null}
            </VisuallyHidden>
          ) : (
            <>
              <Drawer.Title className="sheet-title">{title}</Drawer.Title>
              {description ? <Drawer.Description>{description}</Drawer.Description> : null}
            </>
          )}

          <div className="sheet-content">
            {children}

            {btnLabel && (
              <div className="sheet-btn-wrapper">
                <div className="sheet-btn-container">
                  <Button
                    customContainerClass="sheet-btn"
                    buttonType="primary"
                    onClick={onButtonClick}
                    disabled={btnDisabled}
                  >
                    <span>{btnLabel}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default BaseSheet;
