import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-spending-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spending-summary.html',
  styleUrl: './spending-summary.scss'
})
export class SpendingSummaryComponent {
  ctx = inject(UserContextService);
}
