import { Component, inject, signal, effect, viewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserContextService } from '../../../../core/services/user-context.service';
import { HeyApiService } from '../../../../core/services/hey-api.service';
import { ChatMessage } from '../../../../core/models/chat.model';
import { MessageBubbleComponent } from '../message-bubble/message-bubble';
import { SuggestedChipsComponent } from '../suggested-chips/suggested-chips';

@Component({
  selector: 'app-havi-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageBubbleComponent, SuggestedChipsComponent],
  templateUrl: './havi-chat.html',
  styleUrl: './havi-chat.scss'
})
export class HaviChatComponent {
  private api = inject(HeyApiService);
  ctx = inject(UserContextService);

  messages  = signal<ChatMessage[]>([]);
  inputText = signal<string>('');
  isTyping  = signal<boolean>(false);
  suggestions = signal<string[]>([]);

  messagesEl = viewChild<ElementRef>('messagesContainer');

  defaultChips = computed(() => {
    const seg = this.ctx.profile()?.segment_name ?? '';
    const chips = ['¿Cuánto cashback tengo?', '¿Cómo está mi saldo?', 'Ver mis gastos del mes'];
    if (seg.includes('Inversor')) chips.push('¿Cómo va mi inversión?');
    if (seg.includes('Tensión')) chips.push('¿Cómo mejorar mi score?');
    if (seg.includes('Asalariado')) chips.push('¿Cuándo cae mi nómina?');
    return chips;
  });

  constructor() {
    // Init chat with Havi's greeting once context is ready
    effect(() => {
      const greeting = this.ctx.greeting();
      if (greeting && this.messages().length === 0) {
        this.addMessage('assistant', greeting);
        this.suggestions.set(this.defaultChips());
      }
    });
  }

  send(text?: string): void {
    const msg = (text ?? this.inputText()).trim();
    if (!msg || this.isTyping()) return;

    this.addMessage('user', msg);
    this.inputText.set('');
    this.suggestions.set([]);
    this.isTyping.set(true);

    // Loading bubble
    const loadingId = this.addMessage('assistant', '', true);

    this.api.chat({ user_id: this.ctx.userId(), message: msg }).subscribe({
      next: (res) => {
        this.removeMessage(loadingId);
        this.addMessage('assistant', res.message);
        this.suggestions.set(res.suggestions ?? []);
        this.isTyping.set(false);
        this.scrollToBottom();
      },
      error: () => {
        this.removeMessage(loadingId);
        this.addMessage('assistant', 'Lo siento, ocurrió un error. Por favor intenta de nuevo.');
        this.isTyping.set(false);
      }
    });

    this.scrollToBottom();
  }

  onChipSelected(chip: string): void { this.send(chip); }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  private addMessage(role: 'user' | 'assistant', content: string, isLoading = false): string {
    const id = crypto.randomUUID();
    this.messages.update(msgs => [...msgs, { id, role, content, timestamp: new Date(), isLoading }]);
    return id;
  }

  private removeMessage(id: string): void {
    this.messages.update(msgs => msgs.filter(m => m.id !== id));
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesEl()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
