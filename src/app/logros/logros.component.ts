import { Component, Input, OnInit } from '@angular/core';
import recorrido from '../../assets/data/eventsMordor.json';
import { Iliterals, IUbicacion } from '../commons/commons.interface';


@Component({
  selector: 'app-logros',
  templateUrl: './logros.component.html',
  styleUrls: ['./logros.component.scss'],
  standalone: false,
})
export class LogrosComponent  implements OnInit {
  @Input() currentLogrosNumber!: number;
  @Input() LITERALS!: Iliterals

  public recorrido = recorrido;

  public progressList: IUbicacion[] = [];

  constructor() { }

  ngOnInit() {
    this.setprogressList();
  }

  private setprogressList(): void {
    for(let i=0; i<this.currentLogrosNumber; i++) {
     this.progressList.push(recorrido.recorrido[i])
    }
  }

}
