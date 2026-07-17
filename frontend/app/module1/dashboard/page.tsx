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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Zap, DollarSign, RotateCcw, Loader2, Filter, FileDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboardApi, catalogosApi } from '@/lib/api';
import { createPdfDocument, addSummaryCards, addDataTable, savePdf } from '@/lib/pdf-export';

const COLORS = ['#D85C63', '#8B7EA8', '#6BA3B8', '#7FA89D'];

function formatMonto(valor: number): string {
  if (valor >= 1_000_000) return `$${(valor / 1_000_000).toFixed(1)}M`;
  if (valor >= 1_000) return `$${(valor / 1_000).toFixed(1)}K`;
  return `$${Math.round(valor).toLocaleString()}`;
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
  campaniasPorProducto: { label: string; valor: number }[];
  evolucionMonto: { label: string; valor: number }[];
  ticketPromedioPorSegmento: { label: string; valor: number }[];
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
  const [periodoId, setPeriodoId] = useState('');
  const [segmentoId, setSegmentoId] = useState('');

  useEffect(() => {
    loadCatalogos();
    loadDashboard();
  }, []);

  const loadCatalogos = async () => {
    try {
      const [productosRes, periodosRes, segmentosRes] = await Promise.all([
        catalogosApi.listarProductos(),
        catalogosApi.listarPeriodos(),
        catalogosApi.listarSegmentos(),
      ]);
      setProductos(productosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })));
      setPeriodos(periodosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })));
      setSegmentos(segmentosRes.map((s: any) => ({ id: s.id, nombre: s.nombre })));
    } catch (err: any) {
      console.error('Error cargando catálogos', err);
    }
  };

  const buildParams = (): Record<string, string> => {
    const params: Record<string, string> = {};
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;
    if (estadoCampania) params.estadoCampania = estadoCampania;
    if (productoId) params.productoId = productoId;
    if (periodoId) params.periodoId = periodoId;
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
    setPeriodoId('');
    setSegmentoId('');
  };

  const getFilterLabel = (key: string, value: string): string => {
    switch (key) {
      case 'estadoCampania':
        return ESTADOS_CAMPANIA.find((e) => e.value === value)?.label || value;
      case 'productoId':
        return productos.find((p) => String(p.id) === value)?.nombre || value;
      case 'periodoId':
        return periodos.find((p) => String(p.id) === value)?.nombre || value;
      case 'segmentoId':
        return segmentos.find((s) => String(s.id) === value)?.nombre || value;
      default:
        return value;
    }
  };

  const handleExportPdf = async () => {
    if (!data) return;
    const doc = await createPdfDocument('Resumen Ejecutivo', 'Dashboard de Campañas y Clientes');

    addSummaryCards(doc, [
      { label: 'Campañas', value: data.kpis.totalCampanias.toLocaleString() },
      { label: 'Clientes', value: data.kpis.totalClientes.toLocaleString() },
      { label: 'Ofertas', value: data.kpis.totalOfertas.toLocaleString() },
      { label: 'Monto Total', value: formatMonto(data.kpis.montoTotalOfertado) },
      { label: 'Ticket Promedio', value: formatMonto(data.kpis.ticketPromedio) },
    ]);

    const productoRows = (data.campaniasPorProducto || []).map((item) => [item.label, item.valor]);
    addDataTable(
      doc,
      ['Producto', 'Cantidad de Campañas'],
      productoRows as (string | number)[][],
      { title: 'Campañas por Producto' }
    );

    const evolucionRows = (data.evolucionMonto || []).map((item) => [item.label, formatMonto(item.valor)]);
    addDataTable(
      doc,
      ['Mes', 'Monto Ofertado'],
      evolucionRows as (string | number)[][],
      { title: 'Evolución Mensual de Monto Ofertado' }
    );

    const ticketRows = (data.ticketPromedioPorSegmento || []).map((item) => [
      item.label,
      `$${item.valor.toLocaleString()}`,
    ]);
    addDataTable(
      doc,
      ['Segmento', 'Ticket Promedio'],
      ticketRows as (string | number)[][],
      { title: 'Ticket Promedio por Segmento' }
    );

    const appliedFilters = buildParams();
    if (Object.keys(appliedFilters).length > 0) {
      const finalY = (doc as any).pdfCurrentY || 42;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor('#4B5563');
      doc.text('Filtros Aplicados', 14, finalY + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      let filterY = finalY + 16;
      Object.entries(appliedFilters).forEach(([key, value]) => {
        doc.text(`${key}: ${getFilterLabel(key, value)}`, 14, filterY);
        filterY += 5;
      });
      (doc as any).pdfCurrentY = filterY;
    }

    savePdf(doc, `resumen_ejecutivo_${new Date().toISOString().split('T')[0]}.pdf`);
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

  const chartDataEvolucionMonto = data.evolucionMonto?.length
    ? data.evolucionMonto
    : [
        { label: 'Dic 2024', valor: 0 },
        { label: 'Ene 2025', valor: 0 },
        { label: 'Feb 2025', valor: 0 },
      ];

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
              <Label>Periodo</Label>
              <Select value={periodoId || 'all'} onValueChange={(val) => setPeriodoId(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
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
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPdf}>
              <FileDown className="w-4 h-4" />
              Exportar PDF
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Campañas por Producto</h3>
            {data.campaniasPorProducto?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.campaniasPorProducto}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.label}`}
                    outerRadius={80}
                    dataKey="valor"
                  >
                    {data.campaniasPorProducto.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Evolución de Monto Ofertado</h3>
            <div id="chart-evolucion" style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartDataEvolucionMonto}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatMonto(Number(value))} />
                  <Bar dataKey="valor" fill="#A16555" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ticket Promedio por Segmento</h3>
          {data.ticketPromedioPorSegmento?.length > 0 ? (
            <div id="chart-ticket" style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.ticketPromedioPorSegmento}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatMonto(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="valor" stroke="#A16555" strokeWidth={2} dot={{ fill: '#A16555', r: 5 }} name="Ticket Promedio" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
