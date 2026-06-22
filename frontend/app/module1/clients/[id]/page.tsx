'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/bi/status-badge';
import { DataTablePagination } from '@/components/bi/data-table-pagination';
import { clientesApi, catalogosApi } from '@/lib/api';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Cliente360 {
  cliente: {
    id: number;
    nombreCompleto: string;
    primerNombre: string;
    tipoDocumento?: { nombre: string };
    numeroDocumento: string;
    correo?: string;
    telefono?: string;
    segmento?: { nombre: string };
    zona?: { nombre: string };
    agencia?: { nombre: string };
    tipoCliente?: { nombre: string };
  };
}

interface CampaniaItem {
  id: number;
  codigo: string;
  nombre: string;
  estado: string;
  periodo?: { id: number; nombre: string };
  producto?: { id: number; nombre: string };
}

interface OfertaItem {
  id: number;
  monto: number;
  tasa?: number;
  fechaOferta: string;
  estado: string;
  campaniaNombre?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export default function ClientDetailPage() {
  const params = useParams();
  const clienteId = params.id as string;

  const [data, setData] = useState<Cliente360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [periodos, setPeriodos] = useState<{ id: number; nombre: string }[]>([]);
  const [productos, setProductos] = useState<{ id: number; nombre: string }[]>([]);

  const [campanias, setCampanias] = useState<CampaniaItem[]>([]);
  const [campaniaPage, setCampaniaPage] = useState(1);
  const [campaniaPageSize, setCampaniaPageSize] = useState(5);
  const [campaniaTotalElements, setCampaniaTotalElements] = useState(0);
  const [campaniaTotalPages, setCampaniaTotalPages] = useState(0);
  const [campaniaEstadoFilter, setCampaniaEstadoFilter] = useState('');
  const [campaniaPeriodoFilter, setCampaniaPeriodoFilter] = useState('');
  const [campaniaProductoFilter, setCampaniaProductoFilter] = useState('');

  const [ofertas, setOfertas] = useState<OfertaItem[]>([]);
  const [ofertaPage, setOfertaPage] = useState(1);
  const [ofertaPageSize, setOfertaPageSize] = useState(5);
  const [ofertaTotalElements, setOfertaTotalElements] = useState(0);
  const [ofertaTotalPages, setOfertaTotalPages] = useState(0);
  const [ofertaEstadoFilter, setOfertaEstadoFilter] = useState('');
  const [ofertaMontoDesde, setOfertaMontoDesde] = useState('');
  const [ofertaMontoHasta, setOfertaMontoHasta] = useState('');

  useEffect(() => {
    loadCliente360();
    loadCatalogos();
  }, [clienteId]);

  const loadCatalogos = async () => {
    try {
      const [periodosRes, productosRes] = await Promise.all([
        catalogosApi.listarPeriodos(),
        catalogosApi.listarProductos(),
      ]);
      setPeriodos(periodosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })));
      setProductos(productosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })));
    } catch {
      setPeriodos([]);
      setProductos([]);
    }
  };

  const loadCliente360 = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientesApi.detalle360(clienteId);
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cliente');
    } finally {
      setLoading(false);
    }
  };

  const buildCampaniaParams = (): Record<string, string> => {
    const params: Record<string, string> = {
      page: String(campaniaPage - 1),
      size: String(campaniaPageSize),
    };
    if (campaniaEstadoFilter) params.estado = campaniaEstadoFilter;
    if (campaniaPeriodoFilter) params.periodoId = campaniaPeriodoFilter;
    if (campaniaProductoFilter) params.productoId = campaniaProductoFilter;
    return params;
  };

  const loadCampanias = useCallback(async () => {
    try {
      const response: PaginatedResponse<CampaniaItem> = await clientesApi.listarCampanias(clienteId, buildCampaniaParams());
      setCampanias(response.content || []);
      setCampaniaTotalElements(response.totalElements || 0);
      setCampaniaTotalPages(response.totalPages || 0);
    } catch (err: any) {
      console.error('Error cargando campañas', err);
    }
  }, [clienteId, campaniaPage, campaniaPageSize, campaniaEstadoFilter, campaniaPeriodoFilter, campaniaProductoFilter]);

  const buildOfertaParams = (): Record<string, string> => {
    const params: Record<string, string> = {
      page: String(ofertaPage - 1),
      size: String(ofertaPageSize),
    };
    if (ofertaEstadoFilter) params.estado = ofertaEstadoFilter;
    if (ofertaMontoDesde) params.montoDesde = ofertaMontoDesde;
    if (ofertaMontoHasta) params.montoHasta = ofertaMontoHasta;
    return params;
  };

  const loadOfertas = useCallback(async () => {
    try {
      const response: PaginatedResponse<OfertaItem> = await clientesApi.listarOfertas(clienteId, buildOfertaParams());
      setOfertas(response.content || []);
      setOfertaTotalElements(response.totalElements || 0);
      setOfertaTotalPages(response.totalPages || 0);
    } catch (err: any) {
      console.error('Error cargando ofertas', err);
    }
  }, [clienteId, ofertaPage, ofertaPageSize, ofertaEstadoFilter, ofertaMontoDesde, ofertaMontoHasta]);

  useEffect(() => {
    if (!clienteId) return;
    loadCampanias();
  }, [loadCampanias]);

  useEffect(() => {
    if (!clienteId) return;
    loadOfertas();
  }, [loadOfertas]);

  const resetCampaniaFilters = () => {
    setCampaniaEstadoFilter('');
    setCampaniaPeriodoFilter('');
    setCampaniaProductoFilter('');
    setCampaniaPage(1);
  };

  const resetOfertaFilters = () => {
    setOfertaEstadoFilter('');
    setOfertaMontoDesde('');
    setOfertaMontoHasta('');
    setOfertaPage(1);
  };

  const getEstadoStatus = (estado: string): 'active' | 'inactive' | 'completed' | 'pending' => {
    if (estado === 'ACTIVA' || estado === 'ACEPTADA') return 'active';
    if (estado === 'COMPLETADA') return 'completed';
    if (estado === 'PLANIFICADA' || estado === 'PENDIENTE') return 'pending';
    return 'inactive';
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return `$${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Cliente 360', href: '/module1/clients' }, { label: 'Cargando...' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Cliente 360', href: '/module1/clients' }, { label: 'Error' }]}>
        <div className="p-6 text-center">
          <p className="text-red-600">{error || 'Cliente no encontrado'}</p>
          <Link href="/module1/clients">
            <Button className="mt-4">Volver a Clientes</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const { cliente } = data;

  return (
    <MainLayout breadcrumbs={[{ label: 'Cliente 360', href: '/module1/clients' }, { label: cliente.nombreCompleto }]}>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <Link href="/module1/clients">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{cliente.nombreCompleto}</h1>
            <div className="flex items-center gap-4 mt-3">
              <StatusBadge status="active" />
              <p className="text-muted-foreground">{cliente.tipoCliente?.nombre || 'N/A'}</p>
              <p className="text-muted-foreground">ID: {cliente.id}</p>
            </div>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Exportar 360
          </Button>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Cliente</p>
              <p className="text-lg font-semibold text-foreground">{cliente.tipoCliente?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Documento</p>
              <p className="text-lg font-semibold text-foreground">{cliente.tipoDocumento?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Número de Documento</p>
              <p className="text-lg font-semibold text-foreground font-mono">{cliente.numeroDocumento}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Segmento</p>
              <p className="text-lg font-semibold text-foreground">{cliente.segmento?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Correo Electrónico</p>
              <p className="text-lg font-semibold text-foreground text-sm">{cliente.correo || 'No disponible'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="text-lg font-semibold text-foreground">{cliente.telefono || 'No disponible'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zona</p>
              <p className="text-lg font-semibold text-foreground">{cliente.zona?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Agencia</p>
              <p className="text-lg font-semibold text-foreground">{cliente.agencia?.nombre || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Historial de Campañas</h3>
            <p className="text-sm text-muted-foreground">{campaniaTotalElements} campañas</p>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={campaniaEstadoFilter || 'all'} onValueChange={(val) => {
              setCampaniaEstadoFilter(val === 'all' ? '' : val);
              setCampaniaPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ACTIVA">Activa</SelectItem>
                <SelectItem value="COMPLETADA">Completada</SelectItem>
                <SelectItem value="PLANIFICADA">Planificada</SelectItem>
                <SelectItem value="INACTIVA">Inactiva</SelectItem>
              </SelectContent>
            </Select>

            <Select value={campaniaPeriodoFilter || 'all'} onValueChange={(val) => {
              setCampaniaPeriodoFilter(val === 'all' ? '' : val);
              setCampaniaPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {periodos.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={campaniaProductoFilter || 'all'} onValueChange={(val) => {
              setCampaniaProductoFilter(val === 'all' ? '' : val);
              setCampaniaPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Producto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {productos.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={resetCampaniaFilters}>Limpiar</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Campaña</th>
                  <th className="text-left py-3 px-4 font-medium">Producto</th>
                  <th className="text-left py-3 px-4 font-medium">Período</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {campanias.length > 0 ? (
                  campanias.map((camp) => (
                    <tr key={camp.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 font-medium">{camp.nombre}</td>
                      <td className="py-3 px-4 text-muted-foreground">{camp.producto?.nombre || 'N/A'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{camp.periodo?.nombre || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={getEstadoStatus(camp.estado)} label={camp.estado} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">No hay campañas registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={campaniaPage}
            pageCount={campaniaTotalPages}
            totalItems={campaniaTotalElements}
            pageSize={campaniaPageSize}
            onPageChange={setCampaniaPage}
            onPageSizeChange={(size) => {
              setCampaniaPageSize(size);
              setCampaniaPage(1);
            }}
          />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Historial de Ofertas</h3>
            <p className="text-sm text-muted-foreground">{ofertaTotalElements} ofertas</p>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={ofertaEstadoFilter || 'all'} onValueChange={(val) => {
              setOfertaEstadoFilter(val === 'all' ? '' : val);
              setOfertaPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ACTIVA">Activa</SelectItem>
                <SelectItem value="ACEPTADA">Aceptada</SelectItem>
                <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                <SelectItem value="VENCIDA">Vencida</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Monto desde"
              value={ofertaMontoDesde}
              onChange={(e) => {
                setOfertaMontoDesde(e.target.value);
                setOfertaPage(1);
              }}
            />

            <Input
              type="number"
              placeholder="Monto hasta"
              value={ofertaMontoHasta}
              onChange={(e) => {
                setOfertaMontoHasta(e.target.value);
                setOfertaPage(1);
              }}
            />

            <Button variant="outline" size="sm" onClick={resetOfertaFilters}>Limpiar</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Campaña</th>
                  <th className="text-right py-3 px-4 font-medium">Monto</th>
                  <th className="text-right py-3 px-4 font-medium">Tasa</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-left py-3 px-4 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ofertas.length > 0 ? (
                  ofertas.map((oferta) => (
                    <tr key={oferta.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 font-medium">{oferta.campaniaNombre || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(oferta.monto)}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{oferta.tasa}%</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={getEstadoStatus(oferta.estado)} label={oferta.estado} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{oferta.fechaOferta}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">No hay ofertas registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={ofertaPage}
            pageCount={ofertaTotalPages}
            totalItems={ofertaTotalElements}
            pageSize={ofertaPageSize}
            onPageChange={setOfertaPage}
            onPageSizeChange={(size) => {
              setOfertaPageSize(size);
              setOfertaPage(1);
            }}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
