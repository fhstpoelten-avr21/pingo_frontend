import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PingoPage } from './pingo.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: ':id',
    component: PingoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PingoPageRoutingModule {}
