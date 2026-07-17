'use client';

import { MainLayout } from '@/components/main-layout';
import { KPICard } from '@/components/bi/kpi-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, Users, Zap, DollarSign, RotateCcw, Loader2, Filter } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { dashboardApi, catalogosApi } from '@/lib/api';
import { PeriodoMultiSelect } from '@/components/bi/periodo-multi-select';
import { TabResumenEjecutivo } from '@/components/bi/tab-resumen-ejecutivo';
import { TabDetalleAnalitico } from '@/components/bi/tab-detalle-analitico';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

function formatMonto(valor: number): string {
  if (valor >= 1_000_000) return `$${(valor / 1_000_000).toFixed(1)}M`;
  if (valor >= 1_000) return `$${(valor / 1_000).toFixed(1)}K`;
  return `$${Math.round(valor).toLocaleString()}`;
}

interface SerieComparativa {
  periodo: string;
  label: string;
  valor: number;
}

interface DashboardData {
  kpis: {
    totalCampanias: number;
    totalClientes: number;
    totalOfertas: number;
    montoTotalOfertado: number;
    ticketPromedio: number;
    tasaConversion: number;
  };
  campaniasPorProducto: SerieComparativa[];
  evolucionMonto: SerieComparativa[];
  ticketPromedioPorSegmento: SerieComparativa[];
}

interface CatalogoItem {
  id: number;
  nombre: string;
}

const ESTADOS_CAMPANIA = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVA', label: 'Activa' },
  { value: 'INACTIVA', label: 'Inactiva' },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [productos, setProductos] = useState<CatalogoItem[]>([]);
  const [periodos, setPeriodos] = useState<CatalogoItem[]>([]);
  const [segmentos, setSegmentos] = useState<CatalogoItem[]>([]);

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [estadoCampania, setEstadoCampania] = useState('');
  const [productoId, setProductoId] = useState('');
  const [periodoIds, setPeriodoIds] = useState<string[]>([]);
  const [segmentoId, setSegmentoId] = useState('');
  const retryingRef = useRef(false);

  useEffect(() => {
    loadCatalogos();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [fechaDesde, fechaHasta, estadoCampania, productoId, periodoIds, segmentoId]);

  useEffect(() => {
    if (data && periodoIds.length > 0 && !retryingRef.current) {
      const hasData = data.kpis.totalCampanias > 0 || data.kpis.totalOfertas > 0;
      if (!hasData) {
        retryingRef.current = true;
        setPeriodoIds([]);
      }
    }
  }, [data]);

  const loadCatalogos = async () => {
    try {
      const [productosRes, periodosRes, segmentosRes] = await Promise.all([
        catalogosApi.listarProductos(),
        catalogosApi.listarPeriodosConCampanias(),
        catalogosApi.listarSegmentos(),
      ]);
      setProductos(productosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })));
      setPeriodos(periodosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })));
      setSegmentos(segmentosRes.map((s: any) => ({ id: s.id, nombre: s.nombre })));

      const latestPeriod = periodosRes[periodosRes.length - 1];
      if (latestPeriod) {
        setPeriodoIds([String(latestPeriod.id)]);
      } else {
        loadDashboard();
      }
    } catch (err: any) {
      console.error('Error cargando catálogos', err);
      loadDashboard();
    }
  };

  const buildParams = (): Record<string, string> => {
    const params: Record<string, string> = {};
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;
    if (estadoCampania) params.estadoCampania = estadoCampania;
    if (productoId) params.productoId = productoId;
    if (periodoIds.length > 0) params.periodoIds = periodoIds.join(',');
    if (segmentoId) params.segmentoId = segmentoId;
    return params;
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const resumen = await dashboardApi.getResumen(buildParams());
      setData(resumen);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFechaDesde('');
    setFechaHasta('');
    setEstadoCampania('');
    setProductoId('');
    setPeriodoIds([]);
    setSegmentoId('');
  };





  if (loading) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="p-6">
          <div className="text-red-600 mb-4">{error || 'No se pudieron cargar los datos'}</div>
          <Button onClick={loadDashboard} variant="outline">
            Reintentar
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadDashboard}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
            <Filter className="w-4 h-4" />
            Filtros
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-desde">Fecha desde</Label>
              <Input
                id="fecha-desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-hasta">Fecha hasta</Label>
              <Input
                id="fecha-hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado campaña</Label>
              <Select value={estadoCampania || 'all'} onValueChange={(val) => setEstadoCampania(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_CAMPANIA.map((e) => (
                    <SelectItem key={e.value || 'all'} value={e.value || 'all'}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Producto</Label>
              <Select value={productoId || 'all'} onValueChange={(val) => setProductoId(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
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
            <div className="space-y-2">
              <Label>Períodos</Label>
              <PeriodoMultiSelect
                periodos={periodos}
                selectedIds={periodoIds}
                onChange={setPeriodoIds}
              />
            </div>
            <div className="space-y-2">
              <Label>Segmento cliente</Label>
              <Select value={segmentoId || 'all'} onValueChange={(val) => setSegmentoId(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {segmentos.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
            <Button size="sm" onClick={loadDashboard}>
              Aplicar filtros
            </Button>
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Indicadores Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard label="Cantidad de Campañas" value={data.kpis.totalCampanias} icon={<TrendingUp className="w-5 h-5" />} />
            <KPICard label="Cantidad de Clientes" value={data.kpis.totalClientes} icon={<Users className="w-5 h-5" />} />
            <KPICard label="Cantidad de Ofertas" value={data.kpis.totalOfertas} icon={<Zap className="w-5 h-5" />} />
            <KPICard label="Monto Total Ofertado" value={formatMonto(data.kpis.montoTotalOfertado)} icon={<DollarSign className="w-5 h-5" />} />
            <KPICard label="Ticket Promedio" value={formatMonto(data.kpis.ticketPromedio)} icon={<DollarSign className="w-5 h-5" />} />
          </div>
        </div>

        <Tabs defaultValue="detalle-analitico">
          <TabsList>
            <TabsTrigger value="resumen">Resumen Ejecutivo</TabsTrigger>
            <TabsTrigger value="detalle-analitico">Detalle Analítico</TabsTrigger>
          </TabsList>
          <TabsContent value="resumen">
            <TabResumenEjecutivo data={data} />
          </TabsContent>
          <TabsContent value="detalle-analitico">
            <TabDetalleAnalitico data={data} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
