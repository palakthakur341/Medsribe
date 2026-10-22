/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as appointmentRescheduleRequests from "../appointmentRescheduleRequests.js";
import type * as appointments from "../appointments.js";
import type * as audioRecordings from "../audioRecordings.js";
import type * as chatMessages from "../chatMessages.js";
import type * as chatSessions from "../chatSessions.js";
import type * as devUtils from "../devUtils.js";
import type * as doctorAvailability from "../doctorAvailability.js";
import type * as doctorExceptions from "../doctorExceptions.js";
import type * as doctorPatientConversations from "../doctorPatientConversations.js";
import type * as doctorPatients from "../doctorPatients.js";
import type * as doctors from "../doctors.js";
import type * as emailAutomation from "../emailAutomation.js";
import type * as emailService from "../emailService.js";
import type * as emailTemplates_appointmentFollowup from "../emailTemplates/appointmentFollowup.js";
import type * as emailTemplates_appointmentReminder from "../emailTemplates/appointmentReminder.js";
import type * as emailTemplates_inactiveUser from "../emailTemplates/inactiveUser.js";
import type * as emailTemplates_index from "../emailTemplates/index.js";
import type * as emailTemplates_profileCompletion from "../emailTemplates/profileCompletion.js";
import type * as emailTemplates_resetPassword from "../emailTemplates/resetPassword.js";
import type * as emailTemplates_securityAlert from "../emailTemplates/securityAlert.js";
import type * as emailTemplates_welcome from "../emailTemplates/welcome.js";
import type * as notifications from "../notifications.js";
import type * as patients from "../patients.js";
import type * as pharmacies from "../pharmacies.js";
import type * as prescriptionOrders from "../prescriptionOrders.js";
import type * as prescriptions from "../prescriptions.js";
import type * as referrals from "../referrals.js";
import type * as seedAppointments from "../seedAppointments.js";
import type * as sharedSoapNotes from "../sharedSoapNotes.js";
import type * as slotAvailability from "../slotAvailability.js";
import type * as slotMaintenance from "../slotMaintenance.js";
import type * as soapNotes from "../soapNotes.js";
import type * as timeSlots from "../timeSlots.js";
import type * as treatmentPlans from "../treatmentPlans.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  appointmentRescheduleRequests: typeof appointmentRescheduleRequests;
  appointments: typeof appointments;
  audioRecordings: typeof audioRecordings;
  chatMessages: typeof chatMessages;
  chatSessions: typeof chatSessions;
  devUtils: typeof devUtils;
  doctorAvailability: typeof doctorAvailability;
  doctorExceptions: typeof doctorExceptions;
  doctorPatientConversations: typeof doctorPatientConversations;
  doctorPatients: typeof doctorPatients;
  doctors: typeof doctors;
  emailAutomation: typeof emailAutomation;
  emailService: typeof emailService;
  "emailTemplates/appointmentFollowup": typeof emailTemplates_appointmentFollowup;
  "emailTemplates/appointmentReminder": typeof emailTemplates_appointmentReminder;
  "emailTemplates/inactiveUser": typeof emailTemplates_inactiveUser;
  "emailTemplates/index": typeof emailTemplates_index;
  "emailTemplates/profileCompletion": typeof emailTemplates_profileCompletion;
  "emailTemplates/resetPassword": typeof emailTemplates_resetPassword;
  "emailTemplates/securityAlert": typeof emailTemplates_securityAlert;
  "emailTemplates/welcome": typeof emailTemplates_welcome;
  notifications: typeof notifications;
  patients: typeof patients;
  pharmacies: typeof pharmacies;
  prescriptionOrders: typeof prescriptionOrders;
  prescriptions: typeof prescriptions;
  referrals: typeof referrals;
  seedAppointments: typeof seedAppointments;
  sharedSoapNotes: typeof sharedSoapNotes;
  slotAvailability: typeof slotAvailability;
  slotMaintenance: typeof slotMaintenance;
  soapNotes: typeof soapNotes;
  timeSlots: typeof timeSlots;
  treatmentPlans: typeof treatmentPlans;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
