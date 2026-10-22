# Patient Appointments Components

A comprehensive, reusable, and performant appointment management system for patient interfaces.

## Overview

This module provides a complete set of components and hooks for managing patient appointments with the following features:

- **Custom Hooks**: Clean separation of concerns with specialized hooks
- **Reusable Components**: Modular components for different use cases
- **Performance Optimized**: React.memo, useMemo, useCallback optimizations
- **TypeScript**: Full type safety with comprehensive interfaces
- **Accessibility**: WCAG 2.1 compliant components
- **Error Handling**: Robust error boundaries and recovery

## Architecture

```
appointments/
├── hooks/                 # Custom hooks for business logic
├── components/           # Reusable UI components
├── types.ts             # TypeScript interfaces
└── index.ts             # Main exports
```

## Quick Start

```tsx
import {
  usePatientAuth,
  usePatientAppointments,
  useAppointmentActions,
  AppointmentList,
  QuickActionsGrid
} from '@/app/patient/_components/appointments';

function MyAppointmentsPage() {
  const { isAuthenticated } = usePatientAuth();
  const { upcomingAppointments } = usePatientAppointments(patientId);
  const { cancelAppointment } = useAppointmentActions();

  return (
    <div>
      <AppointmentList 
        appointments={upcomingAppointments} 
        onCancel={cancelAppointment}
      />
      <QuickActionsGrid />
    </div>
  );
}
```

## Hooks

### usePatientAuth()
Handles patient authentication and session management.

**Returns:**
- `isLoading: boolean` - Authentication loading state
- `isAuthenticated: boolean` - User authentication status
- `isPatient: boolean` - Patient role verification
- `redirectToLogin: () => void` - Redirect function

### usePatientAppointments(patientId)
Manages appointment data fetching and filtering.

**Parameters:**
- `patientId: Id<"patients">` - Patient identifier

**Returns:**
- `upcomingAppointments: Appointment[]` - Future appointments
- `pastAppointments: Appointment[]` - Historical appointments
- `stats: AppointmentStats` - Appointment statistics
- `isLoading: boolean` - Data loading state

### useAppointmentActions()
Handles appointment actions (cancel, reschedule, join).

**Returns:**
- `cancelAppointment: (id, reason?) => Promise<void>`
- `rescheduleAppointment: (id, newDateTime) => Promise<void>`
- `joinCall: (meetingLink?) => void`
- `loadingStates: ActionLoadingStates` - Per-action loading states
- `errors: ActionErrors` - Error states

### useAppointmentDialogs()
Manages dialog states for appointment actions.

**Returns:**
- `cancelDialog: CancelDialogState` - Cancel dialog state
- `rescheduleDialog: RescheduleDialogState` - Reschedule dialog state
- `openCancelDialog: (id) => void`
- `closeCancelDialog: () => void`
- `openRescheduleDialog: (id) => void`
- `closeRescheduleDialog: () => void`

### useAppointmentFormatters()
Provides formatting utilities for appointments.

**Returns:**
- `formatDate: (timestamp) => string`
- `formatTime: (timestamp) => string`
- `getAppointmentTypeLabel: (type) => string`
- `getStatusLabel: (status) => string`
- `getStatusVariant: (status) => StatusVariant`

## Components

### AppointmentCard
Displays individual appointment information with actions.

**Props:**
- `appointment: Appointment` - Appointment data
- `variant?: "default" | "compact" | "detailed"` - Display variant
- `showActions?: boolean` - Show action buttons
- `onCancel?: (id) => void` - Cancel handler
- `onReschedule?: (id) => void` - Reschedule handler
- `onJoin?: (link?) => void` - Join call handler

**Example:**
```tsx
<AppointmentCard
  appointment={appointment}
  variant="compact"
  showActions={true}
  onCancel={handleCancel}
/>
```

### AppointmentList
Displays a list of appointments with optional virtualization.

**Props:**
- `appointments: Appointment[]` - Appointment array
- `variant?: "grid" | "list"` - Layout variant
- `showActions?: boolean` - Show action buttons
- `maxItems?: number` - Limit displayed items
- `virtualized?: boolean` - Enable virtualization

**Example:**
```tsx
<AppointmentList
  appointments={upcomingAppointments}
  variant="list"
  showActions={true}
  onCancel={handleCancel}
/>
```

### CompactAppointmentList
Compact version for sidebars and smaller spaces.

**Props:**
- Same as AppointmentList but optimized for compact display
- Default `maxItems={5}`
- Default `showActions={false}`

### AppointmentActions
Configurable action buttons for appointments.

**Props:**
- `appointment: Appointment` - Appointment data
- `size?: "sm" | "md" | "lg"` - Button size
- `variant?: "default" | "compact"` - Display variant
- `loadingStates?: ActionLoadingStates` - Loading states

### Dialog Components

#### CancelDialog
Confirmation dialog for canceling appointments.

#### RescheduleDialog
Information dialog for rescheduling appointments.

#### ConfirmationDialog
Generic confirmation dialog component.

### QuickActionsGrid
Grid of quick action cards for common appointment tasks.

**Props:**
- `variant?: "default" | "compact"` - Display variant
- `className?: string` - Additional CSS classes

### AppointmentStats
Displays appointment statistics and metrics.

**Props:**
- `stats: AppointmentStats` - Statistics data
- `isLoading?: boolean` - Loading state
- `className?: string` - Additional CSS classes

## Performance Optimizations

### React.memo
All components are wrapped with React.memo to prevent unnecessary re-renders.

### useCallback
Event handlers are memoized with useCallback for stable references.

### useMemo
Computed values and filtered data are memoized for performance.

### Virtualization
Large appointment lists support virtualization for optimal performance.

## Error Handling

- Comprehensive error states in hooks
- Error boundaries for component failures
- Retry mechanisms for failed actions
- User-friendly error messages

## Accessibility

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Testing

```bash
# Run component tests
npm test appointments

# Run accessibility tests
npm run test:a11y appointments
```

## Migration Guide

### From Legacy Component

1. Replace direct API calls with custom hooks
2. Update component imports
3. Replace inline formatting with useAppointmentFormatters
4. Update dialog handling with useAppointmentDialogs

### Example Migration

**Before:**
```tsx
const appointments = useQuery(api.appointments.getUpcoming, {patientId});
const formatDate = (date) => new Date(date).toLocaleDateString();
```

**After:**
```tsx
const { upcomingAppointments } = usePatientAppointments(patientId);
const { formatDate } = useAppointmentFormatters();
```

## Contributing

1. Follow TypeScript strict mode
2. Add JSDoc comments for all public APIs
3. Include unit tests for new components
4. Ensure accessibility compliance
5. Update documentation for changes

## License

Internal use only - MedScribe 2.0
