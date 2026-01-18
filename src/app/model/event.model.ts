export interface EventModel {
  id?: number;

  title: string;
  description?: string;

  rfcEventType?: string;
  rfcEventProgress?: string;           // Enum name strings expected by backend (WORKSHOP, EVENT, TASK, MEETING)
  rfcVehiclePriority?: string;    // (LOW, MEDIUM, HIGH, CRITICAL)
  rfcBookingStatus?: string;      // (UPCOMING, INPROGRESS, COMPLETED, PENDING, OVERDUE, CANCELLED)

  rfcDepartment?: string;

  privateEvent?: boolean;
  departmentEvent?: boolean;
  vehicleUpdate?: boolean;

  // backend uses LocalDateTime — we will send ISO datetime strings
  startDate?: string; // "YYYY-MM-DDTHH:mm:ss"
  endDate?: string;   // "YYYY-MM-DDTHH:mm:ss"
  dueDate?: string;   // "YYYY-MM-DDTHH:mm:ss"

  createdBy?: string;
  createdDate?: string;
  updatedDate?: string;

  color?: string;
}
