import type { CSSProperties } from 'react';
import { RevealImage } from '@/components/motion/reveal-image';
import { PhotoImg, type PhotoImgProps } from '@/components/photo-img';
import { photo, placeholderStyle, type PhotoName } from '@/lib/photos';

type PhotoProps = Omit<PhotoImgProps, 'data'> & {
  name: PhotoName;
  /** Classes for the frame, which sets the size. */
  className?: string;
  style?: CSSProperties;
  /** Wipe in on scroll (default) or just sit there. */
  reveal?: boolean;
  parallax?: boolean;
  delay?: number;
};

/**
 * A framed photo with its colour and blurred preview behind it while it loads. Server component:
 * only the photos a section uses reach the page.
 */
export function Photo({
  name,
  className = '',
  style,
  reveal = true,
  parallax = true,
  delay,
  ...img
}: PhotoProps) {
  const data = photo(name);
  const frameStyle = { ...placeholderStyle(data), ...style };
  if (!reveal) {
    return (
      <div className={`photo-frame ${className}`} style={frameStyle}>
        <PhotoImg data={data} {...img} />
      </div>
    );
  }
  return (
    <RevealImage
      className={`photo-frame ${className}`}
      style={frameStyle}
      parallax={parallax}
      delay={delay}
    >
      <PhotoImg data={data} {...img} />
    </RevealImage>
  );
}
