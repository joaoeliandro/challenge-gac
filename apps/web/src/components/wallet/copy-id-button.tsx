'use client';

import { useState } from 'react';

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function copyWithFallback(value: string) {
  const el = document.createElement('textarea');
  el.value = value;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    copyWithFallback(value);
  }
}

export function CopyIdButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Copiar ID"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0,
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        background: copied ? '#f0fdf4' : '#fff',
        color: copied ? '#16a34a' : '#374151',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  );
}
