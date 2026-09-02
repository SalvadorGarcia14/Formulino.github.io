# Formulino.github.io
Formulino 🏎️ será un minijuego web de gestión y simulación de carrera profesional de un piloto de automovilismo.





Entendido. Asumo el rol de desarrollador Front-End senior en React.js y diseñador de sistemas para juegos web. El enfoque será modular, paso a paso, priorizando la arquitectura del estado y mecánicas sólidas antes de apilar capas de complejidad visual.

Para garantizar que el MVP no se vuelva inmanejable ni frágil, es crucial resolver un primer desafío técnico y de diseño:

1. El riesgo del "estado disperso"
Un juego de este estilo puede descontrolarse rápido si manejamos estadísticas, historial de carreras, estado del equipo y eventos en useState separados repartidos por páginas.

Para Formulino, la espina dorsal debe ser una máquina de estados centralizada (usando useReducer + Context API nativo de React, persistido automáticamente en localStorage). Esto permite que:

Las acciones sean puras y predecibles (ej: dispatch({ type: 'COMPLETE_RACE', payload: raceResult })).

El cálculo de popularidad, desgaste, reputación y ofertas ocurra de forma determinista y fácil de testear.

Si el jugador recarga el navegador, la partida continúe exactamente en el mismo punto de la temporada.

2. Mapa de ruta propuesto para el MVP
Dividiremos la construcción en fases ordenadas:

Fase 1: Núcleo del Proyecto y Modelos de Datos

Configuración base de Vite + React.

Definición estricta del esquema del piloto, estadísticas (0-100), categorías y equipos ficticios iniciales (Karting Nacional).

Fase 2: Motor de Estado y Persistencia (useCareerEngine)

GameContext y reductor central para gestionar el flujo: Creación → Pretemporada → Calendario de carreras → Eventos → Fin de temporada.

Fase 3: Pantalla de Creación y Selección de Equipo

Formularios controlados, validaciones de dorsal/nombre, asignación balanceada de estadísticas iniciales.

Fase 4: Motor de Simulación de Carrera y Eventos

Algoritmo probabilístico de resultado (P1 a P20) basado en: Rendimiento del piloto + Rendimiento del auto + Factor consistencia/riesgo + Azar ponderado.

Integración de eventos contextuales durante la carrera o entre fechas.

Fase 5: Fin de Temporada, Renovaciones y Ascenso a Karting Internacional




1. Estructura de carpetas recomendada
Dentro de tu proyecto generado con Vite (npm create vite@latest formulino -- --template react), organizá el directorio src/ de la siguiente manera:

src/
├── assets/
├── components/
│   ├── common/
│   └── ui/
│   ├── StatBar.jsx             # Barra visual de estadísticas reutilizable
│   └── TeamCard.jsx            # Tarjeta de selección de equipo
├── context/
│   └── CareerContext.jsx         # Estado global, persistencia LocalStorage y reducers
├── data/
│   ├── categories.js            # Jerarquía de categorías (Karting a F1)
│   ├── teams.js                 # Equipos ficticios con atributos de rendimiento
│   ├── circuits.jsx             # Circuitos por categoría
│   └── initialPilotStats.js      #Por ver
├── hooks/
│   └── useGame.js
├── pages/
│   └── CreatePlayer.jsx        # Pantalla con el stepper (Paso 1: Piloto, Paso 2: Equipo)
├── services/
│   └── raceEngine.js
├── styles/
│   └── variables.css
├── utils/
│   └── storage.js             # Helpers seguros para LocalStorage
│   └── calculations.js        
├── App.jsx
├── index.css
└── main.jsx