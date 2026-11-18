export class ReporteDTO {
  idReporte: number = 0;
  usuarioReportanteId: number = 0;
  usuarioReportanteNombre: string = '';
  tecnicoAsignadoNombre: string | null = null;
  ubicacionNombre: string = '';
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
