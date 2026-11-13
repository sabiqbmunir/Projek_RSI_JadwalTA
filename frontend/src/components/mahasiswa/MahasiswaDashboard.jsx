import MahasiswaSidebar from "./MahasiswaSidebar.jsx";
import MahasiswaTopbar from "./MahasiswaTopbar.jsx";
import MahasiswaProfil from "./MahasiswaProfil.jsx";

export default function MahasiswaDashboard({
  currentUser,
  handleLogout,
  actionNotice,
}) {
  return (
    <div className="flex min-h-screen bg-[#eff3f8] font-sans text-slate-800">
      {/* Sidebar Mahasiswa (Tampilan normal, bersih, tanpa blur & lock) */}
      <MahasiswaSidebar
        activeMenu="profil"
        onLogout={handleLogout}
      />

      {/* Main Content Area (Hanya Menampilkan Dashboard Profil Mahasiswa) */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <main className="min-w-0 flex-1 p-8 pt-6">
          <MahasiswaTopbar currentUser={currentUser} actionNotice={actionNotice} />
          <div className="mt-7">
            <MahasiswaProfil currentUser={currentUser} />
          </div>
        </main>
      </div>
    </div>
  );
}
