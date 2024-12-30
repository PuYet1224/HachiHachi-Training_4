import { NgModule } from '@angular/core';
import { StatusColorPipe } from './status-color.pipe';

@NgModule({
  declarations: [StatusColorPipe],
  exports: [StatusColorPipe]
})
export class StatusColorModule {}
