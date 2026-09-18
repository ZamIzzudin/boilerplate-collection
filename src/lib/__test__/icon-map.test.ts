import { iconMap, iconOptions } from "../icon-map";

jest.mock("@phosphor-icons/react", () => ({
  GaugeIcon: () => null,
  HouseIcon: () => null,
  DatabaseIcon: () => null,
  UsersIcon: () => null,
  ShieldIcon: () => null,
  ShieldCheckIcon: () => null,
  SquaresFourIcon: () => null,
  ListChecksIcon: () => null,
  KeyIcon: () => null,
  SlidersHorizontalIcon: () => null,
  LightningIcon: () => null,
  BuildingsIcon: () => null,
  MoneyIcon: () => null,
  CalendarBlankIcon: () => null,
  StethoscopeIcon: () => null,
  BoatIcon: () => null,
  LineSegmentsIcon: () => null,
  UserListIcon: () => null,
  UserSquareIcon: () => null,
  StackSimpleIcon: () => null,
  PawPrintIcon: () => null,
  FileArchiveIcon: () => null,
  UserIcon: () => null,
  ListIcon: () => null,
  ListBulletsIcon: () => null,
  PathIcon: () => null,
  FilesIcon: () => null,
  FileTextIcon: () => null,
  ClockCounterClockwiseIcon: () => null,
}));

describe("iconMap", () => {
  it("maps LayoutDashboard to GaugeIcon", () => {
    expect(iconMap.LayoutDashboard).toBeDefined();
  });

  it("maps House to HouseIcon", () => {
    expect(iconMap.House).toBeDefined();
  });

  it("has all expected icon keys", () => {
    const expectedKeys = [
      "LayoutDashboard", "House", "Database", "Users", "Shield",
      "ShieldCheck", "SquaresFour", "ListChecks", "KeyRound",
      "SlidersHorizontal", "Bolt", "Buildings", "Money",
      "CalendarBlank", "Stethoscope", "Boat", "LineSegments",
      "UserList", "UserSquare", "StackSimple", "PawPrint",
      "FileArchive", "User", "List", "ListBullets", "Path",
      "Files", "FileText", "ClockCounterClockwise",
    ];
    expectedKeys.forEach((key) => {
      expect(iconMap).toHaveProperty(key);
    });
  });
});

describe("iconOptions", () => {
  it("returns array of label/value pairs", () => {
    expect(Array.isArray(iconOptions)).toBe(true);
    expect(iconOptions.length).toBeGreaterThan(0);
    iconOptions.forEach((opt) => {
      expect(opt).toHaveProperty("label");
      expect(opt).toHaveProperty("value");
    });
  });

  it("has same length as iconMap keys", () => {
    expect(iconOptions.length).toBe(Object.keys(iconMap).length);
  });
});
