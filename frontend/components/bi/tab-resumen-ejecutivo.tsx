'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FileDown } from 'lucide-react';
import { createPdfDocument, addSummaryCards, addDataTable, savePdf } from '@/lib/pdf-export';

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

const PIE_COLORS = ['#D85C63', '#8B7EA8', '#6BA3B8', '#7FA89D', '#E8A87C', '#85C1E9', '#82E0AA', '#F1948A', '#BB8FCE', '#F0B27A'];
const LINE_COLOR = '#D85C63';
const BAR_COLOR = '#8B7EA8';

function formatMonto(valor: number): string {
  if (valor >= 1_000_000) return `$${(valor / 1_000_000).toFixed(1)}M`;
  if (valor >= 1_000) return `$${(valor / 1_000).toFixed(1)}K`;
  return `$${Math.round(valor).toLocaleString()}`;
}

function agruparPorLabel(data: SerieComparativa[]): { label: string; valor: number }[] {
  const map = new Map<string, number>();
  data.forEach(item => {
    map.set(item.label, (map.get(item.label) || 0) + item.valor);
  });
  return Array.from(map.entries()).map(([label, valor]) => ({ label, valor }));
}

function promedioPorLabel(data: SerieComparativa[]): { label: string; valor: number }[] {
  const sumMap = new Map<string, number>();
  const countMap = new Map<string, number>();
  data.forEach(item => {
    sumMap.set(item.label, (sumMap.get(item.label) || 0) + item.valor);
    countMap.set(item.label, (countMap.get(item.label) || 0) + 1);
  });
  return Array.from(sumMap.entries()).map(([label, sum]) => ({
    label,
    valor: Math.round(sum / (countMap.get(label) || 1)),
  }));
}

interface Props {
  data: DashboardData;
}

export function TabResumenEjecutivo({ data }: Props) {
  const prodData = agruparPorLabel(data.campaniasPorProducto || []);
  const evoData = agruparPorLabel(data.evolucionMonto || []);
  const tickData = promedioPorLabel(data.ticketPromedioPorSegmento || []);

  const handleExportPdf = async () => {
    if (!data) return;
    const doc = await createPdfDocument('Resumen Ejecutivo', 'Dashboard - Vista Resumen');

    addSummaryCards(doc, [
      { label: 'Campañas', value: data.kpis.totalCampanias.toLocaleString() },
      { label: 'Clientes', value: data.kpis.totalClientes.toLocaleString() },
      { label: 'Ofertas', value: data.kpis.totalOfertas.toLocaleString() },
      { label: 'Monto Total', value: formatMonto(data.kpis.montoTotalOfertado) },
      { label: 'Ticket Promedio', value: formatMonto(data.kpis.ticketPromedio) },
    ]);

    const productoRows = prodData.map((item) => [item.label, item.valor]);
    addDataTable(doc, ['Producto', 'Cantidad de Campañas'], productoRows as (string | number)[][], {
      title: 'Campañas por Producto',
    });

    const evolucionRows = evoData.map((item) => [item.label, formatMonto(item.valor)]);
    addDataTable(doc, ['Período', 'Monto Ofertado'], evolucionRows as (string | number)[][], {
      title: 'Evolución de Monto',
    });

    const ticketRows = tickData.map((item) => [item.label, formatMonto(item.valor)]);
    addDataTable(doc, ['Segmento', 'Ticket Promedio'], ticketRows as (string | number)[][], {
      title: 'Ticket Promedio por Segmento',
    });

    savePdf(doc, `resumen_ejecutivo_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPdf}>
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Campañas por Producto</h3>
          {prodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={prodData}
                  dataKey="valor"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                >
                  {prodData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => Number(value).toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Evolución de Monto</h3>
          {evoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={evoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatMonto(Number(value))} />
                <Bar dataKey="valor" fill={BAR_COLOR} radius={[4, 4, 0, 0]} name="Monto" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ticket Promedio por Segmento</h3>
          {tickData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={tickData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatMonto(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke={LINE_COLOR} strokeWidth={2} name="Ticket Promedio" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
