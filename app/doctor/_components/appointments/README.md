# Doctor Appointments Components

A comprehensive set of reusable components and hooks for managing doctor appointments in the MedScribe application.

## Overview

This module provides a complete solution for doctor appointment management, following the established pattern used in patient components. It includes custom hooks for business logic, reusable UI components, and TypeScript types for type safety.

## Features

- **Custom Hooks**: Clean separation of business logic from UI components
- **Reusable Components**: Modular, composable UI components
- **Type Safety**: Comprehensive TypeScript types and interfaces
- **Performance Optimized**: React.memo and useCallback for optimal rendering
- **Error Handling**: Built-in error states and loading indicators
- **Accessibility**: ARIA labels and keyboard navigation support

## Directory Structure

```
appointments/
├── hooks/                 # Custom hooks for business logic
│   ├── useDoctorAuth.ts          # Authentication and profile management
│   ├── useDoctorAppointments.ts  # Appointment data management
│   ├── useAppointmentActions.ts  # Appointment actions (cancel, confirm, etc.)
│   ├── useAppointmentFormatters.ts # Date/time formatting utilities
│   └── index.ts                  # Hook exports
├── components/           # Reusable UI components
│   ├── AppointmentCard.tsx       # Individual appointment display
│   ├── AppointmentsList.tsx      # Appointment list container
│   ├── AppointmentFilters.tsx    # Search and category filters
│   ├── ProfileCompletionCard.tsx # Profile completion prompt
│   ├── AppointmentsSkeleton.tsx  # Loading skeleton
│   └── index.ts                  # Component exports
├── types.ts             # TypeScript type definitions
├── index.ts             # Main exports
└── README.md            # This documentation
```

## Quick Start

```tsx
import {
  useDoctorAuth,
  useDoctorAppointments,
  AppointmentsList,
  AppointmentFilters,
  ProfileCompletionCard
} from '@/app/doctor/_components/appointments';

function MyAppointmentsPage() {
  const { isAuthenticated, doctorProfile, isProfileComplete } = useDoctorAuth();
  const { 
    appointments, 
    filteredAppointments, 
    categorizedAppointments,
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory 
  } = useDoctorAppointments(doctorProfile);

  if (!isProfileComplete) {
    return <ProfileCompletionCard doctorProfile={doctorProfile} />;
  }

  return (
    <div>
      <AppointmentFilters
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        categories={[
          { key: "all", label: "All", count: appointments?.length || 0 },
          { key: "today", label: "Today", count: categorizedAppointments.today.length },
          // ... more categories
        ]}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
      <AppointmentsList 
        appointments={filteredAppointments}
        isLoading={!appointments}
      />
    </div>
  );
}
```

## Hooks

### useDoctorAuth

Handles doctor authentication and profile management.

```tsx
const {
  isLoading,
  isAuthenticated,
  isDoctor,
  doctorProfile,
  isProfileComplete
} = useDoctorAuth();
```

### useDoctorAppointments

Manages appointment data, categorization, and filtering.

```tsx
const {
  appointments,
  categorizedAppointments,
  filteredAppointments,
  stats,
  isLoading,
  error
} = useDoctorAppointments(doctorProfile);
```

### useAppointmentActions

Provides appointment action handlers (cancel, confirm, start, complete).

```tsx
const {
  cancelAppointment,
  confirmAppointment,
  startAppointment,
  completeAppointment,
  rescheduleAppointment,
  joinCall,
  loadingStates,
  errors
} = useAppointmentActions();
```

### useAppointmentFormatters

Utility functions for formatting dates, times, and status display.

```tsx
const {
  formatTime,
  formatDate,
  formatDateTime,
  getStatusColor,
  getStatusIcon,
  getRelativeTime
} = useAppointmentFormatters();
```

## Components

### AppointmentCard

Displays a single appointment with patient info and action buttons.

```tsx
<AppointmentCard
  appointment={appointment}
  onCancel={handleCancel}
  onConfirm={handleConfirm}
  onStart={handleStart}
  onComplete={handleComplete}
  onJoinCall={handleJoinCall}
  isLoading={isLoading}
/>
```

### AppointmentsList

Container component for displaying multiple appointments.

```tsx
<AppointmentsList
  appointments={appointments}
  isLoading={isLoading}
  emptyMessage="No appointments found"
  onAppointmentAction={handleAppointmentAction}
/>
```

### AppointmentFilters

Search and category filtering interface.

```tsx
<AppointmentFilters
  searchTerm={searchTerm}
  selectedCategory={selectedCategory}
  categories={categories}
  onSearchChange={setSearchTerm}
  onCategoryChange={setSelectedCategory}
  onScheduleNew={handleScheduleNew}
/>
```

### ProfileCompletionCard

Prompts doctors to complete their profile before accessing appointments.

```tsx
<ProfileCompletionCard doctorProfile={doctorProfile} />
```

### AppointmentsSkeleton

Loading skeleton that matches the appointments page layout.

```tsx
<AppointmentsSkeleton
  showHeader={true}
  showFilters={true}
  appointmentCount={4}
/>
```

## Types

The module exports comprehensive TypeScript types for all data structures and component props. Key types include:

- `Appointment` - Core appointment data structure
- `Doctor` - Doctor profile information
- `Patient` - Patient information
- `AppointmentStatus` - Status enum (scheduled, confirmed, in_progress, completed, cancelled)
- `AppointmentType` - Type enum (consultation, follow_up, emergency, etc.)
- Component prop types for all components

## Error Handling

All hooks include built-in error handling:

```tsx
const { appointments, error } = useDoctorAppointments(doctorProfile);

if (error) {
  return <div>Error loading appointments: {error}</div>;
}
```

## Performance Considerations

- Components use `React.memo` for optimal re-rendering
- Hooks use `useMemo` and `useCallback` for expensive computations
- Loading states prevent unnecessary API calls
- Efficient filtering and categorization algorithms

## Integration

This module integrates seamlessly with:

- Convex backend for data management
- Next.js authentication system
- Tailwind CSS for styling
- Lucide React for icons
- shadcn/ui component library
