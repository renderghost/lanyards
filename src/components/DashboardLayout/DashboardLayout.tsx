'use client';

import Link from 'next/link';
import * as styles from './DashboardLayout.styles';
import { DashboardLayoutProps } from './DashboardLayout.types';
import { cn } from '@/lib/utils';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  handle,
  children,
  onLogout,
}) => {
  const handleLogoutClick = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Lanyards Dashboard</h1>
          <button onClick={handleLogoutClick} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Profile Header with Actions */}
        <div className={styles.profileHeader}>
          <div className={styles.profileInfo}>
            <p className={styles.handle}>
              <span className={styles.handlePrefix}>@</span>
              {handle}
            </p>
          </div>
          <div className={styles.actions}>
            <Link
              href={`/${handle}`}
              className={cn(styles.actionButton, styles.viewProfileButton)}
            >
              View Lanyard
            </Link>
            <Link
              href={`/${handle}/qr`}
              className={cn(styles.actionButton, styles.qrCodeButton)}
            >
              QR Code
            </Link>
          </div>
        </div>

        {/* Sections */}
        <div className={styles.sections}>{children}</div>
      </main>
    </div>
  );
};
