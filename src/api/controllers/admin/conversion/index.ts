import { RecipeConversionController } from './recipe-conversion.controller';
import { UOMController } from './unit-of-measure.controller';
import { VolumeConversionController } from './volume-conversion.controller';

export const conversionModuleControllers = [
  UOMController,
  VolumeConversionController,
  RecipeConversionController,
];
