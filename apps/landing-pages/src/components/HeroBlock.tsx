import Image from 'next/image';
import Link from 'next/link';
import { ComponentInstance, HeroBlockData } from '@contentful-landing-page-builder/shared';
import styles from './HeroBlock.module.css';

interface HeroBlockProps {
  component: ComponentInstance;
}

export default function HeroBlock({ component }: HeroBlockProps) {
  const data = component.data as HeroBlockData;
  
  // Handle missing data gracefully
  if (!data || !data.backgroundImage || !data.backgroundImage.fields || !data.backgroundImage.fields.file) {
    return (
      <section className={styles.hero}>
        <div className={styles.content}>
          <div className={styles.container}>
            <h2>{data?.heading || 'Hero Section'}</h2>
            <p>{data?.subtitle || 'Content loading...'}</p>
          </div>
        </div>
      </section>
    );
  }
  
  // Extract image URL and ensure it starts with https:
  const imageUrl = data.backgroundImage.fields.file.url.startsWith('//')
    ? `https:${data.backgroundImage.fields.file.url}`
    : data.backgroundImage.fields.file.url;

  const imageWidth = data.backgroundImage.fields.file.details.image?.width || 1920;
  const imageHeight = data.backgroundImage.fields.file.details.image?.height || 1080;

  return (
    <section className={styles.hero} aria-labelledby={`hero-heading-${component.id}`}>
      <div className={styles.backgroundImage}>
        <Image
          src={imageUrl}
          alt={data.backgroundImage.fields.title || 'Hero background'}
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover',
          }}
        />
      </div>
      
      <div className={styles.overlay} />
      
      <div className={styles.content}>
        <div className={styles.container}>
          <h2 id={`hero-heading-${component.id}`} className={styles.heading}>{data.heading}</h2>
          <p className={styles.subtitle}>{data.subtitle}</p>
          
          {data.cta.text && data.cta.url && (
            <Link 
              href={data.cta.url} 
              className={styles.cta}
              aria-describedby={`hero-heading-${component.id}`}
            >
              {data.cta.text}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}