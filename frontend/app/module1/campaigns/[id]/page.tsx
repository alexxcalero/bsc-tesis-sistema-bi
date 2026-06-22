'use client';

import { MainLayout } from '@/components/main-layout';
import { KPICard } from '@/components/bi/kpi-card';
import { StatCard } from '@/components/bi/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/bi/status-badge';
import { DataTablePagination } from '@/components/bi/data-table-pagination';
import { campaniasApi } from '@/lib/api';
import { DollarSign, Users, Target, Search, RotateCcw, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface CampaniaDetalle {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: string;
  periodo?: { id: number; codigo: string; nombre: string };
  producto?: { id: number; codigo: string; nombre: string };
  subproducto?: { id: number; codigo: string; nombre: string };
}

interface OfertaItem {
  id: number;
  monto: number;
  tasa?: number;
  fechaOferta: string;
  estado: string;
  observacion?: string;
  clienteNombreCompleto: string;
  clienteId: number;
}

interface PaginatedResponse {
  content: OfertaItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface OfertaResumen {
  totalOfertas: number;
  clientesAlcanzados: number;
  montoTotalOfertado: number;
  ticketPromedio: number;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaniaDetalle | null>(null);
  const [ofertas, setOfertas] = useState<OfertaItem[]>([]);
  const [resumen, setResumen] = useState<OfertaResumen>({
    totalOfertas: 0,
    clientesAlcanzados: 0,
    montoTotalOfertado: 0,
    ticketPromedio: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const buildParams = (): Record<string, string> => {
    const params: Record<string, string> = {
      page: String(currentPage - 1),
      size: String(pageSize),
    };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    return params;
  };

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await campaniasApi.obtener(campaignId);
      setCampaign(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la campaña');
    } finally {
      setLoading(false);
    }
  };

  const loadOfertas = useCallback(async () => {
    if (!campaignId) return;
    try {
      const data: PaginatedResponse = await campaniasApi.listarOfertas(campaignId, buildParams());
      setOfertas(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Error cargando ofertas', err);
    }
  }, [campaignId, currentPage, pageSize, debouncedSearch]);

  const loadResumen = useCallback(async () => {
    if (!campaignId) return;
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const data: OfertaResumen = await campaniasApi.resumenOfertas(campaignId, params);
      setResumen(data);
    } catch {
      setResumen({ totalOfertas: 0, clientesAlcanzados: 0, montoTotalOfertado: 0, ticketPromedio: 0 });
    }
  }, [campaignId, debouncedSearch]);

  useEffect(() => {
    loadOfertas();
    loadResumen();
  }, [loadOfertas, loadResumen]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return `$${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getEstadoStatus = (estado: string): 'active' | 'inactive' | 'completed' | 'pending' => {
    if (estado === 'ACTIVA') return 'active';
    if (estado === 'COMPLETADA') return 'completed';
    if (estado === 'PLANIFICADA') return 'pending';
    return 'inactive';
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':
        return 'Activa';
      case 'COMPLETADA':
        return 'Completada';
      case 'PLANIFICADA':
        return 'Planificada';
      case 'INACTIVA':
        return 'Inactiva';
      default:
        return estado;
    }
  };

  const handleResetOfertasFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Campañas Comerciales', href: '/module1/campaigns' }, { label: 'Detalle de Campaña' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (error || !campaign) {
    return (
      <MainLayout breadcrumbs={[{ label: 'Campañas Comerciales', href: '/module1/campaigns' }, { label: 'Detalle de Campaña' }]}>
        <div className="p-6 text-center">
          <p className="text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error || 'Campaña no encontrada'}
          </p>
          <Link href="/module1/campaigns">
            <Button className="mt-4">Volver a Campañas</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      breadcrumbs={[
        { label: 'Campañas Comerciales', href: '/module1/campaigns' },
        { label: campaign.nombre },
      ]}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <Link href="/module1/campaigns">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver a Campañas
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{campaign.nombre}</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-1 rounded">
                {campaign.codigo}
              </span>
              <StatusBadge status={getEstadoStatus(campaign.estado)} label={getEstadoLabel(campaign.estado)} />
              <p className="text-muted-foreground">
                {formatDate(campaign.fechaInicio)} a {formatDate(campaign.fechaFin)}
              </p>
            </div>
            <p className="text-muted-foreground mt-3 max-w-2xl">{campaign.descripcion || 'Sin descripción'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Clientes Alcanzados"
            value={resumen.clientesAlcanzados.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
          />
          <KPICard
            label="Total de Ofertas"
            value={resumen.totalOfertas.toLocaleString()}
            icon={<Target className="w-5 h-5" />}
          />
          <KPICard
            label="Monto Total Ofertado"
            value={formatCurrency(resumen.montoTotalOfertado)}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <KPICard
            label="Ticket Promedio"
            value={formatCurrency(resumen.ticketPromedio)}
            icon={<DollarSign className="w-5 h-5" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Producto Principal"
            value={campaign.producto?.nombre || 'N/A'}
            description={campaign.subproducto?.nombre || 'Múltiples subproductos'}
            variant="default"
          />
          <StatCard
            title="Período"
            value={campaign.periodo?.nombre || 'N/A'}
            description={`${formatDate(campaign.fechaInicio)} - ${formatDate(campaign.fechaFin)}`}
            variant="default"
          />
          <StatCard
            title="Ticket Promedio"
            value={formatCurrency(resumen.ticketPromedio)}
            description={`Total: ${formatCurrency(resumen.montoTotalOfertado)}`}
            variant="default"
          />
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Ofertas Asociadas</h3>
            <p className="text-sm text-muted-foreground">{totalElements} ofertas</p>
          </div>

          <div className="mb-6 p-4 bg-secondary/20 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Buscar por Nombre o Documento</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Nombre del cliente o número de documento..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 border border-slate-300 bg-white rounded-md shadow-sm hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-fit mt-4"
              onClick={handleResetOfertasFilters}
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar filtros
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium">Producto</th>
                  <th className="text-left py-3 px-4 font-medium">Subproducto</th>
                  <th className="text-right py-3 px-4 font-medium">Monto</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-left py-3 px-4 font-medium">Fecha</th>
                  <th className="text-center py-3 px-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {ofertas.length > 0 ? (
                  ofertas.map((oferta) => (
                    <tr key={oferta.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 font-medium">{oferta.clienteNombreCompleto}</td>
                      <td className="py-3 px-4 text-muted-foreground">{campaign.producto?.nombre || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{campaign.subproducto?.nombre || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(oferta.monto)}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={getEstadoStatus(oferta.estado)} label={getEstadoLabel(oferta.estado)} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{formatDate(oferta.fechaOferta)}</td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/module1/clients/${oferta.clienteId}`}>
                          <Button variant="ghost" size="sm">
                            Ver 360
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 px-4 text-center text-muted-foreground">
                      No hay ofertas que coincidan con los filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={currentPage}
            pageCount={totalPages}
            totalItems={totalElements}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
