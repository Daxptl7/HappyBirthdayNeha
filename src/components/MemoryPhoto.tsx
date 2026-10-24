import { useState } from 'react';
import { Camera, Heart } from 'lucide-react';

export function MemoryPhoto({ url, alt, width, height, keepsake = false }: { url: string; alt: string; width?: number; height?: number; keepsake?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (url && failedUrl !== url) return <img className="personal-memory-photo" src={url} alt={alt} width={width} height={height} loading="eager" decoding="async" style={{ objectFit: 'contain', objectPosition: 'center' }} onError={() => setFailedUrl(url)} />;
  return <div className={`photo-placeholder ${keepsake ? 'keepsake-placeholder' : ''}`}>
    {keepsake ? <><Heart size={29} strokeWidth={1} /><span>N</span><small>a little light, just for you</small></> : <><Camera size={32} strokeWidth={1} /><span>A photograph of you<br />belongs right here.</span><small>Your photo is coming soon</small></>}
  </div>;
}
