'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 px-6 py-4 border-b border-border">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          {item.href ? (
            <Link href={item.href} className="text-sm text-primary hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-sm text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
