'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientesApi, catalogosApi } from '@/lib/api';
import { DataTablePagination } from '@/components/bi/data-table-pagination';
import { Search, Filter, ChevronRight, RotateCcw, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Cliente {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  nombreCompleto: string;
  tipoDocumento?: { id: number; codigo: string; nombre: string };
  numeroDocumento: string;
  tipoCliente?: { id: number; codigo: string; nombre: string };
  segmento?: { id: number; codigo: string; nombre: string };
}

export default function ClientsPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [segmentos, setSegmentos] = useState<{ id: number; nombre: string }[]>([]);
  const [tiposCliente, setTiposCliente] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [segmentoFilter, setSegmentoFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [resumen, setResumen] = useState({ total: 0, personasNaturales: 0, personasJuridicas: 0 });

  useEffect(() => {
    loadCatalogos();
  }, []);

  useEffect(() => {
    loadClientes(currentPage);
    loadResumen();
  }, [currentPage, pageSize, searchTerm, tipoFilter, segmentoFilter]);

  const loadCatalogos = async () => {
    try {
      const [segmentosRes, tiposRes] = await Promise.all([
        catalogosApi.listarSegmentos(),
        catalogosApi.listarTiposCliente(),
      ]);
      setSegmentos(segmentosRes.map((s: any) => ({ id: s.id, nombre: s.nombre })));
      setTiposCliente(tiposRes.map((t: any) => ({ id: t.id, nombre: t.nombre })));
    } catch (err: any) {
      console.error('Error cargando catálogos', err);
    }
  };

  const buildFilters = (): Record<string, string> => {
    const params: Record<string, string> = {};
    if (searchTerm) {
      if (/^\d+$/.test(searchTerm)) {
        params.numeroDocumento = searchTerm;
      } else {
        params.nombre = searchTerm;
      }
    }
    if (tipoFilter) params.tipoClienteId = tipoFilter;
    if (segmentoFilter) params.segmentoId = segmentoFilter;
    return params;
  };

  const loadClientes = async (page: number) => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string> = {
        page: String(page - 1),
        size: String(pageSize),
        ...buildFilters(),
      };

      const response = await clientesApi.listar(params);
      setClientes(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadResumen = async () => {
    try {
      const data = await clientesApi.resumen(buildFilters());
      setResumen({
        total: data.total || 0,
        personasNaturales: data.personasNaturales || 0,
        personasJuridicas: data.personasJuridicas || 0,
      });
    } catch (err: any) {
      console.error('Error cargando resumen de clientes', err);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setSegmentoFilter('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleTipoFilterChange = (val: string) => {
    setTipoFilter(val === 'all' ? '' : val);
    setCurrentPage(1);
  };

  const handleSegmentoFilterChange = (val: string) => {
    setSegmentoFilter(val === 'all' ? '' : val);
    setCurrentPage(1);
  };

  return (
    <MainLayout breadcrumbs={[{ label: 'Cliente 360' }]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clientes 360</h1>
            <p className="text-muted-foreground mt-1">
              Visualización completa del historial y ofertas de cada cliente
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filtros
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Búsqueda</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Por nombre o número de documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Tipo de Cliente</label>
                <Select value={tipoFilter || 'all'} onValueChange={handleTipoFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {tiposCliente.map((tipo) => (
                      <SelectItem key={tipo.id} value={String(tipo.id)}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Segmento</label>
                <Select value={segmentoFilter || 'all'} onValueChange={handleSegmentoFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {segmentos.map((segmento) => (
                      <SelectItem key={segmento.id} value={String(segmento.id)}>
                        {segmento.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch}>Buscar</Button>
              <Button variant="outline" size="sm" className="gap-2 w-fit" onClick={handleResetFilters}>
                <RotateCcw className="w-4 h-4" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold text-foreground">{resumen.total}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Personas Naturales</p>
              <p className="text-2xl font-bold text-foreground">{resumen.personasNaturales}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Personas Jurídicas</p>
              <p className="text-2xl font-bold text-foreground">{resumen.personasJuridicas}</p>
            </div>
          </div>
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
                      <th className="text-left py-4 px-4 font-medium">Número de Documento</th>
                      <th className="text-left py-4 px-4 font-medium">Tipo de Documento</th>
                      <th className="text-left py-4 px-4 font-medium">Nombre</th>
                      <th className="text-left py-4 px-4 font-medium">Tipo de Cliente</th>
                      <th className="text-left py-4 px-4 font-medium">Segmento</th>
                      <th className="text-center py-4 px-4 font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.length > 0 ? (
                      clientes.map((cliente) => (
                        <tr key={cliente.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className="py-4 px-4 font-medium text-foreground">{cliente.numeroDocumento}</td>
                          <td className="py-4 px-4 text-muted-foreground">{cliente.tipoDocumento?.nombre || '-'}</td>
                          <td className="py-4 px-4 font-medium text-foreground">{cliente.nombreCompleto}</td>
                          <td className="py-4 px-4 text-muted-foreground">{cliente.tipoCliente?.nombre || '-'}</td>
                          <td className="py-4 px-4 text-muted-foreground">{cliente.segmento?.nombre || '-'}</td>
                          <td className="py-4 px-4 text-center">
                            <Link href={`/module1/clients/${cliente.id}`}>
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 px-4 text-center text-muted-foreground">
                          No se encontraron clientes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <DataTablePagination
                page={currentPage}
                pageCount={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
