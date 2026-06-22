'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { auditoriasApi } from '@/lib/api';
import { DataTablePagination } from '@/components/bi/data-table-pagination';
import { Search, RotateCcw, Loader2, AlertCircle } from 'lucide-react';

interface AuditoriaItem {
  id: number;
  usuarioId?: number;
  username: string;
  rol: string;
  accion: string;
  entidad: string;
  entidadId?: string;
  detalle?: string;
  ipAddress?: string;
  userAgent?: string;
  fechaHora: string;
}

interface PaginatedResponse {
  content: AuditoriaItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const ACCIONES = [
  'CONSULTAR',
  'CREAR',
  'ACTUALIZAR',
  'ELIMINAR',
  'PUBLICAR',
  'VALIDAR',
  'RECALCULAR',
  'LOGIN_EXITOSO',
  'LOGIN_FALLIDO',
  'LOGOUT',
];

const ENTIDADES = [
  'SESION',
  'USUARIO',
  'CLIENTE',
  'CAMPANIA',
  'CARGA',
  'REPORTE',
  'DASHBOARD',
  'CATALOGO',
  'OFERTA',
];

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [usernameFilter, setUsernameFilter] = useState('');
  const [accionFilter, setAccionFilter] = useState('');
  const [entidadFilter, setEntidadFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    loadAuditoria(1);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      loadAuditoria(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [usernameFilter]);

  const buildFilters = (): Record<string, string> => {
    const params: Record<string, string> = {};
    if (usernameFilter) params.username = usernameFilter;
    if (accionFilter) params.accion = accionFilter;
    if (entidadFilter) params.entidad = entidadFilter;
    if (fechaDesde) params.fechaDesde = `${fechaDesde}T00:00:00`;
    if (fechaHasta) params.fechaHasta = `${fechaHasta}T23:59:59`;
    return params;
  };

  const loadAuditoria = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string> = {
        page: String(page - 1),
        size: String(pageSize),
        ...buildFilters(),
      };

      const data: PaginatedResponse = await auditoriasApi.listar(params);
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar auditoría');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setUsernameFilter('');
    setAccionFilter('');
    setEntidadFilter('');
    setFechaDesde('');
    setFechaHasta('');
    setCurrentPage(1);
    loadAuditoria(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAuditoria(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    loadAuditoria(1);
  };

  const handleAccionFilterChange = (val: string) => {
    setAccionFilter(val === 'all' ? '' : val);
    setCurrentPage(1);
    loadAuditoria(1);
  };

  const handleEntidadFilterChange = (val: string) => {
    setEntidadFilter(val === 'all' ? '' : val);
    setCurrentPage(1);
    loadAuditoria(1);
  };

  const handleFechaDesdeChange = (val: string) => {
    setFechaDesde(val);
    setCurrentPage(1);
    loadAuditoria(1);
  };

  const handleFechaHastaChange = (val: string) => {
    setFechaHasta(val);
    setCurrentPage(1);
    loadAuditoria(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-PE');
  };

  const getAccionBadgeVariant = (accion: string) => {
    if (accion === 'LOGIN_FALLIDO') return 'destructive';
    if (accion === 'LOGIN_EXITOSO' || accion === 'LOGOUT') return 'default';
    if (accion === 'CREAR') return 'default';
    if (accion === 'ACTUALIZAR') return 'secondary';
    if (accion === 'ELIMINAR') return 'destructive';
    return 'outline';
  };

  if (loading && logs.length === 0) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Administración', href: '/admin' }, { label: 'Auditoría' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout breadcrumbs={[{ label: 'Administración', href: '/admin' }, { label: 'Auditoría' }]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Auditoría</h1>
          <p className="text-muted-foreground mt-1">Registro completo de acciones realizadas en el sistema</p>
        </div>

        {error && (
          <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Usuario</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Username..."
                  value={usernameFilter}
                  onChange={(e) => setUsernameFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Acción</label>
              <Select value={accionFilter || 'all'} onValueChange={handleAccionFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {ACCIONES.map((accion) => (
                    <SelectItem key={accion} value={accion}>{accion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Entidad</label>
              <Select value={entidadFilter || 'all'} onValueChange={handleEntidadFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {ENTIDADES.map((entidad) => (
                    <SelectItem key={entidad} value={entidad}>{entidad}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Fecha Desde</label>
              <Input type="date" value={fechaDesde} onChange={(e) => handleFechaDesdeChange(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Fecha Hasta</label>
              <Input type="date" value={fechaHasta} onChange={(e) => handleFechaHastaChange(e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Limpiar filtros
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Fecha/Hora</th>
                  <th className="text-left py-3 px-4 font-medium">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium">Rol</th>
                  <th className="text-left py-3 px-4 font-medium">Acción</th>
                  <th className="text-left py-3 px-4 font-medium">Entidad</th>
                  <th className="text-left py-3 px-4 font-medium">ID Entidad</th>
                  <th className="text-left py-3 px-4 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 whitespace-nowrap text-muted-foreground text-xs">{formatDate(log.fechaHora)}</td>
                      <td className="py-3 px-4 font-medium">{log.username || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{log.rol || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getAccionBadgeVariant(log.accion)}>{log.accion}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{log.entidad || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{log.entidadId || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{log.ipAddress || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 px-4 text-center text-muted-foreground">
                      No se encontraron registros de auditoría
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
        </Card>
      </div>
    </MainLayout>
  );
}
