import { Heart, Sparkles } from 'lucide-react';
import { EXPERIENCE_CONFIG as config } from '../data/experienceConfig';
import { BirthdayDialog } from './BirthdayDialog';
import { MemoryPhoto } from './MemoryPhoto';

export function SecretSurprise({ onClose }: { onClose: () => void }) {
  return <BirthdayDialog title={config.secret.title} onClose={onClose} className="secret-dialog"><span className="secret-badge"><Sparkles size={14} /> secret birthday bonus unlocked</span>{config.secret.photoUrl ? <div className="secret-photo"><MemoryPhoto url={config.secret.photoUrl} alt="A secret birthday memory" /></div> : <div className="birthday-vip" aria-hidden="true"><Heart size={35} strokeWidth={1} /><span>Birthday<br /><em>VIP</em></span></div>}<p>{config.secret.message}</p><p className="secret-closing">{config.secret.closing}</p><button className="primary-button" onClick={onClose}>Our little secret <Heart size={15} /></button></BirthdayDialog>;
}
