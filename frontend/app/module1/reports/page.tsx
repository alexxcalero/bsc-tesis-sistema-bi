'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/main-layout';
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
import { catalogosApi, reportesApi, dashboardApi } from '@/lib/api';
import { createPdfDocument, addSummaryCards, addDataTable, savePdf, generateReportFromCsv } from '@/lib/pdf-export';
import { Download, FileText, BarChart3, TrendingUp, Loader2, FileDown } from 'lucide-react';

interface FiltroConfig {
  codigo: string;
  nombre: string;
  tipo: string;
  catalogoEndpoint?: string;
  orden: number;
}

interface Reporte {
  id: string;
  nombre: string;
  descripcion: string;
  formato: string;
  icono?: string;
  filtros: FiltroConfig[];
}

const iconMap: Record<string, typeof BarChart3> = {
  campanias: BarChart3,
  ofertas: TrendingUp,
  clientes: FileText,
};

const ESTADOS_CAMPANIA = [
  { value: 'ACTIVA', label: 'Activa' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'PLANIFICADA', label: 'Planificada' },
  { value: 'INACTIVA', label: 'Inactiva' },
];

export default function ReportsPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [catalogos, setCatalogos] = useState<Record<string, { id: number; nombre: string }[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReportes();
    loadCatalogosBase();
  }, []);

  const loadReportes = async () => {
    try {
      const data = await reportesApi.listar();
      setReportes(data);
      if (data.length > 0) setSelectedReport(data[0].id);
    } catch (err: any) {
      setError(err.message || 'Error al cargar reportes');
    }
  };

  const loadCatalogosBase = async () => {
    try {
      const [productosRes, periodosRes, segmentosRes, zonasRes, agenciasRes] = await Promise.all([
        catalogosApi.listarProductos(),
        catalogosApi.listarPeriodos(),
        catalogosApi.listarSegmentos(),
        catalogosApi.listarZonas(),
        catalogosApi.listarAgencias(),
      ]);
      setCatalogos({
        productos: productosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })),
        periodos: periodosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })),
        segmentos: segmentosRes.map((s: any) => ({ id: s.id, nombre: s.nombre })),
        zonas: zonasRes.map((z: any) => ({ id: z.id, nombre: z.nombre })),
        agencias: agenciasRes.map((a: any) => ({ id: a.id, nombre: `${a.nombre} (${a.zona?.nombre || ''})` })),
      });
    } catch (err) {
      console.error('Error cargando catálogos', err);
    }
  };

  const currentReport = reportes.find((r) => r.id === selectedReport);
  const Icon = currentReport ? iconMap[currentReport.id] || FileText : FileText;

  const handleFiltroChange = (key: string, value: string) => {
    setFiltros((prev) => ({ ...prev, [key]: value === 'all' ? '' : value }));
  };

  const buildCsvFilename = () => `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;

  const handleGenerateCsv = async () => {
    if (!selectedReport) return;
    try {
      setLoading(true);
      setError('');
      const blob = await reportesApi.generar(selectedReport, filtros, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = buildCsvFilename();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!selectedReport) return;
    try {
      setLoading(true);
      setError('');

      if (selectedReport === 'dashboard') {
        const data = await dashboardApi.getResumen(filtros);
        const doc = await createPdfDocument(currentReport?.nombre || 'Reporte', currentReport?.descripcion);

        addSummaryCards(doc, [
          { label: 'Campañas', value: (data.kpis?.totalCampanias || 0).toLocaleString() },
          { label: 'Clientes', value: (data.kpis?.totalClientes || 0).toLocaleString() },
          { label: 'Ofertas', value: (data.kpis?.totalOfertas || 0).toLocaleString() },
          { label: 'Monto Total', value: `$${((data.kpis?.montoTotalOfertado || 0) / 1000000).toFixed(1)}M` },
          { label: 'Ticket Promedio', value: `$${((data.kpis?.ticketPromedio || 0) / 1000).toFixed(1)}K` },
        ]);

        const productoRows = (data.campaniasPorProducto || []).map((item: any) => [item.label, item.valor]);
        addDataTable(doc, ['Producto', 'Cantidad'], productoRows as (string | number)[][], { title: 'Campañas por Producto' });

        const evolucionRows = (data.evolucionMonto || []).map((item: any) => [item.label, `$${((item.valor || 0) / 1000000).toFixed(1)}M`]);
        addDataTable(doc, ['Mes', 'Monto Ofertado'], evolucionRows as (string | number)[][], { title: 'Evolución Mensual de Monto' });

        const ticketRows = (data.ticketPromedioPorSegmento || []).map((item: any) => [item.label, `$${(item.valor || 0).toLocaleString()}`]);
        addDataTable(doc, ['Segmento', 'Ticket Promedio'], ticketRows as (string | number)[][], { title: 'Ticket Promedio por Segmento' });

        if (Object.keys(filtros).length > 0) {
          const finalY = (doc as any).pdfCurrentY || 42;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor('#4B5563');
          doc.text('Filtros Aplicados', 14, finalY + 10);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          let filterY = finalY + 16;
          Object.entries(filtros).forEach(([key, value]) => {
            if (value) doc.text(`${key}: ${value}`, 14, filterY);
            filterY += 5;
          });
          (doc as any).pdfCurrentY = filterY;
        }

        savePdf(doc, `${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const csvBlob = await reportesApi.generar(selectedReport, filtros, 'csv');
        const csvText = await csvBlob.text();
        await generateReportFromCsv(
          currentReport?.nombre || 'Reporte',
          currentReport?.descripcion,
          csvText,
          `${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`
        );
      }
    } catch (err: any) {
      setError(err.message || 'Error al generar PDF');
    } finally {
      setLoading(false);
    }
  };

  const renderFiltroInput = (filtro: FiltroConfig) => {
    const value = filtros[filtro.codigo] || '';

    if (filtro.tipo === 'select') {
      let items: { id: number; nombre: string }[] = [];
      const codeToCatalogo: Record<string, string> = {
        productoId: 'productos',
        periodoId: 'periodos',
        segmentoId: 'segmentos',
        zonaId: 'zonas',
        agenciaId: 'agencias',
      };
      const catalogoKey = filtro.catalogoEndpoint?.replace(/^\/catalogos\//, '').replace(/\/$/, '') || codeToCatalogo[filtro.codigo];
      if (catalogoKey && catalogos[catalogoKey]) {
        items = catalogos[catalogoKey];
      } else if (filtro.codigo === 'estado' || filtro.codigo === 'estadoCampania') {
        return (
          <Select value={value || 'all'} onValueChange={(val) => handleFiltroChange(filtro.codigo, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {ESTADOS_CAMPANIA.map((e) => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <Select value={value || 'all'} onValueChange={(val) => handleFiltroChange(filtro.codigo, val)}>
          <SelectTrigger>
            <SelectValue placeholder={`Todos los ${filtro.nombre.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {items.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>{item.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (filtro.tipo === 'date') {
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => handleFiltroChange(filtro.codigo, e.target.value)}
        />
      );
    }

    return (
      <Input
        type={filtro.tipo === 'number' ? 'number' : 'text'}
        placeholder={filtro.nombre}
        value={value}
        onChange={(e) => handleFiltroChange(filtro.codigo, e.target.value)}
      />
    );
  };

  const formatos = currentReport?.formato?.split(',').map((f) => f.trim()) || [];
  const showCsv = formatos.includes('csv');
  const showPdf = formatos.includes('pdf');

  return (
    <MainLayout breadcrumbs={[{ label: 'Reportes y Exportación' }]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes y Exportación</h1>
          <p className="text-muted-foreground mt-1">
            Genera reportes personalizados y exporta datos de campañas y clientes
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
            {error}
          </div>
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">Generador de Reportes</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Selecciona un Reporte</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportes.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                {currentReport?.descripcion}
              </p>
            </div>

            {currentReport && currentReport.filtros.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentReport.filtros
                  .sort((a, b) => a.orden - b.orden)
                  .map((filtro) => (
                    <div key={filtro.codigo}>
                      <Label className="block text-sm font-medium text-foreground mb-2">
                        {filtro.nombre}
                      </Label>
                      {renderFiltroInput(filtro)}
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              {showCsv && (
                <Button onClick={handleGenerateCsv} variant="outline" className="gap-2" disabled={loading || !selectedReport}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Descargar CSV
                </Button>
              )}
              {showPdf && (
                <Button onClick={handleGeneratePdf} className="gap-2" disabled={loading || !selectedReport}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  Descargar PDF
                </Button>
              )}
              {!showCsv && !showPdf && (
                <Button disabled className="gap-2">
                  <Download className="w-4 h-4" />
                  Formato no disponible
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">Reportes Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportes.map((report) => {
              const ReportIcon = iconMap[report.id] || FileText;
              return (
                <Card
                  key={report.id}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedReport === report.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <ReportIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{report.nombre}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{report.descripcion}</p>
                      <div className="flex gap-2 mt-3">
                        <span className="text-xs px-2 py-1 bg-secondary/30 rounded text-muted-foreground">
                          {report.formato}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
