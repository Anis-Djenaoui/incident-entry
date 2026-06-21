import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/buaa-logo.png"
      alt="BUAA"
      width={220}
      height={72}
      priority={priority}
      className={cn('h-auto w-[min(220px,70vw)] object-contain', className)}
    />
  );
}
