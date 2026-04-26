import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DEMO_USERS, UserOption } from '../../../core/data/mock-users';
import { UserContextService } from '../../../core/services/user-context.service';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-selector.html',
  styleUrl: './user-selector.scss'
})
export class UserSelectorComponent {
  ctx   = inject(UserContextService);
  close = output<void>();
  users = DEMO_USERS;

  select(user: UserOption): void {
    this.ctx.setUserId(user.user_id);
    this.ctx.setContext(user.context);
    this.close.emit();
  }

  isActive(user: UserOption): boolean {
    return this.ctx.userId() === user.user_id;
  }
}
