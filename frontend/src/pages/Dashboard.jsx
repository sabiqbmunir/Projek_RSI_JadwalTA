import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  FileText,
  Award,
  Users,
  Mail,
  Plus,
  Clock,
  Building,
  CheckCircle,
  AlertCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Send,
  Shield,
  BookOpen,
  Upload,
  Download,
  Search,
  Check
} from "lucide-react";
import { authApi, tokenStorage } from "../api/auth.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("profil");
  const [activeSubMenu, setActiveSubMenu] = useState("sempro");
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [showAddDosenModal, setShowAddDosenModal] = useState(false);
  const [newDosenForm, setNewDosenForm] = useState({ nama: "", nip: "", kepakaran: "", email: "", password: "Password123!" });
  const [actionNotice, setActionNotice] = useState(null);

  // State untuk form & simulasi interaktif
  const [persetujuanCount, setPersetujuanCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, nama: "M. Sabiq Badrul Munir", nim: "L0225036", angkatan: 2025, prodi: "S1 Informatika" },
    { id: 2, nama: "Ahmad Fauzi", nim: "M0521099", angkatan: 2022, prodi: "S1 Informatika" }
  ]);
  const [approvedStudents, setApprovedStudents] = useState([
    { id: 101, nama: "Rafa Khrisna Daneshwara", nim: "M0521088", angkatan: 2021, prodi: "S1 Informatika" },
    { id: 102, nama: "Dewi Sartika", nim: "M0521012", angkatan: 2021, prodi: "S1 Informatika" }
  ]);

  const [nilaiList, setNilaiList] = useState([
    { nim: "M0521088", nama: "Rafa Khrisna Daneshwara", sempro: "85.5", semhas: "88.0", sidang_akhir: "90.0" },
    { nim: "L0225036", nama: "M. Sabiq Badrul Munir", sempro: "88.0", semhas: "", sidang_akhir: "" },
    { nim: "L0225999", nama: "Budi Mahasiswa Baru", sempro: "", semhas: "", sidang_akhir: "" }
  ]);

  const [rescheduleModal, setRescheduleModal] = useState({ open: false, jadwalId: null, tanggal: "", jam: "", alasan: "" });

  // Dummy messages
  const [pesanList, setPesanList] = useState([
    {
      id: 1,
      header: "Pemberitahuan Pendaftaran Seminar Proposal",
      tanggal: "12 Nov 2026, 09:00 WIB",
      isi: "Pendaftaran Seminar Proposal periode November telah dibuka. Mahasiswa diwajibkan mengunggah formulir pendaftaran dan berkas Turnitin dengan tingkat kemiripan maksimal 30%."
    },
    {
      id: 2,
      header: "Validasi Dosen Pembimbing Tugas Akhir",
      tanggal: "11 Nov 2026, 14:30 WIB",
      isi: "Dosen pembimbing yang menerima pengajuan bimbingan harap segera mengonfirmasi penerimaan mahasiswa pada menu Mahasiswa Bimbingan."
    },
    {
      id: 3,
      header: "Jadwal Sidang Akhir Periode Ganjil",
      tanggal: "10 Nov 2026, 11:15 WIB",
      isi: "Jadwal sidang tugas akhir telah diperbarui pada sistem. Pastikan untuk memeriksa ruangan dan waktu sidang yang telah ditentukan."
    }
  ]);

  useEffect(() => {
    const user = tokenStorage.getUser();
    const token = tokenStorage.getToken();

    if (!token || !user) {
      navigate("/");
      return;
    }

    setCurrentUser(user);

    // Ambil data profil terbaru dari backend
    authApi.getProfile()
      .then(res => {
        if (res.data) {
          setCurrentUser(prev => ({ ...prev, ...res.data }));
          tokenStorage.setUser({ ...user, ...res.data });
        }
      })
      .catch(() => {
        // Fallback memakai user tersimpan
      });

    // Ambil daftar audit log jika SuperAdmin
    const roleLower = (user.peran || user.role || "").toLowerCase();
    if (roleLower === "superadmin" || roleLower === "admin_dosen_ta") {
      authApi.getAuditLogs(1, 10)
        .then(res => {
          if (res.data) setAuditLogs(res.data);
        })
        .catch(() => {});
    }

    // Ambil daftar dosen
    authApi.getDosenList(1, 50)
      .then(res => {
        if (res.data) setDosenList(res.data);
      })
      .catch(() => {});
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      tokenStorage.clear();
    }
    navigate("/");
  };

  const notify = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleAddDosen = async (e) => {
    e.preventDefault();
    if (!newDosenForm.nama || !newDosenForm.nip || !newDosenForm.email) {
      notify("Lengkapi nama, NIP, dan email dosen!");
      return;
    }
    try {
      await authApi.registerDosen(newDosenForm);
      notify("Dosen pembimbing berhasil ditambahkan ke database!");
      setShowAddDosenModal(false);
      setNewDosenForm({ nama: "", nip: "", kepakaran: "", email: "", password: "Password123!" });
      const res = await authApi.getDosenList(1, 50);
      if (res.data) setDosenList(res.data);
    } catch (err) {
      notify(err.message || "Gagal menambahkan dosen.");
    }
  };

  const handleTerimaPersetujuan = (reqItem) => {
    setPendingRequests(prev => prev.filter(r => r.id !== reqItem.id));
    setApprovedStudents(prev => [...prev, { ...reqItem, id: Date.now() }]);
    notify(`Persetujuan mahasiswa ${reqItem.nama} berhasil diterima dan dimasukkan ke Tabel 1!`);
  };

  const handleKirimPersetujuan = (dosenNama) => {
    if (persetujuanCount >= 2) {
      notify("Maksimal hanya dapat mengirimkan 2 pengajuan persetujuan bimbingan!");
      return;
    }
    setPersetujuanCount(prev => prev + 1);
    notify(`Permintaan persetujuan bimbingan ke ${dosenNama} telah terkirim ke backend!`);
  };

  const handleSimpanNilai = (nim) => {
    notify(`Perubahan nilai untuk NIM ${nim} berhasil disimpan ke basis data!`);
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    notify(`Pengajuan jadwal ulang telah dikirim ke Admin TA dan status jadwal diperbarui.`);
    setRescheduleModal({ open: false, jadwalId: null, tanggal: "", jam: "", alasan: "" });
  };

  if (!currentUser) return null;

  const role = (currentUser.peran || currentUser.role || "User").toLowerCase();
  const isAdmin = role === "superadmin" || role === "admin" || role === "admin_dosen_ta";
  const isDosen = role === "dosen" || role === "admin" && !isAdmin;
  const isMahasiswa = role === "user" || role === "mahasiswa";

  // Identifikasi peran tampilan
  const displayRole = (currentUser.peran || currentUser.role || "").toLowerCase();
  const isRoleAdminTA = displayRole.includes("superadmin") || displayRole.includes("admin_dosen_ta") || (currentUser.user_type === "admin");
  const isRoleDosen = !isRoleAdminTA && (displayRole.includes("dosen") || displayRole === "admin");
  const isRoleMahasiswa = !isRoleAdminTA && !isRoleDosen;

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center font-bold text-white shadow-md">
              TA
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">SI Penjadwalan TA</h2>
              <span className="text-[11px] text-sky-400 font-medium">Universitas Sebelas Maret</span>
            </div>
          </div>
        </div>

        {/* User Info Badge di Sidebar */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <p className="text-xs text-slate-400">Masuk sebagai:</p>
          <p className="text-sm font-semibold text-white truncate">{currentUser.nama}</p>
          <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-sky-950 text-sky-400 border border-sky-800/60">
            {isRoleAdminTA ? "Admin Divisi TA (SuperAdmin)" : isRoleDosen ? "Dosen Pembimbing (Admin)" : "Mahasiswa (User)"}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* MENU 1: PROFIL (Semua Peran) */}
          <button
            onClick={() => setActiveMenu("profil")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeMenu === "profil" ? "bg-sky-600 text-white shadow" : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <User size={16} />
            <span>Profil</span>
          </button>

          {/* MENU UNTUK ADMIN TA */}
          {isRoleAdminTA && (
            <>
              <div>
                <button
                  onClick={() => setActiveMenu("jadwal_ta")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeMenu.startsWith("jadwal") ? "bg-sky-600 text-white" : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={16} />
                    <span>Jadwal TA</span>
                  </div>
                  <ChevronDown size={14} />
                </button>
                {activeMenu.startsWith("jadwal") && (
                  <div className="ml-7 mt-1 space-y-1 pl-2 border-l border-slate-700">
                    <button
                      onClick={() => { setActiveMenu("jadwal_ta"); setActiveSubMenu("sempro"); }}
                      className={`block w-full text-left py-1.5 px-2 text-xs rounded-lg transition ${
                        activeSubMenu === "sempro" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Jadwal Sempro
                    </button>
                    <button
                      onClick={() => { setActiveMenu("jadwal_ta"); setActiveSubMenu("semhas"); }}
                      className={`block w-full text-left py-1.5 px-2 text-xs rounded-lg transition ${
                        activeSubMenu === "semhas" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Jadwal Semhas
                    </button>
                    <button
                      onClick={() => { setActiveMenu("jadwal_ta"); setActiveSubMenu("sidang_akhir"); }}
                      className={`block w-full text-left py-1.5 px-2 text-xs rounded-lg transition ${
                        activeSubMenu === "sidang_akhir" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Jadwal Sidang Akhir
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveMenu("dosen_pembimbing")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeMenu === "dosen_pembimbing" ? "bg-sky-600 text-white shadow" : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Users size={16} />
                <span>Dosen Pembimbing</span>
              </button>

              <button
                onClick={() => setActiveMenu("input_nilai")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeMenu === "input_nilai" ? "bg-sky-600 text-white shadow" : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Award size={16} />
                <span>Input Nilai</span>
              </button>

              <button
                onClick={() => setActiveMenu("audit_log")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeMenu === "audit_log" ? "bg-sky-600 text-white shadow" : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Shield size={16} />
                <span>Riwayat Audit Log</span>
              </button>
            </>
          )}

          {/* MENU UNTUK MAHASISWA */}
          {isRoleMahasiswa && (
            <>
              <button
                onClick={() => setActiveMenu("jadwal_ta_mhs")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeMenu === "jadwal_ta_mhs" ? "bg-sky-600 text-white shadow" : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Calendar size={16} />
                <span>Jadwal TA</span>
              </button>

              <div>
                <button
                  onClick={() => setActiveMenu("upload_berkas")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeMenu === "upload_berkas" ? "bg-sky-600 text-white" : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={16} />
                    <span>Upload Berkas</span>
                  </div>
                  <ChevronDown size={14} />
                </button>
                {activeMenu === "upload_berkas" && (
                  <div className="ml-7 mt-1 space-y-1 pl-2 border-l border-slate-700">
                    <button
                      onClick={() => setActiveSubMenu("sempro")}
                      className={`block w-full text-left py-1.5 px-2 text-xs rounded-lg transition ${
                        activeSubMenu === "sempro" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Sempro
                    </button>
                    <button
                      onClick={() => setActiveSubMenu("semhas")}
                      className={`block w-full text-left py-1.5 px-2 text-xs rounded-lg transition ${
                        activeSubMenu === "semhas" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Semhas
                    </button>
                    <button
                      onClick={() => setActiveSubMenu("sidang_ta")}
                      className={`block w-full text-left py-1.5 px-2 text-xs rounded-lg transition ${
                        activeSubMenu === "sidang_ta" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Sidang TA
                    </button>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => setActiveMenu("rekognisi")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeMenu === "rekognisi" ? "bg-sky-600 text-white" : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award size={16} />
                    <span>Rekognisi</span>
                  </div>
                  <ChevronDown size={14} />
                </button>
                {activeMenu === "rekognisi" && (
                  <div className="ml-7 mt-1 space-y-1 pl-2 border-l border-slate-700">
                    <button
                      onClick={() => setActiveSubMenu("sempro")}
                      className={`block w-full text-left py-1.5 px-2 text-xs rounded-lg transition ${
                        activeSubMenu === "sempro" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Sempro
                    </button>
                    <button
                      onClick={() => setActiveSubMenu("semhas")}
                      className={`block w-full text-left py-1.5 px-2 text-xs rounded-lg transition ${
                        activeSubMenu === "semhas" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Semhas
                    </button>
                    <button
                      onClick={() => setActiveSubMenu("sidang_ta")}
                      className={`block w-full text-left py-1.5 px-2 text-xs rounded-lg transition ${
                        activeSubMenu === "sidang_ta" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Sidang TA
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveMenu("dosen_pembimbing_mhs")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeMenu === "dosen_pembimbing_mhs" ? "bg-sky-600 text-white shadow" : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Users size={16} />
                <span>Dosen Pembimbing</span>
              </button>
            </>
          )}

          {/* MENU UNTUK DOSEN */}
          {isRoleDosen && (
            <>
              <button
                onClick={() => setActiveMenu("jadwal_ta_dosen")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeMenu === "jadwal_ta_dosen" ? "bg-sky-600 text-white shadow" : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Calendar size={16} />
                <span>Jadwal TA</span>
              </button>

              <button
                onClick={() => setActiveMenu("mahasiswa_bimbingan")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeMenu === "mahasiswa_bimbingan" ? "bg-sky-600 text-white shadow" : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Users size={16} />
                <span>Mahasiswa Bimbingan</span>
              </button>
            </>
          )}

          {/* MENU PESAN (Semua Peran) */}
          <button
            onClick={() => setActiveMenu("pesan")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeMenu === "pesan" ? "bg-sky-600 text-white shadow" : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <Mail size={16} />
            <span>Pesan</span>
          </button>
        </nav>

        {/* Tombol Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition"
          >
            <LogOut size={15} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* MAIN BODY */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <h1 className="text-base font-bold text-slate-900 capitalize">
              {activeMenu.replace(/_/g, " ")} {activeSubMenu && activeMenu.includes("berkas") ? `— ${activeSubMenu}` : ""}
            </h1>
            <p className="text-xs text-slate-500">Sistem Informasi Penjadwalan Tugas Akhir Universitas Sebelas Maret</p>
          </div>

          <div className="flex items-center gap-4">
            {actionNotice && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium animate-fade-in">
                <CheckCircle size={14} />
                <span>{actionNotice}</span>
              </div>
            )}
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-900">{currentUser.nama}</span>
              <span className="block text-[11px] text-slate-500">{currentUser.email}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* =======================================================
              VIEW: PROFIL (Data hasil input saat register)
              ======================================================= */}
          {activeMenu === "profil" && (
            <div className="max-w-4xl bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {currentUser.nama?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{currentUser.nama}</h2>
                  <p className="text-sm text-slate-500">{currentUser.email}</p>
                  <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
                    Peran: {currentUser.peran || currentUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentUser.nim && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-medium text-slate-500 block uppercase">NIM (Nomor Induk Mahasiswa)</span>
                    <span className="text-base font-bold text-slate-800">{currentUser.nim}</span>
                  </div>
                )}
                {currentUser.nip && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-medium text-slate-500 block uppercase">NIP (Nomor Induk Pegawai)</span>
                    <span className="text-base font-bold text-slate-800">{currentUser.nip}</span>
                  </div>
                )}
                {currentUser.prodi && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-medium text-slate-500 block uppercase">Program Studi</span>
                    <span className="text-base font-bold text-slate-800">{currentUser.prodi}</span>
                  </div>
                )}
                {currentUser.tahun_masuk && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-medium text-slate-500 block uppercase">Tahun Masuk / Angkatan</span>
                    <span className="text-base font-bold text-slate-800">{currentUser.tahun_masuk}</span>
                  </div>
                )}
                {currentUser.kepakaran && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 md:col-span-2">
                    <span className="text-xs font-medium text-slate-500 block uppercase">Bidang Kepakaran</span>
                    <span className="text-base font-bold text-sky-800">{currentUser.kepakaran}</span>
                  </div>
                )}
                {currentUser.judul && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 md:col-span-2">
                    <span className="text-xs font-medium text-slate-500 block uppercase">Judul Penelitian / Skripsi</span>
                    <p className="text-sm font-semibold text-slate-800 mt-1 leading-relaxed">{currentUser.judul}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: JADWAL TA ADMIN (Sempro, Semhas, Sidang Akhir)
              ======================================================= */}
          {activeMenu === "jadwal_ta" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Jadwal {activeSubMenu === "sempro" ? "Seminar Proposal" : activeSubMenu === "semhas" ? "Seminar Hasil" : "Sidang Akhir TA"}
                </h3>
                <span className="text-xs text-slate-500">Data terhubung langsung dengan basis data SQL Server</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">NIM</th>
                      <th className="py-3 px-4">Penguji</th>
                      <th className="py-3 px-4">Jam Mulai</th>
                      <th className="py-3 px-4">Jam Selesai</th>
                      <th className="py-3 px-4">Ruangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-800">2026-11-20</td>
                      <td className="py-3 px-4 font-mono font-medium">M0521088</td>
                      <td className="py-3 px-4 text-slate-700">Dr. Budi Santoso, M.Kom. (Ketua); Bambang Widoyono, M.T.</td>
                      <td className="py-3 px-4 text-slate-600">09:00 WIB</td>
                      <td className="py-3 px-4 text-slate-600">10:30 WIB</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-medium">Ruang Sidang 1</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-800">2026-11-21</td>
                      <td className="py-3 px-4 font-mono font-medium">L0225036</td>
                      <td className="py-3 px-4 text-slate-700">Dr. Siti Aminah, M.T.; Dr. Budi Santoso, M.Kom.</td>
                      <td className="py-3 px-4 text-slate-600">13:00 WIB</td>
                      <td className="py-3 px-4 text-slate-600">14:30 WIB</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-medium">Ruang Sidang 2</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: DOSEN PEMBIMBING (ADMIN TA)
              ======================================================= */}
          {activeMenu === "dosen_pembimbing" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">List Dosen Pembimbing</h3>
                  <p className="text-xs text-slate-500">Daftar dosen pembimbing beserta bidang kepakaran dan jumlah mahasiswa bimbingan</p>
                </div>
                <button
                  onClick={() => setShowAddDosenModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 shadow-sm transition"
                >
                  <Plus size={16} />
                  <span>Tambah Dosen</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                      <th className="py-3 px-4">Nama Dosen</th>
                      <th className="py-3 px-4">NIP</th>
                      <th className="py-3 px-4">Bidang Kepakaran</th>
                      <th className="py-3 px-4 text-center">Jumlah Mahasiswa Dibimbing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dosenList.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">{d.nama}</td>
                        <td className="py-3 px-4 font-mono">{d.nip}</td>
                        <td className="py-3 px-4 text-slate-700">{d.kepakaran || "—"}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                            {d.jumlah_bimbingan ?? 0} Mahasiswa
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: INPUT NILAI (ADMIN TA)
              ======================================================= */}
          {activeMenu === "input_nilai" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900">Input Nilai Tugas Akhir</h3>
                <p className="text-xs text-slate-500">Kelola dan perbarui nilai Semhas, Sempro, dan Sidang Akhir mahasiswa</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                      <th className="py-3 px-4">Nama Mahasiswa</th>
                      <th className="py-3 px-4 text-center">Nilai Sempro</th>
                      <th className="py-3 px-4 text-center">Nilai Semhas</th>
                      <th className="py-3 px-4 text-center">Nilai Sidang Akhir</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {nilaiList.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{item.nama}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{item.nim}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={item.sempro}
                            onChange={(e) => {
                              const v = e.target.value;
                              setNilaiList(prev => prev.map((n, i) => i === index ? { ...n, sempro: v } : n));
                            }}
                            className="w-20 px-2 py-1 text-center border border-slate-300 rounded-lg text-xs font-semibold focus:border-sky-600 outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={item.semhas}
                            onChange={(e) => {
                              const v = e.target.value;
                              setNilaiList(prev => prev.map((n, i) => i === index ? { ...n, semhas: v } : n));
                            }}
                            className="w-20 px-2 py-1 text-center border border-slate-300 rounded-lg text-xs font-semibold focus:border-sky-600 outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={item.sidang_akhir}
                            onChange={(e) => {
                              const v = e.target.value;
                              setNilaiList(prev => prev.map((n, i) => i === index ? { ...n, sidang_akhir: v } : n));
                            }}
                            className="w-20 px-2 py-1 text-center border border-slate-300 rounded-lg text-xs font-semibold focus:border-sky-600 outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleSimpanNilai(item.nim)}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition"
                          >
                            Submit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: AUDIT LOG (ADMIN TA)
              ======================================================= */}
          {activeMenu === "audit_log" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Catatan Audit Log Sistem (Append-Only)</h3>
                  <p className="text-xs text-slate-500">Mencatat riwayat login, registrasi, dan perubahan data pengguna secara otomatis via DB Trigger</p>
                </div>
                <button
                  onClick={() => {
                    authApi.getAuditLogs(1, 15).then(res => setAuditLogs(res.data));
                    notify("Audit log diperbarui!");
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium hover:bg-slate-50"
                >
                  Segarkan Log
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4">Pengguna</th>
                      <th className="py-3 px-4">Aksi</th>
                      <th className="py-3 px-4">Target</th>
                      <th className="py-3 px-4">Alamat IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {new Date(log.waktu_dibuat).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{log.user_email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            log.jenis_aksi.includes("SUCCESS") ? "bg-emerald-100 text-emerald-800" :
                            log.jenis_aksi.includes("FAILED") ? "bg-red-100 text-red-800" :
                            "bg-sky-100 text-sky-800"
                          }`}>
                            {log.jenis_aksi}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{log.tabel_target || "—"} ({log.id_target || "—"})</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{log.alamat_ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: JADWAL TA MAHASISWA
              ======================================================= */}
          {activeMenu === "jadwal_ta_mhs" && (
            <div className="space-y-6">
              {/* Tabel Jadwal Sempro */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-sky-600" />
                  <span>Jadwal Seminar Proposal (Sempro)</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4">NIM</th>
                        <th className="py-3 px-4">Penguji</th>
                        <th className="py-3 px-4">Jam Mulai</th>
                        <th className="py-3 px-4">Jam Selesai</th>
                        <th className="py-3 px-4">Ruangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 font-semibold">2026-11-20</td>
                        <td className="py-3 px-4 font-mono">{currentUser.nim || "M0521088"}</td>
                        <td className="py-3 px-4">Dr. Budi Santoso, M.Kom.; Bambang Widoyono, M.T.</td>
                        <td className="py-3 px-4">09:00 WIB</td>
                        <td className="py-3 px-4">10:30 WIB</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-medium">Ruang Sidang 1</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel Jadwal Sidang TA */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-600" />
                  <span>Jadwal Sidang Akhir Tugas Akhir (Sidang TA)</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4">NIM</th>
                        <th className="py-3 px-4">Penguji</th>
                        <th className="py-3 px-4">Jam Mulai</th>
                        <th className="py-3 px-4">Jam Selesai</th>
                        <th className="py-3 px-4">Ruangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 font-semibold">2026-12-15</td>
                        <td className="py-3 px-4 font-mono">{currentUser.nim || "M0521088"}</td>
                        <td className="py-3 px-4">Dr. Budi Santoso, M.Kom.; Dr. Siti Aminah, M.T.; Bambang Widoyono, M.T.</td>
                        <td className="py-3 px-4">13:30 WIB</td>
                        <td className="py-3 px-4">15:00 WIB</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Ruang Sidang Utama</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: UPLOAD BERKAS MAHASISWA (Sempro, Semhas, Sidang TA)
              ======================================================= */}
          {activeMenu === "upload_berkas" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900 capitalize">Upload Berkas Pendaftaran ({activeSubMenu})</h3>
                <p className="text-xs text-slate-500">Unduh template dan unggah berkas pendaftaran serta laporan hasil Turnitin</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* BOX 1: Download Template */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between hover:border-sky-500 transition">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                      <Download size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">Download Template</h4>
                    <p className="text-xs text-slate-500 mb-4">Unduh format formulir pendaftaran resmi {activeSubMenu}.</p>
                  </div>
                  <button
                    onClick={() => notify(`Template pendaftaran ${activeSubMenu} berhasil diunduh.`)}
                    className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Unduh Dokumen (.docx)
                  </button>
                </div>

                {/* BOX 2: Upload Berkas */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between hover:border-sky-500 transition">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                      <Upload size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">Upload Berkas</h4>
                    <p className="text-xs text-slate-500 mb-4">Unggah dokumen formulir pendaftaran yang telah diisi & ditandatangani.</p>
                  </div>
                  <label className="w-full py-2 px-3 rounded-lg bg-sky-600 text-white text-xs font-semibold text-center cursor-pointer hover:bg-sky-700 transition block">
                    <span>Pilih Berkas PDF</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                      if (e.target.files[0]) notify(`Berkas "${e.target.files[0].name}" berhasil diunggah!`);
                    }} />
                  </label>
                </div>

                {/* BOX 3: Upload Turnitin */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between hover:border-sky-500 transition">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                      <FileText size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">Upload Turnitin</h4>
                    <p className="text-xs text-slate-500 mb-4">Unggah bukti hasil uji kemiripan Turnitin (maksimal 30%).</p>
                  </div>
                  <label className="w-full py-2 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold text-center cursor-pointer hover:bg-purple-700 transition block">
                    <span>Pilih Hasil Turnitin</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                      if (e.target.files[0]) notify(`Bukti Turnitin "${e.target.files[0].name}" berhasil diunggah!`);
                    }} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: REKOGNISI MAHASISWA
              ======================================================= */}
          {activeMenu === "rekognisi" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900 capitalize">Upload Bukti Rekognisi ({activeSubMenu})</h3>
                <p className="text-xs text-slate-500">Unggah bukti rekognisi kompetisi, publikasi ilmiah, atau prestasi setara</p>
              </div>

              <div className="max-w-md border border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Award size={28} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">Bukti Rekognisi Jalur Prestasi</h4>
                <p className="text-xs text-slate-500 mb-5">Format file diperbolehkan: PDF, JPG, PNG (maksimal 5 MB)</p>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 cursor-pointer shadow-sm transition">
                  <Upload size={15} />
                  <span>Unggah Bukti Rekognisi</span>
                  <input type="file" className="hidden" onChange={(e) => {
                    if (e.target.files[0]) notify(`Bukti rekognisi "${e.target.files[0].name}" berhasil diunggah!`);
                  }} />
                </label>
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: DOSEN PEMBIMBING MAHASISWA
              ======================================================= */}
          {activeMenu === "dosen_pembimbing_mhs" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pengajuan Dosen Pembimbing</h3>
                  <p className="text-xs text-slate-500">Kirim persetujuan bimbingan (maksimal 2 dosen pembimbing)</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800">
                  Status Pengajuan: {persetujuanCount} / 2 Terkirim
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                      <th className="py-3 px-4">Nama Dosen</th>
                      <th className="py-3 px-4">Bidang Kepakaran</th>
                      <th className="py-3 px-4">Status Pengajuan</th>
                      <th className="py-3 px-4 text-center">Kirim Persetujuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dosenList.map((d, index) => (
                      <tr key={index} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">{d.nama}</td>
                        <td className="py-3 px-4 text-slate-600">{d.kepakaran || "Rekayasa Perangkat Lunak"}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            Tersedia
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            disabled={persetujuanCount >= 2}
                            onClick={() => handleKirimPersetujuan(d.nama)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              persetujuanCount >= 2
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-sky-600 text-white hover:bg-sky-700"
                            }`}
                          >
                            <Send size={12} />
                            <span>Kirim Persetujuan</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: JADWAL TA DOSEN
              ======================================================= */}
          {activeMenu === "jadwal_ta_dosen" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">Jadwal Ujian & Sidang yang Diuji</h3>
                <p className="text-xs text-slate-500">Daftar jadwal sidang di mana Anda bertugas sebagai penguji atau pembimbing</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">NIM</th>
                      <th className="py-3 px-4">Penguji</th>
                      <th className="py-3 px-4">Jam Mulai</th>
                      <th className="py-3 px-4">Jam Selesai</th>
                      <th className="py-3 px-4">Ruangan</th>
                      <th className="py-3 px-4 text-center">Aksi Reschedule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-900">2026-11-20</td>
                      <td className="py-3 px-4 font-mono font-medium">M0521088</td>
                      <td className="py-3 px-4 text-slate-700">Dr. Budi Santoso, M.Kom.; Bambang Widoyono, M.T.</td>
                      <td className="py-3 px-4 text-slate-600">09:00 WIB</td>
                      <td className="py-3 px-4 text-slate-600">10:30 WIB</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-medium">Ruang Sidang 1</span></td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setRescheduleModal({ open: true, jadwalId: 1, tanggal: "2026-11-25", jam: "10:00", alasan: "" })}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                        >
                          Reschedule
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: MAHASISWA BIMBINGAN DOSEN (Tabel 1 & Tabel 2)
              ======================================================= */}
          {activeMenu === "mahasiswa_bimbingan" && (
            <div className="space-y-8">
              {/* TABEL 1: 10 MAHASISWA PERTAMA AKTIF */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Tabel 1 — Daftar Mahasiswa Bimbingan Aktif</h3>
                    <p className="text-xs text-slate-500">Otomatis terisi oleh 10 mahasiswa pertama yang disetujui bimbingannya</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Kapasitas: {approvedStudents.length} / 10 Mahasiswa
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                        <th className="py-3 px-4">Nama Mahasiswa</th>
                        <th className="py-3 px-4">NIM</th>
                        <th className="py-3 px-4">Angkatan</th>
                        <th className="py-3 px-4">Program Studi</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {approvedStudents.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-semibold text-slate-900">{s.nama}</td>
                          <td className="py-3 px-4 font-mono font-medium">{s.nim}</td>
                          <td className="py-3 px-4">{s.angkatan}</td>
                          <td className="py-3 px-4">{s.prodi}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <Check size={12} /> Bimbingan Aktif
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 2: PERMOHONAN PERSETUJUAN BARU (Antrean > 10) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">Tabel 2 — Antrean Permohonan Persetujuan Mahasiswa</h3>
                  <p className="text-xs text-slate-500">Mahasiswa yang mengajukan bimbingan dan menunggu persetujuan Anda</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                        <th className="py-3 px-4">Nama Mahasiswa</th>
                        <th className="py-3 px-4">NIM</th>
                        <th className="py-3 px-4">Angkatan</th>
                        <th className="py-3 px-4">Program Studi</th>
                        <th className="py-3 px-4 text-center">Terima Persetujuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingRequests.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            Tidak ada antrean permohonan baru.
                          </td>
                        </tr>
                      ) : (
                        pendingRequests.map((reqItem) => (
                          <tr key={reqItem.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-semibold text-slate-900">{reqItem.nama}</td>
                            <td className="py-3 px-4 font-mono font-medium">{reqItem.nim}</td>
                            <td className="py-3 px-4">{reqItem.angkatan}</td>
                            <td className="py-3 px-4">{reqItem.prodi}</td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleTerimaPersetujuan(reqItem)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                              >
                                <Check size={14} />
                                <span>Terima Persetujuan</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              VIEW: PESAN (Accordion Rectangle List)
              ======================================================= */}
          {activeMenu === "pesan" && (
            <div className="max-w-4xl bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900">Kotak Pesan & Pengumuman</h3>
                <p className="text-xs text-slate-500">Klik pada kotak pesan untuk membuka dan melihat isi lengkapnya</p>
              </div>

              <div className="space-y-3">
                {pesanList.map((msg) => {
                  const isExpanded = expandedMessage === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setExpandedMessage(isExpanded ? null : msg.id)}
                      className={`cursor-pointer border rounded-xl p-4 transition-all duration-200 ${
                        isExpanded
                          ? "border-sky-500 bg-sky-50/30 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isExpanded ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                            <Mail size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{msg.header}</h4>
                            <span className="text-[11px] text-slate-400 font-mono">{msg.tanggal}</span>
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown size={18} className="text-sky-600" /> : <ChevronRight size={18} className="text-slate-400" />}
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-slate-200/80 text-xs text-slate-700 leading-relaxed animate-fade-in">
                          {msg.isi}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =======================================================
          MODAL: TAMBAH DOSEN PEMBIMBING (ADMIN TA)
          ======================================================= */}
      {showAddDosenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Tambah Dosen Pembimbing Baru</h3>
            <p className="text-xs text-slate-500 mb-5">Data dosen akan otomatis didaftarkan ke tabel Dosen & Dosen_Kepakaran</p>

            <form onSubmit={handleAddDosen} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  placeholder="Contoh: Dr. Eng. Irwan Santosa, M.T."
                  value={newDosenForm.nama}
                  onChange={(e) => setNewDosenForm(prev => ({ ...prev, nama: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-sky-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">NIP (Nomor Induk Pegawai)</label>
                <input
                  type="text"
                  placeholder="Contoh: 198501012010011002"
                  value={newDosenForm.nip}
                  onChange={(e) => setNewDosenForm(prev => ({ ...prev, nip: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-sky-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Resmi</label>
                <input
                  type="email"
                  placeholder="nama@staff.uns.ac.id"
                  value={newDosenForm.email}
                  onChange={(e) => setNewDosenForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-sky-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Bidang Kepakaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Rekayasa Perangkat Lunak, Data Science"
                  value={newDosenForm.kepakaran}
                  onChange={(e) => setNewDosenForm(prev => ({ ...prev, kepakaran: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-sky-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDosenModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
                >
                  Simpan Dosen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: RESCHEDULE JADWAL (DOSEN)
          ======================================================= */}
      {rescheduleModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Form Pengajuan Reschedule Jadwal</h3>
            <p className="text-xs text-slate-500 mb-5">Ajukan usulan tanggal dan waktu pengganti untuk sidang tugas akhir</p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tanggal Usulan Baru</label>
                <input
                  type="date"
                  value={rescheduleModal.tanggal}
                  onChange={(e) => setRescheduleModal(prev => ({ ...prev, tanggal: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-sky-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Jam Mulai Usulan</label>
                <input
                  type="time"
                  value={rescheduleModal.jam}
                  onChange={(e) => setRescheduleModal(prev => ({ ...prev, jam: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-sky-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Alasan Perubahan Jadwal</label>
                <textarea
                  rows={3}
                  placeholder="Masukkan alasan berhalangan atau perubahan waktu secara jelas..."
                  value={rescheduleModal.alasan}
                  onChange={(e) => setRescheduleModal(prev => ({ ...prev, alasan: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-sky-600 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModal({ open: false, jadwalId: null, tanggal: "", jam: "", alasan: "" })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
