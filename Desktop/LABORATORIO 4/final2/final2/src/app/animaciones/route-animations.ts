import { trigger, transition, query, style, animate, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [


    transition('HomePage => LoginPage', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        query(':enter', style({ transform: 'translateY(-100%)' }), { optional: true }),
        group([
            query(':leave', animate('500ms ease-out', style({ opacity: 0 })), { optional: true }),
            query(':enter', animate('500ms ease-out', style({ transform: 'translateY(0%)' })), { optional: true })
        ])
    ]),
    transition('HomePage => RegisterPage', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        query(':enter', style({ transform: 'translateX(100%)' }), { optional: true }),
        group([
            query(':leave', animate('300ms ease-out', style({ opacity: 0 })), { optional: true }),
            query(':enter', animate('300ms ease-out', style({ transform: 'translateX(0)' })), { optional: true })
        ])
    ]),

    transition('HomePage => estadisticasPage', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        query(':enter', style({ opacity: 0, transform: 'scale(0.9)' }), { optional: true }),
        group([
            query(':leave', animate('400ms ease-out', style({ opacity: 0 })), { optional: true }),
            query(':enter', animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' })), { optional: true })
        ])
    ]),


    transition('HomePage => UsuariosPage', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        query(':enter', style({ transform: 'translateX(100%)' }), { optional: true }),
        group([
            query(':leave', animate('400ms ease', style({ transform: 'translateX(-100%)' })), { optional: true }),
            query(':enter', animate('400ms ease', style({ transform: 'translateX(0)' })), { optional: true })
        ])
    ]),

    transition('HomePage => TurnosPage', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        query(':enter', style({ transform: 'translateX(100%)' }), { optional: true }),
        group([
            query(':leave', animate('400ms ease', style({ transform: 'translateX(-100%)' })), { optional: true }),
            query(':enter', animate('400ms ease', style({ transform: 'translateX(0)' })), { optional: true })
        ])
    ]),


transition('LoginPage => HomePage', [
    query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
    query(':enter', style({ transform: 'translateY(100%)', opacity: 0 }), { optional: true }),
    group([
        query(':leave', animate('500ms ease-in', style({ opacity: 0 })), { optional: true }),
        query(':enter', animate('500ms ease-in', style({ transform: 'translateY(0)', opacity: 1 })), { optional: true })
    ])
]),



transition('* => HomePage', [
  query(':enter', [
    style({ opacity: 0, transform: 'scale(0.70)' })
  ], { optional: true }),
  query(':enter', [
    animate('1500ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
  ], { optional: true })
]),

transition('* => PerfilPage', [
  query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
  group([
    query(':leave', [
      animate('600ms ease-in', style({ transform: 'rotateY(90deg)', opacity: 0 }))
    ], { optional: true }),
    query(':enter', [
      style({ transform: 'rotateY(-90deg)', opacity: 0 }),
      animate('600ms ease-out', style({ transform: 'rotateY(0)', opacity: 1 }))
    ], { optional: true })
  ])
]),



transition('* => RegisterPage', [
  query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
  group([
    query(':leave', [
      animate('6ms ease-in', style({ opacity: 0, filter: 'blur(4px)' }))
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, filter: 'blur(8px)' }),
      animate('600ms ease-out', style({ opacity: 1, filter: 'blur(0)' }))
    ], { optional: true })
  ])
])



]);
