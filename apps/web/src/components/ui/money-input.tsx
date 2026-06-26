'use client';

import { ChangeEvent, InputHTMLAttributes, useState } from 'react';
import { Input } from './input';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  label: string;
  name: string;
  error?: string;
  defaultValue?: string | number;
}

function centsToDisplay(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function MoneyInput({ label, name, error, defaultValue, ...props }: Props) {
  const [cents, setCents] = useState(() => Math.round((Number(defaultValue) || 0) * 100));

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    setCents(digits === '' ? 0 : parseInt(digits, 10));
  }

  return (
    <div>
      <Input
        label={label}
        inputMode="decimal"
        placeholder="R$ 0,00"
        value={cents === 0 ? '' : `R$ ${centsToDisplay(cents)}`}
        onChange={handleChange}
        error={error}
        {...props}
      />
      <input type="hidden" name={name} value={(cents / 100).toFixed(2)} />
    </div>
  );
}
