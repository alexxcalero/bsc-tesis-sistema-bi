'use client';

import { MainLayout } from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReposicion } from '@/lib/reposicion-context';
import { Download, Trash2, X, AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ReposicionPage() {
  const { items, eliminar, limpiar, exportarCsv, cantidad } = useReposicion();

  return (
    <MainLayout breadcrumbs={[{ label: 'Módulo 1' }, { label: 'Reposición' }]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Reposición de Ofertas</h1>
          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">{cantidad} leads</p>
              <Button className="gap-2" onClick={exportarCsv}>
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
              <Button variant="destructive" className="gap-2" onClick={limpiar}>
                <X className="w-4 h-4" />
                Limpiar todo
              </Button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <RefreshCcw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              No hay leads para reponer
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Agrega leads desde las pantallas de Campañas Comerciales o Cliente 360
            </p>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">N° Documento</th>
                    <th className="text-left py-3 px-4 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium">Campaña</th>
                    <th className="text-right py-3 px-4 font-medium">Monto</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-center py-3 px-4 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 font-mono text-xs">{item.numeroDocumento}</td>
                      <td className="py-3 px-4 font-medium">
                        {item.primerNombre} {item.apellidoPaterno}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{item.campaniaCodigo}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        S/ {item.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">{item.estado}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => eliminar(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
