'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

const Navigation = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: '/landing/page-1',
      label: 'Page 1',
      slug: 'page-1'
    },
    {
      href: '/landing/page-2',
      label: 'Page 2',
      slug: 'page-2'
    }
  ];

  const isActive = (slug: string) => {
    return pathname === `/landing/${slug}`;
  };

  return (
    <nav className={styles.navigation} role="navigation" aria-label="Main navigation">
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink}>
            Landing Page Builder
          </Link>
        </div>
        
        <ul className={styles.navList} role="menubar">
          {navigationItems.map((item) => (
            <li key={item.slug} className={styles.navItem} role="none">
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive(item.slug) ? styles.navLinkActive : ''}`}
                role="menuitem"
                aria-current={isActive(item.slug) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;