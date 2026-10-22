/**
 * Production-Ready User Registration RAG Integration Hooks
 * 
 * Provides clean, non-blocking RAG embedding for user lifecycle events:
 * - User registration/account creation
 * - Profile creation and updates
 * - Role-specific onboarding events
 * - Account verification events
 */

import { embedDoctorData, embedPatientData } from './rag-api';

/**
 * Configuration for user RAG embedding
 */
interface UserRAGConfig {
  enabled: boolean;
  async: boolean;
  retryOnFailure: boolean;
  logErrors: boolean;
  timeout: number;
}

const DEFAULT_CONFIG: UserRAGConfig = {
  enabled: process.env.NODE_ENV !== 'test' && typeof window !== 'undefined',
  async: true,
  retryOnFailure: true,
  logErrors: process.env.NODE_ENV === 'development',
  timeout: 5000,
};

/**
 * User registration event data interface
 */
export interface UserRegistrationEventData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'doctor' | 'patient' | 'pharmacy';
  registrationMethod: 'manual';
  createdAt: number;
}

/**
 * Role-specific profile data interfaces
 */
export interface DoctorProfileEventData extends UserRegistrationEventData {
  role: 'doctor';
  phone?: string;
  licenseNumber?: string;
  primarySpecialty?: string;
}

export interface PatientProfileEventData extends UserRegistrationEventData {
  role: 'patient';
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface PharmacyProfileEventData extends UserRegistrationEventData {
  role: 'pharmacy';
  organizationName?: string;
  phone?: string;
  licenseNumber?: string;
}

/**
 * User RAG Service Class
 */
class UserRAGService {
  private config: UserRAGConfig;

  constructor(config: Partial<UserRAGConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute embedding with comprehensive error handling
   */
  private async executeEmbed(
    embedFn: () => Promise<void>,
    eventType: string,
    userId: string
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const execute = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('User RAG embedding timeout')), this.config.timeout);
        });

        await Promise.race([embedFn(), timeoutPromise]);

        if (this.config.logErrors) {
          console.log(`✅ User RAG embed: ${eventType} (${userId})`);
        }
      } catch (error) {
        if (this.config.logErrors) {
          console.warn(`⚠️ User RAG embed failed: ${eventType} (${userId})`, error);
        }

        if (this.config.retryOnFailure) {
          setTimeout(async () => {
            try {
              await Promise.race([embedFn(), timeoutPromise]);
              if (this.config.logErrors) {
                console.log(`✅ User RAG embed retry: ${eventType} (${userId})`);
              }
            } catch {
              if (this.config.logErrors) {
                console.warn(`⚠️ User RAG embed retry failed: ${eventType} (${userId})`);
              }
            }
          }, 2000);
        }
      }
    };

    if (this.config.async) {
      execute().catch(() => {});
    } else {
      await execute();
    }
  }

  /**
   * Embed user registration event
   */
  async onUserRegistered(userData: UserRegistrationEventData): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(userData.createdAt).toLocaleDateString();

        const baseData = `User registered manually on ${date}. Name: ${userData.firstName} ${userData.lastName}. Email: ${userData.email}. Role: ${userData.role}.`;

        // Embed based on role
        if (userData.role === 'doctor') {
          await embedDoctorData(
            userData.userId,
            'user_registered',
            baseData,
            {
              registration_method: userData.registrationMethod,
              email: userData.email,
              full_name: `${userData.firstName} ${userData.lastName}`,
              created_at: userData.createdAt,
              event_category: 'user_lifecycle'
            }
          );
        } else if (userData.role === 'patient') {
          await embedPatientData(
            userData.userId,
            'user_registered',
            baseData,
            {
              registration_method: userData.registrationMethod,
              email: userData.email,
              full_name: `${userData.firstName} ${userData.lastName}`,
              created_at: userData.createdAt,
              event_category: 'user_lifecycle'
            }
          );
        }
        // Note: Pharmacy users don't have dedicated RAG embedding as they're not primary users of the assistant
      },
      'user_registered',
      userData.userId
    );
  }

  /**
   * Embed doctor profile creation event
   */
  async onDoctorProfileCreated(profileData: DoctorProfileEventData): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(profileData.createdAt).toLocaleDateString();
        const phoneText = profileData.phone ? ` Phone: ${profileData.phone}.` : '';
        const licenseText = profileData.licenseNumber ? ` License: ${profileData.licenseNumber}.` : '';
        const specialtyText = profileData.primarySpecialty ? ` Specialty: ${profileData.primarySpecialty}.` : '';
        
        const doctorData = `Doctor profile created on ${date}. Dr. ${profileData.firstName} ${profileData.lastName}.${phoneText}${licenseText}${specialtyText}`;

        await embedDoctorData(
          profileData.userId,
          'doctor_profile_created',
          doctorData,
          {
            phone: profileData.phone,
            license_number: profileData.licenseNumber,
            primary_specialty: profileData.primarySpecialty,
            email: profileData.email,
            full_name: `${profileData.firstName} ${profileData.lastName}`,
            created_at: profileData.createdAt,
            event_category: 'profile_management'
          }
        );
      },
      'doctor_profile_created',
      profileData.userId
    );
  }

  /**
   * Embed patient profile creation event
   */
  async onPatientProfileCreated(profileData: PatientProfileEventData): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(profileData.createdAt).toLocaleDateString();
        const phoneText = profileData.phone ? ` Phone: ${profileData.phone}.` : '';
        const dobText = profileData.dateOfBirth ? ` DOB: ${profileData.dateOfBirth}.` : '';
        const genderText = profileData.gender ? ` Gender: ${profileData.gender}.` : '';
        
        const patientData = `Patient profile created on ${date}. ${profileData.firstName} ${profileData.lastName}.${phoneText}${dobText}${genderText}`;

        await embedPatientData(
          profileData.userId,
          'patient_profile_created',
          patientData,
          {
            phone: profileData.phone,
            date_of_birth: profileData.dateOfBirth,
            gender: profileData.gender,
            email: profileData.email,
            full_name: `${profileData.firstName} ${profileData.lastName}`,
            created_at: profileData.createdAt,
            event_category: 'profile_management'
          }
        );
      },
      'patient_profile_created',
      profileData.userId
    );
  }

}

// Singleton instance for production use
export const userRAGHooks = new UserRAGService();

// Convenience exports
export const {
  onUserRegistered,
  onDoctorProfileCreated,
  onPatientProfileCreated
} = userRAGHooks;
