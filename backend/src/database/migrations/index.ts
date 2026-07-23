import { InitialSchema1719600000000 } from './1719600000000-InitialSchema';
import { TodayRoutineAndScreenCheckins1720100000000 } from './1720100000000-TodayRoutineAndScreenCheckins';
import { LifestyleHealthTracking1720200000000 } from './1720200000000-LifestyleHealthTracking';
import { RemoveLifestyleWaterTracking1720300000000 } from './1720300000000-RemoveLifestyleWaterTracking';
import { UnifyRoutineMoneyAndHobbies1720400000000 } from './1720400000000-UnifyRoutineMoneyAndHobbies';
import { BackfillUnifiedRoutineMoneyAndHobbiesDrift1720500000000 } from './1720500000000-BackfillUnifiedRoutineMoneyAndHobbiesDrift';
import { AddAddictionLabel1720600000000 } from './1720600000000-AddAddictionLabel';

export const migrations = [
  InitialSchema1719600000000,
  TodayRoutineAndScreenCheckins1720100000000,
  LifestyleHealthTracking1720200000000,
  RemoveLifestyleWaterTracking1720300000000,
  UnifyRoutineMoneyAndHobbies1720400000000,
  BackfillUnifiedRoutineMoneyAndHobbiesDrift1720500000000,
  AddAddictionLabel1720600000000,
];
