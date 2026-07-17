'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cargasApi } from '@/lib/api';
import { ArrowLeft, AlertCircle, User, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface CargaDetalle {
  id: number;
  codigo: string;
  observacion?: string;
  totalRegistros: number;
  totalRegValidos: number;
  totalRegInvalidos: number;
  createdAt: string;
  tipoCarga?: { id: number; codigo: string; nombre: string };
  estadoCarga?: { id: number; codigo: string; nombre: string };
  usuario?: { id: number; username: string; nombreCompleto: string };
  archivo?: { id: number; nombreArchivo: string; tipoArchivo: string; tamanoArchivo: number };
}

export default function PublicacionCargaPage() {
  const params = useParams();
  const router = useRouter();
  const procesoId = params.id as string;
  const { hasPermission } = useAuth();
  const canPublish = hasPermission('CARGAS_PUBLICAR');

  const [proceso, setProceso] = useState<CargaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmada, setConfirmada] = useState(false);
  const [publicando, setPublicando] = useState(false);

  useEffect(() => {
    loadDetalle();
  }, [procesoId]);

  const loadDetalle = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await cargasApi.obtener(procesoId);
      setProceso(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el proceso de carga');
    } finally {
      setLoading(false);
    }
  };

  const handlePublicar = async () => {
    try {
      setPublicando(true);
      setError('');
      await cargasApi.publicar(procesoId);
      sessionStorage.setItem('pendingPublication', procesoId);
      router.push('/module2/inbox');
    } catch (err: any) {
      setError(err.message || 'Error al publicar la carga');
    } finally {
      setPublicando(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-PE');
  };

  const getTipoCargaNombre = (tipo?: { codigo: string; nombre: string }) => {
    if (!tipo) return '-';
    return tipo.nombre;
  };

  if (loading) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Publicación de Carga Validada' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (error || !proceso) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Publicación de Carga Validada' }]}>
        <div className="p-6 text-center">
          <p className="text-red-600">{error || 'Proceso de carga no encontrado'}</p>
          <Link href="/module2/inbox">
            <Button className="mt-4">Volver a Bandeja</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const hayRegistrosValidos = proceso.totalRegValidos > 0;
  const estadoPermitePublicar = ['VALIDADA', 'CON_ERRORES'].includes(proceso.estadoCarga?.codigo || '');

  return (
    <MainLayout
      breadcrumbs={[
        { label: 'Captura Digital', href: '/module2' },
        { label: 'Publicación de Carga Validada', href: '#' },
        { label: 'Confirmar Publicación' },
      ]}
    >
      <div className="p-6 space-y-6">
        <div>
          <Link href={`/module2/validation/${proceso.id}`}>
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Publicación de Carga Validada</h1>
          <p className="text-muted-foreground mt-2">{proceso.codigo} - {proceso.archivo?.nombreArchivo || 'Sin archivo'}</p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Resumen de la Carga</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Identificador de Carga</p>
              <p className="text-lg font-semibold text-foreground">{proceso.codigo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nombre del Archivo</p>
              <p className="text-lg font-semibold text-foreground">{proceso.archivo?.nombreArchivo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Carga</p>
              <p className="text-lg font-semibold text-foreground">{getTipoCargaNombre(proceso.tipoCarga)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Registro</p>
              <p className="text-lg font-semibold text-foreground">{formatDate(proceso.createdAt)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Información Responsable</h3>
          <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
            <User className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Usuario Responsable</p>
              <p className="font-semibold text-foreground">{proceso.usuario?.nombreCompleto || '-'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estadísticas de Validación</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
              <span className="text-foreground">Total de Registros Procesados</span>
              <span className="font-semibold text-foreground">{proceso.totalRegistros}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <span className="text-foreground">Registros Válidos (a publicar)</span>
              <span className="font-semibold text-green-600">{proceso.totalRegValidos}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <span className="text-foreground">Registros Inválidos (descartados)</span>
              <span className="font-semibold text-red-600">{proceso.totalRegInvalidos}</span>
            </div>
          </div>
        </Card>

        {!estadoPermitePublicar && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Esta carga no se encuentra en estado válido para publicación. Debe estar Validada o Con Errores.
            </p>
          </div>
        )}

        {!hayRegistrosValidos && estadoPermitePublicar && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              No es posible publicar esta carga debido a que no contiene registros válidos.
            </p>
          </div>
        )}

        {canPublish && hayRegistrosValidos && estadoPermitePublicar && (
          <Card className="p-6 border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-4">Confirmación Explícita</h3>
            <label className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmada}
                onChange={(e) => setConfirmada(e.target.checked)}
                className="mt-1"
              />
              <div>
                <span className="text-foreground font-medium block">
                  Confirmo que deseo publicar {proceso.totalRegValidos} registros válidos en la base de datos.
                </span>
                <span className="text-xs text-muted-foreground mt-1 block">
                  Esta acción es irreversible y actualizará la información comercial del sistema.
                </span>
              </div>
            </label>
          </Card>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Link href={`/module2/validation/${proceso.id}`}>
            <Button variant="outline">Cancelar Publicación</Button>
          </Link>
          {canPublish && (
            <Button
              onClick={handlePublicar}
              disabled={!hayRegistrosValidos || !confirmada || publicando || !estadoPermitePublicar}
            >
              {publicando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {publicando ? 'Publicando...' : 'Publicar Carga'}
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
