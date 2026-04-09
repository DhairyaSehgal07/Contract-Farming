# Bhatti Agritech - Data Models Overview (Client Version)

This document explains what information the system stores and why, in simple terms.
It is meant for business and operations teams, not for technical teams.

---

## 1) How the overall flow works

The system follows this business flow:

1. Create organization and team users
2. Register farmers and their lands
3. Prepare seed in batches (sorting, treatment, quality decision)
4. Dispatch seed by truck
5. Receive seed at distribution point and check discrepancies
6. Distribute seed to farmers and collect acknowledgement
7. Track planting and crop monitoring on each land
8. Generate reminders and final reports

So the data models are simply digital registers for each stage above.

---

## 2) Organization

### Purpose

Represents your company account (tenant) in the system. All data sits under one organization.

### Fields (short explanation)

- `name`: Organization/company name.
- `contactDetails.phone`: Main contact number.
- `contactDetails.email`: Main contact email.
- `contactDetails.address`: Office address.
- `isActive`: Whether this organization is currently active in the system.
- `ownerUserId`: Main owner/admin user linked to this organization.
- `createdAt`, `updatedAt`: When this record was created/last updated.

---

## 3) Store Admin User (User)

### Purpose

Represents internal team members (admin, manager, staff) who use the platform.

### Fields

- `mobileNumber`: Login number for the user.
- `password`: Secure login password.
- `organizationId`: Which organization this user belongs to.
- `role`: User role (admin/manager/staff).
- `isActive`: Whether user account is active.
- `createdAt`, `updatedAt`: Record created/updated time.

---

## 4) Farmer

### Purpose

Stores farmer profile information.

### Fields

- `fullName`: Farmer name.
- `address`: Farmer address.
- `mobileNumber`: Farmer contact number.
- `organizationId`: Which organization manages this farmer.
- `isActive`: Whether farmer profile is active.
- `createdAt`, `updatedAt`: Record created/updated time.

---

## 5) Land

### Purpose

Each farmer can have multiple lands. This model stores land master data.

### Fields

- `name`: Land name/identifier.
- `farmerId`: Farmer who owns or operates this land.
- `organizationId`: Which organization this land belongs to.
- `area.value`: Numeric area.
- `area.unit`: Area unit (acre/hectare).
- `geoLocation.latitude`, `geoLocation.longitude`: Land coordinates (if available).
- `isActive`: Whether this land is active.
- `createdAt`, `updatedAt`: Record created/updated time.

---

## 6) SeedProcessingBatch

### Purpose

Tracks seed preparation before dispatch (retrieval, sorting, treatment, packing, quality decision).

### Fields

- `organizationId`: Organization context.
- `batchNumber`: Unique batch reference number.
- `sourceColdStorageName`: Source cold storage name.
- `inputLots[]`: Incoming seed lots (lot number, variety, size, bag count, total weight).
- `sortingNotes`: Notes from sorting/cleaning stage.
- `treatmentChemicalVolumeMl`: Chemical volume used for treatment.
- `treatmentAppliedAt`: When treatment was applied.
- `treatmentDriedAt`: When treated seed drying was completed.
- `qualityGate.decision`: Quality decision (`accepted`, `resort`, `rejected`).
- `qualityGate.reason`: Why this decision was taken.
- `qualityGate.issueReport`: Linked issue details, if any.
- `qualityGate.decidedAt`: Decision timestamp.
- `qualityGate.recordedByUserId`: Who made/recorded the decision.
- `bagWeightTolerance.targetKg`: Target bag weight.
- `bagWeightTolerance.minKg`: Minimum allowed weight.
- `bagWeightTolerance.maxKg`: Maximum allowed weight.
- `outputLots[]`: Final prepared lots after processing.
- `status`: Current stage (draft, processing, hold, packed, ready for dispatch).
- `createdAt`, `updatedAt`: Record created/updated time.

---

## 7) SeedDispatch

### Purpose

Tracks truck loading and dispatch movement from source to destination.

### Fields

- `organizationId`: Organization context.
- `seedProcessingBatchId`: Which processed batch this dispatch came from.
- `dispatchNumber`: Unique dispatch reference.
- `truckNumber`: Assigned truck number.
- `driverName`: Driver name.
- `driverMobileNumber`: Driver contact.
- `originLocation`: Dispatch origin.
- `destinationLocation`: Dispatch destination point.
- `preDispatchWeighment.tareWeightKg`: Empty truck weight.
- `preDispatchWeighment.grossWeightKg`: Loaded truck weight.
- `preDispatchWeighment.netWeightKg`: Net seed weight.
- `preDispatchWeighment.measuredAt`: Weighment timestamp.
- `documents.dispatchSlipUrl`: Dispatch slip file link.
- `documents.weightSlipUrl`: Weight slip file link.
- `lineItems[]`: Lot-wise bags/weight details dispatched.
- `dispatchedAt`: Actual dispatch time.
- `status`: Stage of movement (draft to delivered).
- `createdAt`, `updatedAt`: Record created/updated time.

---

## 8) SeedReceipt

### Purpose

Tracks receiving process at distribution point with verification and discrepancy reporting.

### Fields

- `organizationId`: Organization context.
- `dispatchId`: Which dispatch this receipt belongs to.
- `receiptNumber`: Unique receipt reference.
- `receiverName`: Person who received the consignment.
- `receiverMobileNumber`: Receiver contact.
- `receivedAt`: Receiving timestamp.
- `hasDiscrepancy`: Whether any mismatch/damage exists.
- `issues[]`: Problem records (type, description, reported time, who reported).
- `lineItems[]`: Received lot-wise bag and weight details.
- `lineItems[].stackLocationLabel`: Where stock is stacked.
- `acknowledgedAt`: Receipt acknowledgement time.
- `status`: Receipt stage (pending verification, verified, discrepancy, closed).
- `createdAt`, `updatedAt`: Record created/updated time.

---

## 9) FarmerSeedDistribution

### Purpose

Tracks seed issue to each farmer (with land/cycle link) and farmer acknowledgement.

### Fields

- `organizationId`: Organization context.
- `farmerId`: Farmer receiving seed.
- `landId`: Land where seed will be used.
- `cycleId`: Crop cycle reference.
- `seedReceiptId`: Optional link to receipt source.
- `seedDispatchId`: Optional link to dispatch source.
- `issueDate`: Seed distribution date.
- `lineItems[]`: Lot-wise bags and total weight issued.
- `storageGeoLocation.latitude`, `storageGeoLocation.longitude`: Farmer storage location coordinates.
- `farmerAcknowledgedAt`: When farmer confirmed receipt.
- `notes`: Extra remarks.
- `status`: Distribution status (`issued`, `acknowledged`, `disputed`).
- `issuedByUserId`: Team member who issued seed.
- `createdAt`, `updatedAt`: Record created/updated time.

---

## 10) LandLifecycle

### Purpose

Tracks farm activity after seed reaches field: planting, irrigation, roguing, strip test, dehaulming, harvest planning.

### Fields

- `organizationId`: Organization context.
- `farmerId`: Farmer for this lifecycle.
- `landId`: Land for this lifecycle.
- `cycleId`: Crop cycle reference.
- `season`: Season (kharif/rabi/zaid/other).
- `year`: Crop year.
- `crop`: Crop name/type.
- `plannedPlantingWindow.startDate`, `plannedPlantingWindow.endDate`: Planned planting period.
- `actualPlantingStart`: Actual planting start date.
- `dehaulmingDate`: Dehaulming date.
- `harvestPlannedDate`: Planned harvest date.

### Plantation entries (`plantationEntries[]`)

- `plantationDate`: Planting date.
- `variety`: Seed variety.
- `size`: Seed size category.
- `quantity`: Quantity used.
- `basalFertilizerDose`: Basal fertilizer note.
- `preIrrigationStatus`: Pre-irrigation status note.
- `fieldGeoLocation`: Planting-day geolocation.
- `plantedArea`: Area planted that day.
- `plantingDepthCm`: Planting depth.
- `spacingCm`: Plant spacing.
- `plantingPattern`: Planting method/pattern.
- `bagsUsed`: Bags used for planting.
- `notes`: Extra remarks.
- `recordedByUserId`: Who entered the data.

### Irrigation entries (`irrigationEntries[]`)

- `irrigationDate`: Irrigation date.
- `notes`: Irrigation notes.
- `media.photos`, `media.videos`: Supporting images/videos.
- `adminManagerInstructions`: Manager guidance.
- `recordedByUserId`: Who entered data.
- `reviewedByUserId`: Who reviewed it.

### Roguing entries (`roguingEntries[]`)

- `roguingDate`: Roguing date.
- `results`: Outcome summary.
- `observations`: Field observations.
- `virusInfectedPlantCount`: Infected plants count.
- `mixedVarietyPlantCount`: Mixed variety count.
- `germinationPercentage`: Germination performance.
- `qualityAssessmentReportUrl`: Quality assessment reference.
- `recordedByUserId`: Who entered data.

### Strip test entries (`stripTestEntries[]`)

- `stripTestDate`: Strip test date.
- `stripLengthMeter`: Strip length.
- `stripAreaSqm`: Strip area.
- `goliTuberCount`: Goli-size count.
- `mediumTuberCount`: Medium-size count.
- `tuberRatio`: Size ratio note.
- `totalTuberWeightKg`: Total tuber weight.
- `isCropReadyForDehaulming`: Readiness decision.
- `decisionNotes`: Decision comments.
- `recordedByUserId`: Who entered data.

### Dehaulming entries (`dehalmingEntries[]`)

- `dehalmingDate`: Dehaulming date.
- `notes`: Remarks.
- `recordedByUserId`: Who entered data.

---

## 11) Reminder

### Purpose

Keeps activity reminders so field operations happen on time.

### Fields

- `organizationId`: Organization context.
- `farmerId`: Farmer reference.
- `landId`: Land reference.
- `cycleId`: Crop cycle reference.
- `reminderType`: Type of reminder (visit, roguing, strip test, QC hold, dispatch follow-up, discrepancy closure, dehaulming readiness, harvest scheduling, etc.).
- `dueDate`: Target date.
- `status`: Current status (`pending`, `completed`, `dismissed`).
- `escalationLevel`: Escalation stage, if delayed.
- `assignedToUserId`: Responsible team member.
- `completedAt`: Completion time.
- `dismissedAt`: Dismissal time.
- `notes`: Extra note.
- `createdAt`, `updatedAt`: Record created/updated time.

---

## 12) FarmerReport

### Purpose

Stores final report generation details for each farmer.

### Fields

- `organizationId`: Organization context.
- `farmerId`: Farmer for whom report is generated.
- `generatedByUserId`: User who generated report.
- `reportDate`: Report generation date.
- `status`: Report state (`draft`, `generated`, `failed`).
- `pdfUrl`: Report file link.
- `errorMessage`: Error note if generation failed.
- `createdAt`, `updatedAt`: Record created/updated time.

---

## 13) ChatMessage

### Purpose

Supports communication among team users (admin/manager/staff).

### Fields

- `organizationId`: Organization context.
- `senderUserId`: Message sender.
- `recipientUserId`: Message receiver.
- `message`: Message text.
- `attachments[]`: Attached files/images/videos.
- `sentAt`: Sent time.
- `readAt`: Read time.
- `createdAt`, `updatedAt`: Record created/updated time.

---

## 14) Final business summary

In simple words, the platform now gives Bhatti Agritech:

- Full traceability from seed preparation to field usage
- Better control on dispatch and receipt quality checks
- Farmer acknowledgement and location capture
- Better crop monitoring records for decision-making
- Timely reminders for operations
- Cleaner final reporting for management and review
