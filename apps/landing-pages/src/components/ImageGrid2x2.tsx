import Image from 'next/image';
import { ComponentInstance, ImageGrid2x2Data } from '@contentful-landing-page-builder/shared';
import styles from './ImageGrid2x2.module.css';

interface ImageGrid2x2Props {
  component: ComponentInstance;
}

export default function ImageGrid2x2({ component }: ImageGrid2x2Props) {
  const data = component.data as ImageGrid2x2Data;
  
  return (
    <section className={styles.imageGrid} aria-label="Image gallery" role="region">
      <div className={styles.container}>
        <div className={styles.grid} role="group" aria-label="2x2 image grid">
          {data.images.map((image, index) => {
            // Extract image URL and ensure it starts with https:
            const imageUrl = image.fields.file.url.startsWith('//')
              ? `https:${image.fields.file.url}`
              : image.fields.file.url;

            const imageWidth = image.fields.file.details.image?.width || 400;
            const imageHeight = image.fields.file.details.image?.height || 400;

            return (
              <div key={`${component.id}-image-${index}`} className={styles.gridItem}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={imageUrl}
                    alt={image.fields.title || `Grid image ${index + 1}`}
                    width={imageWidth}
                    height={imageHeight}
                    sizes="(max-width: 480px) 50vw, (max-width: 768px) 25vw, 300px"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}