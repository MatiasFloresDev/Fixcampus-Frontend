export class ReporteDTOUpdate {
  categoriaId: number = 0;
  ubicacionId: number = 0;
  titulo: string = '';
  descripcion: string = '';
  detalleUbicacion: string | null = null;
  tecnicoAsignadoId: number | null = null;
  prioridad: string | null = null;
  estado: string = '';
}
