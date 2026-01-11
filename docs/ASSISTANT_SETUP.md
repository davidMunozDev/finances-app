# AI Assistant - Setup Guide

## Quick Start

### 1. Install Dependencies

The `openai` package has already been installed. If you need to reinstall:

```bash
cd backend
npm install openai
```

### 2. Configure Environment Variables

Add to your `backend/.env` file:

```env
# OpenAI Configuration (required for AI Assistant)
OPENAI_API_KEY=sk-proj-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Get your API Key:**

1. Go to https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy and paste it into your `.env` file

**Recommended Models:**

- `gpt-4o-mini` - Fast, cheap, good for most queries (recommended)
- `gpt-4o` - More intelligent but more expensive
- `gpt-4-turbo` - Balance between cost and capability

### 3. Start the Backend

```bash
cd backend
npm run dev
```

The assistant endpoint will be available at: `POST http://localhost:4000/assistant/query`

## Testing the Endpoint

### Using cURL

```bash
# First, login to get a token
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Copy the token from the response, then:
curl -X POST http://localhost:4000/assistant/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "question": "¿Cuánto he gastado este mes?",
    "budgetId": 1
  }'
```

### Using Postman/Insomnia

1. **Setup Authorization:**

   - Type: Bearer Token
   - Token: Your access token from login

2. **Make POST request to:**

   ```
   http://localhost:4000/assistant/query
   ```

3. **Request Body (JSON):**
   ```json
   {
     "question": "¿Cuánto he gastado este mes?",
     "budgetId": 1,
     "timezone": "Europe/Madrid"
   }
   ```

### Example Questions to Try

```json
{"question": "¿Cuánto he gastado este mes?", "budgetId": 1}
{"question": "¿En qué categorías gasto más?", "budgetId": 1}
{"question": "Muéstrame mis 5 gastos más grandes", "budgetId": 1}
{"question": "¿Tengo balance positivo este mes?", "budgetId": 1}
{"question": "¿Cuáles son mis gastos recurrentes?", "budgetId": 1}
{"question": "¿Cómo ha evolucionado mi gasto en los últimos 6 meses?", "budgetId": 1}
{"question": "¿Qué porcentaje de mis provisiones he usado?", "budgetId": 1}
```

## Files Created

### Core Implementation

- ✅ `src/types/assistant.types.ts` - TypeScript types
- ✅ `src/validators/assistant.validator.ts` - Request validation (Zod)
- ✅ `src/services/assistant-datasets.service.ts` - Dataset catalog & query engine
- ✅ `src/services/assistant-ai.service.ts` - OpenAI orchestration
- ✅ `src/controllers/assistant.controller.ts` - HTTP controller
- ✅ `src/routes/assistant.routes.ts` - Express routes
- ✅ `src/config/openai.config.ts` - OpenAI configuration

### Configuration

- ✅ `backend/.env.example` - Updated with OpenAI vars
- ✅ `src/app.ts` - Registered assistant routes

### Documentation

- ✅ `docs/assistant.md` - Complete API documentation with 12+ examples
- ✅ `docs/ASSISTANT_SETUP.md` - This setup guide

## Features Implemented

### ✅ Security

- SQL injection protection via parameterized queries
- User isolation (all queries filtered by `req.user.id`)
- Budget ownership verification
- Whitelist-based dataset access (no auth data exposed)
- Tool call limit (max 5 per query)

### ✅ Performance

- 5-minute cache for aggregate queries
- Automatic cache invalidation on data changes
- Response size limits (max 200 rows, default 50)
- Query optimization for current cycle vs historical

### ✅ Intelligence

- OpenAI function calling with 4 tools:
  1. `listDatasets` - Show available data
  2. `queryDataset` - Fetch filtered rows
  3. `aggregateDataset` - Sum/avg/count with grouping
  4. `complexAnalysis` - Month-over-month, year-over-year trends
- Automatic clarification requests for ambiguous questions
- Spanish language responses with Euro formatting
- Date range presets (this_month, last_month, this_year, last_year)

### ✅ Datasets Available

1. **budgets** - User's budget configurations
2. **transactions** - All expenses and incomes
3. **categories** - Spending categories
4. **provisions** - Budget allocations
5. **recurring_expenses** - Auto-generated recurring costs

## Troubleshooting

### Error: "OPENAI_API_KEY no está configurada"

**Solution:** Add your OpenAI API key to `backend/.env`

### Error: "Presupuesto no encontrado"

**Solution:** Make sure the `budgetId` in your request belongs to the authenticated user

### Error: "Se excedió el límite de 5 llamadas a herramientas"

**Solution:** Simplify your question or split it into multiple queries

### Response is slow (>5 seconds)

**Possible causes:**

- First-time query (not cached)
- Complex analysis requiring multiple tool calls
- Large date range with many transactions

**Solutions:**

- Wait for cache to populate (subsequent queries will be faster)
- Use more specific date ranges
- Ask simpler questions

### OpenAI Rate Limit Errors

**Solution:** Check your OpenAI usage tier and rate limits at https://platform.openai.com/account/limits

## Cache Management

The system automatically caches aggregate queries for 5 minutes to improve performance.

### Automatic Invalidation

Cache is automatically invalidated when:

- New transactions are created
- Transactions are updated or deleted
- Any financial data changes

### Manual Invalidation

If you need to manually clear the cache:

```bash
curl -X POST http://localhost:4000/assistant/invalidate-cache \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"dataset": "transactions"}'
```

Omit `dataset` to clear all cache for the user:

```bash
curl -X POST http://localhost:4000/assistant/invalidate-cache \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Cost Estimation

### Pricing (as of January 2026)

- **gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **gpt-4o**: ~$5 per 1M input tokens, ~$15 per 1M output tokens

### Typical Query Costs

- Simple query (1 tool call): ~$0.001-0.002 with gpt-4o-mini
- Complex query (3-5 tool calls): ~$0.003-0.006 with gpt-4o-mini
- Average: **~$0.003 per query** with gpt-4o-mini

### Monthly Estimates (based on usage)

- 100 queries/month: ~$0.30
- 1,000 queries/month: ~$3.00
- 10,000 queries/month: ~$30.00

**Recommendation:** Start with `gpt-4o-mini` for cost-effectiveness.

## Next Steps

### Integration with Frontend

To integrate with your React/Next.js frontend:

```typescript
// Example API call
async function askAssistant(question: string, budgetId: number) {
  const response = await fetch("/api/assistant/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      question,
      budgetId,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });

  return response.json();
}

// Usage
const result = await askAssistant("¿Cuánto he gastado este mes?", 1);
console.log(result.answer);
```

### Future Enhancements

Consider adding:

1. Conversation history for follow-up questions
2. Voice input/output integration
3. Scheduled reports ("send me my spending summary every Monday")
4. Smart alerts ("notify me if I exceed my budget")
5. Export functionality (Excel, PDF reports)
6. Chart generation from query results

## Support

For detailed API documentation, see: `docs/assistant.md`

For issues or questions:

1. Check the troubleshooting section above
2. Review the full documentation in `docs/assistant.md`
3. Check backend logs for detailed error messages
4. Verify your OpenAI API key is valid and has credits

---

**Version:** 1.0.0  
**Last Updated:** January 2026
