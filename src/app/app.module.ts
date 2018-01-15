import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgeBackgroundSrcSetModule } from './background-srcset/background-srcset.directive';

@NgModule({
  imports:      [ BrowserModule, NgeBackgroundSrcSetModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
