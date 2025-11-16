# GymBro - Aplicación de Entrenamiento Personalizado

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Mobile](https://img.shields.io/badge/mobile-optimized-success.svg)

Una aplicación web progresiva (PWA) de entrenamiento personalizado completamente gratuita y open-source. **100% optimizada para uso móvil en el gimnasio**.

## Características Principales

- **100% Optimizado para Móvil**: Diseñado específicamente para uso en el gimnasio desde tu teléfono
- **100% Gratuito y Open Source**: Sin costos ocultos, sin anuncios, sin venta de datos
- **Progressive Web App (PWA)**: Funciona offline, instalable como app nativa
- **Base de Conocimiento Experta**: Biblioteca de ejercicios con técnica detallada y clasificación tier (S/A/B/C/F)
- **Generador de Rutinas Inteligente**: Crea rutinas personalizadas según tu nivel, objetivos y equipamiento
- **Sistema de Progresión Automática**: Sugiere cuándo subir peso o repeticiones basándose en RIR
- **Seguimiento Completo**: Registra series, repeticiones, peso, RIR y sensación muscular
- **Análisis de Progreso**: Gráficos y estadísticas de tu evolución
- **Calculadora Nutricional**: Diseñada especialmente para ectomorfos y objetivos de hipertrofia
- **Modo Offline Completo**: Todos tus datos almacenados localmente con IndexedDB

## Stack Tecnológico

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **UI Components**: shadcn/ui (Tailwind CSS + Radix UI)
- **Iconos**: Lucide React
- **Gráficos**: Recharts
- **Routing**: React Router DOM v7
- **Estado Global**: Zustand con persistencia

### Backend & Datos
- **Base de Datos Local**: Dexie.js (wrapper de IndexedDB)
- **Almacenamiento**: 100% local, sin backend requerido
- **Persistencia**: Zustand persist para configuraciones de usuario

## Instalación y Uso

### Opción 1: Usar como PWA (Recomendado para usuarios)
1. Visita la aplicación en tu navegador
2. Haz clic en "Instalar" o "Agregar a pantalla de inicio"
3. ¡Listo! Ahora funciona como una app nativa

### Opción 2: Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/Edgar-Manuel/Gymbro-.git
cd Gymbro-

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Preview de producción
npm run preview
```

## Estructura del Proyecto

```
Gymbro-/
├── src/
│   ├── components/         # Componentes React reutilizables
│   │   ├── ui/            # Componentes UI de shadcn (100% responsive)
│   │   └── Layout.tsx     # Layout principal con navegación móvil
│   ├── pages/             # Páginas de la aplicación
│   │   ├── Dashboard.tsx  # Panel principal
│   │   └── ExerciseLibrary.tsx  # Biblioteca de ejercicios
│   ├── db/                # Configuración de Dexie.js (IndexedDB)
│   ├── data/              # Datos semilla con 15+ ejercicios tier S/A
│   ├── store/             # Estado global con Zustand
│   ├── types/             # Definiciones de TypeScript
│   ├── utils/             # Funciones utilitarias
│   └── lib/               # Librerías y helpers
├── public/                # Archivos estáticos y manifest PWA
└── package.json
```

## Sistema de Clasificación Tier

Basado en evidencia científica y experiencia práctica:

- **Tier S**: Ejercicios fundamentales e imprescindibles (Press Banca, Sentadillas, Dominadas, etc.)
- **Tier A**: Ejercicios muy efectivos y altamente recomendados
- **Tier B**: Ejercicios buenos y útiles para complementar
- **Tier C**: Ejercicios aceptables pero con mejores alternativas
- **Tier F**: Ejercicios poco efectivos o potencialmente peligrosos

## Optimizaciones para Móvil

La aplicación está diseñada específicamente para uso en el gimnasio:

- ✅ Interfaz touch-friendly con botones grandes
- ✅ Navegación móvil optimizada (menú hamburguesa)
- ✅ Responsive design desde 320px hasta 4K
- ✅ Modo oscuro para entrenar en cualquier luz
- ✅ Sin tiempos de carga (datos locales)
- ✅ Funciona completamente offline
- ✅ Textos legibles sin zoom
- ✅ Acciones con una sola mano

## Progresión Inteligente

El sistema utiliza el concepto de **RIR (Reps In Reserve)**:

- **RIR 0-1**: Listo para subir peso
- **RIR 2-3**: Rango ideal para hipertrofia
- **RIR 4+**: Peso demasiado ligero, sube agresivamente

### Recomendaciones Automáticas
- Incrementos de 2.5kg para ejercicios compuestos
- Incrementos de 1.25kg para aislamientos
- Detección automática de necesidad de deload

## Roadmap

### Fase 1: MVP ✅
- ✅ Biblioteca de ejercicios con 15+ ejercicios tier S/A
- ✅ Sistema de almacenamiento local (Dexie.js)
- ✅ Dashboard con estadísticas
- ✅ Interfaz 100% responsive

### Fase 2: Core Features (En Desarrollo)
- ⏳ Generador de rutinas personalizadas
- ⏳ Interfaz de entrenamiento en vivo con timer
- ⏳ Gráficos interactivos de progreso
- ⏳ Sistema de progresión automática completo

### Fase 3: PWA & Enhancements
- 📋 Service Worker para offline completo
- 📋 Calculadora nutricional para ectomorfos
- 📋 Exportación de datos (CSV, PDF)
- 📋 Sistema de logros y gamificación
- 📋 Notificaciones push para recordatorios

## Privacidad y Seguridad

- **100% Local**: Todos los datos en tu navegador
- **Sin Tracking**: Cero telemetría
- **Sin Backend**: No hay servidores
- **Exportable**: Datos siempre bajo tu control
- **GDPR Compliant**: Total privacidad

## Tecnologías

```json
{
  "react": "^19.2.0",
  "typescript": "~5.9.3",
  "vite": "^7.2.2",
  "tailwindcss": "^3.x",
  "dexie": "^4.2.1",
  "zustand": "^5.0.8",
  "recharts": "^3.4.1"
}
```

## Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## Contacto

GitHub Issues: [https://github.com/Edgar-Manuel/Gymbro-/issues](https://github.com/Edgar-Manuel/Gymbro-/issues)

---

**GymBro** - Entrena inteligente, progresa consistentemente 💪📱
