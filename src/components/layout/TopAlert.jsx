'use client';

import React, { useState, useEffect } from 'react';

let alertEmitter = null;

/**
 * Trigger global top alert banner
 * @param {string} msg 
 * @param {'info' | 'success' | 'warning' | 'danger'} type 
 * @param {boolean} isConfirm 
 * @returns {Promise<boolean>}
 */
export function showTopAlert(msg, type = 'info', isConfirm = false) {
  if (alertEmitter) {
    return alertEmitter(msg, type, isConfirm);
  }
  if (typeof window !== 'undefined') {
    if (isConfirm) return Promise.resolve(window.confirm(msg));
    window.alert(msg);
    return Promise.resolve(true);
  }
  return Promise.resolve(true);
}

export default function TopAlert() {
  const [alertState, setAlertState] = useState({
    visible: false,
    message: '',
    type: 'info',
    isConfirm: false,
    resolve: null
  });

  useEffect(() => {
    alertEmitter = (message, type = 'info', isConfirm = false) => {
      return new Promise((resolve) => {
        setAlertState({
          visible: true,
          message,
          type,
          isConfirm,
          resolve
        });

        if (!isConfirm) {
          setTimeout(() => {
            setAlertState(prev => ({ ...prev, visible: false }));
            resolve(true);
          }, 4000);
        }
      });
    };

    // Attach to window for legacy functions
    if (typeof window !== 'undefined') {
      window.showTopAlert = showTopAlert;
    }

    return () => {
      alertEmitter = null;
    };
  }, []);

  if (!alertState.visible) return null;

  const handleOk = () => {
    if (alertState.resolve) alertState.resolve(true);
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  const handleCancel = () => {
    if (alertState.resolve) alertState.resolve(false);
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  return (
    <div id="topAlertBanner" className={alertState.type} style={{ display: 'flex' }}>
      <div className="alert-container-inner">
        <span dangerouslySetInnerHTML={{ __html: alertState.message }}></span>
        <div className="alert-btns">
          <button className="btn-alert btn-alert-ok" onClick={handleOk}>
            {alertState.isConfirm ? 'Yes' : 'OK'}
          </button>
          {alertState.isConfirm && (
            <button className="btn-alert btn-alert-cancel" onClick={handleCancel}>
              No
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
