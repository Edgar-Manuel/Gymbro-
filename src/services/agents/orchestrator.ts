/**
 * Agente Orquestador Principal
 * Decide qué subagente debe responder según la consulta del usuario
 */

import { groqService, type GroqMessage } from '../groq';
import type { Agent, AgentType, AgentContext, AgentResponse } from './types';
import { nutritionAgent } from './nutritionAgent';
import { exerciseAgent } from './exerciseAgent';
import { trainingAgent } from './trainingAgent';
import { progressAgent } from './progressAgent';

class OrchestratorAgent implements Agent {
  type: 'orchestrator' = 'orchestrator';
  name = 'GymBro Assistant';

  // Mapa de subagentes
  private subAgents: Map<AgentType, Agent>;

  constructor() {
    this.subAgents = new Map<AgentType, Agent>([
      ['nutrition', nutritionAgent],
      ['exercise', exerciseAgent],
      ['training', trainingAgent],
      ['progress', progressAgent],
    ]);
  }

  systemPrompt = `Eres GymBro Assistant, el asistente principal de GymBro, la mejor app de entrenamiento del mundo.

Tu misión es ENTENDER la consulta del usuario y DECIDIR qué experto debe responderla.

EXPERTOS DISPONIBLES:

1. **nutrition** - Experto en Nutrición y dietAI
   - Calorías, macros, timing de nutrientes
   - Plan de comidas para hipertrofia
   - Suplementación (proteína, creatina)
   - Intolerancia a lactosa
   - Qué comer y cuándo

2. **exercise** - Experto en Ejercicios y Técnica BlueGym
   - Cómo ejecutar ejercicios correctamente
   - Retracción escapular, forma de flecha
   - Anatomía muscular
   - Prevención de lesiones
   - Técnica sobre ego

3. **training** - Experto en Entrenamiento y Progresión
   - Sistema RIR (Reps In Reserve)
   - Rutinas y splits
   - Series, repeticiones, descansos
   - Periodización y fases
   - Sobreentrenamiento

4. **progress** - Experto en Análisis de Progreso
   - Análisis de datos históricos
   - Tendencias de fuerza
   - Peso corporal y medidas
   - Detección de estancamientos
   - Ajustes basados en resultados

TU TRABAJO:
1. Lee la consulta del usuario
2. Identifica el tema principal
3. Responde SOLO con el nombre del experto: "nutrition", "exercise", "training" o "progress"
4. Si la consulta es general o de bienvenida, responde "orchestrator"

EJEMPLOS:

Usuario: "¿Qué debo comer después de entrenar?"
Tú: nutrition

Usuario: "¿Cómo hago press de banca correctamente?"
Tú: exercise

Usuario: "¿Cuántas series debo hacer?"
Tú: training

Usuario: "¿Estoy progresando bien?"
Tú: progress

Usuario: "Hola, ¿qué puedes hacer?"
Tú: orchestrator

Usuario: "¿Cómo gano masa muscular?"
Tú: orchestrator (es general, necesita explicación global)

RESPONDE SOLO CON EL NOMBRE DEL AGENTE, NADA MÁS.`;

  async process(query: string, context: AgentContext): Promise<AgentResponse> {
    try {
      // Primero, determinar qué agente debe responder
      const agentType = await this.routeToAgent(query, context);

      // Si debe responder el orquestador directamente
      if (agentType === 'orchestrator') {
        return await this.respondDirectly(query, context);
      }

      // Delegar al subagente correspondiente
      const agent = this.subAgents.get(agentType);
      if (!agent) {
        throw new Error(`Agente ${agentType} no encontrado`);
      }

      return await agent.process(query, context);
    } catch (error) {
      console.error('Error en Orchestrator:', error);
      return {
        content:
          'Lo siento, ha ocurrido un error. Verifica que tu API key de Groq esté configurada correctamente en el archivo .env',
      };
    }
  }

  /**
   * Determina qué agente debe responder
   */
  private async routeToAgent(query: string, _context: AgentContext): Promise<AgentType | 'orchestrator'> {
    // Reglas simples primero (más rápido y no consume API)
    const lowerQuery = query.toLowerCase();

    // Nutrición
    if (
      lowerQuery.includes('comer') ||
      lowerQuery.includes('comida') ||
      lowerQuery.includes('dieta') ||
      lowerQuery.includes('nutrición') ||
      lowerQuery.includes('calorías') ||
      lowerQuery.includes('proteína') ||
      lowerQuery.includes('creatina') ||
      lowerQuery.includes('suplemento') ||
      lowerQuery.includes('batido')
    ) {
      return 'nutrition';
    }

    // Ejercicios
    if (
      lowerQuery.includes('cómo hacer') ||
      lowerQuery.includes('técnica') ||
      lowerQuery.includes('ejercicio') ||
      lowerQuery.includes('press') ||
      lowerQuery.includes('dominada') ||
      lowerQuery.includes('sentadilla') ||
      lowerQuery.includes('curl') ||
      lowerQuery.includes('remo') ||
      lowerQuery.includes('retracción') ||
      lowerQuery.includes('forma de flecha') ||
      lowerQuery.includes('lesión') ||
      lowerQuery.includes('dolor')
    ) {
      return 'exercise';
    }

    // Entrenamiento
    if (
      lowerQuery.includes('rutina') ||
      lowerQuery.includes('entrenamiento') ||
      lowerQuery.includes('entrenar') ||
      lowerQuery.includes('series') ||
      lowerQuery.includes('repeticiones') ||
      lowerQuery.includes('rir') ||
      lowerQuery.includes('descanso') ||
      lowerQuery.includes('frecuencia') ||
      lowerQuery.includes('volumen') ||
      lowerQuery.includes('split')
    ) {
      return 'training';
    }

    // Progreso
    if (
      lowerQuery.includes('progreso') ||
      lowerQuery.includes('progresando') ||
      lowerQuery.includes('avance') ||
      lowerQuery.includes('estancado') ||
      lowerQuery.includes('mejorando') ||
      lowerQuery.includes('resultados') ||
      lowerQuery.includes('evolución')
    ) {
      return 'progress';
    }

    // Saludos y consultas generales
    if (
      lowerQuery.includes('hola') ||
      lowerQuery.includes('ayuda') ||
      lowerQuery.includes('qué puedes') ||
      lowerQuery.includes('cómo funciona') ||
      lowerQuery.includes('ganar músculo') ||
      lowerQuery.includes('hipertrofia')
    ) {
      return 'orchestrator';
    }

    // Si no hay coincidencia clara, usar IA para decidir
    try {
      const messages: GroqMessage[] = [
        {
          role: 'system',
          content: this.systemPrompt,
        },
        {
          role: 'user',
          content: query,
        },
      ];

      const response = await groqService.chat(messages, 0.3, 50);
      const agentName = response.trim().toLowerCase();

      if (
        agentName === 'nutrition' ||
        agentName === 'exercise' ||
        agentName === 'training' ||
        agentName === 'progress'
      ) {
        return agentName as AgentType;
      }

      return 'orchestrator';
    } catch (error) {
      console.error('Error al enrutar consulta:', error);
      return 'orchestrator';
    }
  }

  /**
   * Respuestas directas del orquestador
   */
  private async respondDirectly(query: string, _context: AgentContext): Promise<AgentResponse> {
    const lowerQuery = query.toLowerCase();

    // Saludo
    if (lowerQuery.includes('hola') || lowerQuery.includes('hey')) {
      return {
        content: `¡Hola! Soy tu coach virtual GymBro.

Puedo ayudarte directamente con:

💪 **Ejercicios** - "¿Cómo hago press de banca?" "¿Qué es retracción escapular?"
🍽️ **Nutrición** - "¿Qué comer post-entreno?" "¿Cuántas calorías necesito?"
🏋️ **Entrenamiento** - "¿Qué es RIR?" "¿Cuántas series hacer?"
📊 **Progreso** - "¿Estoy progresando?" "¿Cómo saber si estanco?"

Pregúntame lo que necesites y te responderé directamente.`,
        suggestedActions: [
          { label: 'Mi Plan de Nutrición', action: 'navigate', data: { to: '/nutrition' } },
          { label: 'Biblioteca de Ejercicios', action: 'navigate', data: { to: '/exercises' } },
        ],
      };
    }

    // Pregunta sobre funcionalidades
    if (lowerQuery.includes('qué puedes') || lowerQuery.includes('ayuda')) {
      return {
        content: `Soy tu asistente experto en GymBro. Tengo 4 especialistas a tu disposición:

**🍽️ Experto en Nutrición**
- Plan dietAI personalizado (3,000 kcal en días de entreno)
- Timing de nutrientes y macros
- Suplementación (proteína ISO Whey, creatina)
- Compatible con intolerancia a lactosa

**💪 Experto en Ejercicios**
- Técnica BlueGym (retracción escapular, forma de flecha)
- 38 ejercicios con detalle anatómico
- Prevención de lesiones
- "Técnica sobre ego, siempre"

**🏋️ Experto en Entrenamiento**
- Sistema RIR (Reps In Reserve)
- Rutinas personalizadas
- Progresión inteligente por fases
- Volumen y frecuencia óptimos

**📊 Experto en Progreso**
- Análisis de datos de fuerza
- Tendencias de peso corporal
- Detección de estancamientos
- Ajustes basados en resultados

Pregúntame lo que necesites sobre entrenamiento, nutrición, ejercicios o progreso.`,
      };
    }

    // Pregunta general sobre hipertrofia/ganar músculo
    if (lowerQuery.includes('ganar músculo') || lowerQuery.includes('hipertrofia') || lowerQuery.includes('masa muscular')) {
      return {
        content: `Para ganar masa muscular (hipertrofia), necesitas 3 pilares NO NEGOCIABLES:

**1️⃣ NUTRICIÓN (70% del éxito)**
- Superávit calórico: 300-500 kcal sobre tu TDEE
- Proteína: 1.6-2.2g por kg de peso corporal
- Como ectomorfo: 3,000 kcal en días de entreno
- Consistencia > perfección

**2️⃣ ENTRENAMIENTO (25% del éxito)**
- 10-20 series por grupo muscular por semana
- RIR 1-3 (cerca del fallo pero con técnica)
- Frecuencia: cada grupo 2x por semana
- Progresión gradual: +2.5-5kg cuando completes el rango

**3️⃣ DESCANSO (5% del éxito)**
- 7-9 horas de sueño
- 48-72h entre grupos musculares
- El músculo crece FUERA del gym

**La verdad dura**: No hay atajos. Necesitas 6-12 meses de CONSISTENCIA para ver cambios significativos.

¿Quieres ayuda con tu nutrición, rutina de entrenamiento, o aprender técnica correcta?`,
        suggestedActions: [
          { label: 'Ver Mi Plan de Nutrición', action: 'navigate', data: { to: '/nutrition' } },
          { label: 'Generar Rutina', action: 'navigate', data: { to: '/routine-generator' } },
          { label: 'Aprender Técnica', action: 'navigate', data: { to: '/education' } },
        ],
      };
    }

    // Respuesta genérica
    return {
      content: 'No estoy seguro de cómo ayudarte con eso. Puedes preguntarme sobre:\n\n- Nutrición y dieta\n- Técnica de ejercicios\n- Rutinas de entrenamiento\n- Análisis de tu progreso\n\n¿Qué te gustaría saber?',
    };
  }
}

export const orchestrator = new OrchestratorAgent();
