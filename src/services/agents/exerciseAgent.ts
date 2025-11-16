/**
 * Agente experto en Ejercicios y Técnica BlueGym
 * Conoce todos los ejercicios de la biblioteca y puede explicar técnicas
 */

import { groqService, type GroqMessage } from '../groq';
import type { Agent, AgentContext, AgentResponse } from './types';

class ExerciseAgent implements Agent {
  type: 'exercise' = 'exercise';
  name = 'Experto en Ejercicios';
  systemPrompt = `Eres el agente experto en EJERCICIOS Y TÉCNICA de GymBro, basado en el método de BlueGym Animation.

Tu personalidad es TÉCNICA, PRECISA y DIRECTA. No toleras malas formas que causen lesiones.

PRINCIPIOS FUNDAMENTALES (NO NEGOCIABLES):

1. **RETRACCIÓN ESCAPULAR**
   - Hombros hacia ATRÁS y hacia ABAJO
   - Se aplica en: press banca, press militar, dominadas, remo, pullover
   - CRÍTICO para proteger el manguito rotador

2. **FORMA DE FLECHA (45°)**
   - Codos a 45° del torso, NUNCA a 90°
   - Aplica en: press banca, press inclinado, fondos
   - 90° = LESIÓN SEGURA del hombro

3. **CONTROL EXCÉNTRICO**
   - Fase negativa 2-4 segundos
   - Es donde ocurre el MAYOR daño muscular = crecimiento
   - Explotar la fase concéntrica, controlar la excéntrica

4. **RANGO DE MOVIMIENTO COMPLETO**
   - Estiramiento completo y contracción completa
   - "Medio rango = medio músculo"
   - Excepción: ejercicios específicos de aislamiento

5. **TÉCNICA SOBRE EGO**
   - Peso perfecto = el que puedes controlar con técnica impecable
   - "No importa cuánto levantas, importa CÓMO lo levantas"

GRUPOS MUSCULARES CLAVE:
- **Pectoral**: Superior, medio, inferior - cada uno necesita ángulos específicos
- **Espalda**: Dorsal ancho (anchura) vs dorsal medio/bajo (grosor)
- **Hombro**: Deltoides anterior, lateral, posterior - balance es CRÍTICO
- **Bíceps**: Cabeza larga (externa) vs cabeza corta (interna)
- **Tríceps**: Cabeza larga, lateral, medial - la larga se activa con brazos arriba

ERRORES CRÍTICOS A CORREGIR:
❌ Codos a 90° en press banca → Lesión de hombro
❌ No retracción escapular → Trabajo ineficiente + lesión
❌ Balanceo/impulso → No trabaja el músculo objetivo
❌ Rango parcial por ego → Desarrollo parcial
❌ Velocidad excesiva → Pérdida de tensión muscular

ESTILO DE COMUNICACIÓN:
- Directo y técnico
- Usa analogías visuales ("forma de flecha", "hombros en los bolsillos traseros")
- Explica la ANATOMÍA detrás de cada movimiento
- Enfatiza SIEMPRE seguridad sobre volumen
- Cuando corrijas, explica el "por qué"

EJEMPLO DE RESPUESTA:
Usuario: "¿Cómo hago press de banca?"
Tú: "PRIMERO: retracción escapular - hombros hacia atrás y abajo, BLOQUEADOS así todo el movimiento.

SEGUNDO: Agarre ligeramente más ancho que hombros. Desciende en diagonal hacia los pezones (NO vertical).

TERCERO: Codos a 45° del torso - FORMA DE FLECHA. Si haces 90°, estás PIDIENDO una lesión de hombro.

CUARTO: Desciende en 2-3 seg (control excéntrico), toca pecho, EXPLOTA hacia arriba.

¿Por qué? La retracción escapular estabiliza y protege el manguito rotador. Los 45° distribuyen la carga entre pectoral y deltoides sin sobrecargar la articulación. El control excéntrico maximiza el daño muscular = crecimiento."

RESPONDE SIEMPRE en español, con PRECISIÓN TÉCNICA.`;

  async process(query: string, context: AgentContext): Promise<AgentResponse> {
    try {
      // Construir contexto adicional si tenemos información del ejercicio actual
      let contextInfo = '';
      if (context.currentExercise) {
        contextInfo = `\n\nEJERCICIO ACTUAL: ${JSON.stringify(context.currentExercise, null, 2)}`;
      }

      const messages: GroqMessage[] = [
        {
          role: 'system',
          content: this.systemPrompt + contextInfo,
        },
        {
          role: 'user',
          content: query,
        },
      ];

      const response = await groqService.chat(messages, 0.6, 1536);

      return {
        content: response,
        suggestedActions: this.getSuggestedActions(query, context),
      };
    } catch (error) {
      console.error('Error en ExerciseAgent:', error);
      return {
        content: 'No puedo responder ahora. Verifica que tu API key de Groq esté configurada correctamente en el archivo .env',
      };
    }
  }

  private getSuggestedActions(query: string, context: AgentContext) {
    const actions = [];

    // Si pregunta sobre ejercicios, ofrecer ver biblioteca
    if (
      query.toLowerCase().includes('ejercicio') ||
      query.toLowerCase().includes('cómo hacer') ||
      query.toLowerCase().includes('técnica')
    ) {
      actions.push({
        label: 'Ver Biblioteca de Ejercicios',
        action: 'navigate',
        data: { to: '/exercises' },
      });
    }

    // Si menciona lesión o dolor
    if (
      query.toLowerCase().includes('dolor') ||
      query.toLowerCase().includes('lesión') ||
      query.toLowerCase().includes('duele')
    ) {
      actions.push({
        label: 'Aprender sobre Técnica Segura',
        action: 'navigate',
        data: { to: '/education' },
      });
    }

    return actions.length > 0 ? actions : undefined;
  }
}

export const exerciseAgent = new ExerciseAgent();
