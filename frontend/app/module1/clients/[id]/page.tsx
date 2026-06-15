'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/bi/status-badge';
import { clientesApi } from '@/lib/api';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
  campanias: any[];
  ofertas: any[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const clienteId = params.id as string;
  const [data, setData] = useState<Cliente360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCliente360();
  }, [clienteId]);

  const loadCliente360 = async () => {
    try {
      setLoading(true);
      const response = await clientesApi.detalle360(clienteId);
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cliente');
    } finally {
      setLoading(false);
    }
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

  const { cliente, campanias, ofertas } = data;

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
          <h3 className="text-lg font-semibold mb-4">Historial de Campañas ({campanias?.length || 0})</h3>
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
                {campanias?.length > 0 ? (
                  campanias.map((camp: any, idx: number) => (
                    <tr key={idx} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 font-medium">{camp.nombre}</td>
                      <td className="py-3 px-4 text-muted-foreground">{camp.producto?.nombre || 'N/A'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{camp.periodo?.nombre || 'N/A'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{camp.estado}</td>
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
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Historial de Ofertas ({ofertas?.length || 0})</h3>
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
                {ofertas?.length > 0 ? (
                  ofertas.map((oferta: any, idx: number) => (
                    <tr key={idx} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 font-medium">{oferta.campaniaNombre || oferta.campania?.nombre || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-medium">${Number(oferta.monto).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{oferta.tasa}%</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={oferta.estado === 'ACEPTADA' ? 'active' : 'pending'} label={oferta.estado} />
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
        </Card>
      </div>
    </MainLayout>
  );
}
