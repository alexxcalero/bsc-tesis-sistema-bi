'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/bi/status-badge';
import { cargasApi } from '@/lib/api';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CargaDetalle {
  id: number;
  codigo: string;
  fechaInicio?: string;
  fechaFin?: string;
  observacion?: string;
  totalRegistros: number;
  totalRegValidos: number;
  totalRegInvalidos: number;
  createdAt: string;
  tipoCarga?: { id: number; codigo: string; nombre: string };
  estadoCarga?: { id: number; codigo: string; nombre: string };
  usuario?: { id: number; username: string; nombreCompleto: string };
  archivo?: { id: number; nombreArchivo: string; tipoArchivo: string; tamanoArchivo: number };
  resultado?: { totalRegistrosProcesados: number };
}

interface ErrorCarga {
  id: number;
  numeroFila: number;
  campo?: string;
  mensajeError: string;
  tipoError: string;
}

export default function DetalleProcesoPage() {
  const params = useParams();
  const procesoId = params.id as string;
  const [proceso, setProceso] = useState<CargaDetalle | null>(null);
  const [errores, setErrores] = useState<ErrorCarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDetalle();
  }, [procesoId]);

  const loadDetalle = async () => {
    try {
      setLoading(true);
      setError('');
      const [procesoRes, erroresRes] = await Promise.all([
        cargasApi.obtener(procesoId),
        cargasApi.listarErrores(procesoId, { size: '100' }),
      ]);
      setProceso(procesoRes);
      setErrores(erroresRes.content || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar detalle');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeStatus = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'publicada':
        return { status: 'completed' as const, label: 'Publicada' };
      case 'validada':
        return { status: 'active' as const, label: 'Validada' };
      case 'en_validacion':
        return { status: 'pending' as const, label: 'En Validación' };
      case 'con_errores':
        return { status: 'error' as const, label: 'Con Errores' };
      case 'rechazada':
        return { status: 'inactive' as const, label: 'Rechazada' };
      case 'pendiente':
      default:
        return { status: 'pending' as const, label: 'Pendiente' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-PE');
  };

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return '-';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Bandeja de Cargas', href: '/module2/inbox' }, { label: 'Detalle' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (error || !proceso) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Bandeja de Cargas', href: '/module2/inbox' }, { label: 'Detalle' }]}>
        <div className="p-6 text-center">
          <p className="text-red-600">{error || 'Proceso no encontrado'}</p>
          <Link href="/module2/inbox">
            <Button className="mt-4">Volver a Bandeja</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const badgeStatus = getEstadoBadgeStatus(proceso.estadoCarga?.codigo || '');

  return (
    <MainLayout
      breadcrumbs={[
        { label: 'Captura Digital', href: '/module2' },
        { label: 'Bandeja de Cargas', href: '/module2/inbox' },
        { label: 'Seguimiento del Proceso de Carga' },
      ]}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <Link href="/module2/inbox">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Seguimiento del Proceso de Carga</h1>
            <p className="text-muted-foreground mt-2">{proceso.codigo} - {proceso.archivo?.nombreArchivo || 'Sin archivo'}</p>
          </div>
          <StatusBadge {...badgeStatus} />
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Carga</p>
              <p className="text-lg font-semibold text-foreground capitalize">{proceso.tipoCarga?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuario Responsable</p>
              <p className="text-lg font-semibold text-foreground">{proceso.usuario?.nombreCompleto || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tamaño de Archivo</p>
              <p className="text-lg font-semibold text-foreground">{formatBytes(proceso.archivo?.tamanoArchivo)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Registro</p>
              <p className="text-lg font-semibold text-foreground">{formatDate(proceso.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha Inicio</p>
              <p className="text-lg font-semibold text-foreground">{formatDate(proceso.fechaInicio)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha Fin</p>
              <p className="text-lg font-semibold text-foreground">{formatDate(proceso.fechaFin)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="text-lg font-semibold text-foreground capitalize">{badgeStatus.label}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Observación</p>
              <p className="text-lg font-semibold text-foreground">{proceso.observacion || '-'}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total de Registros Procesados</p>
            <p className="text-3xl font-bold text-foreground">{proceso.totalRegistros}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Registros Válidos</p>
            <p className="text-3xl font-bold text-green-600">{proceso.totalRegValidos}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Registros con Error</p>
            <p className="text-3xl font-bold text-red-600">{proceso.totalRegInvalidos}</p>
          </Card>
        </div>

        {errores.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Errores de Validación ({errores.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Fila</th>
                    <th className="text-left py-3 px-4 font-medium">Campo</th>
                    <th className="text-left py-3 px-4 font-medium">Tipo de Error</th>
                    <th className="text-left py-3 px-4 font-medium">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {errores.map((error) => (
                    <tr key={error.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 font-medium text-red-600">{error.numeroFila}</td>
                      <td className="py-3 px-4 text-muted-foreground">{error.campo || 'N/A'}</td>
                      <td className="py-3 px-4 text-muted-foreground capitalize">{error.tipoError}</td>
                      <td className="py-3 px-4 text-muted-foreground">{error.mensajeError}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Descargar Reporte
          </Button>
          {(proceso.estadoCarga?.codigo === 'VALIDADA' || proceso.estadoCarga?.codigo === 'CON_ERRORES') && (
            <Link href={`/module2/validation/${proceso.id}`}>
              <Button>Ir a Validación</Button>
            </Link>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
