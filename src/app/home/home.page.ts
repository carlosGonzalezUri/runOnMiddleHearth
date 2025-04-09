import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';
import { USER_DATA_MOCK } from '../commons/data-mocks';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy{
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
  public isShowProgress = false;

  public oneStepMetters = ONE_STEP_METERS;

  public showHome = true;
  public showSettings = false;
  public showTutorial = false;

  private appUrlOpenSub: Subscription | undefined;

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
    this.mockActivities();



    this.checkAppForIncommingParams();
    this.setPreviousLang()
    this.initLiterals();
  }

  public mockActivities() {
    this.us.setLS(LOCAL_STORAGE.userData, USER_DATA_MOCK);
  }

  ngOnDestroy() {
    if (this.appUrlOpenSub) {
      this.appUrlOpenSub.unsubscribe();
    }
  }

  public async openApp() {
    // await AppLauncher.openUrl({ url: 'running.steps.epic'});
    window.location.href = 'caminoxrutaepica://home'
  }

  public showLogros(): void {
    this.isShowGrafica = false;
    this.isShowProgress = false;

    this.isShowLogros = true;
  }

  public showGrafica(): void {
    this.isShowLogros = false;
    this.isShowProgress = false;

    this.isShowGrafica = true;
    
  }

  public showProgress(): void {
    this.isShowLogros = false;
    this.isShowGrafica = false;

    this.isShowProgress = true;
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

  public async askForNewData() {
    if(this.us.isStravaModeSelected()) {
      const stravaActivities = await this.stravaService.getUserStravaActivities();
      const formatedActivities = this.stravaService.formatActivities(stravaActivities);

      const userData: IUserData = this.us.getLS(LOCAL_STORAGE.userData);

      userData.sessions = formatedActivities;
      this.us.setLS(LOCAL_STORAGE.userData, userData);

      this.initData();

      return;
    }
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
        meters: Number(distanceInSteps) * (ONE_STEP_METERS/1000)
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
    //WEB FLOW
    if(!this.isWeb()) {
      if (window.location.href.includes('code')) {
        this.stravaService.openAppWithCodeOnUrl();
      } else {
        // this.stravaService.goToStravaPageToLogin();
      }
    }
    //ENDS WEB FLOW

    if (this.isFirstInit()) {
      this.openTutorial();
    } else {
      this.initData();
    }
  }  

  private isFirstInit(): boolean {
    const isAlreadyRegistered = this.us.getLS(LOCAL_STORAGE.userData);
    return isAlreadyRegistered === null;
  }

  private initUser() {
    const initData: IUserData = {
      sessions: [],
      initDate: new Date(),
    };
    this.us.setLS(LOCAL_STORAGE.userData, initData);

    this.askForNewData();
  }

  private async initData() {
    let userData: IUserData = this.getUserData();

    if (this.us.getLS(LOCAL_STORAGE.insertDataMode) === 'strava') {
      const stravaActivities = await this.stravaService.getUserStravaActivities();
      const formatedActivities = this.stravaService.formatActivities(stravaActivities);

      userData.sessions = formatedActivities;
    }

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

    this.currentLongestNumber = parseFloat(this.us.longestSession(userData.sessions).steps.toFixed(2));
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

  private isWeb(): boolean {
    return !this.platform.is('hybrid');
  }

  private async checkAppForIncommingParams() {
    const listener = App.addListener('appUrlOpen', async (event) => {
      const url = event.url;

      if (url) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const token = urlParams.get('token');

        if (token) {
          await this.stravaService.getUserAccessToken(token);
          await this.stravaService.saveNoCaducableAccessToken();

          this.initData();
          return;
        }
      }
    });

    this.appUrlOpenSub = new Subscription(async () => (await listener).remove());
  }
}
