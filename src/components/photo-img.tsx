import type { PhotoData } from '@/lib/photo-data';

export type PhotoImgProps = {
  data: PhotoData;
  alt: string;
  /** How wide the photo is drawn, for choosing a copy from srcset. */
  sizes: string;
  /** object-position. */
  position?: string;
  priority?: boolean;
};

/**
 * A plain <img> for a photo. Client components use this with data passed down from the server
 * (photo(name)), so the photo manifest itself never ships to the browser.
 */
export function PhotoImg({
  data,
  alt,
  sizes,
  position,
  priority,
}: PhotoImgProps) {
  return (
    <img
      src={data.src}
      srcSet={data.srcSet}
      sizes={sizes}
      width={data.width}
      height={data.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}
