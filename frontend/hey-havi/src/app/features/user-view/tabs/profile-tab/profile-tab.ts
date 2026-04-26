import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-tab.html',
  styleUrl: './profile-tab.scss'
})
export class ProfileTabComponent {
  ctx = inject(UserContextService);

  scoreLabel(score: number): string {
    if (score >= 750) return 'Excelente — sigue así';
    if (score >= 700) return 'Muy bueno';
    if (score >= 650) return 'Bueno';
    if (score >= 550) return 'Regular — puedes mejorarlo';
    return 'En proceso de mejora';
  }

  antiguedad(dias: number): string {
    if (dias >= 365) return `${Math.floor(dias / 365)} año${Math.floor(dias / 365) > 1 ? 's' : ''}`;
    if (dias >= 30) return `${Math.floor(dias / 30)} mes${Math.floor(dias / 30) > 1 ? 'es' : ''}`;
    return `${dias} días`;
  }

  topicLabel(topic: string): string {
    const labels: Record<string, string> = {
      'transferencias_app':  'Transferencias',
      'tarjetas_fisicas':    'Mis tarjetas',
      'credito_plazos':      'Crédito a plazos',
      'gestion_cuenta':      'Mi cuenta',
      'escalacion_humano':   'Hablar con un asesor',
      'solicitud_credito':   'Solicitar crédito',
      'canales_atencion':    'Canales de atención',
      'cancelaciones':       'Cancelaciones',
      'productos_hey':       'Productos Hey',
      'credito_auto':        'Crédito auto',
      'cargos_disputas':     'Aclaraciones',
      'transferencias':      'Transferencias',
    };
    return labels[topic] ?? topic.replace(/_/g, ' ');
  }
}
