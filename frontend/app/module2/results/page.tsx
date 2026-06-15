'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/bi/status-badge';
import { cargasApi } from '@/lib/api';
import { Download, Search, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CargaItem {
  id: number;
  codigo: string;
  totalRegistros: number;
  totalRegValidos: number;
  totalRegInvalidos: number;
  createdAt: string;
  tipoCarga?: { id: number; codigo: string; nombre: string };
  estadoCarga?: { id: number; codigo: string; nombre: string };
  archivo?: { nombreArchivo: string };
}

interface PaginatedResponse {
  content: CargaItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const TIPO_CODIGO_A_FILTRO: Record<string, string> = {
  CAMPANIAS: 'campañas',
  CLIENTES: 'clientes',
  OFERTAS: 'ofertas',
};

export default function ConsultaResultadosPage() {
  const [cargas, setCargas] = useState<CargaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadCargas();
  }, []);

  const loadCargas = async () => {
    try {
      setLoading(true);
      setError('');
      const data: PaginatedResponse = await cargasApi.listar({ size: '1000' });
      setCargas(data.content || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar resultados');
    } finally {
      setLoading(false);
    }
  };

  const filteredProcesos = useMemo(() => {
    return cargas.filter((proceso) => {
      const matchesSearch =
        proceso.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (proceso.archivo?.nombreArchivo || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = !tipoFilter || (TIPO_CODIGO_A_FILTRO[proceso.tipoCarga?.codigo || ''] === tipoFilter);
      const matchesEstado = !estadoFilter || (proceso.estadoCarga?.codigo || '').toLowerCase() === estadoFilter;
      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [cargas, searchTerm, tipoFilter, estadoFilter]);

  const totalPages = Math.ceil(filteredProcesos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProcesos = filteredProcesos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setEstadoFilter('');
    setCurrentPage(1);
  };

  const getEstadoBadge = (codigo?: string) => {
    const estado = (codigo || '').toLowerCase();
    switch (estado) {
      case 'publicada':
        return { status: 'completed' as const, label: 'Publicada' };
      case 'con_errores':
        return { status: 'error' as const, label: 'Con Errores' };
      case 'validada':
        return { status: 'active' as const, label: 'Validada' };
      case 'en_validacion':
        return { status: 'pending' as const, label: 'En Validación' };
      case 'rechazada':
        return { status: 'inactive' as const, label: 'Rechazada' };
      case 'pendiente':
      default:
        return { status: 'pending' as const, label: 'Pendiente' };
    }
  };

  const getTipoNombre = (codigo?: string) => {
    switch (codigo) {
      case 'CAMPANIAS':
        return 'Campañas';
      case 'CLIENTES':
        return 'Clientes';
      case 'OFERTAS':
        return 'Ofertas';
      default:
        return '-';
    }
  };

  if (loading) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Consulta de Resultados y Errores' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Consulta de Resultados y Errores' }]}>
        <div className="p-6 text-center">
          <p className="text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </p>
          <Button className="mt-4" onClick={loadCargas}>Reintentar</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      breadcrumbs={[
        { label: 'Captura Digital', href: '/module2' },
        { label: 'Consulta de Resultados y Errores' },
      ]}
    >
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Consulta de Resultados y Errores</h1>
          <p className="text-muted-foreground mt-2">Consulte el detalle de cargas ejecutadas, validados y errores encontrados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Cargas Publicadas</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {cargas.filter(p => p.estadoCarga?.codigo === 'PUBLICADA').length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Procesados</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {cargas.reduce((sum, p) => sum + (p.totalRegistros || 0), 0).toLocaleString()}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Registros Válidos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {cargas.reduce((sum, p) => sum + (p.totalRegValidos || 0), 0).toLocaleString()}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Errores Totales</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {cargas.reduce((sum, p) => sum + (p.totalRegInvalidos || 0), 0).toLocaleString()}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filtros</h3>
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="gap-2">
              <Filter className="w-4 h-4" />
              Limpiar
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Buscar por ID o Nombre</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="CARGA-2025-001..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 border border-slate-300 bg-white rounded-md shadow-sm hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Tipo de Carga</label>
              <Select value={tipoFilter || 'all'} onValueChange={(val) => {
                setTipoFilter(val === 'all' ? '' : val);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="border border-slate-300 bg-white rounded-md shadow-sm hover:border-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="campañas">Campañas</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="ofertas">Ofertas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Estado</label>
              <Select value={estadoFilter || 'all'} onValueChange={(val) => {
                setEstadoFilter(val === 'all' ? '' : val);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="border border-slate-300 bg-white rounded-md shadow-sm hover:border-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_validacion">En Validación</SelectItem>
                  <SelectItem value="validada">Validada</SelectItem>
                  <SelectItem value="con_errores">Con Errores</SelectItem>
                  <SelectItem value="publicada">Publicada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Cargas Ejecutadas</h3>
            <p className="text-sm text-muted-foreground">{filteredProcesos.length} registros</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">ID Carga</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-right py-3 px-4 font-medium">Procesados</th>
                  <th className="text-right py-3 px-4 font-medium">Válidos</th>
                  <th className="text-right py-3 px-4 font-medium">Errores</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-center py-3 px-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProcesos.length > 0 ? (
                  paginatedProcesos.map((proceso) => {
                    const badge = getEstadoBadge(proceso.estadoCarga?.codigo);
                    return (
                      <tr key={proceso.id} className="border-b border-border hover:bg-secondary/30">
                        <td className="py-3 px-4 font-medium">{proceso.codigo}</td>
                        <td className="py-3 px-4 text-muted-foreground">{getTipoNombre(proceso.tipoCarga?.codigo)}</td>
                        <td className="py-3 px-4 text-right font-medium">{proceso.totalRegistros}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">{proceso.totalRegValidos}</td>
                        <td className="py-3 px-4 text-right text-red-600 font-medium">{proceso.totalRegInvalidos}</td>
                        <td className="py-3 px-4">
                          <StatusBadge {...badge} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link href={`/module2/detalle/${proceso.id}`}>
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 px-4 text-center text-muted-foreground">
                      No hay cargas que coincidan con los filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col items-start gap-4 mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredProcesos.length)} de {filteredProcesos.length} cargas
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1 flex-wrap">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, currentPage - 2) + i;
                    return page <= totalPages ? (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ) : null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Descargar Reportes</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Genere y descargue reportes completos de cargas, validaciones y errores
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" className="gap-2" disabled>
              <Download className="w-4 h-4" />
              Reporte Completo (PDF)
            </Button>
            <Button variant="outline" className="gap-2" disabled>
              <Download className="w-4 h-4" />
              Errores Detallados (Excel)
            </Button>
            <Button variant="outline" className="gap-2" disabled>
              <Download className="w-4 h-4" />
              Resumen de Período (CSV)
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
