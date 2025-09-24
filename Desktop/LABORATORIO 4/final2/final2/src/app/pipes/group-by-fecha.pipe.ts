import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'groupByFecha', standalone: true })
export class GroupByFechaPipe implements PipeTransform {
  transform(visitas: Array<{ fecha: string }>): Array<{ fecha: string, cantidad: number }> {
    if (!Array.isArray(visitas)) return [];
    const agrupado: { [fecha: string]: number } = {};
    for (const v of visitas) {
      agrupado[v.fecha] = (agrupado[v.fecha] || 0) + 1;
    }
    return Object.keys(agrupado).sort().map(fecha => ({ fecha, cantidad: agrupado[fecha] }));
  }
}
