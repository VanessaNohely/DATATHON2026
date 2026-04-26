import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suggested-chips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suggested-chips.html',
  styleUrl: './suggested-chips.scss'
})
export class SuggestedChipsComponent {
  chips = input<string[]>([]);
  selected = output<string>();
}
