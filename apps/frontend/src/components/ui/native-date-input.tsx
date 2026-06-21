import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface NativeDateInputProps extends Omit<React.ComponentProps<'input'>, 'type' | 'value'> {
  value?: string;
}

const NativeDateInput = React.forwardRef<HTMLInputElement, NativeDateInputProps>(
  ({ className, value = '', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        className={cn('block', className)}
        value={value}
        {...props}
      />
    );
  },
);
NativeDateInput.displayName = 'NativeDateInput';

export { NativeDateInput };
