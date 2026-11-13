export class ReporteDTO {
  idReporte: number = 0;
  titulo: string = '';
  descripcion: string = '';
  estado: string = '';
  prioridad: string | null = null;
  categoriaId: number = 0;
  ubicacionId: number = 0;
  tecnicoAsignadoId: number | null = null;
  categoriaNombre: string = '';
  detalleUbicacion: string | null = null;
  fechaCreacion: string = '';
  fechaAsignacion: string | null = null;
  fechaResolucion: string | null = null;
}
export class IncidenciasPorMesDTO {
  usuarioId: number = 0;
  nombre: string = '';
  apellido: string = '';
  anio: number = 0;
  mes: number = 0;
  cantidad: number = 0;
}
export class AdjuntoDTO {
  idAdjunto: number = 0;
  nombreArchivo: string = '';
  urlArchivo: string = '';
  tipoArchivo?: string | null = null;
}
export class AdjuntoFormularioDTO {
  reporteId: number = 0;
  nombreArchivo: string = '';
  urlArchivo: string = '';
  tipoArchivo: string | null = null;
}
export class ReporteFormularioDTO {
  titulo: string = '';
  descripcion: string = '';
  detalleUbicacion: string | null = null;
  categoriaId: number = 0;
  ubicacionId: number = 0;
  estado: string = '';
  prioridad: string | null = null;
  tecnicoAsignadoId?: number | null = null;
}
export class SugerenciaCategoriaDTO {
  categoriaId: number | null = null;
}
export class CategoriaDTO {
  idCategoria: number = 0;
  nombre: string = '';
}
export class UbicacionDTO {
  idUbicacion: number = 0;
  campus: string = '';
  edificio: string = '';
  piso: number | null = null;
  zona: string | null = null;
  latitud?: number | null = null;
  longitud?: number | null = null;
}
