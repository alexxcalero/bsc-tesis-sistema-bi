'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Layers, Upload, BarChart3, Mail, Plus, CheckSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const modules = [
  {
    id: 'module1',
    label: 'Visualización e Integración',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', href: '/module1/dashboard' },
      { label: 'Campañas Comerciales', href: '/module1/campaigns' },
      { label: 'Cliente 360', href: '/module1/clients' },
      { label: 'Reportes y Exportación', href: '/module1/reports' },
    ],
  },
  {
    id: 'module2',
    label: 'Captura Digital',
    icon: Upload,
    items: [
      { label: 'Bandeja de Cargas', href: '/module2/inbox' },
      { label: 'Registro de Proceso de Carga', href: '/module2/registro' },
      { label: 'Validación de Archivo de Carga', href: '/module2/validation' },
      { label: 'Consulta de Resultados y Errores', href: '/module2/results' },
      { label: 'Historial y Trazabilidad de Cargas', href: '/module2/history' },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sidebar-primary" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-sidebar-primary">BI Bancario</h1>
            <p className="text-xs text-sidebar-foreground/60">v1.0</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-6">
        {modules.map((module) => {
          const Icon = module.icon;
          const isModuleActive = module.items.some((item) =>
            pathname.startsWith(item.href.split('/').slice(0, 3).join('/'))
          );

          return (
            <div key={module.id}>
              <div className="flex items-center gap-2 px-4 py-2 mb-2 text-sm font-semibold text-sidebar-foreground">
                <Icon className="w-4 h-4" />
                {module.label}
              </div>
              <div className="space-y-1">
                {module.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'block px-4 py-2 rounded text-sm transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
