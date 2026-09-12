import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LoadingService } from './nucleo/servicos/loading.service';

import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmDialog, ProgressSpinner],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly loadingService = inject(LoadingService);
}
