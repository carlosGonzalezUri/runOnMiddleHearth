import {
  Component,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { IUbicacion, IUserSession } from '../commons/commons.interface';
import { trigger, transition, style, animate } from '@angular/animations';

// export interface ILocationPoint {
//   id: number;
//   ubicacion: string;
//   distancia_km: number;
//   logro: string;
// }

// export interface IUserSession {
//   date: Date;
//   steps: number;
//   activityType?: string;
//   meters: number;
// }

@Component({
  selector: 'app-progress-map',
  templateUrl: './progress-map.component.html',
  styleUrls: ['./progress-map.component.scss'],
  animations: [
    trigger('slideInIcon', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class ProgressMapComponent implements AfterViewInit {
  @Input() recorrido: IUbicacion[] = [];
  @Input() sesiones: IUserSession[] = [];

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  totalDistancia: number = 0;
  puntoActualIndex: number = 0;

  ngAfterViewInit(): void {
    this.calcularDistanciaTotal();
    this.encontrarPuntoActual();
    this.scrollToActual();
  }

  calcularDistanciaTotal(): void {
    this.totalDistancia = this.sesiones.reduce(
      (acc, sesion) => acc + sesion.meters / 1000,
      0
    );
  }

  encontrarPuntoActual(): void {
    for (let i = 0; i < this.recorrido.length; i++) {
      if (this.totalDistancia < this.recorrido[i].distancia_km) {
        this.puntoActualIndex = i - 1;
        return;
      }
    }
    this.puntoActualIndex = this.recorrido.length - 1;
  }

  isVisited(punto: IUbicacion): boolean {
    return this.totalDistancia >= punto.distancia_km;
  }

  isActual(punto: IUbicacion, index: number): boolean {
    return index === this.puntoActualIndex;
  }

  scrollToActual(): void {
    setTimeout(() => {
      if (this.scrollContainer && this.scrollContainer.nativeElement) {
        const container = this.scrollContainer.nativeElement as HTMLElement;
        const puntos = container.querySelectorAll('.punto-wrapper');
        const actual = puntos[this.puntoActualIndex] as HTMLElement;
        if (actual) {
          const offset = actual.offsetLeft - container.clientWidth / 2 + actual.clientWidth / 2;
          container.scrollTo({ left: offset, behavior: 'smooth' });
        }
      }
    }, 500);
  }

  getProgresoPorcentaje(): number {
    const totalKm = this.recorrido[this.recorrido.length - 1]?.distancia_km || 1;
    const recorridoKm = this.totalDistancia;
    return Math.min(Math.max((recorridoKm / totalKm) * 100, 0), 100);
  }
}
