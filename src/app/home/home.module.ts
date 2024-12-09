import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { LogrosComponent } from '../logros/logros.component';
import { GraficaComponent } from '../grafica/grafica.component';
import { ProgressbarComponent } from '../progressbar/progressbar.component';
import { SettingsComponent } from '../settings/settings.component';
import { LegalComponent } from '../legal/legal.component';
import { TutorialComponent } from '../tutorial/tutorial.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    TranslateModule
  ],
  declarations: [
    HomePage,
    LogrosComponent,
    GraficaComponent,
    ProgressbarComponent,
    SettingsComponent,
    LegalComponent,
    TutorialComponent
  ]
})
export class HomePageModule {}
