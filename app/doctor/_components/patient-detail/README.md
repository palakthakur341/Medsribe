# Patient Detail Components

This directory contains all components and hooks related to the patient detail page.

## Structure

```
patient-detail/
├── hooks/                    # Custom hooks for business logic
│   ├── usePatientDetail.ts          # Patient data management
│   ├── useTreatmentManagement.ts    # Treatment plans management
│   ├── useMedicationManagement.ts   # Medications management
│   ├── useAppointmentScheduling.ts  # Appointment scheduling
│   ├── usePatientDetailFormatters.ts # Formatting utilities
│   └── index.ts                     # Hook exports
├── components/              # Reusable UI components
│   ├── PatientHeader.tsx            # Patient info header
│   ├── TreatmentList.tsx            # Treatment plans list
│   ├── TreatmentDetails.tsx         # Treatment plan details
│   ├── AppointmentForm.tsx          # Appointment scheduling form
│   ├── MedicationManagement.tsx     # Medication management
│   ├── PatientChat.tsx              # Chat interface wrapper
│   ├── PatientDetailSkeleton.tsx    # Loading skeleton
│   └── index.ts                     # Component exports
├── types.ts                 # TypeScript type definitions
├── index.ts                 # Main exports
└── README.md               # This file
```

## Usage

```tsx
import {
  usePatientDetail,
  useTreatmentManagement,
  PatientHeader,
  TreatmentList,
  TreatmentDetails,
  AppointmentForm
} from "@/app/doctor/_components/patient-detail";

function PatientDetailPage({ params }) {
  const { patient, isLoading } = usePatientDetail(params.id);
  const { treatments, selectedTreatment } = useTreatmentManagement(params.id);

  return (
    <div>
      <PatientHeader patient={patient} />
      <TreatmentList treatments={treatments} />
      <TreatmentDetails treatment={selectedTreatment} />
    </div>
  );
}
```

## Features

- **Performance Optimized**: Uses React.memo and useCallback for optimal rendering
- **Type Safe**: Comprehensive TypeScript definitions
- **Reusable**: Components can be used across different patient-related pages
- **Accessible**: Built with accessibility best practices
- **Responsive**: Mobile-first design approach
