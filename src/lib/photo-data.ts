import type { CSSProperties } from 'react';

// Client-safe photo helpers (no manifest import; see photos.ts for the server side).

export type PhotoData = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  /** Average colour and a 16px preview, shown while the photo loads. */
  color: string;
  blur: string;
};

/** CSS custom properties for a frame's placeholder (see .photo-frame in globals.css). */
export const placeholderStyle = (data: PhotoData) =>
  ({
    '--ph-color': data.color,
    '--ph-blur': `url(${data.blur})`,
  }) as CSSProperties;
