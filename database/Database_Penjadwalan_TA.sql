
IF DB_ID('PenjadwalanTA') IS NULL
    CREATE DATABASE PenjadwalanTA;
GO
USE PenjadwalanTA;
GO

/* ---------- 1. DOSEN ---------- */
CREATE TABLE Dosen (
    nip              VARCHAR(30)   NOT NULL,
    nama             NVARCHAR(100) NOT NULL,
    email            NVARCHAR(100) NOT NULL,
    password         NVARCHAR(255) NOT NULL,
    jumlah_bimbingan INT           NOT NULL CONSTRAINT DF_Dosen_jumlah DEFAULT 0,
    role             VARCHAR(20)   NOT NULL CONSTRAINT DF_Dosen_role   DEFAULT 'dosen',
    CONSTRAINT PK_Dosen       PRIMARY KEY (nip),
    CONSTRAINT UQ_Dosen_email UNIQUE (email),
    CONSTRAINT CK_Dosen_jumlah CHECK (jumlah_bimbingan >= 0)
);
GO

/* Atribut multivalue "kepakaran" Dosen (Fleksibel untuk text box) */
CREATE TABLE Dosen_Kepakaran (
    nip       VARCHAR(30)   NOT NULL,
    kepakaran NVARCHAR(100) NOT NULL,
    CONSTRAINT PK_Dosen_Kepakaran PRIMARY KEY (nip, kepakaran),
    CONSTRAINT FK_DosenKepakaran_Dosen FOREIGN KEY (nip)
        REFERENCES Dosen(nip) ON DELETE CASCADE
);
GO

/* ---------- 2. ADMIN DOSEN TA ---------- */
CREATE TABLE Admin_Dosen_TA (
    id_admin INT IDENTITY(1,1) NOT NULL,
    nip      VARCHAR(30)   NOT NULL,
    nama     NVARCHAR(100) NOT NULL,
    email    NVARCHAR(100) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role     VARCHAR(20)   NOT NULL CONSTRAINT DF_Admin_role DEFAULT 'admin',
    CONSTRAINT PK_Admin PRIMARY KEY (id_admin),
    CONSTRAINT UQ_Admin_email UNIQUE (email),
    CONSTRAINT FK_Admin_Dosen FOREIGN KEY (nip) REFERENCES Dosen(nip)
);
GO

/* ---------- 3. MAHASISWA ---------- */
CREATE TABLE Mahasiswa (
    nim         VARCHAR(20)   NOT NULL,
    nama        NVARCHAR(100) NOT NULL,
    email       NVARCHAR(100) NOT NULL,
    password    NVARCHAR(255) NOT NULL,
    prodi       NVARCHAR(100) NULL,
    tahun_masuk INT           NULL,   -- Angkatan
    judul       NVARCHAR(255) NULL,
    role        VARCHAR(20)   NOT NULL CONSTRAINT DF_Mhs_role DEFAULT 'mahasiswa',
    CONSTRAINT PK_Mahasiswa PRIMARY KEY (nim),
    CONSTRAINT UQ_Mahasiswa_email UNIQUE (email)
);
GO

/* ---------- 4. PEMBIMBING (Dosen - Mahasiswa) ---------- */
CREATE TABLE Pembimbing (
    nip               VARCHAR(30)  NOT NULL,
    nim               VARCHAR(20)  NOT NULL,
    status            NVARCHAR(50) NULL,
    tanggal_pengajuan DATETIME     NOT NULL CONSTRAINT DF_Pembimbing_tgl DEFAULT GETDATE(), -- Penentu 10 pendaftar pertama
    CONSTRAINT PK_Pembimbing PRIMARY KEY (nip, nim),
    CONSTRAINT FK_Pembimbing_Dosen FOREIGN KEY (nip) REFERENCES Dosen(nip),
    CONSTRAINT FK_Pembimbing_Mhs   FOREIGN KEY (nim) REFERENCES Mahasiswa(nim)
);
GO

/* ---------- 5. RUANGAN (Mempertahankan Hari & Jam Asli) ---------- */
CREATE TABLE Ruangan (
    id_ruangan   INT IDENTITY(1,1) NOT NULL,
    nama_ruangan NVARCHAR(100) NOT NULL,
    hari         VARCHAR(10)   NULL,   -- contoh: 'Senin'
    jam          VARCHAR(20)   NULL,   -- contoh: '08:00-10:00'
    CONSTRAINT PK_Ruangan PRIMARY KEY (id_ruangan)
);
GO

/* ---------- 6. JADWAL (Hanya Sidang Sempro & Sidang TA Sesuai Desain) ---------- */
CREATE TABLE Jadwal (
    id_jadwal    INT IDENTITY(1,1) NOT NULL,
    id_ruangan   INT         NOT NULL,
    nim          VARCHAR(20) NOT NULL,
    tanggal      DATE        NOT NULL,
    jam_mulai    TIME(0)     NOT NULL,
    jam_selesai  TIME(0)     NOT NULL,
    jenis_sidang VARCHAR(20) NOT NULL,
    CONSTRAINT PK_Jadwal PRIMARY KEY (id_jadwal),
    CONSTRAINT FK_Jadwal_Ruangan FOREIGN KEY (id_ruangan) REFERENCES Ruangan(id_ruangan),
    CONSTRAINT FK_Jadwal_Mhs     FOREIGN KEY (nim)        REFERENCES Mahasiswa(nim),
    CONSTRAINT CK_Jadwal_jenis   CHECK (jenis_sidang IN ('sidang_sempro', 'sidang_ta')),
    CONSTRAINT CK_Jadwal_jam     CHECK (jam_selesai > jam_mulai)
);
GO

/* ---------- 7. JADWAL PENGUJI ---------- */
CREATE TABLE Jadwal_Penguji (
    id_jadwal INT         NOT NULL,
    nip       VARCHAR(30) NOT NULL,
    CONSTRAINT PK_Jadwal_Penguji PRIMARY KEY (id_jadwal, nip),
    CONSTRAINT FK_JP_Jadwal FOREIGN KEY (id_jadwal) REFERENCES Jadwal(id_jadwal) ON DELETE CASCADE,
    CONSTRAINT FK_JP_Dosen  FOREIGN KEY (nip)       REFERENCES Dosen(nip)
);
GO

/* ---------- 8. RESCHEDULE ---------- */
CREATE TABLE Reschedule (
    id_reschedule      INT IDENTITY(1,1) NOT NULL,
    nip                VARCHAR(30)   NOT NULL,
    id_jadwal          INT           NOT NULL,
    alasan             NVARCHAR(500) NULL,
    tanggal_usulan     DATE          NULL,
    jam_mulai_usulan   TIME(0)       NULL,
    jam_selesai_usulan TIME(0)       NULL,
    status             VARCHAR(20)   NOT NULL CONSTRAINT DF_Resched_status DEFAULT 'menunggu',
    tanggal_pengajuan  DATETIME      NOT NULL CONSTRAINT DF_Resched_tgl DEFAULT GETDATE(),
    CONSTRAINT PK_Reschedule PRIMARY KEY (id_reschedule),
    CONSTRAINT FK_Resched_Dosen  FOREIGN KEY (nip)       REFERENCES Dosen(nip),
    CONSTRAINT FK_Resched_Jadwal FOREIGN KEY (id_jadwal) REFERENCES Jadwal(id_jadwal)
);
GO

/* ---------- 9. JADWAL KOSONG DOSEN (Sesuai ERD) ---------- */
CREATE TABLE Jadwal_Kosong_Dosen (
    id_jadwal_kosong INT IDENTITY(1,1) NOT NULL,
    nip              VARCHAR(30) NOT NULL,
    hari             VARCHAR(10) NOT NULL,
    jam              VARCHAR(20) NOT NULL,
    CONSTRAINT PK_JKD PRIMARY KEY (id_jadwal_kosong),
    CONSTRAINT FK_JKD_Dosen FOREIGN KEY (nip) REFERENCES Dosen(nip)
);
GO

/* ---------- 10. NILAI ---------- */
CREATE TABLE Nilai (
    id_nilai           INT IDENTITY(1,1) NOT NULL,
    nim                VARCHAR(20)  NOT NULL,
    id_admin           INT          NOT NULL,
    nilai_sempro       DECIMAL(5,2) NULL,
    nilai_semhas       DECIMAL(5,2) NULL,
    nilai_sidang_akhir DECIMAL(5,2) NULL,
    CONSTRAINT PK_Nilai PRIMARY KEY (id_nilai),
    CONSTRAINT UQ_Nilai_nim UNIQUE (nim),
    CONSTRAINT FK_Nilai_Mhs   FOREIGN KEY (nim)      REFERENCES Mahasiswa(nim),
    CONSTRAINT FK_Nilai_Admin FOREIGN KEY (id_admin) REFERENCES Admin_Dosen_TA(id_admin),
    CONSTRAINT CK_Nilai_sempro CHECK (nilai_sempro       BETWEEN 0 AND 100),
    CONSTRAINT CK_Nilai_semhas CHECK (nilai_semhas       BETWEEN 0 AND 100),
    CONSTRAINT CK_Nilai_akhir  CHECK (nilai_sidang_akhir BETWEEN 0 AND 100)
);
GO

/* ---------- 11. BERKAS PENDAFTARAN (Ditambahkan pembeda jenis sidang) ---------- */
CREATE TABLE Berkas_pendaftaran (
    id_berkas     INT IDENTITY(1,1) NOT NULL,
    nim           VARCHAR(20)   NOT NULL,
    jenis_sidang  VARCHAR(20)   NOT NULL, -- 'sempro', 'semhas', 'sidang_ta'
    file_berkas   NVARCHAR(255) NULL,
    file_turnitin NVARCHAR(255) NULL,
    tanggal_upload DATETIME     NOT NULL CONSTRAINT DF_Berkas_tgl DEFAULT GETDATE(),
    CONSTRAINT PK_Berkas PRIMARY KEY (id_berkas),
    CONSTRAINT FK_Berkas_Mhs FOREIGN KEY (nim) REFERENCES Mahasiswa(nim),
    CONSTRAINT CK_Berkas_jenis CHECK (jenis_sidang IN ('sempro', 'semhas', 'sidang_ta'))
);
GO

/* ---------- 12. REKOGNISI (Disesuaikan untuk upload bukti rekognisi) ---------- */
CREATE TABLE Rekognisi (
    id_rekognisi   INT IDENTITY(1,1) NOT NULL,
    nim            VARCHAR(20)   NOT NULL,
    jenis_sidang   VARCHAR(20)   NOT NULL, -- 'sempro', 'semhas', 'sidang_ta'
    file_bukti     NVARCHAR(255) NOT NULL,
    keterangan     NVARCHAR(500) NULL,
    tanggal_upload DATETIME      NOT NULL CONSTRAINT DF_Rekognisi_tgl DEFAULT GETDATE(),
    CONSTRAINT PK_Rekognisi PRIMARY KEY (id_rekognisi),
    CONSTRAINT FK_Rekognisi_Mhs FOREIGN KEY (nim) REFERENCES Mahasiswa(nim),
    CONSTRAINT CK_Rekognisi_jenis CHECK (jenis_sidang IN ('sempro', 'semhas', 'sidang_ta'))
);
GO

/* ---------- 13. PESAN (Fleksibel untuk Admin, Dosen, Mahasiswa) ---------- */
CREATE TABLE Pesan (
    id_pesan      INT IDENTITY(1,1) NOT NULL,
    pengirim_role VARCHAR(20)   NOT NULL, -- 'admin', 'dosen', 'mahasiswa'
    pengirim_id   VARCHAR(30)   NOT NULL, -- id_admin / nip / nim
    penerima_role VARCHAR(20)   NOT NULL, -- 'admin', 'dosen', 'mahasiswa'
    penerima_id   VARCHAR(30)   NOT NULL, -- id_admin / nip / nim
    header        NVARCHAR(150) NOT NULL,
    isi_pesan     NVARCHAR(MAX) NOT NULL,
    status_dibaca BIT           NOT NULL CONSTRAINT DF_Pesan_dibaca DEFAULT 0,
    tanggal_kirim DATETIME      NOT NULL CONSTRAINT DF_Pesan_tgl DEFAULT GETDATE(),
    CONSTRAINT PK_Pesan PRIMARY KEY (id_pesan)
);
GO