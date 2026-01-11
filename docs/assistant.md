# AI Assistant - Documentación

## Descripción General

El endpoint `/assistant/query` permite realizar consultas en lenguaje natural sobre todos los datos financieros del usuario utilizando inteligencia artificial. El asistente puede responder preguntas sobre gastos, ingresos, presupuestos, categorías, provisiones y gastos recurrentes.

## Características

✅ **Consultas en lenguaje natural** - Pregunta como lo harías normalmente  
✅ **Seguridad total** - Solo accede a datos del usuario autenticado (nunca datos de auth)  
✅ **Inteligente** - Usa OpenAI con function calling para consultas precisas  
✅ **Rápido** - Cache de 5 minutos en agregaciones para mejor rendimiento  
✅ **Multiusuario** - Filtra automáticamente por `user_id`  
✅ **Protegido contra SQL Injection** - Queries parametrizadas con whitelist de campos

## Endpoints

### `POST /assistant/query`

Procesa una pregunta en lenguaje natural y devuelve una respuesta con datos relevantes.

#### Autenticación

Requiere header `Authorization: Bearer <access_token>`

#### Request Body

```json
{
  "question": "¿Cuánto gasté este mes?",
  "budgetId": 1,
  "timezone": "Europe/Madrid"
}
```

**Campos:**

- `question` (string, requerido): Pregunta en lenguaje natural (1-1000 caracteres)
- `budgetId` (number, opcional): ID del presupuesto a consultar. Si se omite, puede consultar todos los presupuestos del usuario
- `timezone` (string, opcional): Zona horaria para cálculos de fechas. Default: `Europe/Madrid`

#### Response

```json
{
  "answer": "Este mes has gastado 1.234,56 € en total. La categoría con más gasto es Comida con 456,78 €.",
  "data": {
    "dataset": "transactions",
    "result": 1234.56,
    "metric": "sum(amount)"
  },
  "tool_used": "aggregateDataset",
  "needs_clarification": false,
  "metadata": {
    "total_count": 45,
    "showing_first": 50
  }
}
```

**Campos de respuesta:**

- `answer` (string): Respuesta en español con formato legible
- `data` (object, opcional): Datos crudos del último tool ejecutado (limitado a 50 filas)
- `tool_used` (string, opcional): Nombre del último tool utilizado
- `needs_clarification` (boolean, opcional): `true` si la pregunta es ambigua
- `clarifying_question` (string, opcional): Pregunta del asistente para aclarar
- `metadata` (object, opcional): Metadatos adicionales (conteo total, cache, etc.)

## Datasets Disponibles

El asistente puede consultar estos conjuntos de datos:

### 1. **budgets**

Presupuestos del usuario con configuración de ciclos y moneda.

**Campos:** `id`, `name`, `currency`, `reset_frequency`, `reset_day`, `is_active`  
**Filtros:** `is_active`, `currency`  
**Ordenamiento:** `name`, `created_at`  
**Agregaciones:** `count(id)`

### 2. **transactions**

Todas las transacciones (gastos e ingresos) del usuario.

**Campos:** `id`, `type`, `description`, `amount`, `date`, `category_id`, `category_name`, `provision_id`, `provision_name`, `source`  
**Filtros:** `type` (income/expense), `category_id`, `provision_id`, `source` (manual/recurring), `min_amount`, `max_amount`  
**Ordenamiento:** `date`, `amount`, `description`  
**Agregaciones:** `sum(amount)`, `avg(amount)`, `min(amount)`, `max(amount)`, `count(id)`  
**Agrupación:** `type`, `category_id`, `category_name`, `provision_id`, `source`, `date`

### 3. **categories**

Categorías de gastos (globales y del usuario).

**Campos:** `id`, `name`, `icon`, `user_id`  
**Filtros:** `user_owned` (boolean)  
**Ordenamiento:** `name`  
**Agregaciones:** `count(id)`

### 4. **provisions**

Provisiones asignadas a categorías dentro de un presupuesto.

**Campos:** `id`, `budget_id`, `category_id`, `category_name`, `name`, `amount`  
**Filtros:** `category_id`, `min_amount`, `max_amount`  
**Ordenamiento:** `name`, `amount`, `category_name`  
**Agregaciones:** `sum(amount)`, `avg(amount)`, `min(amount)`, `max(amount)`, `count(id)`  
**Agrupación:** `category_id`, `category_name`

### 5. **recurring_expenses**

Gastos recurrentes configurados para generación automática.

**Campos:** `id`, `budget_id`, `category_id`, `category_name`, `description`, `amount`, `frequency`, `reset_day`  
**Filtros:** `category_id`, `frequency` (weekly/monthly/yearly), `min_amount`, `max_amount`  
**Ordenamiento:** `description`, `amount`, `category_name`  
**Agregaciones:** `sum(amount)`, `avg(amount)`, `min(amount)`, `max(amount)`, `count(id)`  
**Agrupación:** `category_id`, `category_name`, `frequency`

## Ejemplos de Consultas

### 1. Total Gastado Este Mes

**Pregunta:**

```json
{
  "question": "¿Cuánto he gastado este mes?",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "Este mes has gastado 1.234,56 € en total.",
  "data": {
    "dataset": "transactions",
    "metric": "sum(amount)",
    "result": 1234.56
  },
  "tool_used": "aggregateDataset"
}
```

### 2. Desglose por Categorías

**Pregunta:**

```json
{
  "question": "¿En qué categorías gasto más?",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "Tus principales gastos por categoría son: Comida (456,78 €), Transporte (234,50 €), Casa (189,00 €). En total son 880,28 € repartidos en 3 categorías.",
  "data": {
    "dataset": "transactions",
    "metric": "sum(amount)",
    "result": [
      { "category_name": "Comida", "value": 456.78 },
      { "category_name": "Transporte", "value": 234.5 },
      { "category_name": "Casa", "value": 189.0 }
    ]
  },
  "tool_used": "aggregateDataset"
}
```

### 3. Presupuesto vs Realidad

**Pregunta:**

```json
{
  "question": "¿Cómo voy con mi presupuesto? ¿He superado alguna provisión?",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "Has gastado 1.234,56 € de un presupuesto total de 1.500,00 €. Te quedan 265,44 € (17,7%). Has superado la provisión de Comida: gastaste 456,78 € de 400,00 € asignados (+56,78 €).",
  "tool_used": "complexAnalysis"
}
```

### 4. Gastos Recurrentes

**Pregunta:**

```json
{
  "question": "¿Cuáles son mis gastos recurrentes?",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "Tienes 3 gastos recurrentes configurados:\n- Netflix (Entretenimiento): 12,99 € mensual\n- Gimnasio (Salud): 35,00 € mensual\n- Seguro (Casa): 450,00 € anual\n\nTotal mensual aproximado: 47,99 €",
  "data": {
    "dataset": "recurring_expenses",
    "rows": [
      {
        "id": 1,
        "description": "Netflix",
        "category_name": "Entretenimiento",
        "amount": 12.99,
        "frequency": "monthly"
      },
      {
        "id": 2,
        "description": "Gimnasio",
        "category_name": "Salud",
        "amount": 35.0,
        "frequency": "monthly"
      },
      {
        "id": 3,
        "description": "Seguro",
        "category_name": "Casa",
        "amount": 450.0,
        "frequency": "yearly"
      }
    ],
    "total_count": 3
  },
  "tool_used": "queryDataset"
}
```

### 5. Comparación Ingresos vs Gastos

**Pregunta:**

```json
{
  "question": "¿Tengo balance positivo este mes?",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "Este mes tienes un balance positivo de 265,44 €. Has ingresado 1.500,00 € y gastado 1.234,56 €. Tu tasa de ahorro es del 17,7%.",
  "tool_used": "aggregateDataset"
}
```

### 6. Top 5 Gastos Más Grandes

**Pregunta:**

```json
{
  "question": "Muéstrame mis 5 gastos más grandes de este mes",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "Tus 5 gastos más grandes este mes son:\n1. Alquiler (Casa) - 600,00 € el 1 de enero\n2. Compra supermercado (Comida) - 123,45 € el 15 de enero\n3. Gasolina (Transporte) - 78,90 € el 10 de enero\n4. Restaurante (Comida) - 65,50 € el 8 de enero\n5. Farmacia (Salud) - 45,30 € el 5 de enero",
  "data": {
    "dataset": "transactions",
    "rows": [
      {
        "id": 1,
        "description": "Alquiler",
        "category_name": "Casa",
        "amount": 600.0,
        "date": "2026-01-01"
      }
      // ... 4 más
    ],
    "total_count": 5
  },
  "tool_used": "queryDataset"
}
```

### 7. Análisis Histórico Mes a Mes

**Pregunta:**

```json
{
  "question": "¿Cómo ha evolucionado mi gasto en los últimos 6 meses?",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "Tu gasto ha ido aumentando gradualmente:\n- Agosto 2025: 980,50 €\n- Septiembre 2025: 1.050,30 € (+7,1%)\n- Octubre 2025: 1.120,00 € (+6,6%)\n- Noviembre 2025: 1.189,45 € (+6,2%)\n- Diciembre 2025: 1.456,78 € (+22,5%)\n- Enero 2026: 1.234,56 € (-15,3%)\n\nTendencia general: creciente (+25,9% en 6 meses)",
  "data": {
    "analysis_type": "month_over_month",
    "dataset": "transactions",
    "periods": [...],
    "summary": {
      "trend": "increasing",
      "change_percentage": 25.9
    }
  },
  "tool_used": "complexAnalysis"
}
```

### 8. Utilización de Provisiones

**Pregunta:**

```json
{
  "question": "¿Qué porcentaje de mis provisiones he usado?",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "Has utilizado el 82,3% de tus provisiones (1.234,56 € de 1.500,00 € asignados).\n\nDesglose por categoría:\n- Comida: 114% (456,78 € de 400,00 €) ⚠️ Excedido\n- Transporte: 78% (234,50 € de 300,00 €)\n- Casa: 63% (189,00 € de 300,00 €)\n- Entretenimiento: 45% (90,00 € de 200,00 €)",
  "tool_used": "aggregateDataset"
}
```

### 9. Comparación entre Presupuestos

**Pregunta:**

```json
{
  "question": "¿En cuál de mis presupuestos gasto más?"
}
```

**Respuesta:**

```json
{
  "answer": "Tienes 2 presupuestos activos:\n\n1. Presupuesto Personal: 1.234,56 € este mes\n2. Presupuesto Familiar: 2.456,78 € este mes\n\nGastas el doble en el Presupuesto Familiar. Total combinado: 3.691,34 €",
  "data": {
    "dataset": "transactions",
    "result": [
      { "budget_name": "Presupuesto Familiar", "value": 2456.78 },
      { "budget_name": "Presupuesto Personal", "value": 1234.56 }
    ]
  },
  "tool_used": "aggregateDataset"
}
```

### 10. Búsqueda Específica de Transacciones

**Pregunta:**

```json
{
  "question": "Muéstrame todos los gastos en restaurantes del mes pasado",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "El mes pasado tuviste 8 gastos en restaurantes por un total de 234,50 €. Promedio por comida: 29,31 €.",
  "data": {
    "dataset": "transactions",
    "rows": [
      {
        "id": 45,
        "description": "Cena italiana",
        "category_name": "Comida",
        "amount": 45.6,
        "date": "2025-12-28"
      }
      // ... 7 más
    ],
    "total_count": 8
  },
  "tool_used": "queryDataset"
}
```

### 11. Solicitud de Aclaración

**Pregunta:**

```json
{
  "question": "¿Cuánto gasté?",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "¿En qué período te gustaría saber tu gasto? Por ejemplo: este mes, el mes pasado, este año, o un rango de fechas específico.",
  "needs_clarification": true,
  "clarifying_question": "¿En qué período te gustaría saber tu gasto? Por ejemplo: este mes, el mes pasado, este año, o un rango de fechas específico."
}
```

### 12. Consulta de Datos Inexistentes

**Pregunta:**

```json
{
  "question": "¿Cuánto he ahorrado en inversiones?",
  "budgetId": 1
}
```

**Respuesta:**

```json
{
  "answer": "No tengo acceso a datos de inversiones en este presupuesto. Los datasets disponibles son: transacciones, categorías, provisiones y gastos recurrentes. Si quieres registrar inversiones, podrías crear una categoría 'Inversiones' y registrarlas como gastos o ingresos según corresponda.",
  "needs_clarification": true
}
```

## Rangos de Fechas

El asistente soporta varios formatos de fechas:

### Presets

- `this_month` - Mes actual
- `last_month` - Mes pasado
- `this_year` - Año actual
- `last_year` - Año pasado

### Fechas Explícitas

```json
{
  "date_range": {
    "from": "2025-12-01",
    "to": "2025-12-31"
  }
}
```

### Default

Si no se especifica rango de fechas, usa el **ciclo actual** del presupuesto (basado en `reset_frequency` y `reset_day`).

## Herramientas (Tools) Disponibles

El asistente usa estas 4 herramientas internamente:

### 1. `listDatasets()`

Lista todos los datasets disponibles y sus capacidades.

### 2. `queryDataset(dataset, filters?, date_range?, limit?, sort?)`

Obtiene filas de un dataset con filtros y ordenamiento.

**Límites:**

- Máximo 200 filas por query
- Default: 50 filas
- Si hay más, devuelve `showing_first` en metadata

### 3. `aggregateDataset(dataset, metric, field?, group_by?, date_range?, filters?)`

Calcula agregaciones: sum, avg, count, min, max.

**Métricas:**

- `sum(field)` - Suma total
- `avg(field)` - Promedio
- `count(*)` - Conteo
- `min(field)` - Mínimo
- `max(field)` - Máximo

**Agrupación:**

- Máximo 2 campos
- Resultados ordenados por valor descendente

### 4. `complexAnalysis(analysis_type, dataset, metric, field?, date_range?, filters?)`

Análisis temporales complejos:

- `month_over_month` - Últimos 6 meses comparados
- `year_over_year` - Este año vs año pasado por meses
- `trend_analysis` - Tendencia de últimos 12 meses

## Seguridad

### ✅ Datos Permitidos

- Presupuestos (`budgets`)
- Transacciones (`transactions`)
- Categorías (`categories`)
- Provisiones (`provisions`)
- Gastos recurrentes (`recurring_expenses`)

### ❌ Datos Prohibidos

- Usuarios (`users`)
- Contraseñas (`password_hash`)
- Tokens (`refresh_tokens`)
- Emails (si se considera dato de auth)
- Cualquier dato de autenticación

### Protecciones

1. **SQL Injection**: Queries parametrizadas con whitelist de campos
2. **User Isolation**: Todos los queries filtran por `req.user.id` automáticamente
3. **Budget Ownership**: Verifica que el usuario sea dueño del budget antes de consultar
4. **Tool Call Limit**: Máximo 5 llamadas por query para evitar loops infinitos
5. **No SQL Dinámico**: El modelo NO puede generar SQL arbitrario, solo invocar tools predefinidas

## Cache

El sistema implementa un cache en memoria de 5 minutos para agregaciones:

- **TTL:** 5 minutos
- **Invalidación:** Automática al crear/actualizar transacciones
- **Scope:** Por usuario y dataset
- **Tipos cached:** Solo `aggregateDataset` (queries no se cachean por su naturaleza dinámica)

### Invalidar Cache Manualmente

```http
POST /assistant/invalidate-cache
Authorization: Bearer <token>
Content-Type: application/json

{
  "dataset": "transactions"  // opcional, omitir para invalidar todo
}
```

**Response:** `204 No Content`

## Límites y Restricciones

- **Máximo de tool calls:** 5 por query
- **Máximo de filas retornadas:** 200 (default 50)
- **Máximo de campos en group_by:** 2
- **Longitud de pregunta:** 1-1000 caracteres
- **Rate limiting:** Heredado de OpenAI (depende de tu plan)

## Variables de Entorno

Añade estas variables a tu `.env`:

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
```

**Modelos recomendados:**

- `gpt-4o-mini` - Rápido y económico (recomendado)
- `gpt-4o` - Más inteligente pero más caro
- `gpt-4-turbo` - Balance entre costo y capacidad

## Manejo de Errores

### Error: API Key no configurada

```json
{
  "status": 500,
  "code": "INTERNAL_ERROR",
  "message": "OPENAI_API_KEY no está configurada"
}
```

**Solución:** Añadir `OPENAI_API_KEY` al `.env`

### Error: Límite de tool calls excedido

```json
{
  "status": 500,
  "code": "INTERNAL_ERROR",
  "message": "Se excedió el límite de 5 llamadas a herramientas. Pregunta demasiado compleja."
}
```

**Solución:** Simplificar la pregunta o dividirla en varias queries

### Error: Dataset desconocido

```json
{
  "status": 500,
  "code": "INTERNAL_ERROR",
  "message": "Dataset desconocido: investments"
}
```

**Solución:** Usar solo datasets disponibles (ver lista arriba)

### Error: Presupuesto no encontrado

```json
{
  "status": 404,
  "code": "RESOURCE_NOT_FOUND",
  "message": "Presupuesto no encontrado"
}
```

**Solución:** Verificar que el `budgetId` existe y pertenece al usuario

## Mejores Prácticas

### ✅ DO

- Ser específico en las preguntas
- Incluir `budgetId` cuando consultes un presupuesto específico
- Usar lenguaje natural y claro
- Preguntar por rangos de fechas concretos cuando sea relevante
- Dividir preguntas muy complejas en varias más simples

### ❌ DON'T

- No pedir datos de autenticación (el asistente no puede acceder)
- No hacer preguntas extremadamente vagas ("dime algo")
- No esperar datos que no existen en el sistema
- No abusar del endpoint (usa cache cuando sea posible)

## Performance

**Tiempos típicos de respuesta:**

- Queries simples (agregaciones cached): ~500-800ms
- Queries complejas (sin cache): ~1.5-3s
- Análisis temporales (`complexAnalysis`): ~3-5s

**Optimizaciones:**

- Cache de 5 min en agregaciones reduce latencia en 80%
- Queries sobre ciclo actual son más rápidas (no requiere joins históricos)
- Limitar resultados a 50 filas mejora tiempo de respuesta

## Roadmap Futuro

Posibles mejoras:

1. **Historial de conversación** - Mantener contexto entre queries
2. **Exportación de datos** - Generar Excel/CSV desde el asistente
3. **Alertas inteligentes** - "Avísame si gasto más de X en categoría Y"
4. **Recomendaciones** - Sugerencias de ahorro basadas en patrones
5. **Gráficas** - Generar visualizaciones desde el asistente
6. **Comparaciones con objetivos** - "¿Voy a cumplir mi meta de ahorro?"

## Soporte

Si encuentras problemas:

1. Verifica que `OPENAI_API_KEY` está configurada
2. Confirma que el usuario tiene presupuestos/transacciones creados
3. Revisa los logs del backend para errores de OpenAI
4. Prueba con preguntas más simples
5. Invalida el cache si ves datos desactualizados

---

**Última actualización:** Enero 2026  
**Versión:** 1.0.0
