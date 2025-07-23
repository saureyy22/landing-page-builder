import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404 - Landing Page Not Found</h1>
        <p className={styles.description}>
          The landing page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.link}>
            Go Home
          </Link>
          <Link href="/landing/page-1" className={styles.link}>
            View Sample Page
          </Link>
        </div>
      </div>
    </div>
  );
}