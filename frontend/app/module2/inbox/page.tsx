'use client';

import { MainLayout } from '@/components/main-layout';
import { KPICard } from '@/components/bi/kpi-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/bi/status-badge';
import { cargasApi, catalogosApi } from '@/lib/api';
import { Plus, Search, RotateCcw, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface Carga {
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

export default function BandejaPage() {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [tiposCarga, setTiposCarga] = useState<{ id: number; nombre: string }[]>([]);
  const [estadosCarga, setEstadosCarga] = useState<{ id: number; codigo: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadCatalogos();
    loadCargas();
  }, []);

  const loadCatalogos = async () => {
    try {
      const [tipos, estados] = await Promise.all([
        catalogosApi.listarTiposCarga(),
        catalogosApi.listarEstadosCarga(),
      ]);
      setTiposCarga(tipos.map((t: any) => ({ id: t.id, nombre: t.nombre })));
      setEstadosCarga(estados.map((e: any) => ({ id: e.id, codigo: e.codigo, nombre: e.nombre })));
    } catch (err: any) {
      console.error('Error cargando catálogos', err);
    }
  };

  const loadCargas = async (page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string> = {
        page: String(page),
        size: String(PAGE_SIZE),
        sort: 'createdAt,desc',
      };
      if (searchTerm) params.codigo = searchTerm;
      if (tipoFilter) params.tipoCargaId = tipoFilter;
      if (estadoFilter) params.estadoCargaId = estadoFilter;
      if (fechaDesde) params.fechaDesde = `${fechaDesde}T00:00:00`;
      if (fechaHasta) params.fechaHasta = `${fechaHasta}T23:59:59`;

      const response = await cargasApi.listar(params);
      setCargas(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la bandeja');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadCargas(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setEstadoFilter('');
    setFechaDesde('');
    setFechaHasta('');
    setCurrentPage(0);
    loadCargas(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCargas(page);
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
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  const cargasPendientes = cargas.filter((c) =>
    ['PENDIENTE', 'EN_VALIDACION'].includes(c.estadoCarga?.codigo || '')
  ).length;
  const cargasPublicadas = cargas.filter((c) => c.estadoCarga?.codigo === 'PUBLICADA').length;
  const totalRegistrosProcesados = cargas.reduce(
    (sum, c) => sum + (c.resultado?.totalRegistrosProcesados || 0),
    0
  );

  return (
    <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Bandeja de Cargas' }]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bandeja de Cargas</h1>
            <p className="text-muted-foreground mt-1">Panel central de gestión de cargas de datos</p>
          </div>
          <Link href="/module2/registro">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Carga
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Cargas del Día" value={cargas.length} icon={<Plus className="w-4 h-4" />} />
          <KPICard label="Cargas Pendientes" value={cargasPendientes} icon={<Plus className="w-4 h-4" />} />
          <KPICard label="Cargas Publicadas" value={cargasPublicadas} icon={<Plus className="w-4 h-4" />} />
          <KPICard label="Total de Registros" value={totalRegistrosProcesados.toLocaleString()} icon={<Plus className="w-4 h-4" />} />
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Buscar ID o Archivo</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ID Carga o nombre de archivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Tipo de Carga</label>
              <Select value={tipoFilter || 'all'} onValueChange={(val) => setTipoFilter(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tiposCarga.map((tipo) => (
                    <SelectItem key={tipo.id} value={String(tipo.id)}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Estado</label>
              <Select value={estadoFilter || 'all'} onValueChange={(val) => setEstadoFilter(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {estadosCarga.map((estado) => (
                    <SelectItem key={estado.id} value={String(estado.id)}>
                      {estado.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">Buscar</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Fecha Desde</label>
              <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Fecha Hasta</label>
              <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
            </div>
          </div>

          <Button variant="outline" size="sm" className="gap-2 w-fit" onClick={handleResetFilters}>
            <RotateCcw className="w-4 h-4" />
            Limpiar filtros
          </Button>
        </Card>

        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-red-600 py-4">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground">
                      <th className="text-left py-3 px-4 font-medium">ID Carga</th>
                      <th className="text-left py-3 px-4 font-medium">Archivo</th>
                      <th className="text-left py-3 px-4 font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium">Usuario</th>
                      <th className="text-left py-3 px-4 font-medium">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium">Estado</th>
                      <th className="text-center py-3 px-4 font-medium">Procesados</th>
                      <th className="text-center py-3 px-4 font-medium">Válidos</th>
                      <th className="text-center py-3 px-4 font-medium">Errores</th>
                      <th className="text-center py-3 px-4 font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargas.length > 0 ? (
                      cargas.map((carga) => {
                        const badgeStatus = getEstadoBadgeStatus(carga.estadoCarga?.codigo || '');
                        return (
                          <tr key={carga.id} className="border-b border-border hover:bg-secondary/30">
                            <td className="py-3 px-4 font-medium text-foreground">{carga.codigo}</td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">{carga.archivo?.nombreArchivo || '-'}</td>
                            <td className="py-3 px-4 text-muted-foreground capitalize">{carga.tipoCarga?.nombre || '-'}</td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">{carga.usuario?.nombreCompleto || '-'}</td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">{formatDate(carga.createdAt)}</td>
                            <td className="py-3 px-4">
                              <StatusBadge status={badgeStatus.status} label={badgeStatus.label} />
                            </td>
                            <td className="py-3 px-4 text-center text-foreground font-medium">{carga.resultado?.totalRegistrosProcesados || 0}</td>
                            <td className="py-3 px-4 text-center text-green-600 dark:text-green-400 font-medium">{carga.totalRegValidos}</td>
                            <td className="py-3 px-4 text-center text-red-600 dark:text-red-400 font-medium">{carga.totalRegInvalidos}</td>
                            <td className="py-3 px-4 text-center">
                              <Link href={`/module2/detalle/${carga.id}`}>
                                <Button variant="ghost" size="sm" className="text-xs">
                                  Ver
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={10} className="py-8 px-4 text-center text-muted-foreground">
                          No hay cargas que coincidan con los filtros
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage + 1} de {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 0}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
