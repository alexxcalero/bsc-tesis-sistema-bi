export type TipoCliente = 'natural' | 'juridica';
export type EstadoCampaña = 'active' | 'inactive' | 'completed' | 'planned';
export type EstadoOferta = 'accepted' | 'rejected' | 'pending';
export type EstadoProcesoCarga = 'pendiente' | 'en_validacion' | 'validada' | 'con_errores' | 'publicada' | 'rechazada';
export type TipoCarga = 'campañas' | 'clientes' | 'ofertas';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  subproductos: Subproducto[];
}

export interface Subproducto {
  id: string;
  nombre: string;
  productoId: string;
}

export interface Campaña {
  id: string;
  codigo: string;
  nombre: string;
  productoId: string;
  subproductoId?: string;
  descripcion: string;
  estado: EstadoCampaña;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  clientesAlcanzados: number;
  clientesConvertidos: number;
  montoOfertado: number;
  ofertasAceptadas: number;
  ticketPromedio: number;
  tazaConversion: number;
  ingresos: number;
}

export interface Oferta {
  id: string;
  clienteId: string;
  campañaId: string;
  productoId: string;
  subproductoId: string;
  monto: number;
  estado: EstadoOferta;
  fecha: string;
  periodo: string;
}

export interface HistorialOferta {
  periodo: string;
  montoOfertado: number;
  montoAceptado: number;
  montoRechazado: number;
  cantidad: number;
}

export interface Cliente {
  id: string;
  nombre: string;
  tipoCliente: TipoCliente;
  tipoDocumento: string;
  numeroDocumento: string;
  email?: string;
  telefono?: string;
  segmento: string;
  estado: 'active' | 'inactive';
  campaignaOrigen: {
    id: string;
    nombre: string;
    producto: string;
    periodo: string;
    fechaContacto: string;
  };
  historialCampaignas: Array<{
    id: string;
    nombre: string;
    producto: string;
    periodo: string;
    estado: EstadoCampaña;
    fecha: string;
  }>;
  historialOfertas: Array<{
    id: string;
    producto: string;
    subproducto: string;
    monto: number;
    estado: EstadoOferta;
    fecha: string;
  }>;
  productosSubproductosOfertados: Array<{
    productoId: string;
    productoNombre: string;
    subproductos: Array<{
      id: string;
      nombre: string;
      estado: 'vigente' | 'vencido';
    }>;
  }>;
  montosPerPeriodo: Array<{
    periodo: string;
    montoOfertado: number;
    montoAceptado: number;
    montoRechazado: number;
  }>;
}

export interface EventoProcesoCarga {
  id: string;
  fecha: string;
  hora: string;
  evento: string;
  estado: 'completado' | 'en_progreso' | 'error';
  detalle: string;
}

export interface ErrorValidacion {
  id: string;
  fila: number;
  campo: string;
  tipoError: 'estructura' | 'formato' | 'duplicado' | 'negocio';
  descripcion: string;
  valor: string;
}

export interface ProcesoCarga {
  id: string;
  idCarga: string;
  nombreArchivo: string;
  tipoCarga: TipoCarga;
  periodo: string;
  usuarioResponsable: string;
  fechaCarga: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: EstadoProcesoCarga;
  registrosProcesados: number;
  registrosValidos: number;
  registrosConError: number;
  tamanoArchivo: string;
  eventos: EventoProcesoCarga[];
  errores: ErrorValidacion[];
  observaciones?: string;
  impacto?: {
    campanasActualizar: number;
    clientesActualizar: number;
    ofertasActualizar: number;
  };
}

// Mock Products
export const mockProductos: Producto[] = [
  {
    id: 'prod-001',
    nombre: 'Crédito Personal',
    descripcion: 'Créditos personales para diversos propósitos',
    subproductos: [
      { id: 'subprod-001', nombre: 'Crédito Personal Estándar', productoId: 'prod-001' },
      { id: 'subprod-002', nombre: 'Crédito Personal Rápido', productoId: 'prod-001' },
      { id: 'subprod-003', nombre: 'Crédito Personal Premium', productoId: 'prod-001' },
    ],
  },
  {
    id: 'prod-002',
    nombre: 'Depósitos',
    descripcion: 'Productos de ahorro y depósitos',
    subproductos: [
      { id: 'subprod-004', nombre: 'Cuenta de Ahorros', productoId: 'prod-002' },
      { id: 'subprod-005', nombre: 'Depósito a Plazo', productoId: 'prod-002' },
      { id: 'subprod-006', nombre: 'Cuenta Corriente', productoId: 'prod-002' },
    ],
  },
  {
    id: 'prod-003',
    nombre: 'Crédito Automotriz',
    descripcion: 'Financiamiento para compra de vehículos',
    subproductos: [
      { id: 'subprod-007', nombre: 'Crédito Auto Nuevo', productoId: 'prod-003' },
      { id: 'subprod-008', nombre: 'Crédito Auto Usado', productoId: 'prod-003' },
    ],
  },
  {
    id: 'prod-004',
    nombre: 'Crédito Hipotecario',
    descripcion: 'Financiamiento inmobiliario',
    subproductos: [
      { id: 'subprod-009', nombre: 'Hipoteca Tasa Fija', productoId: 'prod-004' },
      { id: 'subprod-010', nombre: 'Hipoteca Tasa Variable', productoId: 'prod-004' },
    ],
  },
];

// Mock Campaigns - sin campo segmento, acepta clientes de múltiples segmentos
export const mockCampaignas: Campaña[] = [
  {
    id: 'camp-001',
    codigo: 'CAMP-2025-CP-001',
    nombre: 'Crédito Personal Primavera 2025',
    productoId: 'prod-001',
    subproductoId: 'subprod-001',
    descripcion: 'Campaña de colocación de créditos personales estándar para diversos segmentos',
    estado: 'active',
    periodo: '2025-01',
    fechaInicio: '2025-01-01',
    fechaFin: '2025-03-31',
    clientesAlcanzados: 589,
    clientesConvertidos: 126,
    montoOfertado: 166000000,
    ofertasAceptadas: 126,
    ticketPromedio: 1317460,
    tazaConversion: 21.4,
    ingresos: 1575000,
  },
  {
    id: 'camp-002',
    codigo: 'CAMP-2025-DP-002',
    nombre: 'Depósitos a Plazo - Segmento Premium',
    productoId: 'prod-002',
    subproductoId: 'subprod-005',
    descripcion: 'Campaña de captación de depósitos a plazo fijo para múltiples segmentos',
    estado: 'active',
    periodo: '2025-01',
    fechaInicio: '2025-01-15',
    fechaFin: '2025-04-30',
    clientesAlcanzados: 234,
    clientesConvertidos: 47,
    montoOfertado: 145000000,
    ofertasAceptadas: 47,
    ticketPromedio: 3085106,
    tazaConversion: 20.1,
    ingresos: 2175000,
  },
  {
    id: 'camp-003',
    codigo: 'CAMP-2025-CA-003',
    nombre: 'Crédito Automotriz Q1 2025',
    productoId: 'prod-003',
    subproductoId: 'subprod-007',
    descripcion: 'Financiamiento de vehículos nuevos para clientes de diversos segmentos',
    estado: 'active',
    periodo: '2025-01',
    fechaInicio: '2025-01-01',
    fechaFin: '2025-03-31',
    clientesAlcanzados: 412,
    clientesConvertidos: 62,
    montoOfertado: 124000000,
    ofertasAceptadas: 62,
    ticketPromedio: 2000000,
    tazaConversion: 15.0,
    ingresos: 1860000,
  },
  {
    id: 'camp-004',
    codigo: 'CAMP-2025-CH-004',
    nombre: 'Hipotecario Año Nuevo',
    productoId: 'prod-004',
    subproductoId: 'subprod-009',
    descripcion: 'Promoción especial de hipotecas con tasa fija para clientes de alto potencial',
    estado: 'completed',
    periodo: '2024-12',
    fechaInicio: '2024-12-01',
    fechaFin: '2024-12-31',
    clientesAlcanzados: 89,
    clientesConvertidos: 8,
    montoOfertado: 52000000,
    ofertasAceptadas: 8,
    ticketPromedio: 6500000,
    tazaConversion: 9.0,
    ingresos: 1300000,
  },
  {
    id: 'camp-005',
    codigo: 'CAMP-2025-CP-FEB',
    nombre: 'Crédito Personal Verano 2025',
    productoId: 'prod-001',
    subproductoId: 'subprod-002',
    descripcion: 'Segunda ola de créditos personales rápidos para segmentos amplios',
    estado: 'active',
    periodo: '2025-02',
    fechaInicio: '2025-02-01',
    fechaFin: '2025-02-28',
    clientesAlcanzados: 445,
    clientesConvertidos: 89,
    montoOfertado: 89000000,
    ofertasAceptadas: 89,
    ticketPromedio: 1000000,
    tazaConversion: 20.0,
    ingresos: 900000,
  },
];

// Generate mock clients with proper distribution
function generateClientes(): Cliente[] {
  const segmentos = ['Regular', 'Premium', 'Beyond', 'Mass', 'Top of Mass'];
  const nombres = [
    'Juan García', 'María López', 'Carlos Rodríguez', 'Ana Martínez', 'Luis Fernández',
    'Rosa González', 'Miguel Sánchez', 'Laura Pérez', 'Diego Torres', 'Carmen Ruiz',
    'Francisco Moreno', 'Elena Jiménez', 'Andrés Gutiérrez', 'Isabel Ramírez', 'Roberto Cruz',
    'Sofía Vargas', 'Manuel Reyes', 'Beatriz Ortega', 'Javier Herrera', 'Victoria Cabrera',
    'Raúl Miranda', 'Marcela Silva', 'Eduardo Acosta', 'Catalina Medina', 'Ricardo Flores',
    'Alejandra Molina', 'Fernando Navarro', 'Constanza Rojas', 'Alfonso Castro', 'Daniela Parra',
    'Víctor Valenzuela', 'Karina Núñez', 'Héctor Espinoza', 'Paula Sepúlveda', 'Mateo Bravo',
    'Francisca Díaz', 'Gonzalo Iturra', 'Olivia Donoso', 'Ignacio Venegas', 'Camila Barría',
  ];
  
  const apellidos = [
    'López', 'García', 'Martínez', 'Rodríguez', 'González', 'Pérez', 'Sánchez', 'Ramírez',
    'Torres', 'Flores', 'Rivera', 'Cruz', 'Morales', 'Castillo', 'Vargas', 'Mendoza',
  ];

  const clientes: Cliente[] = [];
  let clienteId = 1;
  
  // Generar clientes para cada segmento
  segmentos.forEach((segmento) => {
    const countPerSegmento = segmento === 'Regular' ? 150 : 
                              segmento === 'Premium' ? 120 :
                              segmento === 'Beyond' ? 140 :
                              segmento === 'Mass' ? 80 :
                              60; // Top of Mass

    for (let i = 0; i < countPerSegmento; i++) {
      const tipoCliente = (Math.random() > 0.85) ? 'juridica' : 'natural';
      const nombre = `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
      const numeroDocumento = tipoCliente === 'natural' 
        ? `${Math.floor(Math.random() * 10000000)}-${Math.random() > 0.5 ? 'K' : Math.floor(Math.random() * 9)}`
        : `${Math.floor(Math.random() * 100000000)}-${Math.floor(Math.random() * 9)}`;

      // Permitir que el cliente se asocie a MÚLTIPLES campañas sin restricción de segmento
      const numCampanas = Math.floor(Math.random() * 3) + 1;
      const campanasSeleccionadas = [];
      for (let j = 0; j < numCampanas; j++) {
        const campanaAleatoria = mockCampaignas[Math.floor(Math.random() * mockCampaignas.length)];
        if (!campanasSeleccionadas.find(c => c.id === campanaAleatoria.id)) {
          campanasSeleccionadas.push(campanaAleatoria);
        }
      }

      const campaniaOrigen = campanasSeleccionadas[0] || mockCampaignas[0];
      
      const historialCampaignas = campanasSeleccionadas.map(c => ({
        id: c.id,
        nombre: c.nombre,
        producto: c.nombre.split(' ')[0],
        periodo: c.periodo,
        estado: c.estado,
        fecha: c.fechaInicio,
      }));

      const montosOfertas = [
        { periodo: '2024-11', monto: Math.floor(Math.random() * 30000000) + 5000000 },
        { periodo: '2024-12', monto: Math.floor(Math.random() * 40000000) + 10000000 },
        { periodo: '2025-01', monto: Math.floor(Math.random() * 50000000) + 15000000 },
        { periodo: '2025-02', monto: Math.floor(Math.random() * 45000000) + 12000000 },
      ];

      const historialOfertas = montosOfertas.flatMap(mo => 
        Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, idx) => ({
          id: `oft-${clienteId}-${idx}`,
          producto: historialCampaignas[idx % historialCampaignas.length]?.producto || 'Crédito Personal',
          subproducto: 'Subproducto ' + (idx + 1),
          monto: Math.floor(mo.monto / 3),
          estado: Math.random() > 0.6 ? 'accepted' : Math.random() > 0.5 ? 'rejected' : 'pending' as EstadoOferta,
          fecha: mo.periodo,
        }))
      );

      clientes.push({
        id: `cli-${String(clienteId).padStart(3, '0')}`,
        nombre: tipoCliente === 'juridica' ? `${nombre} S.A.` : nombre,
        tipoCliente,
        tipoDocumento: tipoCliente === 'natural' ? 'Cédula' : 'NIT',
        numeroDocumento,
        email: `cliente${clienteId}@email.com`,
        telefono: `+56 9 ${Math.floor(Math.random() * 90000000) + 10000000}`,
        segmento,
        estado: Math.random() > 0.15 ? 'active' : 'inactive',
        campaignaOrigen: {
          id: campaniaOrigen.id,
          nombre: campaniaOrigen.nombre,
          producto: campaniaOrigen.nombre,
          periodo: campaniaOrigen.periodo,
          fechaContacto: campaniaOrigen.fechaInicio,
        },
        historialCampaignas,
        historialOfertas,
        productosSubproductosOfertados: [],
        montosPerPeriodo: montosOfertas.map(mo => ({
          periodo: mo.periodo,
          montoOfertado: mo.monto,
          montoAceptado: Math.floor(mo.monto * 0.4),
          montoRechazado: Math.floor(mo.monto * 0.3),
        })),
      });

      clienteId++;
    }
  });

  return clientes;
}

export const mockClientes = generateClientes();

// Generate mock Procesos de Carga for Module 2
function generateProcesosCarga(): ProcesoCarga[] {
  const usuarios = ['Carlos Mendoza', 'Ana López', 'Roberto García', 'María Rodríguez', 'Juan Pérez'];
  const tipos: TipoCarga[] = ['campañas', 'clientes', 'ofertas'];
  
  const procesosCarga: ProcesoCarga[] = [
    {
      id: 'proc-001',
      idCarga: 'CARGA-2025-001',
      nombreArchivo: 'campañas_enero_2025.xlsx',
      tipoCarga: 'campañas',
      periodo: '2025-01',
      usuarioResponsable: 'Carlos Mendoza',
      fechaCarga: '2025-01-10',
      fechaInicio: '2025-01-10 09:30:00',
      fechaFin: '2025-01-10 09:45:32',
      estado: 'publicada',
      registrosProcesados: 156,
      registrosValidos: 156,
      registrosConError: 0,
      tamanoArchivo: '2.4 MB',
      eventos: [
        { id: 'evt-1', fecha: '2025-01-10', hora: '09:30:00', evento: 'Registro de carga', estado: 'completado', detalle: 'Archivo recibido y validado' },
        { id: 'evt-2', fecha: '2025-01-10', hora: '09:32:15', evento: 'Lectura de archivo', estado: 'completado', detalle: '156 registros leídos' },
        { id: 'evt-3', fecha: '2025-01-10', hora: '09:35:00', evento: 'Validación de estructura', estado: 'completado', detalle: 'Estructura válida' },
        { id: 'evt-4', fecha: '2025-01-10', hora: '09:40:00', evento: 'Validación de reglas de negocio', estado: 'completado', detalle: 'Todas las reglas cumplidas' },
        { id: 'evt-5', fecha: '2025-01-10', hora: '09:42:30', evento: 'Generación de resultado', estado: 'completado', detalle: 'Resultado generado exitosamente' },
        { id: 'evt-6', fecha: '2025-01-10', hora: '09:45:32', evento: 'Publicación', estado: 'completado', detalle: 'Datos publicados en base de datos' },
      ],
      errores: [],
      observaciones: 'Carga sin errores. 5 campañas nuevas creadas.',
      impacto: { campanasActualizar: 5, clientesActualizar: 0, ofertasActualizar: 0 },
    },
    {
      id: 'proc-002',
      idCarga: 'CARGA-2025-002',
      nombreArchivo: 'clientes_enero_2025.xlsx',
      tipoCarga: 'clientes',
      periodo: '2025-01',
      usuarioResponsable: 'Ana López',
      fechaCarga: '2025-01-12',
      fechaInicio: '2025-01-12 14:00:00',
      fechaFin: '2025-01-12 14:28:45',
      estado: 'publicada',
      registrosProcesados: 1245,
      registrosValidos: 1238,
      registrosConError: 7,
      tamanoArchivo: '8.7 MB',
      eventos: [
        { id: 'evt-7', fecha: '2025-01-12', hora: '14:00:00', evento: 'Registro de carga', estado: 'completado', detalle: 'Archivo recibido' },
        { id: 'evt-8', fecha: '2025-01-12', hora: '14:05:00', evento: 'Lectura de archivo', estado: 'completado', detalle: '1245 registros leídos' },
        { id: 'evt-9', fecha: '2025-01-12', hora: '14:10:00', evento: 'Validación de estructura', estado: 'completado', detalle: 'Estructura válida' },
        { id: 'evt-10', fecha: '2025-01-12', hora: '14:15:00', evento: 'Validación de reglas de negocio', estado: 'completado', detalle: '7 errores detectados' },
        { id: 'evt-11', fecha: '2025-01-12', hora: '14:20:00', evento: 'Generación de resultado', estado: 'completado', detalle: 'Reporte de errores generado' },
        { id: 'evt-12', fecha: '2025-01-12', hora: '14:28:45', evento: 'Publicación', estado: 'completado', detalle: '1238 registros publicados' },
      ],
      errores: [
        { id: 'err-1', fila: 45, campo: 'Email', tipoError: 'formato', descripcion: 'Formato de email inválido', valor: 'cliente@' },
        { id: 'err-2', fila: 120, campo: 'Teléfono', tipoError: 'formato', descripcion: 'Formato de teléfono incorrecto', valor: '123456' },
        { id: 'err-3', fila: 567, campo: 'NumeroDocumento', tipoError: 'duplicado', descripcion: 'Documento duplicado', valor: '12345678-9' },
        { id: 'err-4', fila: 890, campo: 'Segmento', tipoError: 'negocio', descripcion: 'Segmento no reconocido', valor: 'VIP' },
        { id: 'err-5', fila: 1023, campo: 'Email', tipoError: 'formato', descripcion: 'Formato de email inválido', valor: 'usuario@domain' },
        { id: 'err-6', fila: 1150, campo: 'TipoCliente', tipoError: 'estructura', descripcion: 'Campo requerido vacío', valor: '' },
        { id: 'err-7', fila: 1230, campo: 'Nombre', tipoError: 'estructura', descripcion: 'Campo requerido vacío', valor: '' },
      ],
      observaciones: '7 registros con error de validación. 1238 clientes nuevos y actualizados.',
      impacto: { campanasActualizar: 0, clientesActualizar: 1238, ofertasActualizar: 0 },
    },
    {
      id: 'proc-003',
      idCarga: 'CARGA-2025-003',
      nombreArchivo: 'ofertas_enero_2025.xlsx',
      tipoCarga: 'ofertas',
      periodo: '2025-01',
      usuarioResponsable: 'Roberto García',
      fechaCarga: '2025-01-15',
      fechaInicio: '2025-01-15 10:15:00',
      estado: 'con_errores',
      registrosProcesados: 3456,
      registrosValidos: 3200,
      registrosConError: 256,
      tamanoArchivo: '12.1 MB',
      eventos: [
        { id: 'evt-13', fecha: '2025-01-15', hora: '10:15:00', evento: 'Registro de carga', estado: 'completado', detalle: 'Archivo recibido' },
        { id: 'evt-14', fecha: '2025-01-15', hora: '10:20:00', evento: 'Lectura de archivo', estado: 'completado', detalle: '3456 registros leídos' },
        { id: 'evt-15', fecha: '2025-01-15', hora: '10:25:00', evento: 'Validación de estructura', estado: 'completado', detalle: 'Estructura válida' },
        { id: 'evt-16', fecha: '2025-01-15', hora: '10:35:00', evento: 'Validación de reglas de negocio', estado: 'error', detalle: '256 errores detectados' },
      ],
      errores: [
        { id: 'err-8', fila: 12, campo: 'Monto', tipoError: 'negocio', descripcion: 'Monto fuera de rango permitido', valor: '500000000' },
        { id: 'err-9', fila: 45, campo: 'ClienteID', tipoError: 'negocio', descripcion: 'Cliente no existe', valor: 'CLI-99999' },
        { id: 'err-10', fila: 78, campo: 'CampañaID', tipoError: 'negocio', descripcion: 'Campaña inactiva', valor: 'CAMP-2024-001' },
      ],
      observaciones: 'Requiere correcciones. 256 errores de validación detectados. Contactar especialista.',
      impacto: { campanasActualizar: 0, clientesActualizar: 0, ofertasActualizar: 3200 },
    },
    {
      id: 'proc-004',
      idCarga: 'CARGA-2025-004',
      nombreArchivo: 'campañas_febrero_2025.xlsx',
      tipoCarga: 'campañas',
      periodo: '2025-02',
      usuarioResponsable: 'María Rodríguez',
      fechaCarga: '2025-02-01',
      fechaInicio: '2025-02-01 08:00:00',
      estado: 'validada',
      registrosProcesados: 89,
      registrosValidos: 89,
      registrosConError: 0,
      tamanoArchivo: '1.2 MB',
      eventos: [
        { id: 'evt-17', fecha: '2025-02-01', hora: '08:00:00', evento: 'Registro de carga', estado: 'completado', detalle: 'Archivo recibido' },
        { id: 'evt-18', fecha: '2025-02-01', hora: '08:03:00', evento: 'Lectura de archivo', estado: 'completado', detalle: '89 registros leídos' },
        { id: 'evt-19', fecha: '2025-02-01', hora: '08:06:00', evento: 'Validación de estructura', estado: 'completado', detalle: 'Estructura válida' },
        { id: 'evt-20', fecha: '2025-02-01', hora: '08:10:00', evento: 'Validación de reglas de negocio', estado: 'completado', detalle: 'Todas las reglas cumplidas' },
      ],
      errores: [],
      observaciones: 'Carga lista para publicación. Sin errores encontrados.',
      impacto: { campanasActualizar: 3, clientesActualizar: 0, ofertasActualizar: 0 },
    },
    {
      id: 'proc-005',
      idCarga: 'CARGA-2025-005',
      nombreArchivo: 'clientes_febrero_2025.xlsx',
      tipoCarga: 'clientes',
      periodo: '2025-02',
      usuarioResponsable: 'Juan Pérez',
      fechaCarga: '2025-02-05',
      fechaInicio: '2025-02-05 16:00:00',
      estado: 'en_validacion',
      registrosProcesados: 567,
      registrosValidos: 567,
      registrosConError: 0,
      tamanoArchivo: '4.3 MB',
      eventos: [
        { id: 'evt-21', fecha: '2025-02-05', hora: '16:00:00', evento: 'Registro de carga', estado: 'completado', detalle: 'Archivo recibido' },
        { id: 'evt-22', fecha: '2025-02-05', hora: '16:05:00', evento: 'Lectura de archivo', estado: 'completado', detalle: '567 registros leídos' },
        { id: 'evt-23', fecha: '2025-02-05', hora: '16:10:00', evento: 'Validación de estructura', estado: 'en_progreso', detalle: 'Validando estructura...' },
      ],
      errores: [],
      observaciones: 'En proceso de validación. Esperar confirmación.',
    },
  ];

  return procesosCarga;
}

export const mockProcesosCarga = generateProcesosCarga();

// Calculate dashboard KPIs
export function getDashboardKPIs() {
  const totalCampaignas = mockCampaignas.length;
  const totalClientes = mockClientes.length;
  const totalOfertas = mockClientes.reduce(
    (sum, cliente) => sum + cliente.historialOfertas.length,
    0
  );
  const montoTotalOfertado = mockCampaignas.reduce((sum, c) => sum + c.montoOfertado, 0);
  const ticketPromedio = mockCampaignas.reduce((sum, c) => sum + c.ticketPromedio, 0) / mockCampaignas.length;

  return {
    totalCampaignas,
    totalClientes,
    totalOfertas,
    montoTotalOfertado,
    ticketPromedio: Math.round(ticketPromedio),
  };
}
