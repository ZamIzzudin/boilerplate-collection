import type {
  UserItem,
  CreateUserPayload,
  UpdateUserPayload,
  PendingRegistration,
  CustomParamItem,
  CustomParamPayload,
  TarifStatus,
  TarifValue,
  TarifDetailItem,
  TarifItem,
  TarifPayload,
  PelabuhanItem,
  PelabuhanPayload,
  TrayekItem,
  TrayekPayload,
  TrayekForm,
  TrayekFormPayload,
  GroundHoldingItem,
  GroundHoldingPayload,
  DoctorItem,
  DoctorPayload,
  ActivateUserItem,
  ActivateUserPayload,
  JadwalKapalKuota,
  JadwalKapalApprovalData,
  JadwalKapalItem,
  JadwalKapalPayload,
  AnimalItem,
  AnimalPayload,
  AnimalTypeItem,
  AnimalTypePayload,
  VesselItem,
  VesselPayload,
  ContractStatus,
  ContractItem,
  ContractPayload,
  ReportingItem,
  ReportingPayload,
  BookingStatusReportItem,
  GeladakItem,
  GeladakItemDetail,
  DetailAnimalType,
  SisaQuotaReportItem,
  RealisasiVoyageReportItem,
} from "../domain";

describe("Domain Types", () => {
  describe("User Types", () => {
    it("should define UserItem type", () => {
      const user: UserItem = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
        role: {
          id: "role1",
          code: "ADMIN",
          name: "Administrator"
        }
      };
      expect(user.id).toBe("1");
      expect(user.username).toBe("testuser");
    });

    it("should define CreateUserPayload type", () => {
      const payload: CreateUserPayload = {
        username: "newuser",
        email: "new@example.com",
        password: "password123",
        user_type_id: "role1"
      };
      expect(payload.username).toBe("newuser");
    });

    it("should define UpdateUserPayload type", () => {
      const payload: UpdateUserPayload = {
        username: "updateduser",
        email: "updated@example.com",
        password: "newpassword",
        user_type_id: "role1"
      };
      expect(payload.password).toBeDefined();
    });

    it("should define UpdateUserPayload without password", () => {
      const payload: UpdateUserPayload = {
        username: "updateduser",
        email: "updated@example.com",
        user_type_id: "role1"
      };
      expect(payload.password).toBeUndefined();
    });

    it("should define PendingRegistration type", () => {
      const pending: PendingRegistration = {
        id: "1",
        username: "pendinguser",
        email: "pending@example.com",
        role: {
          id: "role1",
          code: "USER",
          name: "User"
        },
        createdAt: "2024-01-01T00:00:00Z"
      };
      expect(pending.createdAt).toBeDefined();
    });
  });

  describe("CustomParam Types", () => {
    it("should define CustomParamItem type", () => {
      const item: CustomParamItem = {
        id: "1",
        key: "setting1",
        value: "value1"
      };
      expect(item.key).toBe("setting1");
    });

    it("should define CustomParamPayload type", () => {
      const payload: CustomParamPayload = {
        key: "newsetting",
        value: "newvalue"
      };
      expect(payload.value).toBe("newvalue");
    });
  });

  describe("Tarif Types", () => {
    it("should define TarifStatus type", () => {
      const statusActive: TarifStatus = "active";
      const statusInactive: TarifStatus = "inactive";
      expect(statusActive).toBe("active");
      expect(statusInactive).toBe("inactive");
    });

    it("should define TarifValue type", () => {
      const value: TarifValue = {
        subsidiHewanBesar: 10000,
        subsidiHewanKecil: 5000,
        nonSubsidiHewanBesar: 20000,
        nonSubsidiHewanKecil: 10000,
        nonTernak: 15000
      };
      expect(value.subsidiHewanBesar).toBe(10000);
    });

    it("should define TarifDetailItem type", () => {
      const detail: TarifDetailItem = {
        animal_type_id: "type1",
        animal_type_name: "Sapi",
        harga: 50000,
        harga_subsidi: 30000,
        subsidy: true
      };
      expect(detail.subsidy).toBe(true);
    });

    it("should define TarifItem type", () => {
      const item: TarifItem = {
        id: "1",
        pelabuhanAsalCode: "P001",
        pelabuhanAsalLabel: "Pelabuhan A",
        pelabuhanTujuanCode: "P002",
        pelabuhanTujuanLabel: "Pelabuhan B",
        tahun: "2024",
        status: "ACTIVE",
        description: "Tarif A ke B",
        harga: [
          {
            animal_type_id: "type1",
            animal_type_name: "Sapi",
            harga: 50000,
            harga_subsidi: 30000
          }
        ]
      };
      expect(item.tahun).toBe("2024");
    });

    it("should define TarifPayload type", () => {
      const payload: TarifPayload = {
        pelabuhanAsalCode: "P001",
        pelabuhanAsalLabel: "Pelabuhan A",
        pelabuhanTujuanCode: "P002",
        pelabuhanTujuanLabel: "Pelabuhan B",
        tahun: "2024",
        description: "Tarif A ke B",
        harga: []
      };
      expect(payload.pelabuhanAsalCode).toBe("P001");
    });
  });

  describe("Pelabuhan Types", () => {
    it("should define PelabuhanItem type", () => {
      const pelabuhan: PelabuhanItem = {
        id: "1",
        port_name: "Pelabuhan Tanjung Priok",
        port_code: "TPR",
        province_name: "DKI Jakarta",
        city_name: "Jakarta Utara",
        port_long: "106.8844",
        port_lat: "-6.1080"
      };
      expect(pelabuhan.port_code).toBe("TPR");
    });

    it("should define PelabuhanPayload type", () => {
      const payload: PelabuhanPayload = {
        port_name: "Pelabuhan Baru",
        port_code: "PBR",
        province_name: "Jawa Barat",
        city_name: "Bandung",
        port_long: "107.6098",
        port_lat: "-6.9175"
      };
      expect(payload.city_name).toBe("Bandung");
    });
  });

  describe("Trayek Types", () => {
    it("should define TrayekItem type", () => {
      const trayek: TrayekItem = {
        id: "1",
        trayek_code: "TR001",
        tahun: 2024,
        port_origin_id: "P001",
        port_destination_id: "P002",
        users_operator_id: "OP001",
        status_code: "ACTIVE",
        port_origin_name: "Pelabuhan A",
        port_destination_name: "Pelabuhan B",
        user_profile_name: "Operator A",
        label_status_code: "Aktif"
      };
      expect(trayek.tahun).toBe(2024);
    });

    it("should define TrayekPayload type", () => {
      const payload: TrayekPayload = {
        trayek_code: "TR002",
        tahun: 2025,
        port_origin_id: "P001",
        port_destination_id: "P003",
        operator_id: "OP002"
      };
      expect(payload.tahun).toBe(2025);
    });

    it("should define TrayekForm type", () => {
      const form: TrayekForm = {
        id_mst_kode_trayek: "1",
        master_trayek_code: "TR001",
        year: "2024",
        routeOrigin: "P001",
        routeDestination: "P002",
        master_trayek_target: 100
      };
      expect(form.year).toBe("2024");
    });

    it("should define TrayekFormPayload type", () => {
      const payload: TrayekFormPayload = {
        id_mst_kode_trayek: "1",
        master_trayek_target: 150
      };
      expect(payload.master_trayek_target).toBe(150);
    });
  });

  describe("GroundHolding Types", () => {
    it("should define GroundHoldingItem type", () => {
      const item: GroundHoldingItem = {
        id: "1",
        namaGroundHolding: "Ground Holding A",
        pelabuhanCode: "P001",
        pelabuhanName: "Pelabuhan A",
        alamat: "Jalan A No. 1",
        operator: "Operator A"
      };
      expect(item.namaGroundHolding).toBe("Ground Holding A");
    });

    it("should define GroundHoldingPayload type", () => {
      const payload: GroundHoldingPayload = {
        namaGroundHolding: "Ground Holding B",
        pelabuhanCode: "P002",
        pelabuhanName: "Pelabuhan B",
        alamat: "Jalan B No. 2"
      };
      expect(payload.alamat).toBe("Jalan B No. 2");
    });
  });

  describe("Doctor Types", () => {
    it("should define DoctorItem type", () => {
      const doctor: DoctorItem = {
        id: "1",
        name: "Dr. John",
        permissionNumber: "DOC123",
        birthPlace: "Jakarta",
        dob: "1990-01-01",
        email: "doctor@example.com",
        phone: "081234567890",
        province: "DKI Jakarta",
        city: "Jakarta",
        address: "Jalan A No. 1",
        operator: "Operator A",
        note: "Note",
        status: "ACTIVE"
      };
      expect(doctor.permissionNumber).toBe("DOC123");
    });

    it("should define DoctorPayload type", () => {
      const payload: DoctorPayload = {
        name: "Dr. Jane",
        permissionNumber: "DOC456",
        birthPlace: "Bandung",
        dob: "1992-02-02",
        email: "doctor2@example.com",
        phone: "081234567891",
        province: "Jawa Barat",
        city: "Bandung",
        address: "Jalan B No. 2",
        operator: "Operator B",
        note: "Note B",
        status: "ACTIVE"
      };
      expect(payload.name).toBe("Dr. Jane");
    });
  });

  describe("ActivateUser Types", () => {
    it("should define ActivateUserItem type", () => {
      const item: ActivateUserItem = {
        id: 1,
        user_profile_name: "User A",
        user_email: "user@example.com",
        user_type_id: 1,
        user_type_name: "User",
        user_profile_address: "Address A",
        user_profile_phone: "081234567890",
        user_profile_fax: "Fax123",
        user_profile_siup: "SIUP123",
        user_profile_npwp: "NPWP123",
        status: 1,
        user_status: "Active",
        label: "Label A",
        value: 1,
        label_status: "Status A"
      };
      expect(item.id).toBe(1);
    });

    it("should define ActivateUserPayload type", () => {
      const payload: ActivateUserPayload = {
        user_profile_name: "User B",
        user_email: "user2@example.com",
        user_type_id: 2,
        user_type_name: "Admin",
        user_profile_address: "Address B",
        user_profile_phone: "081234567891",
        user_profile_fax: "Fax456",
        user_profile_siup: "SIUP456",
        user_profile_npwp: "NPWP456",
        status: 1,
        user_status: "Active",
        label: "Label B",
        value: 2,
        label_status: "Status B"
      };
      expect(payload.user_email).toBe("user2@example.com");
    });
  });

  describe("JadwalKapal Types", () => {
    it("should define JadwalKapalKuota type", () => {
      const kuota: JadwalKapalKuota = {
        quotaTotal: 100,
        quotaAvailable: 50
      };
      expect(kuota.quotaAvailable).toBe(50);
    });

    it("should define JadwalKapalApprovalData type", () => {
      const approvalData: JadwalKapalApprovalData = {
        kuota: {
          quotaTotal: 100,
          quotaAvailable: 50
        },
        tarif: {
          subsidi: 50000,
          nonSubsidi: 100000,
          nonTernak: 75000
        }
      };
      expect(approvalData.tarif?.subsidi).toBe(50000);
    });

    it("should define JadwalKapalItem type", () => {
      const jadwal: JadwalKapalItem = {
        id: "1",
        masterTrayekId: "TR001",
        trayekCode: "TR001",
        trayekLabel: "Trayek A-B",
        pelabuhanAsal: "Pelabuhan A",
        pelabuhanTujuan: "Pelabuhan B",
        namaKapal: "Kapal A",
        kodeKapal: "KAP001",
        jadwalKeberangkatanTanggal: "2024-01-01",
        jadwalKeberangkatanJam: "08:00",
        jadwalKedatanganTanggal: "2024-01-02",
        jadwalKedatanganJam: "12:00",
        aktualKeberangkatanTanggal: "2024-01-01",
        aktualKeberangkatanJam: "08:30",
        aktualKedatanganTanggal: "2024-01-02",
        aktualKedatanganJam: "12:30",
        jadwalDockingTanggal: "2024-01-03",
        jadwalDockingJam: "14:00",
        dokterNames: ["Dr. John", "Dr. Jane"],
        approvalData: {
          kuota: {
            quotaTotal: 100,
            quotaAvailable: 50
          }
        },
        status: 1,
        statusLabel: "Confirmed",
        alasanPenolakan: null,
        operatorName: "Operator A"
      };
      expect(jadwal.namaKapal).toBe("Kapal A");
    });

    it("should define JadwalKapalPayload type", () => {
      const payload: JadwalKapalPayload = {
        masterTrayekId: "TR001",
        trayekCode: "TR001",
        trayekLabel: "Trayek A-B",
        pelabuhanAsal: "Pelabuhan A",
        pelabuhanTujuan: "Pelabuhan B",
        namaKapal: "Kapal B",
        kodeKapal: "KAP002",
        jadwalKeberangkatanTanggal: "2024-02-01",
        jadwalKeberangkatanJam: "09:00",
        jadwalKedatanganTanggal: "2024-02-02",
        jadwalKedatanganJam: "13:00",
        aktualKeberangkatanTanggal: "2024-02-01",
        aktualKeberangkatanJam: "09:30",
        aktualKedatanganTanggal: "2024-02-02",
        aktualKedatanganJam: "13:30",
        jadwalDockingTanggal: "2024-02-03",
        jadwalDockingJam: "15:00",
        dokterNames: ["Dr. Alice"],
        operatorName: "Operator B"
      };
      expect(payload.kodeKapal).toBe("KAP002");
    });
  });

  describe("Animal Types", () => {
    it("should define AnimalItem type", () => {
      const animal: AnimalItem = {
        id: "1",
        animal_name: "Sapi",
        animal_code: "ANI001",
        animal_type_name: "Sapi Bali",
        animal_type_id: "type1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        status_code: "ACTIVE"
      };
      expect(animal.animal_code).toBe("ANI001");
    });

    it("should define AnimalPayload type", () => {
      const payload: AnimalPayload = {
        animal_type_id: "type2",
        animal_name: "Kambing"
      };
      expect(payload.animal_name).toBe("Kambing");
    });

    it("should define AnimalTypeItem type", () => {
      const animalType: AnimalTypeItem = {
        id: "1",
        animal_type_name: "Sapi",
        animal_type_code: "TYP001",
        has_subsidi: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        status_code: "ACTIVE",
        status_code_label: "Aktif"
      };
      expect(animalType.has_subsidi).toBe(true);
    });

    it("should define AnimalTypePayload type", () => {
      const payload: AnimalTypePayload = {
        animal_type_name: "Kambing",
        animal_type_code: "TYP002",
        has_subsidi: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        status_code: "ACTIVE"
      };
      expect(payload.has_subsidi).toBe(false);
    });
  });

  describe("Vessel Types", () => {
    it("should define VesselItem type", () => {
      const vessel: VesselItem = {
        id: "1",
        vessel_name: "Kapal Roro",
        users_operator_id: "OP001",
        users_operator_name: "Operator A",
        vessel_photo: "photo.jpg",
        status_code: "ACTIVE",
        status_code_label: "Aktif",
        complete: true,
        total_room: 100,
        total_capacity: 500
      };
      expect(vessel.vessel_name).toBe("Kapal Roro");
    });

    it("should define VesselPayload type", () => {
      const payload: VesselPayload = {
        vessel_name: "Kapal Feri",
        users_operator_id: "OP002",
        users_operator_name: "Operator B",
        vessel_photo: "photo2.jpg",
        status_code: "ACTIVE",
        status_code_label: "Aktif",
        complete: false
      };
      expect(payload.vessel_name).toBe("Kapal Feri");
    });
  });

  describe("Contract Types", () => {
    it("should define ContractStatus type", () => {
      const statusActive: ContractStatus = "active";
      const statusInactive: ContractStatus = "inactive";
      expect(statusActive).toBe("active");
      expect(statusInactive).toBe("inactive");
    });

    it("should define ContractItem type", () => {
      const contract: ContractItem = {
        id: "1",
        nomorKontrak: "CONTR123",
        tanggalMulai: "2024-01-01",
        tanggalSelesai: "2024-12-31",
        fileKontrak: "contract.pdf",
        status: "active"
      };
      expect(contract.nomorKontrak).toBe("CONTR123");
    });

    it("should define ContractPayload type", () => {
      const payload: ContractPayload = {
        nomorKontrak: "CONTR456",
        tanggalMulai: "2025-01-01",
        tanggalSelesai: "2025-12-31",
        fileKontrak: "contract2.pdf"
      };
      expect(payload.nomorKontrak).toBe("CONTR456");
    });
  });

  describe("Reporting Types", () => {
    it("should define ReportingItem type", () => {
      const report: ReportingItem = {
        id: "1",
        report_name: "Laporan A",
        report_code: "REP001",
        province_name: "Jawa Barat",
        city_name: "Bandung",
        report_long: "107.6098",
        report_lat: "-6.9175",
        status_code: "ACTIVE"
      };
      expect(report.report_code).toBe("REP001");
    });

    it("should define ReportingPayload type", () => {
      const payload: ReportingPayload = {
        report_name: "Laporan B",
        report_code: "REP002",
        province_name: "DKI Jakarta",
        city_name: "Jakarta",
        report_long: "106.8844",
        report_lat: "-6.1080"
      };
      expect(payload.report_name).toBe("Laporan B");
    });

    it("should define BookingStatusReportItem type", () => {
      const item: BookingStatusReportItem = {
        id: "1",
        booking_code: "BK001",
        booking_date: "2024-01-01",
        booking_payment_date: "2024-01-02",
        trayek_code: "TR001",
        voyage_code: "VOY001",
        port_origin: "Pelabuhan A",
        port_destination: "Pelabuhan B",
        users_operator_name: "Operator A",
        status: "Confirmed",
        pembayaran: "Paid",
        year: "2024"
      };
      expect(item.booking_code).toBe("BK001");
    });

    it("should define GeladakItem type", () => {
      const geladak: GeladakItem = {
        gladak_name: "Deck A",
        gladak_code: "DK001",
        max_room_capacity: 100,
        available_max_room_capacity: 50,
        detail: [
          {
            cattle_room_code: "ROOM001",
            cattle_room_capacity: 10,
            cattle_available_capacity: 5
          }
        ]
      };
      expect(geladak.gladak_code).toBe("DK001");
    });

    it("should define GeladakItemDetail type", () => {
      const detail: GeladakItemDetail = {
        cattle_room_code: "ROOM002",
        cattle_room_capacity: 20,
        cattle_available_capacity: 10
      };
      expect(detail.cattle_room_capacity).toBe(20);
    });

    it("should define DetailAnimalType type", () => {
      const animalType: DetailAnimalType = {
        schedule_id: 1,
        animal_type_name: "Sapi",
        alocate_quota: 50,
        remaining_quota: 30
      };
      expect(animalType.alocate_quota).toBe(50);
    });

    it("should define SisaQuotaReportItem type", () => {
      const quota: SisaQuotaReportItem = {
        id: "1",
        alocate_quota: 100,
        remaining_quota: 50,
        alocate_quota_total: 1000,
        remaining_quota_total: 500,
        users_operator_id: "OP001",
        master_schedule_voyage: "VOY001",
        port_origin_id: "P001",
        port_destination_id: "P002",
        master_trayek_code: "TR001",
        port_destination_name: "Pelabuhan B",
        port_origin_name: "Pelabuhan A",
        trayek_and_voyage: "TR001-VOY001",
        users_operator_name: "Operator A",
        doctors: ["Dr. John"],
        detail_animal_type: [
          {
            schedule_id: 1,
            animal_type_name: "Sapi",
            alocate_quota: 50,
            remaining_quota: 30
          }
        ],
        data_geladak: [
          {
            gladak_name: "Deck A",
            gladak_code: "DK001",
            max_room_capacity: 100,
            available_max_room_capacity: 50
          }
        ],
        schedule_etd: "2024-01-01T08:00:00Z",
        schedule_eta: "2024-01-02T12:00:00Z"
      };
      expect(quota.remaining_quota).toBe(50);
    });

    it("should define RealisasiVoyageReportItem type", () => {
      const realisasi: RealisasiVoyageReportItem = {
        id: "1",
        master_trayek_code: "TR001",
        tahun: 2024,
        user_profile_name: "Operator A",
        target_voyage: "12",
        total_voyage: "10"
      };
      expect(realisasi.total_voyage).toBe("10");
    });
  });
});
