import { z } from "zod";

export const ObjectTypes = z.enum([
  "TAG",
  "SIMPLETAG",
  "STRUCTURETAG",
  "TAGTYPE",
  "STRUCTURETAGTYPE",
  "SIMPLETAGTYPE",
  "ALARM",
  "ALARMCLASS",
  "LOGGINGTAG",
]);

export const LoggedTagValuesSortingMode = z.enum(["TIME_ASC", "TIME_DESC"]);

export const LoggedTagValuesBoundingMode = z.enum([
  "NO_BOUNDING_VALUES",
  "LEFT_BOUNDING_VALUES",
  "RIGHT_BOUNDING_VALUES",
  "LEFTRIGHT_BOUNDING_VALUES",
]);

export const MainQuality = z.enum([
  "BAD",
  "UNCERTAIN",
  "GOOD_NON_CASCADE",
  "GOOD_CASCADE",
]);

export const QualitySubStatus = z.enum([
  "NON_SPECIFIC",
  "CONFIGURATION_ERROR",
  "NOT_CONNECTED",
  "SENSOR_FAILURE",
  "DEVICE_FAILURE",
  "NO_COMMUNICATION_WITH_LAST_USABLE_VALUE",
  "NO_COMMUNICATION_NO_USABLE_VALUE",
  "OUT_OF_SERVICE",
  "LAST_USABLE_VALUE",
  "SUBSTITUTE_VALUE",
  "INITIAL_VALUE",
  "SENSOR_CONVERSION",
  "RANGE_VIOLATION",
  "SUB_NORMAL",
  "CONFIG_ERROR",
  "SIMULATED_VALUE",
  "SENSOR_CALIBRATION",
  "UPDATE_EVENT",
  "ADVISORY_ALARM",
  "CRITICAL_ALARM",
  "UNACK_UPDATE_EVENT",
  "UNACK_ADVISORY_ALARM",
  "UNACK_CRITICAL_ALARM",
  "INIT_FAILSAFE",
  "MAINTENANCE_REQUIRED",
  "INIT_ACKED",
  "INITREQ",
  "NOT_INVITED",
  "DO_NOT_SELECT",
  "LOCAL_OVERRIDE",
]);

export const QualityInput = z.object({
  quality: MainQuality,
  subStatus: QualitySubStatus.optional(),
});

export const AlarmIdentifierInput = z.object({
  name: z.string().min(1, "Alarm name cannot be empty."),
  instanceID: z.number().int().optional().default(0),
});
