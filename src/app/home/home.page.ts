import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  IUbicacion,
  IUserData,
  IUserSession,
  Iliterals,
} from '../commons/commons.interface';
import { LOCAL_STORAGE, ONE_STEP_METERS } from '../commons/commons.constants';
import recorrido from '../../assets/data/eventsMordor.json';
import { UtilsService } from '../utils.service';
import { AlertController, Platform } from '@ionic/angular';
import { StravaService } from '../strava.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  public recorrido = recorrido;
  public LITERALS!: Iliterals;

  public isShowFooterCard = false;

  public currentDistanceKilometers!: number;
  public currentDistanceMeters!: string;

  public lastDestino!: string;
  public lastLogro!: string;

  public lastUbicacion!: IUbicacion;

  public currentSesionesNumber!: number;
  public currentPercentageNumber!: number;
  public progressBar!: string;
  public currentMediaNumber!: number;
  public currentLogrosNumber!: number;
  public currentLongestNumber!: number;
  public currentKmsNumber!: number;
  public currentStepsNumber!: number;

  public kmsToNextLogro!: number;
  public nextStop!: string;
  public stepsToNextLogro!: number;

  public userSessions!: IUserSession[];

  public isShowLogros = false;
  public isShowGrafica = true;

  public oneStepMetters = ONE_STEP_METERS;

  public showHome = true;
  public showSettings = false;
  public showTutorial = false;

  constructor(
    private translateService: TranslateService,
    private us: UtilsService,
    private alertController: AlertController,
    private platform: Platform,
    private stravaService: StravaService
  ) {
    translateService.setDefaultLang('es');
  }

  ngOnInit(): void {
    this.setPreviousLang()
    this.initLiterals();
  }

  public async openApp() {
    // await AppLauncher.openUrl({ url: 'running.steps.epic'});
    window.location.href = 'caminoxrutaepica://home'
  }

  public showLogros(): void {
    this.isShowLogros = true;
    this.isShowGrafica = false;
  }

  public showGrafica(): void {
    this.isShowLogros = false;
    this.isShowGrafica = true;
  }

  public showFooterCard() {
    this.isShowFooterCard = !this.isShowFooterCard;
  }

  public openSettings() {
    this.hideHome();
    this.showSettings = true;
  }

  public onCloseSettings() {
    this.showSettings = false;
    this.setShowHome();
  }

  public openTutorial() {
    this.hideHome();
    this.showTutorial = true;
  }

  public onCloseTutorial() {
    this.showTutorial = false;
    this.setShowHome();
    this.initUser();
  }

  public async openAlertAskForData() {
    const alert = await this.alertController.create({
      header: this.LITERALS['stepsPlaceholder'],
      subHeader: this.LITERALS['stepsSubtitle'],
      message: this.LITERALS['stepsTitle'],
      inputs: [
        {
          placeholder: this.LITERALS['steps'],
          name: 'steps',
          type: 'number',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
        {
          text: 'Ok',
          handler: (alertData) => {
            //takes the data
            this.addNewRegister(alertData.steps);
          },
        },
      ],
    });
    await alert.present();
  }

  private addNewRegister(distanceInSteps: string, date?: Date) {
    if (Number(distanceInSteps) >= 1) {
      if (!date) {
        date = new Date();
      }
      const userData: IUserData = this.us.getLS(LOCAL_STORAGE.userData);

      userData.sessions.push({
        date,
        steps: Number(distanceInSteps),
      });
      this.us.setLS(LOCAL_STORAGE.userData, userData);

      this.initData();
    }
  }

  private initLiterals() {
    this.translateService.get('LITERALS').subscribe((res: Iliterals) => {
      this.LITERALS = res;
      this.initApp();
    });
  }

  private async initApp() {
    if (this.us.isStravaModeSelected()) {
      await this.stravaUserFlow()
    }
    if (!this.isOnWebAfterRedirectFromLoginOnStrava()) { //comes from strava flow and strava login redirect to camino on web
      // this.stravaService.getCodeFromUrlAndOpenAPP();
      return;
    }
    

    if (this.isFirstInit()) {
      this.firstSteps();
    } else {
      this.initData();
    }
  }

  private async stravaUserFlow() {
    await this.stravaService.initFlow();
  }

  private isFirstInit(): boolean {
    const isAlreadyRegistered = this.us.getLS(LOCAL_STORAGE.userData);
    return isAlreadyRegistered === null;
  }

  private firstSteps() {
    this.askForFirstSteps();
  }

  private async askForFirstSteps() {
    this.openTutorial();
  }

  private initUser() {
    const initData: IUserData = {
      sessions: [],
      initDate: new Date(),
    };
    this.us.setLS(LOCAL_STORAGE.userData, initData);
    this.openAlertAskForData();
  }

  private initData() {
    const userData: IUserData = this.getUserData();
    const currentTotalKMS = this.getCurrentDistanceKM(userData);

    this.currentDistanceKilometers = Math.trunc(currentTotalKMS);
    this.currentDistanceMeters = this.getMetersFromCurrentDistance(currentTotalKMS);
    this.lastUbicacion = this.us.getLastUbicacion(currentTotalKMS);
    this.lastDestino = this.lastUbicacion.ubicacion;
    this.lastLogro = this.lastUbicacion.logro;

    this.currentSesionesNumber = userData.sessions.length;
    this.currentMediaNumber = this.calculateMedia(
      currentTotalKMS,
      this.currentSesionesNumber
    );
    this.currentLogrosNumber = this.lastUbicacion.id;
    this.currentPercentageNumber = this.us.calculatePercentage(
      currentTotalKMS,
      this.recorrido.recorrido
    );
    this.progressBar = Math.round(this.currentPercentageNumber).toString();

    this.currentLongestNumber = this.us.longestSession(userData.sessions).steps;
    this.currentKmsNumber = this.currentDistanceKilometers;
    this.currentStepsNumber = this.us.getTotalSteps(userData.sessions);

    this.loadChart(userData);

    if (this.isFinishTheWay()) {
      this.gameOver();
      return;
    }

    this.kmsToNextLogro = this.us.formatToTwoDecimals(
      recorrido.recorrido[this.lastUbicacion.id].distancia_km - currentTotalKMS
    );
    this.nextStop = recorrido.recorrido[this.lastUbicacion.id].ubicacion;
    this.stepsToNextLogro = Math.round(
      this.kmsToNextLogro * this.oneStepMetters
    );
  }

  private loadChart(userData: IUserData): void {
    this.userSessions = userData.sessions;
  }

  private getUserData(): IUserData {
    const userDataFromLS = localStorage.getItem(LOCAL_STORAGE.userData);
    return JSON.parse(userDataFromLS!);
  }

  private getCurrentDistanceKM(userData: IUserData): number {
    return this.us.getTotalDistanceFromSessionsKM(userData.sessions);
  }

  private getMetersFromCurrentDistance(distance: number) {
    const decimales = distance.toString().split('.')[1];

    if (!decimales) {
      return '';
    }
    const tresUltimosDecimales = decimales.slice(-3);
    return tresUltimosDecimales;
  }

  private calculateMedia(distance: number, sessionsNumber: number): number {
    return this.us.calculateMedia(distance, sessionsNumber);
  }

  private setShowHome() {
    this.showHome = true;
  }

  private hideHome() {
    this.showHome = false;
  }

  private isFinishTheWay(): boolean {
    return this.lastUbicacion.id === recorrido.recorrido.length;
  }

  private async gameOver() {
    const alert = await this.alertController.create({
      header: this.LITERALS['end_congrats'],
      subHeader: this.LITERALS['end_subheader'],
      message: this.LITERALS['end_message'],
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
      ],
    });
    await alert.present();
  }

  private setPreviousLang() {
    const prevLang = this.us.getLS(LOCAL_STORAGE.lang);
    this.translateService.setDefaultLang(prevLang ?? 'es');
  }

  private isOnWebAfterRedirectFromLoginOnStrava(): boolean {
    return this.platform.is('hybrid');
  }
}
