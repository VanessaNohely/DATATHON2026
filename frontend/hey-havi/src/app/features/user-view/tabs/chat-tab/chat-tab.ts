import { Component } from '@angular/core';
import { HaviChatComponent } from '../../components/havi-chat/havi-chat';

@Component({
  selector: 'app-chat-tab',
  standalone: true,
  imports: [HaviChatComponent],
  template: '<app-havi-chat class="full-chat" />',
  styles: [':host { display: flex; flex-direction: column; flex: 1; min-height: 0; }',
           '.full-chat { flex: 1; min-height: 0; }']
})
export class ChatTabComponent {}
