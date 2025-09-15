// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class LoadingService {
//   private loadingSubject = new BehaviorSubject<boolean>(false);
//   loading$ = this.loadingSubject.asObservable();

//   show(): void {
//     this.loadingSubject.next(true);
//   }

//   hide(): void {
//     this.loadingSubject.next(false);
//   }
// }

import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private showRequestedAt: number | null = null;
  private minDuration = 300; // en milisegundos

  show(): void {
    this.showRequestedAt = Date.now();
    this.loadingSubject.next(true);
  }

  hide(): void {
    const now = Date.now();
    const elapsed = this.showRequestedAt ? now - this.showRequestedAt : 0;

    if (elapsed < this.minDuration) {
      const remaining = this.minDuration - elapsed;
      timer(remaining).subscribe(() => this.loadingSubject.next(false));
    } else {
      this.loadingSubject.next(false);
    }
  }
}
