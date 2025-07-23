import Image from 'next/image';
import Link from 'next/link';
import { ComponentInstance, TwoColumnRowData } from '@contentful-landing-page-builder/shared';
import styles from './TwoColumnRow.module.css';

interface TwoColumnRowProps {
  component: ComponentInstance;
}

export default function TwoColumnRow({ component }: TwoColumnRowProps) {
  const data = component.data as TwoColumnRowData;

  // Handle null/undefined image data
  if (!data?.rightColumn?.image?.fields?.file?.url) {
    return (
      <section className={styles.twoColumnRow} aria-labelledby={`two-col-heading-${component.id}`}>
        <div className={styles.container}>
          <div className={styles.leftColumn}>
            <h3 id={`two-col-heading-${component.id}`} className={styles.heading}>{data?.leftColumn?.heading || 'Heading'}</h3>
            <p className={styles.subtitle}>{data?.leftColumn?.subtitle || 'Subtitle'}</p>

            {data?.leftColumn?.cta?.text && data?.leftColumn?.cta?.url && (
              <Link
                href={data.leftColumn.cta.url}
                className={styles.cta}
                aria-describedby={`two-col-heading-${component.id}`}
              >
                {data.leftColumn.cta.text}
              </Link>
            )}
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.imageWrapper}>
              <div style={{ padding: '2rem', background: '#f5f5f5', textAlign: 'center' }}>
                Image not available
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Extract image URL and ensure it starts with https:
  const imageUrl = data.rightColumn.image.fields.file.url.startsWith('//')
    ? `https:${data.rightColumn.image.fields.file.url}`
    : data.rightColumn.image.fields.file.url;

  const imageWidth = data.rightColumn.image.fields.file.details.image?.width || 600;
  const imageHeight = data.rightColumn.image.fields.file.details.image?.height || 400;

  return (
    <section className={styles.twoColumnRow} aria-labelledby={`two-col-heading-${component.id}`}>
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <h3 id={`two-col-heading-${component.id}`} className={styles.heading}>{data.leftColumn.heading}</h3>
          <p className={styles.subtitle}>{data.leftColumn.subtitle}</p>

          {data.leftColumn.cta.text && data.leftColumn.cta.url && (
            <Link
              href={data.leftColumn.cta.url}
              className={styles.cta}
              aria-describedby={`two-col-heading-${component.id}`}
            >
              {data.leftColumn.cta.text}
            </Link>
          )}
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.imageWrapper}>
            <Image
              src={imageUrl}
              alt={data.rightColumn.image.fields.title || 'Two column row image'}
              width={imageWidth}
              height={imageHeight}
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}