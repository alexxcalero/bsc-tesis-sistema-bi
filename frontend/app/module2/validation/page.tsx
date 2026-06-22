'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/bi/status-badge';
import { DataTablePagination } from '@/components/bi/data-table-pagination';
import { cargasApi, catalogosApi } from '@/lib/api';
import { Search, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

interface TipoCarga {
  id: number;
  codigo: string;
  nombre: string;
}

const TIPO_CODIGO_A_FILTRO: Record<string, string> = {
  CAMPANIAS: 'campañas',
  CLIENTES: 'clientes',
  OFERTAS: 'ofertas',
};

const ESTADOS_VALIDACION = ['VALIDADA', 'CON_ERRORES'];

export default function ValidationPage() {
  const [cargas, setCargas] = useState<CargaItem[]>([]);
  const [tiposCarga, setTiposCarga] = useState<TipoCarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadTiposCarga();
  }, []);

  useEffect(() => {
    loadCargas();
  }, [currentPage, pageSize, searchTerm, tipoFilter]);

  const loadTiposCarga = async () => {
    try {
      const data = await catalogosApi.listarTiposCarga();
      setTiposCarga(data || []);
    } catch {
      setTiposCarga([]);
    }
  };

  const loadCargas = async () => {
    try {
      setLoading(true);
      setError('');
      const tipoCargaId = getTipoCargaId(tipoFilter);
      const params: Record<string, string> = {
        page: String(currentPage - 1),
        size: String(pageSize),
        estados: ESTADOS_VALIDACION.join(','),
      };
      if (tipoCargaId) params.tipoCargaId = tipoCargaId;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data: PaginatedResponse = await cargasApi.listar(params);
      setCargas(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar validaciones');
    } finally {
      setLoading(false);
    }
  };

  const getTipoCargaId = (filtro: string) => {
    const tipo = tiposCarga.find((t) => TIPO_CODIGO_A_FILTRO[t.codigo] === filtro);
    return tipo ? String(tipo.id) : '';
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTipoChange = (value: string) => {
    setTipoFilter(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

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

  if (loading && cargas.length === 0) {
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
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                onValueChange={handleTipoChange}
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
                {cargas.length > 0 ? (
                  cargas.map((proceso) => {
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

          <div className="px-6">
            <DataTablePagination
              page={currentPage}
              pageCount={totalPages}
              totalItems={totalElements}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
