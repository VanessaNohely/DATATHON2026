import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.scss'
})
export class RecommendationsComponent {
  ctx = inject(UserContextService);
}
