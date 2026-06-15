'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/bi/status-badge';
import { cargasApi } from '@/lib/api';
import { Search, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
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

export default function ValidationPage() {
  const [cargas, setCargas] = useState<CargaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
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
      setError(err.message || 'Error al cargar validaciones');
    } finally {
      setLoading(false);
    }
  };

  const filteredProcesos = useMemo(() => {
    return cargas
      .filter((proceso) =>
        proceso.estadoCarga?.codigo === 'VALIDADA' || proceso.estadoCarga?.codigo === 'CON_ERRORES'
      )
      .filter((proceso) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          (proceso.archivo?.nombreArchivo || '').toLowerCase().includes(term) ||
          proceso.codigo.toLowerCase().includes(term);
        const matchesTipo = !tipoFilter || (TIPO_CODIGO_A_FILTRO[proceso.tipoCarga?.codigo || ''] === tipoFilter);
        return matchesSearch && matchesTipo;
      });
  }, [cargas, searchTerm, tipoFilter]);

  const totalPages = Math.ceil(filteredProcesos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProcesos = filteredProcesos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setCurrentPage(1);
  };

  const getStatusInfo = (codigo?: string) => {
    if (codigo === 'VALIDADA') {
      return { status: 'active' as const, label: 'Validada' };
    }
    return { status: 'error' as const, label: 'Con Errores' };
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
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Validación de Archivo de Carga' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Validación de Archivo de Carga' }]}>
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
        { label: 'Validación de Archivo de Carga' },
      ]}
    >
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Validación de Archivo de Carga</h1>
          <p className="text-muted-foreground">Revisa y valida los archivos de carga pendientes de procesamiento</p>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Buscar por Nombre o ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre de archivo o ID de carga..."
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
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Tipo de Carga
              </label>
              <Select
                value={tipoFilter || 'all'}
                onValueChange={(val) => {
                  setTipoFilter(val === 'all' ? '' : val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="border border-slate-300 bg-white rounded-md shadow-sm hover:border-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="campañas">Campañas</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="ofertas">Ofertas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-fit mt-4"
            onClick={handleResetFilters}
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar filtros
          </Button>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">ID de Carga</th>
                  <th className="text-left py-3 px-4 font-medium">Archivo</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-right py-3 px-4 font-medium">Registros</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-center py-3 px-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProcesos.length > 0 ? (
                  paginatedProcesos.map((proceso) => {
                    const { status, label } = getStatusInfo(proceso.estadoCarga?.codigo);

                    return (
                      <tr key={proceso.id} className="border-b border-border hover:bg-secondary/30">
                        <td className="py-3 px-4 font-medium">{proceso.codigo}</td>
                        <td className="py-3 px-4 text-muted-foreground">{proceso.archivo?.nombreArchivo || '-'}</td>
                        <td className="py-3 px-4 text-muted-foreground">{getTipoNombre(proceso.tipoCarga?.codigo)}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {proceso.totalRegistros}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={status} label={label} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link href={`/module2/validation/${proceso.id}`}>
                            <Button variant="ghost" size="sm">
                              Revisar
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-muted-foreground">
                      No hay validaciones pendientes que coincidan con los filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col items-start gap-4 mt-6 p-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredProcesos.length)} de{' '}
                {filteredProcesos.length} validaciones
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
                  {totalPages > 0 && (
                    <Button
                      variant={currentPage === 1 ? 'default' : 'outline'}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>
                  )}

                  {currentPage > 3 && totalPages > 6 && (
                    <span className="text-muted-foreground px-2">...</span>
                  )}

                  {Array.from({ length: Math.min(5, totalPages - 1) }, (_, i) => {
                    const page = Math.max(2, currentPage - 2) + i;
                    return page < totalPages ? (
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

                  {currentPage < totalPages - 2 && totalPages > 6 && (
                    <span className="text-muted-foreground px-2">...</span>
                  )}

                  {totalPages > 1 && (
                    <Button
                      variant={currentPage === totalPages ? 'default' : 'outline'}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  )}
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
      </div>
    </MainLayout>
  );
}
