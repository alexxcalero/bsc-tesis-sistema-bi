'use client';

import React from 'react';
import { AppSidebar } from './app-sidebar';
import { Topbar } from './topbar';
import { Breadcrumbs, type BreadcrumbItem } from './breadcrumbs';

interface MainLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function MainLayout({ children, breadcrumbs = [] }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
        <main className="flex-1 overflow-auto">
          <div className="bg-background">{children}</div>
        </main>
      </div>
    </div>
  );
}
