import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IUbicacion, IUserData, Iliterals } from '../commons/commons.interface';
import { LOCAL_STORAGE } from '../commons/commons.constants';
import recorrido from '../../assets/data/eventsMordor.json';
import { UtilsService } from '../utils.service';
import { AlertController } from '@ionic/angular';


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
  public currentMediaNumber!: number;
  public currentLogrosNumber!: number;
  public currentLongestNumber!: number;
  public currentKmsNumber!: number;
  public currentStepsNumber!: number

  // private initUserData : IUserData;

  constructor(
    private translateService: TranslateService,
    private us: UtilsService,
    private alertController: AlertController
  ) {
    translateService.setDefaultLang('es');
  }
  
  ngOnInit(): void {
    this.initLiterals();

    this.initApp();
  }

  public showFooterCard() {
    this.isShowFooterCard = !this.isShowFooterCard;
  }

  public async openAlertAskForData() {
    const alert = await this.alertController.create({
      header: 'header',
      subHeader: 'subHeader',
      message: 'message',
      inputs: [
        {
          placeholder: this.LITERALS['steps'],
          name: 'steps',
          type: 'number'
      }],    
      buttons: [
          {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                  console.log('Confirm Cancel');
              }
          }, 
          {
              text: 'Ok',
              handler: (alertData) => { //takes the data 
                  this.addNewRegister(alertData.steps)
              }
          }
      ]
  });
  await alert.present();
  }

  private addNewRegister(distanceInSteps: string, date?: Date) {
    if(!date) {
      date = new Date();
    }
    const userData: IUserData  = this.us.getLS(LOCAL_STORAGE.userData);

    userData.sessions.push({
      date,
      steps: Number(distanceInSteps)
    });
    this.us.setLS(LOCAL_STORAGE.userData, userData);

    this.initData();
  }

  private initLiterals() {
    this.translateService.get('LITERALS').subscribe(
      (res: Iliterals) => {
        this.LITERALS = res;
    })
  }

  private initApp() {
    if(this.isFirstInit()) {
      this.firstSteps();
    } else {
      this.initData();
    }
  }

  private isFirstInit(): boolean {
    const isAlreadyRegistered = this.us.getLS(LOCAL_STORAGE.userData);
    return isAlreadyRegistered === null;
  }

  private firstSteps() {
    // Show tutorial alert
    // Ask for first session
    const userDataMock: IUserData = {
      sessions: [
        { date: new Date('2023-11-25'), steps: 8723 },
        { date: new Date('2023-11-26'), steps: 6471 },
        { date: new Date('2023-11-27'), steps: 7542 },
        { date: new Date('2023-11-28'), steps: 9823 },
        { date: new Date('2023-11-29'), steps: 5634 },
        { date: new Date('2023-11-30'), steps: 7218 },
        { date: new Date('2023-12-01'), steps: 8094 }
      ],
      initDate: new Date(),
      userId: '',
      userToken: ''
    }
    this.us.setLS(LOCAL_STORAGE.userData, userDataMock);

    this.initApp();
  }

  private initData() {
    const userData = this.getUserData();
    const currentTotalKMS = this.getCurrentDistanceKM(userData);
    this.currentDistanceKilometers = Math.trunc(currentTotalKMS);
    this.currentDistanceMeters = this.getMetersFromCurrentDistance(currentTotalKMS);
    this.lastUbicacion = this.us.getLastUbicacion(currentTotalKMS);
    this.lastDestino = this.lastUbicacion.ubicacion;
    this.lastLogro = this.lastUbicacion.logro;

    this.currentSesionesNumber = userData.sessions.length;;
    this.currentMediaNumber = this.calculateMedia(currentTotalKMS, this.currentSesionesNumber);
    this.currentLogrosNumber = this.lastUbicacion.id;
    this.currentPercentageNumber = this.us.calculatePercentage(currentTotalKMS, this.recorrido.recorrido);
    this.currentLongestNumber = this.us.longestSession(userData.sessions).steps;
    this.currentKmsNumber = this.currentDistanceKilometers;
    this.currentStepsNumber = this.us.getTotalSteps(userData.sessions);;
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



}
