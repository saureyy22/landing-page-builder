import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Landing Page Builder</h1>
        <p className={styles.description}>
          Welcome to the Landing Page Builder. Navigate to your landing pages:
        </p>
        <nav className={styles.nav}>
          <Link href="/landing/page-1" className={styles.link}>
            Landing Page 1
          </Link>
          <Link href="/landing/page-2" className={styles.link}>
            Landing Page 2
          </Link>
        </nav>
      </main>
    </div>
  );
}