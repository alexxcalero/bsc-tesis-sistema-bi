'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/bi/status-badge';
import { Input } from '@/components/ui/input';
import { campaniasApi, catalogosApi } from '@/lib/api';
import { Search, Filter, ChevronRight, RotateCcw, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Campania {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: string;
  periodo?: { id: number; codigo: string; nombre: string };
  producto?: { id: number; codigo: string; nombre: string };
}

export default function CampaignsPage() {
  const [campanias, setCampanias] = useState<Campania[]>([]);
  const [productos, setProductos] = useState<{ id: number; nombre: string }[]>([]);
  const [periodos, setPeriodos] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [productoFilter, setProductoFilter] = useState<string>('');
  const [periodoFilter, setPeriodoFilter] = useState<string>('');

  useEffect(() => {
    loadCatalogos();
    loadCampanias();
  }, []);

  const loadCatalogos = async () => {
    try {
      const [productosRes, periodosRes] = await Promise.all([
        catalogosApi.listarProductos(),
        catalogosApi.listarPeriodos(),
      ]);
      setProductos(productosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })));
      setPeriodos(periodosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })));
    } catch (err: any) {
      console.error('Error cargando catálogos', err);
    }
  };

  const loadCampanias = async () => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string> = {};
      if (searchTerm) params.nombre = searchTerm;
      if (statusFilter) params.estado = statusFilter;
      if (productoFilter) params.productoId = productoFilter;
      if (periodoFilter) params.periodoId = periodoFilter;

      const response = await campaniasApi.listar(params);
      setCampanias(response.content || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar campañas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCampanias();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setProductoFilter('');
    setPeriodoFilter('');
    loadCampanias();
  };

  const getEstadoStatus = (estado: string): 'active' | 'inactive' | 'completed' | 'pending' => {
    if (estado === 'ACTIVA') return 'active';
    if (estado === 'COMPLETADA') return 'completed';
    if (estado === 'PLANIFICADA') return 'pending';
    return 'inactive';
  };

  const totalCampanias = campanias.length;
  const activeCampanias = campanias.filter((c) => c.estado === 'ACTIVA').length;

  return (
    <MainLayout breadcrumbs={[{ label: 'Campañas Comerciales' }]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campañas Comerciales</h1>
            <p className="text-muted-foreground mt-1">
              Gestión y seguimiento de todas las campañas activas y completadas
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filtros
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Búsqueda</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 border border-slate-300 bg-white rounded-md shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Período</label>
                <Select value={periodoFilter || 'all'} onValueChange={(val) => setPeriodoFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {periodos.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Producto</label>
                <Select value={productoFilter || 'all'} onValueChange={(val) => setProductoFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los productos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {productos.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Estado</label>
                <Select value={statusFilter || 'all'} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ACTIVA">Activa</SelectItem>
                    <SelectItem value="COMPLETADA">Completada</SelectItem>
                    <SelectItem value="PLANIFICADA">Planificada</SelectItem>
                    <SelectItem value="INACTIVA">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} className="w-full">Buscar</Button>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 w-fit" onClick={handleResetFilters}>
              <RotateCcw className="w-4 h-4" />
              Limpiar filtros
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total de Campañas</p>
              <p className="text-2xl font-bold text-foreground">{totalCampanias}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Campañas Activas</p>
              <p className="text-2xl font-bold text-foreground">{activeCampanias}</p>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground">
                    <th className="text-left py-4 px-4 font-medium">Código</th>
                    <th className="text-left py-4 px-4 font-medium">Nombre</th>
                    <th className="text-left py-4 px-4 font-medium">Producto</th>
                    <th className="text-left py-4 px-4 font-medium">Período</th>
                    <th className="text-left py-4 px-4 font-medium">Estado</th>
                    <th className="text-left py-4 px-4 font-medium">Fecha Inicio</th>
                    <th className="text-left py-4 px-4 font-medium">Fecha Fin</th>
                    <th className="text-center py-4 px-4 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {campanias.length > 0 ? (
                    campanias.map((campaign) => (
                      <tr key={campaign.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4 text-muted-foreground">
                          <span className="font-mono text-xs">{campaign.codigo}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-foreground">{campaign.nombre}</div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{campaign.producto?.nombre || 'N/A'}</td>
                        <td className="py-4 px-4 text-muted-foreground">{campaign.periodo?.nombre || 'N/A'}</td>
                        <td className="py-4 px-4">
                          <StatusBadge status={getEstadoStatus(campaign.estado)} />
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{campaign.fechaInicio || '-'}</td>
                        <td className="py-4 px-4 text-muted-foreground">{campaign.fechaFin || '-'}</td>
                        <td className="py-4 px-4 text-center">
                          <Link href={`/module1/campaigns/${campaign.id}`}>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 px-4 text-center text-muted-foreground">
                        No se encontraron campañas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
