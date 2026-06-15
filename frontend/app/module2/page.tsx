'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Module2Page() {
  useEffect(() => {
    redirect('/module2/bandeja');
  }, []);

  return null;
}
