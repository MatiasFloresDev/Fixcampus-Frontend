export class ReporteDTOList {
  idReporte: number = 0;
  usuarioReportanteId: number = 0;
  tecnicoAsignadoId: number | null = null;
  categoriaId: number = 0;
  ubicacionId: number = 0;
  titulo: string = '';
  descripcion: string = '';
  detalleUbicacion: string | null = null;
  prioridad: string | null = null;
  estado: string = '';
  fechaCreacion: string = '';
  fechaAsignacion: string | null = null;
  fechaResolucion: string | null = null;
}
