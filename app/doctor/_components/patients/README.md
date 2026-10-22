# Doctor Patients Components

A comprehensive set of reusable components and hooks for managing doctor patients in the MedScribe application.

## Overview

This module provides a complete solution for doctor patient management, following the established pattern used in appointment components. It includes custom hooks for business logic, reusable UI components, and TypeScript types for type safety.

## Features

- **Custom Hooks**: Clean separation of business logic from UI components
- **Reusable Components**: Modular, composable UI components
- **Type Safety**: Comprehensive TypeScript types and interfaces
- **Performance Optimized**: React.memo and useCallback for optimal rendering
- **Error Handling**: Built-in error states and loading indicators
- **Accessibility**: ARIA labels and keyboard navigation support

## Directory Structure

```
patients/
├── hooks/                 # Custom hooks for business logic
│   ├── useDoctorPatients.ts      # Patient data management
│   ├── usePatientActions.ts      # Patient actions (assign, remove, etc.)
│   ├── usePatientFormatters.ts   # Formatting utilities
│   └── index.ts                  # Hook exports
├── components/           # Reusable UI components
│   ├── PatientCard.tsx           # Individual patient display
│   ├── PatientsList.tsx          # Patient list container
│   ├── PatientFilters.tsx        # Search functionality
│   ├── PatientsSkeleton.tsx      # Loading skeleton
│   └── index.ts                  # Component exports
├── types.ts             # TypeScript type definitions
├── index.ts             # Main exports
└── README.md            # This documentation
```

## Quick Start

```tsx
import {
  useDoctorAuth,
  useDoctorPatients,
  PatientsList,
  PatientFilters,
  PatientsSkeleton
} from '@/app/doctor/_components/patients';

function MyPatientsPage() {
  const { isAuthenticated, doctorProfile } = useDoctorAuth();
  const { 
    patients, 
    filteredPatients, 
    stats,
    searchTerm,
    setSearchTerm,
    isLoading 
  } = useDoctorPatients(doctorProfile);

  if (isLoading) {
    return <PatientsSkeleton />;
  }

  return (
    <div>
      <PatientFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddPatient={() => setShowAddDialog(true)}
      />
      <PatientsList 
        patients={filteredPatients}
        isLoading={isLoading}
        onPatientAction={(action, patientId) => {
          if (action === 'view') {
            router.push(`/doctor/patients/${patientId}`);
          }
        }}
      />
    </div>
  );
}
```

## Hooks

### useDoctorAuth

Handles doctor authentication and profile management (reused from appointments).

```tsx
const {
  isLoading,
  isAuthenticated,
  isDoctor,
  doctorProfile
} = useDoctorAuth();
```

### useDoctorPatients

Manages patient data, filtering, and statistics.

```tsx
const {
  patients,
  filteredPatients,
  stats,
  isLoading,
  error,
  searchTerm,
  setSearchTerm
} = useDoctorPatients(doctorProfile);
```

### usePatientActions

Provides patient action handlers (assign, remove, update notes).

```tsx
const {
  assignPatient,
  removePatient,
  updatePatientNotes,
  loadingStates,
  errors
} = usePatientActions();
```

### usePatientFormatters

Utility functions for formatting patient data.

```tsx
const {
  calculateAge,
  formatAssignmentType,
  formatPatientName,
  formatAddress,
  getAssignmentBadgeVariant
} = usePatientFormatters();
```

## Components

### PatientCard

Displays a single patient with their info and action buttons.

```tsx
<PatientCard
  relationship={relationship}
  onView={handleView}
  onRemove={handleRemove}
  isLoading={isLoading}
/>
```

### PatientsList

Container component for displaying multiple patients.

```tsx
<PatientsList
  patients={patients}
  isLoading={isLoading}
  emptyMessage="No patients found"
  onPatientAction={handlePatientAction}
/>
```

### PatientFilters

Search functionality interface.

```tsx
<PatientFilters
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  onAddPatient={handleAddPatient}
/>
```

### PatientsSkeleton

Loading skeleton that matches the patients page layout.

```tsx
<PatientsSkeleton
  showHeader={true}
  showFilters={true}
  patientCount={5}
/>
```

## Types

The module exports comprehensive TypeScript types for all data structures and component props. Key types include:

- `Patient` - Core patient data structure
- `DoctorPatient` - Doctor-patient relationship
- `AssignmentType` - How patient was assigned (referral, appointment, direct)
- `PatientStats` - Patient statistics
- Component prop types for all components

## Error Handling

All hooks include built-in error handling:

```tsx
const { patients, error } = useDoctorPatients(doctorProfile);

if (error) {
  return <div>Error loading patients: {error}</div>;
}
```

## Performance Considerations

- Components use `React.memo` for optimal re-rendering
- Hooks use `useMemo` and `useCallback` for expensive computations
- Loading states prevent unnecessary API calls
- Efficient filtering algorithms

## Integration

This module integrates seamlessly with:

- Convex backend for data management
- Next.js authentication system
- Tailwind CSS for styling
- Lucide React for icons
- shadcn/ui component library

## Future Enhancements

- Patient detail page components
- Add patient form components
- Patient statistics dashboard
- Advanced filtering options
- Bulk patient operations
