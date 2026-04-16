import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Assignment } from "../context/AssignmentsContext";
import { useInventory } from "../context/InventoryContext";

interface Props {
  assignments: Assignment[];
  onSeatClick?: (assignment: Assignment | null, seatPosition: number) => void;
}

type SeatStatus = "assigned" | "available" | "undermaintenance" | "defective" | "unoccupied";

function getStatusFromAssignment(assignment: Assignment): SeatStatus {
  const status = assignment.status.toLowerCase();
  if (status === "assigned") return "assigned";
  if (status === "under maintenance") return "undermaintenance";
  if (status === "defective") return "defective";
  if (status === "available") return "available";
  return "unoccupied";
}

const SEAT_COLORS: Record<SeatStatus, string> = {
  assigned: "bg-[#22c55e] text-white border-[#16a34a] shadow-sm",
  available: "bg-[#3b82f6] text-white border-[#2563eb] shadow-sm",
  undermaintenance: "bg-[#f59e0b] text-white border-[#d97706] shadow-sm",
  defective: "bg-[#e11d48] text-white border-[#be123c] shadow-sm",
  unoccupied:
    "bg-slate-100 text-slate-400 border-dashed border-slate-300 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 dark:hover:border-slate-600",
};

const WORKSTATION_AREAS = {
  "PROD 2": {
    label: "PROD 2",
    color: "bg-[#1a7a4a]",
    workstationNames: ["PROD 2", "Production 2", "PROD2"],
  },
  "PROD 1": {
    label: "PROD 1",
    color: "bg-[#1a7a4a]",
    workstationNames: ["PROD 1", "Production 1", "PROD1"],
  },
  "Conference Room": {
    label: "CONFERENCE ROOM",
    color: "bg-[#1a5a7a]",
    workstationNames: ["Conference Room", "Conference", "Meeting Room"],
  },
  "IT Room": {
    label: "IT ROOM",
    color: "bg-[#2d4a7a]",
    workstationNames: ["IT Room", "IT", "IT Department"],
  },
  "Front Desk": {
    label: "FRONT DESK",
    color: "bg-[#B0BF00]",
    workstationNames: ["Front Desk", "Reception", "Lobby"],
  },
} as const;

interface SeatCellProps {
  assignment: Assignment;
  isDark: boolean;
  onClick?: (assignment: Assignment) => void;
}

function getSeatLabel(assignment: Assignment) {
  const name = assignment.assignedTo.trim() || "Unassigned";
  const seatLabel = assignment.seatNumber ? `Seat ${assignment.seatNumber}` : "No seat";
  return { name, seatLabel };
}

function SeatCell({ assignment, isDark, onClick }: SeatCellProps) {
  const [hovered, setHovered] = useState(false);
  const status = getStatusFromAssignment(assignment);
  const { name, seatLabel } = getSeatLabel(assignment);

  return (
    <div className="relative">
      <div
        className={`flex h-12 w-12 cursor-pointer select-none items-center justify-center rounded-lg border px-1 text-center transition-all hover:scale-105 hover:shadow-lg sm:h-16 sm:w-16 ${SEAT_COLORS[status]}`}
        style={{ fontSize: "10px", fontWeight: 700, lineHeight: 1.05 }}
        onClick={() => onClick?.(assignment)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={`${name} - ${seatLabel}`}
      >
        <div className="flex flex-col items-center">
          <span
            className="max-w-full overflow-hidden text-[8px] font-semibold leading-tight sm:text-[9px]"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {name}
          </span>
          <span className="mt-0.5 text-[9px] font-bold leading-tight sm:text-[10px]">{seatLabel}</span>
        </div>
      </div>

      {hovered && (
        <div
          className={`pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 min-w-[160px] -translate-x-1/2 rounded-lg px-3 py-2.5 shadow-xl sm:min-w-[180px] ${
            isDark ? "bg-slate-800 text-slate-100" : "bg-gray-900 text-white"
          }`}
        >
          <p className="mb-1 text-xs font-bold text-[#B0BF00]">{assignment.assignmentId}</p>
          <p className={`text-[11px] ${isDark ? "text-slate-100" : "text-white"}`}>{assignment.assignedTo}</p>
          <p className={`mt-1 text-[10px] ${isDark ? "text-slate-300" : "text-gray-300"}`}>{assignment.assetName}</p>
          <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>{assignment.assetCategory}</p>
          <div className={`mt-2 border-t pt-2 ${isDark ? "border-slate-700" : "border-gray-700"}`}>
            <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>Workstation: {assignment.workstation}</p>
            {assignment.seatNumber && (
              <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>Seat/PC #: {assignment.seatNumber}</p>
            )}
          </div>
          <span
            className={`mt-2 inline-block rounded px-2 py-0.5 text-[9px] font-semibold ${
              status === "assigned"
                ? "bg-[#22c55e]"
                : status === "undermaintenance"
                  ? "bg-[#f59e0b]"
                  : status === "defective"
                    ? "bg-[#e11d48]"
                    : status === "available"
                      ? "bg-[#3b82f6]"
                      : "bg-gray-500"
            }`}
          >
            {assignment.status}
          </span>
          <div
            className={`absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${
              isDark ? "border-t-slate-800" : "border-t-gray-900"
            }`}
          />
        </div>
      )}
    </div>
  );
}

export default function FloorMapIT({ assignments, onSeatClick }: Props) {
  const [selectedInfo, setSelectedInfo] = useState<Assignment | null>(null);
  const { resolvedTheme } = useTheme();
  const { inventory } = useInventory();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (
      selectedInfo &&
      !assignments.some((assignment) => assignment.assignmentId === selectedInfo.assignmentId)
    ) {
      setSelectedInfo(null);
    }
  }, [assignments, selectedInfo]);

  const getWorkstationAssignments = (areaKey: keyof typeof WORKSTATION_AREAS) => {
    const area = WORKSTATION_AREAS[areaKey];

    const filtered = assignments.filter((assignment) =>
      area.workstationNames.some((name) => {
        const normalizedAssignment = assignment.workstation.toLowerCase().trim();
        const normalizedName = name.toLowerCase().trim();
        return normalizedAssignment === normalizedName || normalizedAssignment.includes(normalizedName);
      })
    );

    const sorted = [...filtered].sort((left, right) => {
      const leftDate = new Date(left.dateAssigned || 0).getTime();
      const rightDate = new Date(right.dateAssigned || 0).getTime();
      return leftDate - rightDate;
    });

    return sorted.map((assignment, index) => ({
      assignment,
    }));
  };

  const handleClick = (assignment: Assignment) => {
    setSelectedInfo(assignment);
    onSeatClick?.(assignment, assignment.seatNumber || 0);
  };

  const selectedAsset = selectedInfo
    ? inventory.find(
        (asset) =>
          (selectedInfo.assetId && asset.id === selectedInfo.assetId) ||
          asset.sku === selectedInfo.assetSKU
      )
    : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-gray-500"}`}>Legend:</span>
        {[
          { label: "Assigned", cls: "bg-[#22c55e]", text: "text-white" },
          { label: "Available", cls: "bg-[#3b82f6]", text: "text-white" },
          { label: "Under Maintenance", cls: "bg-[#f59e0b]", text: "text-white" },
          { label: "Defective", cls: "bg-[#e11d48]", text: "text-white" },
        ].map((legend) => (
          <div key={legend.label} className="flex items-center gap-1.5">
            <div className={`flex h-5 w-5 items-center justify-center rounded text-[8px] font-bold ${legend.cls} ${legend.text}`}>
              {legend.label === "Assigned" ? "1" : ""}
            </div>
            <span className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{legend.label}</span>
          </div>
        ))}
      </div>

      <div className={`overflow-x-auto rounded-xl border p-5 ${isDark ? "border-slate-800 bg-slate-950" : "border-gray-200 bg-[#f4f6f8]"}`}>
        {assignments.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className={`mx-auto max-w-md rounded-2xl border px-5 py-7 text-center shadow-sm sm:px-6 sm:py-8 ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
              <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                No matching assignments found
              </p>
              <p className={`mt-2 text-xs leading-6 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                Try a different search term to show seats on this floor map.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-w-full space-y-6 lg:min-w-[800px]">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              {(["PROD 2", "PROD 1"] as const).map((areaKey) => (
                <div key={areaKey} className={`rounded-xl border p-4 shadow-sm ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
                  <div className={`${WORKSTATION_AREAS[areaKey].color} mb-3 rounded-lg px-3 py-2 text-center text-xs font-bold text-white`}>
                    {WORKSTATION_AREAS[areaKey].label}
                  </div>
                  <div className="flex min-h-[120px] flex-wrap gap-2">
                    {getWorkstationAssignments(areaKey).map((item) => (
                      <SeatCell
                        key={item.assignment.assignmentId}
                        assignment={item.assignment}
                        isDark={isDark}
                        onClick={handleClick}
                      />
                    ))}
                  </div>
                  <div className={`mt-3 border-t pt-3 ${isDark ? "border-slate-700" : "border-gray-100"}`}>
                    <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                      {getWorkstationAssignments(areaKey).length} assignments
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
              {(["Conference Room", "IT Room", "Front Desk"] as const).map((areaKey) => (
                <div key={areaKey} className={`rounded-xl border p-4 shadow-sm ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
                  <div className={`${WORKSTATION_AREAS[areaKey].color} mb-3 rounded-lg px-3 py-2 text-center text-xs font-bold text-white`}>
                    {WORKSTATION_AREAS[areaKey].label}
                  </div>
                  <div className="flex min-h-[80px] flex-wrap gap-2">
                    {getWorkstationAssignments(areaKey).map((item) => (
                      <SeatCell
                        key={item.assignment.assignmentId}
                        assignment={item.assignment}
                        isDark={isDark}
                        onClick={handleClick}
                      />
                    ))}
                  </div>
                  <div className={`mt-3 border-t pt-3 ${isDark ? "border-slate-700" : "border-gray-100"}`}>
                    <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                      {getWorkstationAssignments(areaKey).length} assignments
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedInfo && (
        <div className={`animate-in slide-in-from-bottom-2 fade-in rounded-xl border p-4 shadow-sm duration-200 ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border text-[11px] font-bold ${SEAT_COLORS[getStatusFromAssignment(selectedInfo)]}`}>
                  {selectedInfo.seatNumber ?? "N/A"}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-800"}`}>
                    {selectedInfo.assignmentId} - {selectedInfo.workstation}
                  </p>
                  <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                    Seat Position #{selectedInfo.seatNumber ?? "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                {[
                  { label: "Assignment ID", value: selectedInfo.assignmentId },
                  { label: "Assigned To", value: selectedInfo.assignedTo },
                  { label: "Asset", value: selectedInfo.assetName },
                  { label: "Category", value: selectedInfo.assetCategory },
                  { label: "Asset SKU", value: selectedInfo.assetSKU || selectedAsset?.sku || "N/A" },
                  { label: "Brand", value: selectedAsset?.brand || "N/A" },
                  { label: "Model", value: selectedAsset?.model || "N/A" },
                  { label: "Serial Number", value: selectedAsset?.serialNumber || "N/A" },
                  { label: "Condition", value: selectedAsset?.condition || "N/A" },
                  { label: "Asset Status", value: selectedAsset?.assetStatus || "N/A" },
                  {
                    label: "Location",
                    value: selectedAsset
                      ? `${selectedAsset.location}${selectedAsset.locationCode ? ` (${selectedAsset.locationCode})` : ""}`
                      : "N/A",
                  },
                  { label: "Department", value: selectedInfo.department },
                  { label: "Workstation", value: selectedInfo.workstation },
                  { label: "Floor", value: selectedInfo.floor },
                  { label: "Date Assigned", value: selectedInfo.dateAssigned },
                ].map((field) => (
                  <div key={field.label}>
                    <p className={`mb-0.5 text-[10px] ${isDark ? "text-slate-500" : "text-gray-400"}`}>{field.label}</p>
                    <p className={`text-xs font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>{field.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedInfo(null)}
              className={`flex-shrink-0 text-xl leading-none ${isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"}`}
            >
              x
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
