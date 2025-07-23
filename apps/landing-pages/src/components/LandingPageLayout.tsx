import { ReactNode } from 'react';
import Navigation from './Navigation';
import styles from './LandingPageLayout.module.css';

interface LandingPageLayoutProps {
  children: ReactNode;
}

const LandingPageLayout = ({ children }: LandingPageLayoutProps) => {
  return (
    <div className={styles.layout}>
      <Navigation />
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default LandingPageLayout;