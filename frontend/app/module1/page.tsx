'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Module1Page() {
  useEffect(() => {
    redirect('/module1/dashboard');
  }, []);

  return null;
}
