import ComingSoon from '@/components/shared/ComingSoon';
import { SUBJECTS } from '@/lib/shared/subjects';

export const metadata = { title: 'Lab Biologi · Learn Science' };

export default function Page(){
  return <ComingSoon subject={SUBJECTS.find(s => s.href === '/biologi')} />;
}
