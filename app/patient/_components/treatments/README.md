# Patient Treatments Components

A comprehensive, refactored treatment management system for patients with clean separation of concerns, performance optimizations, and reusable components.

## 🏗️ Architecture

### Directory Structure
```
treatments/
├── components/           # Reusable UI components
│   ├── TreatmentCard.tsx        # Compact treatment card for sidebar
│   ├── TreatmentList.tsx        # Treatment list container
│   ├── TreatmentDetails.tsx     # Detailed treatment view
│   ├── TreatmentStats.tsx       # Statistics display
│   ├── TreatmentFilters.tsx     # Search and filter controls
│   └── index.ts                 # Component exports
├── hooks/               # Custom hooks for business logic
│   ├── usePatientAuth.ts        # Authentication and profile management
│   ├── usePatientTreatments.ts  # Treatment data management
│   └── index.ts                 # Hook exports
├── types.ts            # TypeScript type definitions
├── index.ts            # Main exports
└── README.md           # This file
```

## 🚀 Features

### Performance Optimizations
- **React.memo**: All components are memoized to prevent unnecessary re-renders
- **useCallback**: Event handlers are memoized for stable references
- **useMemo**: Expensive computations are memoized (filtering, statistics)
- **Efficient filtering**: Client-side filtering with optimized algorithms

### Clean Architecture
- **Separation of Concerns**: Business logic in hooks, UI in components
- **Custom Hooks**: Reusable logic for auth, data fetching, and state management
- **Type Safety**: Comprehensive TypeScript types for all interfaces
- **Component Composition**: Modular, composable components

### User Experience
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Loading States**: Skeleton loading and proper loading indicators
- **Error Handling**: Graceful error states and user feedback
- **Accessibility**: ARIA labels and keyboard navigation support

## 📦 Components

### TreatmentCard
Compact treatment card component for sidebar display.

**Props:**
- `treatment`: Treatment plan object
- `variant`: Display variant (default, compact, detailed)
- `isSelected`: Whether the card is currently selected
- `onClick`: Click handler for selection
- `className`: Additional CSS classes

**Features:**
- Status indicators with color coding
- Medication and goal counts
- Truncated text with tooltips
- Hover and selection states

### TreatmentList
Container component for displaying a list of treatments.

**Props:**
- `treatments`: Array of treatment plans
- `selectedTreatment`: Currently selected treatment
- `onSelectTreatment`: Selection handler
- `variant`: List display variant
- `emptyState`: Custom empty state component
- `maxItems`: Maximum items to display

**Features:**
- Scrollable list with custom scrollbar
- Empty state handling
- Item count badges
- Virtualization support (planned)

### TreatmentDetails
Detailed view component for selected treatment.

**Props:**
- `treatment`: Selected treatment plan
- `standaloneMedications`: Independent medications
- `className`: Additional CSS classes

**Features:**
- Comprehensive treatment information
- Medication management
- Treatment goals display
- Doctor information
- Standalone medications section

### TreatmentStats
Statistics display component.

**Props:**
- `stats`: Treatment statistics object
- `isLoading`: Loading state
- `className`: Additional CSS classes

**Features:**
- Active treatment count
- Medication statistics
- Loading skeleton
- Responsive layout

### TreatmentFilters
Search and filter controls component.

**Props:**
- `filters`: Current filter state
- `onFiltersChange`: Filter change handler
- `stats`: Statistics for badge counts
- `className`: Additional CSS classes

**Features:**
- Real-time search
- Status filtering
- Count badges
- Responsive controls

## 🎣 Hooks

### usePatientAuth
Handles patient authentication and profile management.

**Returns:**
- `session`: Current session data
- `status`: Authentication status
- `isLoading`: Loading state
- `isAuthenticated`: Authentication flag
- `isPatient`: Role verification
- `user`: User object
- `patientProfile`: Patient profile data
- `redirectToLogin`: Login redirect function

**Features:**
- Session management
- Role-based access control
- Profile completion checking
- Automatic redirects

### usePatientTreatments
Manages treatment and medication data.

**Parameters:**
- `patientId`: Patient ID for data fetching

**Returns:**
- `treatmentPlans`: Raw treatment plans
- `medications`: Raw medications
- `treatmentsWithMedications`: Enhanced treatments with medications
- `standaloneMedications`: Independent medications
- `isLoading`: Loading state
- `error`: Error state
- `refetch`: Refetch function
- `stats`: Calculated statistics

**Features:**
- Data fetching and caching
- Medication association
- Statistics calculation
- Error handling

## 🔧 Usage

### Basic Implementation
```tsx
import {
  usePatientAuth,
  usePatientTreatments,
  TreatmentList,
  TreatmentDetails,
  TreatmentStats,
  TreatmentFilters,
} from "@/app/patient/_components/treatments";

function TreatmentsPage() {
  const { patientProfile, isLoading: authLoading } = usePatientAuth();
  const { 
    treatmentsWithMedications, 
    standaloneMedications, 
    stats,
    isLoading: treatmentsLoading 
  } = usePatientTreatments(patientProfile?._id);

  // Component implementation...
}
```

### Custom Filtering
```tsx
const [filters, setFilters] = useState({
  status: [],
  searchTerm: "",
});

const filteredTreatments = useMemo(() => {
  return treatmentsWithMedications.filter(treatment => {
    const matchesStatus = filters.status.length === 0 || 
      filters.status.includes(treatment.status);
    const matchesSearch = filters.searchTerm === "" ||
      treatment.title.toLowerCase().includes(filters.searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
}, [treatmentsWithMedications, filters]);
```

## 🎨 Styling

### Design System
- Uses shadcn/ui components for consistency
- Tailwind CSS for styling
- Custom color schemes for status indicators
- Responsive breakpoints for mobile-first design

### Status Colors
- **Active**: Green (success)
- **Completed**: Blue (info)
- **Discontinued**: Red (error)
- **Default**: Gray (neutral)

## 🔮 Future Enhancements

### Planned Features
- **Virtualization**: For large treatment lists
- **Offline Support**: PWA capabilities
- **Real-time Updates**: WebSocket integration
- **Advanced Filtering**: Date ranges, doctor filters
- **Export Functionality**: PDF/CSV export
- **Treatment Timeline**: Visual progress tracking

### Performance Improvements
- **Code Splitting**: Lazy loading of components
- **Caching**: Advanced caching strategies
- **Prefetching**: Predictive data loading
- **Bundle Optimization**: Tree shaking and minification

## 📝 Contributing

When adding new features or modifying existing ones:

1. **Follow the established patterns**: Use the same hook and component structure
2. **Add proper TypeScript types**: Update types.ts for new interfaces
3. **Include performance optimizations**: Use React.memo, useCallback, useMemo
4. **Write comprehensive tests**: Unit and integration tests
5. **Update documentation**: Keep README and JSDoc comments current

## 🐛 Troubleshooting

### Common Issues
- **Import errors**: Ensure all exports are properly defined in index.ts files
- **Type errors**: Check that all TypeScript interfaces are up to date
- **Performance issues**: Verify that components are properly memoized
- **Data loading**: Check that patient profile is available before fetching treatments

### Debug Tips
- Use React DevTools Profiler to identify performance bottlenecks
- Check network tab for API call efficiency
- Verify that useCallback dependencies are correct
- Ensure proper error boundaries are in place
