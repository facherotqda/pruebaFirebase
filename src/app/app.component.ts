// /* import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   //styleUrl: './app.component.scss'
// })
// export class AppComponent {
//   title = 'Clinica Online';
// }
//  */

// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { routeAnimations } from './animaciones/route-animations';



// @Component({
//   selector: 'app-root',
//    standalone: true,  
//   imports: [RouterOutlet],

//   templateUrl: './app.component.html',
//  // styleUrl: './app.component.css',
//   animations: [routeAnimations]
// })
// export class AppComponent {
//   title = 'clinicaOnline';
//   getAnimationData(outlet: RouterOutlet) {
//     return outlet.activatedRouteData['animation'];
//   }


// }


import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';
import { routeAnimations } from './animaciones/route-animations';
import { LoadingService } from './services/loading.service';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SpinnerComponent, NgIf],
  template: `
    <app-spinner *ngIf="loading"></app-spinner>
    <div [@routeAnimations]="getAnimationData(outlet)">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `,
  animations: [routeAnimations]
})
export class AppComponent {
  loading = false;

  constructor(private router: Router, private loadingService: LoadingService) {
    // Escuchamos cambios del servicio de carga
    this.loadingService.loading$.subscribe(value => this.loading = value);

    // Escuchamos navegación
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.hide();
      }
    });
  }

  getAnimationData(outlet: RouterOutlet) {
    return outlet.activatedRouteData['animation'];
  }
}
