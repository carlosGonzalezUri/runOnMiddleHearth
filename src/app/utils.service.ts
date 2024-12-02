import { Injectable } from '@angular/core';
import { IUbicacion, IUserSession } from './commons/commons.interface';
import { ONE_STEP_METERS } from './commons/commons.constants';
import recorrido from '../assets/data/eventsMordor.json';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  public recorrido = recorrido;

  constructor() {}

  public getTotalDistanceFromSessionsKM(sessionList: IUserSession[]): number {
    const totalPasos = sessionList.reduce(
      (acumulado, sesion) => acumulado + sesion.steps, 0);
    const totalKilometros = totalPasos / ONE_STEP_METERS;
    return Number(totalKilometros.toFixed(3));
  }

  public getLastUbicacion(currentDistanceKilometers: number): IUbicacion {
    const recorrido = this.recorrido.recorrido;
    let ubicacionActual = null;

    for (let i = 0; i < recorrido.length; i++) {
      if (currentDistanceKilometers >= recorrido[i].distancia_km) {
        ubicacionActual = recorrido[i];
      } else {
        break;
      }
    }

    return ubicacionActual!;
  }

  public calculateMedia(kms: number, currentSesionesNumber: number): number {
    const media = kms / currentSesionesNumber;
    return parseFloat(media.toFixed(2));
  }

  public setLS(clave: string, objeto: Object) {
    localStorage.setItem(clave, JSON.stringify(objeto));
  }

  public getLS(clave: string) {
    const objetoString = localStorage.getItem(clave);
    return objetoString ? JSON.parse(objetoString) : null;
  }

  public calculatePercentage(kmsActuales: number, recorrido: IUbicacion[]): number {
    // Obtener la distancia total del recorrido (en kilómetros)
    const distanciaTotal = recorrido[recorrido.length - 1].distancia_km;

    // Calcular el porcentaje basado en los kilómetros actuales
    const porcentaje = (kmsActuales / distanciaTotal) * 100;

    // Limitar el porcentaje a 100% si se excede
    return porcentaje > 100 ? 100 : Number(porcentaje.toFixed(2));
  }

  public longestSession(sessionList: IUserSession[]): IUserSession {
    return sessionList.reduce((sesionMasLarga, sesionActual) => {
      return sesionActual.steps > sesionMasLarga.steps ? sesionActual : sesionMasLarga;
    });
  }

  public getTotalSteps(sessionList: IUserSession[]): number {
    const totalPasos = sessionList.reduce(
      (acumulado, sesion) => acumulado + sesion.steps, 0);

    return totalPasos;
  }
}
