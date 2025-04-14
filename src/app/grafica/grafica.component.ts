import { Component, Input, OnInit } from '@angular/core';

import Chart, { ChartItem } from 'chart.js/auto';
import { IUserSession } from '../commons/commons.interface';
import { UtilsService } from '../utils.service';


@Component({
  selector: 'app-grafica',
  templateUrl: './grafica.component.html',
  styleUrls: ['./grafica.component.scss'],
})
export class GraficaComponent {
  @Input() set userSessions(sessions: IUserSession[]) {
    this.configChart(sessions);
  }


  constructor(
    private us: UtilsService
  ) {}

  public newChart!: Chart;

  private configChart(sessions: IUserSession[]) {
    if(!sessions) {
      return;
    }
    if(this.newChart) {
      this.newChart.destroy();
    }
    setTimeout(() => {
      this.newChart = new Chart(
        document.getElementById('progress-chart') as ChartItem,
        {
          type: 'line',
          data: this.getCharData(sessions),
          options: {
            scales: {
              x: {  // <-- axis is not array anymore, unlike before in v2.x: '[{'
                grid: {
                  color: 'darkslategrey',
                }
              },
              y: {  // <-- axis is not array anymore, unlike before in v2.x: '[{'
                grid: {
                  color: 'darkslategrey',
                }
              }
            },
            plugins: {
              legend: {
                display: false,
              },
            },
            elements: {
              line: {
                borderColor: '#fc4c02',
                backgroundColor: 'white',
              },
            },
          },
        }
      );
      this.newChart.draw();
    });
  }

  private getCharData(sessions: IUserSession[]) {
    const charData = sessions

    return {
      labels: charData?.map((row: { date: any }) => this.us.formatDate(row.date)),
      datasets: [
        {
          data: charData?.map((row: { steps: any }) => row.steps),
          borderColor: '#fc4c02',
          backgroundColor: 'white',
          color: 'white',
          tension: 0.2
        },
      ],
    };
  }

}
