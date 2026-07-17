'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/bi/status-badge';
import { cargasApi } from '@/lib/api';
import { ArrowLeft, AlertCircle, CheckCircle, ChevronRight, Loader2, FileX2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface CargaDetalle {
  id: number;
  codigo: string;
  totalRegistros: number;
  totalRegValidos: number;
  totalRegInvalidos: number;
  estadoCarga?: { id: number; codigo: string; nombre: string };
  archivo?: { nombreArchivo: string };
  tipoCarga?: { nombre: string };
}

interface ErrorCarga {
  id: number;
  numeroFila: number;
  campo?: string;
  mensajeError: string;
  tipoError: string;
}

export default function ValidacionArchivoPage() {
  const params = useParams();
  const procesoId = params.id as string;
  const { hasPermission } = useAuth();
  const canValidate = false;
  const canPublish = hasPermission('CARGAS_PUBLICAR');
  const [proceso, setProceso] = useState<CargaDetalle | null>(null);
  const [errores, setErrores] = useState<ErrorCarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [validando, setValidando] = useState(false);
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
      setError(err.message || 'Error al cargar validación');
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async () => {
    try {
      setValidando(true);
      await cargasApi.validar(procesoId);
      await loadDetalle();
    } catch (err: any) {
      setError(err.message || 'Error al validar');
    } finally {
      setValidando(false);
    }
  };

  const descargarArchivo = (blob: Blob, nombre: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDescargarErrores = async () => {
    try {
      const blob = await cargasApi.descargarErrores(procesoId);
      descargarArchivo(blob, `errores_carga_${procesoId}.csv`);
    } catch (err: any) {
      setError(err.message || 'Error al descargar errores');
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

  if (loading) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Validación' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (error || !proceso) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Validación' }]}>
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
  const porcentajeValidos = proceso.totalRegistros > 0
    ? Math.round((proceso.totalRegValidos / proceso.totalRegistros) * 100)
    : 0;
  const porcentajeErrores = 100 - porcentajeValidos;

  return (
    <MainLayout
      breadcrumbs={[
        { label: 'Captura Digital', href: '/module2' },
        { label: 'Validación de Archivo de Carga', href: '/module2/validation' },
        { label: 'Detalle' },
      ]}
    >
      <div className="p-6 space-y-6">
        <div>
          <Link href="/module2/inbox">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Validación de Archivo de Carga</h1>
          <p className="text-muted-foreground mt-2">{proceso.codigo} - {proceso.archivo?.nombreArchivo}</p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Resumen del Archivo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Nombre del Archivo</p>
              <p className="text-lg font-semibold text-foreground">{proceso.archivo?.nombreArchivo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Carga</p>
              <p className="text-lg font-semibold text-foreground">{proceso.tipoCarga?.nombre || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Registros</p>
              <p className="text-lg font-semibold text-foreground">{proceso.totalRegistros}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registros Válidos</p>
                <p className="text-3xl font-bold text-green-600">{proceso.totalRegValidos}</p>
                <p className="text-xs text-muted-foreground mt-1">{porcentajeValidos}% del total</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registros Inválidos</p>
                <p className="text-3xl font-bold text-red-600">{proceso.totalRegInvalidos}</p>
                <p className="text-xs text-muted-foreground mt-1">{porcentajeErrores}% del total</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errores Totales</p>
                <p className="text-3xl font-bold text-blue-600">{errores.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Encontrados</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </div>

        {errores.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detalle de Errores por Fila</h3>
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
                  {errores.slice(0, 10).map((error) => (
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
            {errores.length > 10 && (
              <p className="text-xs text-muted-foreground mt-4">...y {errores.length - 10} errores más</p>
            )}
          </Card>
        )}

        {proceso.totalRegInvalidos === 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              Archivo validado exitosamente. Puede proceder a publicar los {proceso.totalRegValidos} registros válidos.
            </p>
          </div>
        )}

        {proceso.totalRegInvalidos > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Se encontraron {proceso.totalRegInvalidos} registros con errores. Puede publicar los {proceso.totalRegValidos} registros válidos.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end flex-wrap">
          {proceso.totalRegInvalidos > 0 && (
            <Button variant="outline" className="gap-2" onClick={handleDescargarErrores}>
              <FileX2 className="w-4 h-4" />
              Descargar Errores
            </Button>
          )}
          {canValidate && (
            <Button onClick={handleValidar} disabled={validando}>
              {validando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {validando ? 'Revalidando...' : 'Revalidar Archivo'}
            </Button>
          )}
          {canPublish && (proceso.estadoCarga?.codigo === 'VALIDADA' || proceso.estadoCarga?.codigo === 'CON_ERRORES') && (
            <Link href={`/module2/publication/${proceso.id}`}>
              <Button className="gap-2">
                Ir a Publicación
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
