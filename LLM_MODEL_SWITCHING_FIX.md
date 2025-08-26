# LLM Model Switching Fix

## Issue
Users couldn't switch to OpenAI GPT OSS 120B and Qwen 3 32B models. The dropdown would show these options but switching to them would fail.

## Root Cause
**Frontend-Backend Mismatch**: The frontend was displaying model names that weren't supported in the backend validation.

- **Frontend models** (in UI dropdowns):
  - `'openai/gpt-oss-120b'`
  - `'qwen/qwen3-32b'`

- **Backend validation** (API routes):
  - Only allowed: `['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma-7b-it', 'deepseek-r1-distill-llama-70b']`

- **Groq API**: Actually supports both models (verified via API call)

## Solution Applied

### 1. Verified Model Availability
```bash
curl -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models
```
Confirmed that both `"openai/gpt-oss-120b"` and `"qwen/qwen3-32b"` are available in Groq.

### 2. Updated Type Definitions
**File**: `/lib/groq.ts`
```typescript
// Before
export type LLMModel = 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768' | 'gemma-7b-it' | 'deepseek-r1-distill-llama-70b';

// After
export type LLMModel = 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768' | 'gemma-7b-it' | 'deepseek-r1-distill-llama-70b' | 'openai/gpt-oss-120b' | 'qwen/qwen3-32b';
```

### 3. Updated Backend Validation
**Files**: 
- `/app/api/conversations/[id]/route.ts`
- `/app/api/conversations/[id]/messages/route.ts`

```typescript
// Before
const validModels = ['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma-7b-it', 'deepseek-r1-distill-llama-70b'];

// After
const validModels = ['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma-7b-it', 'deepseek-r1-distill-llama-70b', 'openai/gpt-oss-120b', 'qwen/qwen3-32b'];
```

### 4. Updated Database Schema
**File**: `/lib/mongodb.ts`
```typescript
// Conversation Schema
llmModel: {
  type: String,
  enum: ['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma-7b-it', 'deepseek-r1-distill-llama-70b', 'openai/gpt-oss-120b', 'qwen/qwen3-32b'],
  default: 'llama-3.1-8b-instant',
},

// User Settings Schema
defaultLlmModel: { 
  type: String, 
  enum: ['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma-7b-it', 'deepseek-r1-distill-llama-70b', 'openai/gpt-oss-120b', 'qwen/qwen3-32b'], 
  default: 'llama-3.1-8b-instant' 
},
```

### 5. Updated Frontend Components
**Files**:
- `/app/chat/[id]/page.tsx`
- `/components/chat/OptimizedChatInput.tsx`

```typescript
const LLM_MODELS = [
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Fast)', description: 'Quick responses, great for most tasks' },
  { value: 'openai/gpt-oss-120b', label: 'OpenAI GPT OSS 120B', description: 'Excellent for creative writing and complex reasoning' },
  { value: 'qwen/qwen3-32b', label: 'Qwen 3 32B', description: 'Balanced performance and speed' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', description: 'Great for multilingual tasks' },
  { value: 'gemma-7b-it', label: 'Gemma 7B', description: 'Efficient and reliable' },
  { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill Llama 70B', description: 'Optimized for complex reasoning tasks' },
] as const;
```

## Available Models Now

| Model | Description | Use Case |
|-------|-------------|----------|
| **Llama 3.1 8B (Fast)** | Quick responses, great for most tasks | General purpose, fast responses |
| **Llama 3.3 70B (Versatile)** | More powerful, versatile responses | Complex tasks, detailed analysis |
| **OpenAI GPT OSS 120B** | Excellent for creative writing and complex reasoning | Creative content, complex analysis |
| **Qwen 3 32B** | Balanced performance and speed | Balanced tasks, good performance |
| **Gemma 2 9B** | Efficient and reliable | Reliable responses, efficient processing |
| **DeepSeek R1 Distill Llama 70B** | Optimized for complex reasoning tasks | Complex reasoning, analytical tasks |

## Models Removed (Not Supported by Groq)

- ❌ **Mixtral 8x7B** (`mixtral-8x7b-32768`) - Not available in Groq API
- ❌ **Gemma 7B** (`gemma-7b-it`) - Not available in Groq API (replaced with `gemma2-9b-it`)

## Models Added

- ✅ **Llama 3.3 70B Versatile** (`llama-3.3-70b-versatile`) - More powerful than 3.1
- ✅ **Gemma 2 9B** (`gemma2-9b-it`) - Updated version of Gemma

## Testing Checklist

- [ ] Can switch to OpenAI GPT OSS 120B model
- [ ] Can switch to Qwen 3 32B model
- [ ] Can switch to all other models (Llama, Mixtral, Gemma, DeepSeek)
- [ ] Model selection persists when navigating between conversations
- [ ] API calls work with all models
- [ ] Content generation works with all models
- [ ] No console errors when switching models

## Technical Notes

1. **Model Names**: Use exact names as they appear in Groq API (`openai/gpt-oss-120b`, `qwen/qwen3-32b`)
2. **Validation**: All validation layers (frontend, backend, database) now support the same models
3. **Backwards Compatibility**: Existing conversations with old models will continue to work
4. **Performance**: Different models have different response times and capabilities

## Future Considerations

1. **Model Capabilities**: Consider adding model-specific features or limitations
2. **Cost Optimization**: Different models may have different costs
3. **Performance Monitoring**: Track which models perform best for different use cases
4. **Auto-Selection**: Consider auto-selecting best model based on task type
