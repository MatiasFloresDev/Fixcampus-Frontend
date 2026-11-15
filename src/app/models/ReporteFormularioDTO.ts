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
