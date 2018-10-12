import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromConfig from './store/config.reducer';
import { CONFIG_FEATURE_NAME } from './store/config.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ConfigEffects } from './store/config.effects';
import { ConfigSectionComponent } from './config-section/config-section.component';
import { ConfigFormComponent } from './config-form/config-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { ConfigService } from './config.service';

@NgModule({
  imports: [
    ReactiveFormsModule,
    FormlyModule.forChild(),
    FormlyMaterialModule,
    CommonModule,
    StoreModule.forFeature(CONFIG_FEATURE_NAME, fromConfig.reducer),
    EffectsModule.forFeature([ConfigEffects])
  ],
  declarations: [
    ConfigSectionComponent,
    ConfigFormComponent
  ],
  exports: [
    ConfigSectionComponent,
    ConfigFormComponent
  ],
  providers: [
    ConfigService
  ]
})
export class ConfigModule {
}
