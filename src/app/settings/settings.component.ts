import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../utils.service';
import { LOCAL_STORAGE } from '../commons/commons.constants';
import { IUserData } from '../commons/commons.interface';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent  implements OnInit {
  @Output() closeSettings = new EventEmitter<void>();

  public isShowPolicy = false;

  public alertReset = true;
  public confirmReset = false;

  public initDay!: string;

  constructor(
    private translateService: TranslateService,
    private us: UtilsService
  ) { }

  ngOnInit() {
    this.initUserParams();
  }

  public close() {
    this.closeSettings.emit();
  }

  public selectLang(lang: string) {
    this.translateService.use(lang);
    this.us.setLS(LOCAL_STORAGE.lang, lang)
  }

  public showPolicy() {
    this.isShowPolicy = !this.isShowPolicy;
  }

  public resetAll() {
    if(this.alertReset) {
      this.confirmReset = true;
      this.alertReset = false;
      return;
    }

    this.us.resetLS();
  }

  private initUserParams() {
    const userData: IUserData = this.us.getLS(LOCAL_STORAGE.userData);
    if(userData.sessions.length) {
      this.initDay = this.us.formatDate(userData.sessions[0].date);
    }
  }

}
