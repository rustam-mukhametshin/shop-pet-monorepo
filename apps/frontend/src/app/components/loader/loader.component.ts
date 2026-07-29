import { Component } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialogContainer } from '@angular/material/dialog';

@Component({
  selector: 'app-loader',
  imports: [MatProgressSpinner, MatDialogContainer],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent {}
