import { IUserData, IUserSession } from "./commons.interface";

export const USER_DATA_SESSIONS: IUserSession[] = [
    {
      date: new Date('01/15/2025'),
      steps: 0,
      meters: 0,
    },
    {
      date: new Date('02/01/2025'),
      steps: 1200,
      meters: 850,
    },
    {
      date: new Date('02/20/2025'),
      steps: 2000,
      meters: 1300,
    },
    {
      date: new Date('03/01/2025'),
      steps: 0,
      meters: 0,
    },
    {
      date: new Date('03/10/2025'),
      steps: 1500,
      meters: 1100,
    },
    {
      date: new Date('03/15/2025'),
      steps: 0,
      meters: 0,
    },
    {
      date: new Date('04/01/2025'),
      steps: 1000,
      meters: 700,
    },
    {
      date: new Date('04/05/2025'),
      steps: 3000,
      meters: 2100,
    },
    {
        date: new Date('04/06/2025'),
        steps: 3001,
        meters: 2100,
    },
    {
        date: new Date('04/07/2025'),
        steps: 3002,
        meters: 2100,
    },
    {
        date: new Date('04/08/2025'),
        steps: 3003,
        meters: 2100,
    },
  ];

  export const USER_DATA_MOCK: IUserData = {
    sessions: USER_DATA_SESSIONS,
    initDate: new Date('01/01/2025'), //mes, dia, año
}
  