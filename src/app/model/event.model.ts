export interface EventModel {
  id?: number;

  title: string;
  description?: string;

  eventType?: string;
  category?: string;           // Enum name strings expected by backend (WORKSHOP, EVENT, TASK, MEETING)
  vehiclePriority?: string;    // (LOW, MEDIUM, HIGH, CRITICAL)
  bookingStatus?: string;      // (UPCOMING, INPROGRESS, COMPLETED, PENDING, OVERDUE, CANCELLED)

  department?: string;

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
