import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  sizes = '100px'
  lastChange: string;

  increase () {
    const sizes = parseInt(this.sizes, 10) + 50;
    this.sizes = `${sizes}px`;
  }

  change() {
    this.lastChange = new Date().toISOString()
  }
}
