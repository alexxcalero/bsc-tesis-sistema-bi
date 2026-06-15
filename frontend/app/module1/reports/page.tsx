'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { catalogosApi, reportesApi } from '@/lib/api';
import { Download, FileText, BarChart3, TrendingUp, Loader2 } from 'lucide-react';

interface Reporte {
  id: string;
  nombre: string;
  descripcion: string;
  filtros: string[];
  formato: string;
}

const iconMap: Record<string, typeof BarChart3> = {
  campanias: BarChart3,
  ofertas: TrendingUp,
  clientes: FileText,
};

export default function ReportsPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [productos, setProductos] = useState<{ id: number; nombre: string }[]>([]);
  const [periodos, setPeriodos] = useState<{ id: number; nombre: string }[]>([]);
  const [segmentos, setSegmentos] = useState<{ id: number; nombre: string }[]>([]);
  const [zonas, setZonas] = useState<{ id: number; nombre: string }[]>([]);
  const [agencias, setAgencias] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReportes();
    loadCatalogos();
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

  const loadCatalogos = async () => {
    try {
      const [productosRes, periodosRes, segmentosRes, zonasRes, agenciasRes] = await Promise.all([
        catalogosApi.listarProductos(),
        catalogosApi.listarPeriodos(),
        catalogosApi.listarSegmentos(),
        catalogosApi.listarZonas(),
        catalogosApi.listarAgencias(),
      ]);
      setProductos(productosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })));
      setPeriodos(periodosRes.map((p: any) => ({ id: p.id, nombre: p.nombre })));
      setSegmentos(segmentosRes.map((s: any) => ({ id: s.id, nombre: s.nombre })));
      setZonas(zonasRes.map((z: any) => ({ id: z.id, nombre: z.nombre })));
      setAgencias(agenciasRes.map((a: any) => ({ id: a.id, nombre: `${a.nombre} (${a.zona?.nombre || ''})` })));
    } catch (err) {
      console.error('Error cargando catálogos', err);
    }
  };

  const currentReport = reportes.find((r) => r.id === selectedReport);
  const Icon = currentReport ? iconMap[currentReport.id] || FileText : FileText;

  const handleFiltroChange = (key: string, value: string) => {
    setFiltros((prev) => ({ ...prev, [key]: value === 'all' ? '' : value }));
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) return;
    try {
      setLoading(true);
      setError('');
      const blob = await reportesApi.generar(selectedReport, filtros);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
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

  const renderFiltroInput = (filtro: string) => {
    if (filtro === 'periodoId') {
      return (
        <Select value={filtros[filtro] || 'all'} onValueChange={(val) => handleFiltroChange(filtro, val)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos los períodos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {periodos.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (filtro === 'productoId') {
      return (
        <Select value={filtros[filtro] || 'all'} onValueChange={(val) => handleFiltroChange(filtro, val)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos los productos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {productos.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (filtro === 'segmentoId') {
      return (
        <Select value={filtros[filtro] || 'all'} onValueChange={(val) => handleFiltroChange(filtro, val)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos los segmentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {segmentos.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (filtro === 'zonaId') {
      return (
        <Select value={filtros[filtro] || 'all'} onValueChange={(val) => handleFiltroChange(filtro, val)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las zonas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {zonas.map((z) => (
              <SelectItem key={z.id} value={String(z.id)}>{z.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (filtro === 'agenciaId') {
      return (
        <Select value={filtros[filtro] || 'all'} onValueChange={(val) => handleFiltroChange(filtro, val)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las agencias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {agencias.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (filtro === 'estado') {
      return (
        <Select value={filtros[filtro] || 'all'} onValueChange={(val) => handleFiltroChange(filtro, val)}>
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
      );
    }
    return null;
  };

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
                {currentReport.filtros.map((filtro) => (
                  <div key={filtro}>
                    <label className="block text-sm font-medium text-foreground mb-2 capitalize">
                      {filtro.replace(/Id$/, '').replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderFiltroInput(filtro)}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleGenerateReport} className="gap-2" disabled={loading || !selectedReport}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {loading ? 'Generando...' : 'Generar y Descargar CSV'}
              </Button>
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
