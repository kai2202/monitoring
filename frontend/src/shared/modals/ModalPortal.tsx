import React from 'react';
import { createPortal } from 'react-dom';

export interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * Frontend/src/shared/modals/ModalPortal.tsx
 *
 * Cổng render dùng chung cho toàn bộ Modal & Drawer:
 * - Đưa overlay ra document.body để thoát khỏi CSS stacking context của .page-transition,
 *   đảm bảo che phủ đồng nhất cả Header và Sidebar trên mọi tab.
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  if (typeof document === 'undefined') return <>{children}</>;
  return createPortal(children, document.body);
};

export default ModalPortal;
