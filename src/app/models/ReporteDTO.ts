export interface ReporteDTO {
  idReporte: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string | null;
  categoriaId: number;
  ubicacionId: number;
  tecnicoAsignadoId: number | null;
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
  tipoArchivo?: string | null;
}

export interface AdjuntoFormularioDTO {
  reporteId: number;
  nombreArchivo: string;
  urlArchivo: string;
  tipoArchivo: string | null;
}

export interface ReporteFormularioDTO {
  titulo: string;
  descripcion: string;
  detalleUbicacion: string | null;
  categoriaId: number;
  ubicacionId: number;
  estado: string;
  prioridad: string | null;
  tecnicoAsignadoId?: number | null;
}

export interface SugerenciaCategoriaDTO {
  categoriaId: number | null;
}

export interface CategoriaDTO {
  idCategoria: number;
  nombre: string;
}

export interface UbicacionDTO {
  idUbicacion: number;
  campus: string;
  edificio: string;
  piso: number | null;
  zona: string | null;
  latitud?: number | null;
  longitud?: number | null;
}
