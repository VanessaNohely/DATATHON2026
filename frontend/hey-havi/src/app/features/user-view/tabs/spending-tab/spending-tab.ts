import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../../../core/services/user-context.service';
import { SpendingSummaryComponent } from '../../components/spending-summary/spending-summary';

@Component({
  selector: 'app-spending-tab',
  standalone: true,
  imports: [CommonModule, SpendingSummaryComponent],
  templateUrl: './spending-tab.html',
  styleUrl: './spending-tab.scss'
})
export class SpendingTabComponent {
  ctx = inject(UserContextService);
}
