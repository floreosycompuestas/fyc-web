# Enhanced Tables & Lists Styling Guide

## 🎨 New UI Components

Your project now has professional components for displaying data in tables and lists.

---

## 📊 DataTable Component

### Usage
```typescript
import { DataTable } from '@/app/components/ui';
import { Bird } from '@/app/types';

const columns = [
  { header: 'Band ID', accessor: 'band_id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Sex', accessor: 'sex' },
  {
    header: 'DOB',
    accessor: 'dob',
    cell: (value) => value ? new Date(value).toLocaleDateString() : '-',
  },
];

export default function BirdsTable({ birds }: { birds: Bird[] }) {
  return (
    <DataTable
      columns={columns}
      data={birds}
      variant="striped"
      colorScheme="blue"
      size="md"
    />
  );
}
```

### Props
- **columns**: Array of column definitions
- **data**: Array of row data
- **variant**: 'simple' | 'striped' | 'unstyled' (default: 'striped')
- **colorScheme**: Chakra color scheme (default: 'gray')
- **size**: 'sm' | 'md' | 'lg' (default: 'md')
- **isLoading**: Show loading state
- **emptyMessage**: Message when no data

### Features
✅ Sortable columns support
✅ Custom cell rendering
✅ Responsive overflow
✅ Striped rows option
✅ Hover effects
✅ Professional styling

---

## 📋 EnhancedList Component

### Usage - Simple Variant
```typescript
import { EnhancedList } from '@/app/components/ui';

<EnhancedList
  items={items}
  variant="simple"
  dividers={true}
  hoverable={true}
  renderItem={(item) => (
    <HStack justify="space-between">
      <Text fontWeight="600">{item.name}</Text>
      <Text fontSize="sm" color="gray.600">{item.description}</Text>
    </HStack>
  )}
/>
```

### Usage - Card Variant
```typescript
<EnhancedList
  items={items}
  variant="card"
  spacing={4}
  renderItem={(item) => (
    <Box>
      <Heading size="sm">{item.title}</Heading>
      <Text mt={2}>{item.content}</Text>
    </Box>
  )}
/>
```

### Usage - Bordered Variant
```typescript
<EnhancedList
  items={items}
  variant="bordered"
  hoverable={true}
  renderItem={(item) => (
    <VStack align="flex-start" gap={1}>
      <Text fontWeight="600">{item.name}</Text>
      <Text fontSize="sm">{item.category}</Text>
    </VStack>
  )}
/>
```

### Props
- **items**: Data array
- **renderItem**: Function to render each item
- **variant**: 'simple' | 'card' | 'bordered' (default: 'simple')
- **hoverable**: Show hover effects (default: true)
- **dividers**: Show divider lines (default: true)
- **spacing**: Gap between items
- **emptyMessage**: Message when empty
- **isLoading**: Show skeleton loading

### Features
✅ Three styling variants
✅ Loading skeletons
✅ Empty state
✅ Hover animations
✅ Responsive
✅ Scrollable with maxH

---

## 🎴 ListItemCard Component

### Usage
```typescript
import { ListItemCard } from '@/app/components/ui';

<ListItemCard
  title="Bird Name"
  subtitle="Band: BAND-001"
  description="A beautiful bird species"
  status={{ label: 'Active', colorScheme: 'green' }}
  metadata={[
    { label: 'Species', value: 'Spanish Timbrado' },
    { label: 'Sex', value: 'Male' },
    { label: 'DOB', value: '2026-01-14' },
  ]}
  actions={[
    {
      icon: <FiEdit2 />,
      onClick: () => handleEdit(),
      colorScheme: 'blue',
    },
    {
      icon: <FiTrash2 />,
      onClick: () => handleDelete(),
      colorScheme: 'red',
    },
  ]}
/>
```

### Props
- **title**: Card title (required)
- **subtitle**: Secondary text
- **description**: Main description
- **status**: Badge with label and color
- **metadata**: Array of label-value pairs
- **actions**: Array of action buttons
- **footer**: Footer content
- **isClickable**: Make card clickable
- **onClickItem**: Click handler

### Features
✅ Beautiful card layout
✅ Status badges
✅ Metadata display
✅ Action buttons
✅ Footer content
✅ Hover animations
✅ Responsive design

---

## 🎨 Styling Features

### DataTable
```
┌────────────────────────────────┐
│ HEADER (Blue background)       │  ← Uppercase, bold
├────────────────────────────────┤
│ Row 1 (Normal)                 │
├────────────────────────────────┤
│ Row 2 (Hover: Light blue bg)   │  ← Hover effect
├────────────────────────────────┤
│ Row 3 (Striped: Alternating)   │  ← Optional striping
└────────────────────────────────┘
```

### EnhancedList - Simple
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Item 1 with divider        (on hover: indent + blue border)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Item 2 with divider        (on hover: indent + blue border)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Item 3
```

### EnhancedList - Card
```
┌─────────────────────────┐
│                         │
│  Beautiful Card Item 1  │  ← Shadow, rounded
│  (Hover: Lift up)       │
│                         │
└─────────────────────────┘

┌─────────────────────────┐
│                         │
│  Beautiful Card Item 2  │
│  (Hover: More shadow)   │
│                         │
└─────────────────────────┘
```

### ListItemCard
```
┌──────────────────────────────────────┐
│ Title              Badge: Active     │  ← Header with status
├──────────────────────────────────────┤
│ Subtitle line in gray                │
│                                      │
│ Description: Lorem ipsum dolor...   │
│                                      │
│ Species: Value • Sex: Value • DOB: ...│  ← Metadata
├──────────────────────────────────────┤
│  [Edit Button]        [Delete Button]│  ← Action buttons
└──────────────────────────────────────┘
```

---

## 🎯 Color Schemes

Use with any Chakra color scheme:

```typescript
colorScheme="blue"      // Blue accents
colorScheme="green"     // Green accents
colorScheme="purple"    // Purple accents
colorScheme="red"       // Red accents
colorScheme="gray"      // Gray accents
```

---

## 📱 Responsive Behavior

### Desktop
- Full width tables
- All columns visible
- Larger spacing

### Tablet
- Optimized font sizes
- Adjusted padding
- Stack when needed

### Mobile
- Horizontal scroll for tables
- Compact spacing
- Full-width cards

---

## 🎓 Real-World Examples

### Example 1: Birds List
```typescript
<EnhancedList
  items={birds}
  variant="card"
  hoverable={true}
  spacing={4}
  renderItem={(bird) => (
    <ListItemCard
      title={bird.name || bird.band_id}
      subtitle={`Band ID: ${bird.band_id}`}
      metadata={[
        { label: 'Species', value: 'Spanish Timbrado' },
        bird.sex && { label: 'Sex', value: bird.sex === 'M' ? 'Male' : 'Female' },
        bird.dob && { label: 'DOB', value: new Date(bird.dob).toLocaleDateString() },
      ]}
      actions={[
        { icon: <FiEdit2 />, onClick: () => handleEdit(bird.id) },
        { icon: <FiTrash2 />, onClick: () => handleDelete(bird.id) },
      ]}
    />
  )}
/>
```

### Example 2: Birds Table
```typescript
<DataTable
  columns={[
    { header: 'Band ID', accessor: 'band_id', width: '150px' },
    { header: 'Name', accessor: 'name' },
    { header: 'Sex', accessor: 'sex', width: '80px' },
    {
      header: 'DOB',
      accessor: 'dob',
      cell: (value) => value ? new Date(value).toLocaleDateString() : '-',
      width: '120px',
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (id) => (
        <HStack gap={2}>
          <Button size="sm" onClick={() => handleEdit(id)}>Edit</Button>
          <Button size="sm" colorScheme="red" onClick={() => handleDelete(id)}>Delete</Button>
        </HStack>
      ),
      width: '150px',
    },
  ]}
  data={birds}
  variant="striped"
  colorScheme="blue"
/>
```

### Example 3: Breeders List
```typescript
<EnhancedList
  items={breeders}
  variant="bordered"
  hoverable={true}
  renderItem={(breeder) => (
    <HStack justify="space-between" w="100%">
      <VStack align="flex-start">
        <Text fontWeight="600">{`${breeder.first_name} ${breeder.last_name}`}</Text>
        <Text fontSize="sm" color="gray.600">{breeder.breeder_code}</Text>
      </VStack>
      <Button onClick={() => handleSelect(breeder.id)}>
        View Birds
      </Button>
    </HStack>
  )}
/>
```

---

## ✨ Styling Tips

### Tip 1: Consistent Colors
```typescript
// Use same colorScheme throughout the app
<DataTable colorScheme="blue" />
<EnhancedList variant="card" />
```

### Tip 2: Proper Spacing
```typescript
// Card variant: larger spacing
<EnhancedList variant="card" spacing={4} />

// Simple variant: tighter spacing
<EnhancedList variant="simple" spacing={2} />
```

### Tip 3: Status Badges
```typescript
// Show status with badge
<ListItemCard
  status={{
    label: 'Active',
    colorScheme: 'green',
  }}
/>
```

### Tip 4: Metadata Organization
```typescript
// Group related information
metadata={[
  { label: 'Band', value: item.band_id },
  { label: 'Sex', value: item.sex },
  { label: 'Age', value: calculateAge(item.dob) },
]}
```

---

## 🎨 Customization

### Create Your Own Variant
```typescript
export function CustomListVariant({ items, renderItem }) {
  return (
    <VStack gap={3} align="stretch">
      {items.map((item) => (
        <Box
          key={item.id}
          bg="gradient.to-r(blue.400, purple.400)"
          color="white"
          p={4}
          rounded="xl"
          boxShadow="lg"
        >
          {renderItem(item)}
        </Box>
      ))}
    </VStack>
  );
}
```

---

## 🚀 Performance Tips

1. **Use virtualization for large lists**
   - Install `react-window` for 1000+ items

2. **Memoize render functions**
   - Use `useCallback` for renderItem

3. **Lazy load data**
   - Load on scroll instead of all at once

4. **Minimize re-renders**
   - Keep data structures stable

---

## 📚 Component Files

- **DataTable.tsx** - Table component
- **EnhancedList.tsx** - List component
- **ListItemCard.tsx** - Card item component
- **index.ts** - Barrel exports

Import like this:
```typescript
import { DataTable, EnhancedList, ListItemCard } from '@/app/components/ui';
```

---

## ✅ Quick Checklist

- [ ] Choose between DataTable (structured data) vs EnhancedList (flexible)
- [ ] Pick the right variant for your use case
- [ ] Set appropriate spacing and sizing
- [ ] Add status badges for important info
- [ ] Include action buttons for CRUD operations
- [ ] Test on mobile devices
- [ ] Use consistent colorScheme

---

**Status**: ✅ Ready to Use
**Components**: 3 professional components
**Styling**: Modern, professional, responsive

Happy styling! 🎨


