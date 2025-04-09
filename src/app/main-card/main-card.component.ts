import { Component, Input, OnInit } from '@angular/core';
import {
  Iliterals,
  IUserData,
  IUserSession,
  WeekProgress,
} from '../commons/commons.interface';
import { UtilsService } from '../utils.service';
import { LOCAL_STORAGE } from '../commons/commons.constants';
import { format, startOfWeek, isSameDay, addDays, isToday, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-main-card',
  templateUrl: './main-card.component.html',
  styleUrls: ['./main-card.component.scss'],
})
export class MainCardComponent implements OnInit {
  @Input() LITERALS!: Iliterals;
  @Input() porcentaje!: number;

  public week!: WeekProgress[];
  public consecutiveDays!: number

  public currentSteps!: number;
  public totalSteps!: number;

  constructor(private us: UtilsService) {}

  ngOnInit() {
    const userData: IUserData = this.us.getLS(LOCAL_STORAGE.userData);

    this.initData(userData);

    this.week = this.getWeekProgress(userData.sessions);
    this.consecutiveDays = this.getConsecutiveExerciseDays(userData.sessions)
  }

  private initData(userData: IUserData): void {
    this.currentSteps = this.us.getTotalSteps(userData.sessions);
    this.totalSteps = 10000;
  }

  private getWeekProgress(sessions: IUserSession[]): WeekProgress[] {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 }); // lunes
    const sunday = endOfWeek(today, { weekStartsOn: 1 }); // domingo
  
    const result: WeekProgress[] = [];
  
    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(monday, i);
      const dayName = format(currentDay, 'EE', { locale: es }); // día en español
  
      const session = sessions.find(s => isSameDay(new Date(s.date), currentDay));
      const isTodayFlag = isToday(currentDay);
      const isFuture = currentDay > today;
  
      let state: boolean | undefined;
      let icono: 'check' | 'cross' | 'progress' | 'steps';
  
      if (isFuture) {
        state = undefined;
        icono = 'steps';
      } else if (isTodayFlag) {
        state = undefined;
        icono = 'progress';
      } else if (session && (session.steps > 0 || session.meters > 0)) {
        state = true;
        icono = 'check';
      } else {
        state = false;
        icono = 'cross';
      }
  
      result.push({
        day: dayName.charAt(0).toUpperCase() + dayName.slice(1), // Capitalizamos
        state,
        icono,
      });
    }
  
    return result;
  }

  private getConsecutiveExerciseDays(sessions: IUserSession[]): number {
    const today = new Date();
    let yesterday = new Date(new Date().setDate(new Date().getDate()-1));
    let consecutiveDays = 0;
  
    // Iterar desde hoy hacia atrás
    for (let i = 0; i < sessions.length; i++) {
      const currentDay = addDays(yesterday, -i); // Contamos desde ayer hacia atrás
  
      // Buscar sesión de este día
      const session = sessions.find(s => isSameDay(new Date(s.date), currentDay));
  
      // Si hay sesión de ejercicio (pasos > 0 o metros > 0), contar como día de ejercicio
      if (session && (session.steps > 0 || session.meters > 0)) {
        consecutiveDays++;
      } else {
        // Si no hay ejercicio, detener el conteo de días consecutivos
        break;
      }
    }
  
    return consecutiveDays;
  }
}
