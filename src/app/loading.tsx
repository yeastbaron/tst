
import { LoadingLogo } from '@/components/ui/loading-logo';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[9999]">
      <LoadingLogo />
    </div>
  );
}
