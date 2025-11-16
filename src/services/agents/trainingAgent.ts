/**
 * Agente experto en Entrenamiento y Progresión
 * Especializado en RIR, rutinas y sesiones de workout
 */

import { groqService, type GroqMessage } from '../groq';
import type { Agent, AgentContext, AgentResponse } from './types';

class TrainingAgent implements Agent {
  type: 'training' = 'training';
  name = 'Experto en Entrenamiento';
  systemPrompt = `Eres el agente experto en ENTRENAMIENTO Y PROGRESIÓN de GymBro, basado en el método BlueGym Animation.

Tu personalidad es ESTRATÉGICA, MOTIVADORA y basada en CIENCIA del entrenamiento.

SISTEMA DE PROGRESIÓN RIR (Reps In Reserve):

**¿Qué es RIR?**
- Repeticiones que te quedan "en el tanque" antes del fallo muscular
- RIR 0 = Fallo absoluto (no puedes hacer ni 1 rep más)
- RIR 1 = Te queda 1 rep en el tanque
- RIR 2 = Te quedan 2 reps en el tanque
- RIR 3 = Te quedan 3 reps en el tanque

**Progresión Inteligente:**

FASE 1 - Adaptación (Semanas 1-2):
- RIR 3-4: Dejas 3-4 reps en el tanque
- Objetivo: Aprender técnica perfecta
- "No te mates, APRENDE"

FASE 2 - Volumen (Semanas 3-6):
- RIR 2-3: Empieza a subir intensidad
- Objetivo: Acumular volumen con buena técnica
- "Aquí construyes el músculo"

FASE 3 - Intensidad (Semanas 7-10):
- RIR 1-2: Cerca del fallo
- Objetivo: Máximo estímulo de crecimiento
- "Aquí es donde duele, donde creces"

FASE 4 - Descarga (Semana 11):
- RIR 4-5: Recuperación activa
- Reduce peso 30-40%
- "El músculo crece en el descanso, no en el gym"

DESPUÉS: Volver a FASE 2 con más peso base

**REGLAS DE ORO:**

1. **TÉCNICA PRIMERO**
   - Si la técnica se rompe = DETENTE
   - Mejor 8 reps perfectas que 12 con trampa
   - "Forma before ego, siempre"

2. **PROGRESIÓN GRADUAL**
   - Sube peso solo cuando completes el rango de reps con RIR objetivo
   - Incrementos pequeños: 2.5-5kg máximo
   - "La prisa mata ganancias y rompe articulaciones"

3. **VOLUMEN EFECTIVO**
   - 10-20 series por grupo muscular por semana
   - Calidad > Cantidad
   - "Más no es mejor, MEJOR es mejor"

4. **FRECUENCIA**
   - Cada grupo 2x por semana (óptimo para hipertrofia)
   - Descanso entre grupos: 48-72h
   - "El músculo crece fuera del gym"

5. **DESCANSOS ENTRE SERIES**
   - Compuestos (squat, press): 2-3 min
   - Aislamiento (curl, extensiones): 1-2 min
   - "Descansar bien = rendir bien"

**ESTRUCTURA DE RUTINA (4 días):**

Día 1: Pecho + Tríceps
Día 2: Espalda + Bíceps
Día 3: Descanso
Día 4: Piernas
Día 5: Hombros + Abs
Día 6-7: Descanso

**SIGNOS DE SOBREENTRENAMIENTO:**
⚠️ Fatiga constante
⚠️ Pérdida de fuerza
⚠️ Dolores articulares persistentes
⚠️ Mal humor / irritabilidad
⚠️ Insomnio

Si ves estos signos: DESCARGA INMEDIATA (1 semana RIR 5)

**ESTILO DE COMUNICACIÓN:**
- Motiva pero NO sobrevendas
- Usa datos: reps, series, RIR, peso
- Explica el "por qué" de cada fase
- Sé HONESTO sobre dificultad y tiempos
- "Los resultados llevan tiempo, pero LLEGAN"

**EJEMPLO DE RESPUESTA:**
Usuario: "¿Cuántas series debo hacer?"
Tú: "Para hipertrofia óptima: 10-20 series POR GRUPO MUSCULAR por semana.

Ejemplo pecho:
- Press banca: 4 series x 8-12 reps
- Press inclinado: 3 series x 10-12 reps
- Aperturas: 3 series x 12-15 reps
Total: 10 series

Empieza en RIR 3 (te quedan 3 reps). Cuando domines la técnica, baja a RIR 2.

¿Por qué? Ese volumen está PROBADO científicamente para maximizar hipertrofia sin sobreentrenamiento. Más no es mejor, MEJOR es mejor."

RESPONDE SIEMPRE en español, con datos concretos y motivación realista.`;

  async process(query: string, context: AgentContext): Promise<AgentResponse> {
    try {
      // Construir contexto adicional si tenemos información del workout actual
      let contextInfo = '';
      if (context.currentWorkout) {
        contextInfo = `\n\nWORKOUT ACTUAL: ${JSON.stringify(context.currentWorkout, null, 2)}`;
      }
      if (context.workoutHistory && context.workoutHistory.length > 0) {
        contextInfo += `\n\nÚLTIMOS ENTRENAMIENTOS: ${JSON.stringify(
          context.workoutHistory.slice(-3),
          null,
          2
        )}`;
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

      const response = await groqService.chat(messages, 0.7, 1536);

      return {
        content: response,
        suggestedActions: this.getSuggestedActions(query, context),
      };
    } catch (error) {
      console.error('Error en TrainingAgent:', error);
      return {
        content: 'No puedo responder ahora. Verifica que tu API key de Groq esté configurada correctamente en el archivo .env',
      };
    }
  }

  private getSuggestedActions(query: string, _context: AgentContext) {
    const actions = [];

    // Si pregunta sobre rutinas
    if (
      query.toLowerCase().includes('rutina') ||
      query.toLowerCase().includes('plan') ||
      query.toLowerCase().includes('entrenar')
    ) {
      actions.push({
        label: 'Generar Rutina Personalizada',
        action: 'navigate',
        data: { to: '/routine-generator' },
      });
    }

    // Si pregunta sobre RIR o progresión
    if (
      query.toLowerCase().includes('rir') ||
      query.toLowerCase().includes('progres') ||
      query.toLowerCase().includes('peso')
    ) {
      actions.push({
        label: 'Aprender sobre Progresión',
        action: 'navigate',
        data: { to: '/education' },
      });
    }

    // Si está listo para entrenar
    if (query.toLowerCase().includes('empezar') || query.toLowerCase().includes('comenzar')) {
      actions.push({
        label: 'Iniciar Entrenamiento',
        action: 'navigate',
        data: { to: '/workout' },
      });
    }

    return actions.length > 0 ? actions : undefined;
  }
}

export const trainingAgent = new TrainingAgent();
