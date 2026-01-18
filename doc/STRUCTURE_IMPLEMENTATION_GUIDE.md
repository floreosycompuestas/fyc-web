# Project Structure Implementation Guide

## New Architecture Overview

### 1. **Types Directory** ✅
```
app/types/
├── bird.ts           # Bird entity types
├── breeder.ts        # Breeder entity types
└── index.ts          # Barrel export
```

**Usage:**
```typescript
import { Bird, BirdFormData, Breeder } from '@/app/types';
```

---

### 2. **Library/Utils** ✅
```
app/lib/
├── constants.ts      # API endpoints, messages, nav items
├── api/
│   ├── birds.ts      # Bird API functions
│   └── breeders.ts   # Breeder API functions
```

**Usage:**
```typescript
import { fetchBirdsByBreeder, createBird } from '@/app/lib/api/birds';
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/app/lib/constants';
```

---

### 3. **Components** ✅
```
app/components/
├── layout/
│   ├── Header.tsx         # Shared header with navigation
│   └── PageLayout.tsx     # Page wrapper component
```

**Usage:**
```typescript
import PageLayout from '@/app/components/layout/PageLayout';

export default function MyPage() {
  return (
    <PageLayout onLogout={handleLogout}>
      {/* Content here */}
    </PageLayout>
  );
}
```

---

## Next Steps to Implement

### Phase 1: Refactor Existing Pages (HIGH PRIORITY)

#### 1. Update `birds/birds-content.tsx`
Replace direct API calls and imports with new structure:

```typescript
// OLD
import { Bird, Breeder } from './interfaces';
const API_BREEDER_CURRENT = '/api/breeders/me/breeder';

// NEW
import { Bird, Breeder } from '@/app/types';
import { fetchCurrentBreeder, fetchBirdsByBreeder } from '@/app/lib/api';
import { API_ENDPOINTS } from '@/app/lib/constants';
```

#### 2. Create `BirdForm` Component
Extract shared form logic for both create and edit:

```typescript
// app/components/forms/BirdForm.tsx
interface BirdFormProps {
  initialData?: BirdFormData;
  onSubmit: (data: BirdFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function BirdForm({ initialData, onSubmit, isSubmitting }: BirdFormProps) {
  // Reusable form component
}
```

#### 3. Update Edit Bird Page
```typescript
import PageLayout from '@/app/components/layout/PageLayout';
import BirdForm from '@/app/components/forms/BirdForm';
import { updateBird } from '@/app/lib/api/birds';

export default function EditBirdPage() {
  return (
    <PageLayout onLogout={handleLogout}>
      <BirdForm initialData={bird} onSubmit={updateBird} />
    </PageLayout>
  );
}
```

---

## Code Reduction Expected

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| `birds/[id]/edit/page.tsx` | 479 lines | ~200 lines | 58% |
| `birds/create/page.tsx` | ~400 lines | ~150 lines | 63% |
| `birds/birds-content.tsx` | 359 lines | ~220 lines | 39% |
| **Total** | **~1,238 lines** | **~570 lines** | **54%** |

---

## Benefits Achieved

✅ **No Code Duplication**
- Header reused across all pages
- Form logic shared between create/edit
- API calls centralized

✅ **Type Safety**
- Single source of truth for types
- Better IDE autocomplete
- Easier refactoring

✅ **Maintainability**
- Change API endpoint in one place
- Update form styling globally
- Easy to add new features

✅ **Scalability**
- Simple to add new entity types
- Easy to create new API services
- Flexible component structure

✅ **Performance**
- Better tree-shaking
- Smaller bundle size
- Optimized imports

---

## File Structure After Improvements

```
app/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── PageLayout.tsx
│   │   └── index.ts
│   ├── forms/
│   │   ├── BirdForm.tsx
│   │   └── index.ts
│   └── index.ts
├── lib/
│   ├── api/
│   │   ├── birds.ts
│   │   ├── breeders.ts
│   │   └── index.ts
│   ├── constants.ts
│   └── index.ts
├── types/
│   ├── bird.ts
│   ├── breeder.ts
│   └── index.ts
├── birds/
│   ├── page.tsx (refactored)
│   ├── create/page.tsx (refactored)
│   └── [id]/
│       ├── edit/page.tsx (refactored)
│       └── delete/page.tsx
├── dashboard/page.tsx
├── login/page.tsx
├── layout.tsx
└── ...
```

---

## Implementation Checklist

- [x] Create types directory with Bird and Breeder types
- [x] Create lib/constants with API endpoints and messages
- [x] Create lib/api services for birds and breeders
- [x] Create Header component
- [x] Create PageLayout wrapper component
- [ ] Create BirdForm component (extract from create/edit)
- [ ] Refactor edit bird page to use new structure
- [ ] Refactor create bird page to use new structure
- [ ] Refactor birds list page to use new structure
- [ ] Create custom hooks (useAuth, useBirds, useBreeder)
- [ ] Create additional UI components (Card wrappers, etc.)
- [ ] Update dashboard page
- [ ] Remove old duplicate code

---

## Quick Start Template

Use this template for refactoring existing pages:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import { API_ENDPOINTS } from '@/app/lib/constants';

export default function NewPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  return (
    <PageLayout onLogout={handleLogout}>
      {/* Your page content */}
    </PageLayout>
  );
}
```


