'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/', '/login'];

const ROUTE_PERMISSIONS = [
  { prefix: '/module1/campaigns', permiso: 'CAMPANIAS_VER' },
  { prefix: '/module1/clients', permiso: 'CLIENTES_VER' },
  { prefix: '/module1/reports', permiso: 'REPORTES_VER' },
  { prefix: '/module2/inbox', permiso: 'CARGAS_VER' },
  { prefix: '/module2/results', permiso: 'CARGAS_VER' },
  { prefix: '/module2/history', permiso: 'CARGAS_VER' },
  { prefix: '/module2/detalle', permiso: 'CARGAS_VER' },
  { prefix: '/module2/registro', permiso: 'CARGAS_CREAR' },
  { prefix: '/module2/validation', permiso: 'CARGAS_VALIDAR' },
  { prefix: '/module2/publication', permiso: 'CARGAS_PUBLICAR' },
  { prefix: '/admin/usuarios', permiso: 'USUARIOS_VER' },
  { prefix: '/admin/auditoria', permiso: 'AUDITORIA_VER' },
];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, hasPermission } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (!user && !isPublic) {
      router.replace('/login');
      return;
    }

    if (user && !isPublic) {
      const required = ROUTE_PERMISSIONS.find((route) =>
        pathname.startsWith(route.prefix)
      );

      if (required && !hasPermission(required.permiso)) {
        router.replace('/module1/dashboard');
        return;
      }
    }

    setIsChecking(false);
  }, [pathname, user, isLoading, hasPermission, router]);

  if (isLoading || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
