'use client';

import { MainLayout } from '@/components/main-layout';
import { KPICard } from '@/components/bi/kpi-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Zap, DollarSign, RotateCcw, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboardApi, catalogosApi } from '@/lib/api';

const COLORS = ['#D85C63', '#8B7EA8', '#6BA3B8', '#7FA89D'];

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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const resumen = await dashboardApi.getResumen();
      setData(resumen);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
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
          <Button variant="outline" size="sm" onClick={loadDashboard}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Indicadores Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard label="Cantidad de Campañas" value={data.kpis.totalCampanias} icon={<TrendingUp className="w-5 h-5" />} />
            <KPICard label="Cantidad de Clientes" value={data.kpis.totalClientes} icon={<Users className="w-5 h-5" />} />
            <KPICard label="Cantidad de Ofertas" value={data.kpis.totalOfertas} icon={<Zap className="w-5 h-5" />} />
            <KPICard label="Monto Total Ofertado" value={`$${(data.kpis.montoTotalOfertado / 1000000).toFixed(1)}M`} icon={<DollarSign className="w-5 h-5" />} />
            <KPICard label="Ticket Promedio" value={`$${(data.kpis.ticketPromedio / 1000).toFixed(1)}K`} icon={<DollarSign className="w-5 h-5" />} />
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataEvolucionMonto}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => `$${(Number(value) / 1000000).toFixed(1)}M`} />
                <Bar dataKey="valor" fill="#A16555" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ticket Promedio por Segmento</h3>
          {data.ticketPromedioPorSegmento?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.ticketPromedioPorSegmento}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="#A16555" strokeWidth={2} dot={{ fill: '#A16555', r: 5 }} name="Ticket Promedio" />
              </LineChart>
            </ResponsiveContainer>
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
