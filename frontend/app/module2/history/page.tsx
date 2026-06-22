'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/bi/data-table-pagination';
import { cargasApi, catalogosApi } from '@/lib/api';
import { Search, Download, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface CargaItem {
  id: number;
  codigo: string;
  totalRegistros: number;
  createdAt: string;
  tipoCarga?: { id: number; codigo: string; nombre: string };
  estadoCarga?: { id: number; codigo: string; nombre: string };
  usuario?: { id: number; username: string; nombreCompleto: string };
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

interface UsuarioResponsable {
  id: number;
  nombreCompleto: string;
}

const TIPO_CODIGO_A_FILTRO: Record<string, string> = {
  CAMPANIAS: 'campañas',
  CLIENTES: 'clientes',
  OFERTAS: 'ofertas',
};

const ESTADOS_HISTORIAL = ['PUBLICADA', 'RECHAZADA', 'CON_ERRORES'];

export default function HistoryPage() {
  const [cargas, setCargas] = useState<CargaItem[]>([]);
  const [tiposCarga, setTiposCarga] = useState<TipoCarga[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponsable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [usuarioFilter, setUsuarioFilter] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    loadCargas();
  }, [currentPage, pageSize, searchTerm, tipoFilter, estadoFilter, usuarioFilter, fechaDesde, fechaHasta]);

  const loadCatalogs = async () => {
    try {
      const [tipos, usuariosResp] = await Promise.all([
        catalogosApi.listarTiposCarga(),
        cargasApi.listarUsuariosResponsables(),
      ]);
      setTiposCarga(tipos || []);
      setUsuarios(usuariosResp || []);
    } catch {
      setTiposCarga([]);
      setUsuarios([]);
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
        estados: ESTADOS_HISTORIAL.join(','),
      };
      if (tipoCargaId) params.tipoCargaId = tipoCargaId;
      if (estadoFilter) params.estados = estadoFilter;
      if (usuarioFilter) params.usuarioId = usuarioFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (fechaDesde) params.fechaDesde = `${fechaDesde}T00:00:00`;
      if (fechaHasta) params.fechaHasta = `${fechaHasta}T23:59:59`;

      const data: PaginatedResponse = await cargasApi.listar(params);
      setCargas(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const getTipoCargaId = (filtro: string) => {
    const tipo = tiposCarga.find((t) => TIPO_CODIGO_A_FILTRO[t.codigo] === filtro);
    return tipo ? String(tipo.id) : '';
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setEstadoFilter('');
    setUsuarioFilter('');
    setFechaDesde('');
    setFechaHasta('');
    setCurrentPage(1);
  };

  const getEstadoColor = (codigo?: string) => {
    switch (codigo) {
      case 'PUBLICADA':
        return 'bg-green-100 text-green-800';
      case 'RECHAZADA':
        return 'bg-red-100 text-red-800';
      case 'CON_ERRORES':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (codigo?: string) => {
    switch (codigo) {
      case 'PUBLICADA':
        return 'Publicada';
      case 'RECHAZADA':
        return 'Rechazada';
      case 'CON_ERRORES':
        return 'Con Errores';
      default:
        return codigo || '-';
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-PE');
  };

  if (loading && cargas.length === 0) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Historial y Trazabilidad de Cargas' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Historial y Trazabilidad de Cargas' }]}>
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
    <MainLayout breadcrumbs={[{ label: 'Captura Digital', href: '/module2' }, { label: 'Historial y Trazabilidad de Cargas' }]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Historial y Trazabilidad de Cargas</h1>
            <p className="text-muted-foreground mt-1">Registro completo y trazabilidad de todas las cargas procesadas, validadas y publicadas</p>
          </div>
          <Button className="gap-2" disabled>
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <label className="text-xs text-muted-foreground mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Archivo, ID o usuario..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 border border-slate-300 bg-white rounded-md shadow-sm hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                  />
                </div>
              </div>

              <div className="w-40">
                <label className="text-xs text-muted-foreground mb-2 block">Tipo</label>
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

              <div className="w-40">
                <label className="text-xs text-muted-foreground mb-2 block">Estado</label>
                <Select value={estadoFilter || 'all'} onValueChange={(val) => {
                  setEstadoFilter(val === 'all' ? '' : val);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="border border-slate-300 bg-white rounded-md shadow-sm hover:border-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PUBLICADA">Publicada</SelectItem>
                    <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                    <SelectItem value="CON_ERRORES">Con Errores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-48">
                <label className="text-xs text-muted-foreground mb-2 block">Usuario Responsable</label>
                <Select value={usuarioFilter || 'all'} onValueChange={(val) => {
                  setUsuarioFilter(val === 'all' ? '' : val);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="border border-slate-300 bg-white rounded-md shadow-sm hover:border-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={String(usuario.id)}>
                        {usuario.nombreCompleto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-end gap-4 flex-wrap">
              <div className="w-40">
                <label className="text-xs text-muted-foreground mb-2 block">Fecha Desde</label>
                <Input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => {
                    setFechaDesde(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 bg-white rounded-md shadow-sm hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                />
              </div>

              <div className="w-40">
                <label className="text-xs text-muted-foreground mb-2 block">Fecha Hasta</label>
                <Input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => {
                    setFechaHasta(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 bg-white rounded-md shadow-sm hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">ID Carga</th>
                  <th className="text-left py-3 px-4 font-medium">Archivo</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-center py-3 px-4 font-medium">Registros</th>
                  <th className="text-left py-3 px-4 font-medium">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-center py-3 px-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cargas.length > 0 ? (
                  cargas.map((proceso) => (
                    <tr key={proceso.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 font-medium">{proceso.codigo}</td>
                      <td className="py-3 px-4 text-muted-foreground">{proceso.archivo?.nombreArchivo || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{getTipoNombre(proceso.tipoCarga?.codigo)}</td>
                      <td className="py-3 px-4 text-center font-medium">{proceso.totalRegistros}</td>
                      <td className="py-3 px-4 text-muted-foreground">{proceso.usuario?.nombreCompleto || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(proceso.createdAt)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(proceso.estadoCarga?.codigo)}`}>
                          {getEstadoLabel(proceso.estadoCarga?.codigo)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/module2/detalle/${proceso.id}`}>
                          <Button variant="ghost" size="sm">Ver</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 px-4 text-center text-muted-foreground">
                      No hay registros en el historial
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
        </Card>
      </div>
    </MainLayout>
  );
}
