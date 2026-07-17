'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const PERIOD_COLORS = ['#D85C63', '#8B7EA8', '#6BA3B8', '#7FA89D', '#E8A87C', '#85C1E9', '#82E0AA', '#F1948A', '#BB8FCE', '#F0B27A', '#73C6B6', '#AED6F1'];

function formatMonto(valor: number): string {
  if (valor >= 1_000_000) return `$${(valor / 1_000_000).toFixed(1)}M`;
  if (valor >= 1_000) return `$${(valor / 1_000).toFixed(1)}K`;
  return `$${Math.round(valor).toLocaleString()}`;
}

function renderGroupedBars(rawData: SerieComparativa[], xKey: string) {
  const periodos = [...new Set(rawData.map(i => i.periodo))].filter(Boolean);
  const labels = [...new Set(rawData.map(i => i.label))];
  const chartData = labels.map(label => {
    const row: Record<string, any> = { [xKey]: label };
    periodos.forEach(p => {
      row[p] = rawData.find(i => i.label === label && i.periodo === p)?.valor ?? 0;
    });
    return row;
  });
  return { chartData, periodos };
}

interface Props {
  data: DashboardData;
}

export function TabDetalleAnalitico({ data }: Props) {
  const { chartData: prodData, periodos: prodPeriodos } = renderGroupedBars(data.campaniasPorProducto || [], 'producto');
  const { chartData: evoData, periodos: evoPeriodos } = renderGroupedBars(data.evolucionMonto || [], 'periodo');
  const { chartData: tickData, periodos: tickPeriodos } = renderGroupedBars(data.ticketPromedioPorSegmento || [], 'segmento');

  const handleExportPdf = async () => {
    if (!data) return;
    const doc = await createPdfDocument('Detalle Analítico', 'Dashboard - Vista Detalle');

    addSummaryCards(doc, [
      { label: 'Campañas', value: data.kpis.totalCampanias.toLocaleString() },
      { label: 'Clientes', value: data.kpis.totalClientes.toLocaleString() },
      { label: 'Ofertas', value: data.kpis.totalOfertas.toLocaleString() },
      { label: 'Monto Total', value: formatMonto(data.kpis.montoTotalOfertado) },
      { label: 'Ticket Promedio', value: formatMonto(data.kpis.ticketPromedio) },
    ]);

    const productoRows = (data.campaniasPorProducto || []).map((item) => [
      item.periodo,
      item.label,
      item.valor,
    ]);
    addDataTable(doc, ['Período', 'Producto', 'Cantidad de Campañas'], productoRows as (string | number)[][], {
      title: 'Campañas por Producto',
    });

    const evolucionRows = (data.evolucionMonto || []).map((item) => [
      item.label,
      formatMonto(item.valor),
    ]);
    addDataTable(doc, ['Período', 'Monto Ofertado'], evolucionRows as (string | number)[][], {
      title: 'Comparativa de Monto por Período',
    });

    const ticketRows = (data.ticketPromedioPorSegmento || []).map((item) => [
      item.periodo,
      item.label,
      formatMonto(item.valor),
    ]);
    addDataTable(doc, ['Período', 'Segmento', 'Ticket Promedio'], ticketRows as (string | number)[][], {
      title: 'Ticket Promedio por Segmento y Período',
    });

    savePdf(doc, `detalle_analitico_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPdf}>
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Campañas por Producto</h3>
          {prodData.length > 0 && prodPeriodos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="producto" />
                <YAxis />
                <Tooltip formatter={(value: any) => Number(value).toLocaleString()} />
                <Legend />
                {prodPeriodos.map((p, i) => (
                  <Bar key={p} dataKey={p} fill={PERIOD_COLORS[i % PERIOD_COLORS.length]} name={p} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Comparativa de Monto por Período</h3>
          {evoData.length > 0 && evoPeriodos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={evoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatMonto(Number(value))} />
                <Legend />
                {evoPeriodos.map((p, i) => (
                  <Bar key={p} dataKey={p} fill={PERIOD_COLORS[i % PERIOD_COLORS.length]} name={p} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ticket Promedio por Segmento</h3>
        {tickData.length > 0 && tickPeriodos.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tickData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="segmento" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatMonto(Number(value))} />
              <Legend />
              {tickPeriodos.map((p, i) => (
                <Bar key={p} dataKey={p} fill={PERIOD_COLORS[i % PERIOD_COLORS.length]} name={p} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No hay datos disponibles
          </div>
        )}
      </Card>
    </div>
  );
}
