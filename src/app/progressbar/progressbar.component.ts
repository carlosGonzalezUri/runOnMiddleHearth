import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IUbicacion } from '../commons/commons.interface';
import recorrido from '../../assets/data/eventsMordor.json';


@Component({
  selector: 'app-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrls: ['./progressbar.component.scss'],
})
export class ProgressbarComponent implements OnInit, OnDestroy{
  @Input() set progressBar(progressBar: string) {
    this.totalProgres = Number(progressBar);
    if(this.totalProgres < 1) {
      this.totalProgres = 1;
    }
    this.setGlobalProgress();
  }

  @Input() set kmsToNextLogro(kms: number) {
    this._kmsToNextLogro = kms;
    this.setLocalProgress();
  }

  @Input() lastUbicacion!: IUbicacion;

  public totalProgres!: number;
  public progress!: number;
  public recorrido = recorrido;
  public currentPoint!: string;
  public nextPoint!: string;

  public fromLocation!: string;
  public toLocation!: string;

  private isLocal!: boolean;
  private changeInterval: any;
  private _kmsToNextLogro!: number;

  constructor() { }

  ngOnDestroy(): void {
    clearInterval(this.changeInterval);
  }

  ngOnInit() {
    this.setPoints();
    this.activateAutoChange();
  }

  public changeProgress() {
    this.resetInterval();

    if (this.isLocal) {
      this.setGlobalProgress();
      this.isLocal = false;
      return;
    }
    this.setLocalProgress();
    this.isLocal = true
  }

  private activateAutoChange() {
    this.changeInterval = setInterval(() => {
      this.changeProgress();
    }, 10000)
  }

  private resetInterval() {
    clearInterval(this.changeInterval);
    this.activateAutoChange();
  }

  private setPoints(): void {
    const index = this.lastUbicacion.id;
    const pointsList = this.recorrido.recorrido;

    if (this.isFinishTheWay()) {
      this.currentPoint = pointsList[index -1].ubicacion
      this.nextPoint = this.currentPoint;
      return;
    }

    this.currentPoint = pointsList[index -1].ubicacion
    this.nextPoint = pointsList[index].ubicacion
  }

  private setGlobalProgress(): void {
    this.progress = Math.round(this.totalProgres);
    this.fromLocation = this.recorrido.recorrido[0].ubicacion;
    this.toLocation = this.recorrido.recorrido[this.recorrido.recorrido.length -1].ubicacion;
  }

  private setLocalProgress(): void {
    if (!this.lastUbicacion) {
      return;
    }
    if(this.isFinishTheWay()) {
      this.progress = 100;
      return;
    }

    const index = this.lastUbicacion.id;
    const pointsList = this.recorrido.recorrido;

    this.fromLocation = pointsList[index -1].ubicacion;
    this.toLocation = pointsList[index].ubicacion;

    const totalToA = pointsList[index -1].distancia_km;
    const totalToB = pointsList[index].distancia_km;

    const remainingPercentage = this.calculateRemainingPercentage(this._kmsToNextLogro, totalToA, totalToB);
    const calculatedProgress = 100 - Math.round(remainingPercentage);
    this.progress = Math.max(1, calculatedProgress);
  }

  private calculateRemainingPercentage(remainingToB: number, totalToA: number, totalToB: number) {
    if(remainingToB <= 0) {
      remainingToB = 1;
    }
    if (totalToB <= totalToA) {
      throw new Error("Los valores proporcionados no son válidos.");
    }
  
    // Distancia total entre A y B
    const distanceFromAtoB = totalToB - totalToA;
  
    // Distancia recorrida desde A hacia B
    const distanceTraveledFromA = totalToB - remainingToB - totalToA;
  
    // Porcentaje restante desde A hasta B
    const percentageRemaining = 100 * (distanceFromAtoB - distanceTraveledFromA) / distanceFromAtoB;
  
    return Math.max(0, Math.min(100, percentageRemaining)); // Asegurar un rango entre 0% y 100%
    }

    private isFinishTheWay(): boolean {
      return this.lastUbicacion.id === recorrido.recorrido.length;
    }
}
