export interface ReporteDTO {
  idReporte: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoriaNombre: string;
  detalleUbicacion: string | null;
  fechaCreacion: string;
  fechaAsignacion: string | null;
  fechaResolucion: string | null;
}

export interface IncidenciasPorMesDTO {
  usuarioId: number;
  nombre: string;
  apellido: string;
  anio: number;
  mes: number;
  cantidad: number;
}

export interface AdjuntoDTO {
  idAdjunto: number;
  nombreArchivo: string;
  urlArchivo: string;
}
