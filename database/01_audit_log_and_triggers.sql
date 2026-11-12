USE PenjadwalanTA;
GO

/* ==========================================================
   1. TABEL LOG_AUDIT
   Sesuai TSD Bagian 4.3 (Tabel 13) & Bagian 6.3
   ========================================================== */
IF OBJECT_ID('Log_audit', 'U') IS NULL
BEGIN
    CREATE TABLE Log_audit (
        log_id       UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        user_email   NVARCHAR(150)    NOT NULL,
        jenis_aksi   NVARCHAR(50)     NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'USER_CREATED', 'ROLE_CHANGED', dll
        tabel_target NVARCHAR(50)     NULL,
        id_target    NVARCHAR(50)     NULL,
        old_values   NVARCHAR(MAX)    NULL,
        new_values   NVARCHAR(MAX)    NULL,
        alamat_ip    NVARCHAR(45)     NOT NULL,
        waktu_dibuat DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_Log_audit PRIMARY KEY (log_id)
    );
END;
GO

/* Index untuk optimasi query log audit */
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Log_audit_waktu' AND object_id = OBJECT_ID('Log_audit'))
    CREATE INDEX IX_Log_audit_waktu ON Log_audit(waktu_dibuat DESC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Log_audit_email' AND object_id = OBJECT_ID('Log_audit'))
    CREATE INDEX IX_Log_audit_email ON Log_audit(user_email);
GO

/* ==========================================================
   2. TRIGGER APPEND-ONLY PADA LOG_AUDIT
   Sesuai Batasan AC-09: Log audit dilarang diubah atau dihapus
   ========================================================== */
CREATE OR ALTER TRIGGER trg_audit_log_append_only
ON Log_audit
AFTER UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    THROW 50001, 'Tabel Log_audit bersifat append-only. Baris data tidak boleh diubah atau dihapus.', 1;
END;
GO

/* ==========================================================
   3. TRIGGER AUDIT PADA TABEL MAHASISWA
   ========================================================== */
CREATE OR ALTER TRIGGER trg_audit_mahasiswa
ON Mahasiswa
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- INSERT
    IF EXISTS (SELECT 1 FROM inserted) AND NOT EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
        SELECT 
            i.email,
            'USER_CREATED',
            'Mahasiswa',
            i.nim,
            NULL,
            (SELECT i.nim, i.nama, i.email, i.prodi, i.tahun_masuk, i.judul, i.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            '127.0.0.1'
        FROM inserted i;
    END

    -- UPDATE
    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
        SELECT 
            i.email,
            CASE 
                WHEN d.role <> i.role THEN 'ROLE_CHANGED'
                ELSE 'USER_UPDATED'
            END,
            'Mahasiswa',
            i.nim,
            (SELECT d.nim, d.nama, d.email, d.prodi, d.tahun_masuk, d.judul, d.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT i.nim, i.nama, i.email, i.prodi, i.tahun_masuk, i.judul, i.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            '127.0.0.1'
        FROM inserted i
        JOIN deleted d ON i.nim = d.nim;
    END

    -- DELETE
    IF NOT EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
        SELECT 
            d.email,
            'USER_DELETED',
            'Mahasiswa',
            d.nim,
            (SELECT d.nim, d.nama, d.email, d.prodi, d.tahun_masuk, d.judul, d.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            NULL,
            '127.0.0.1'
        FROM deleted d;
    END
END;
GO

/* ==========================================================
   4. TRIGGER AUDIT PADA TABEL DOSEN
   ========================================================== */
CREATE OR ALTER TRIGGER trg_audit_dosen
ON Dosen
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- INSERT
    IF EXISTS (SELECT 1 FROM inserted) AND NOT EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
        SELECT 
            i.email,
            'DOSEN_CREATED',
            'Dosen',
            i.nip,
            NULL,
            (SELECT i.nip, i.nama, i.email, i.jumlah_bimbingan, i.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            '127.0.0.1'
        FROM inserted i;
    END

    -- UPDATE
    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
        SELECT 
            i.email,
            CASE 
                WHEN d.role <> i.role THEN 'ROLE_CHANGED'
                ELSE 'DOSEN_UPDATED'
            END,
            'Dosen',
            i.nip,
            (SELECT d.nip, d.nama, d.email, d.jumlah_bimbingan, d.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT i.nip, i.nama, i.email, i.jumlah_bimbingan, i.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            '127.0.0.1'
        FROM inserted i
        JOIN deleted d ON i.nip = d.nip;
    END

    -- DELETE
    IF NOT EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
        SELECT 
            d.email,
            'DOSEN_DELETED',
            'Dosen',
            d.nip,
            (SELECT d.nip, d.nama, d.email, d.jumlah_bimbingan, d.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            NULL,
            '127.0.0.1'
        FROM deleted d;
    END
END;
GO

/* ==========================================================
   5. TRIGGER AUDIT PADA TABEL ADMIN_DOSEN_TA
   ========================================================== */
CREATE OR ALTER TRIGGER trg_audit_admin
ON Admin_Dosen_TA
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- INSERT
    IF EXISTS (SELECT 1 FROM inserted) AND NOT EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
        SELECT 
            i.email,
            'ADMIN_CREATED',
            'Admin_Dosen_TA',
            CAST(i.id_admin AS NVARCHAR(50)),
            NULL,
            (SELECT i.id_admin, i.nip, i.nama, i.email, i.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            '127.0.0.1'
        FROM inserted i;
    END

    -- UPDATE
    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
        SELECT 
            i.email,
            CASE 
                WHEN d.role <> i.role THEN 'ROLE_CHANGED'
                ELSE 'ADMIN_UPDATED'
            END,
            'Admin_Dosen_TA',
            CAST(i.id_admin AS NVARCHAR(50)),
            (SELECT d.id_admin, d.nip, d.nama, d.email, d.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT i.id_admin, i.nip, i.nama, i.email, i.role FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            '127.0.0.1'
        FROM inserted i
        JOIN deleted d ON i.id_admin = d.id_admin;
    END
END;
GO

/* ==========================================================
   6. STORED PROCEDURE: REGISTRASI MAHASISWA
   ========================================================== */
CREATE OR ALTER PROCEDURE sp_registrasi_mahasiswa
    @p_nim         VARCHAR(20),
    @p_nama        NVARCHAR(100),
    @p_email       NVARCHAR(100),
    @p_password    NVARCHAR(255),
    @p_prodi       NVARCHAR(100),
    @p_tahun_masuk INT,
    @p_judul       NVARCHAR(255) = NULL,
    @p_alamat_ip   NVARCHAR(45)  = '127.0.0.1',
    @p_result      NVARCHAR(30)  OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Periksa apakah email sudah terdaftar di salah satu tabel
        IF EXISTS (SELECT 1 FROM Mahasiswa WHERE email = @p_email)
           OR EXISTS (SELECT 1 FROM Dosen WHERE email = @p_email)
           OR EXISTS (SELECT 1 FROM Admin_Dosen_TA WHERE email = @p_email)
        BEGIN
            SET @p_result = 'EMAIL_EXISTS';
            RETURN;
        END;

        -- Periksa apakah NIM sudah terdaftar
        IF EXISTS (SELECT 1 FROM Mahasiswa WHERE nim = @p_nim)
        BEGIN
            SET @p_result = 'NIM_EXISTS';
            RETURN;
        END;

        BEGIN TRANSACTION;

        INSERT INTO Mahasiswa (nim, nama, email, password, prodi, tahun_masuk, judul, role)
        VALUES (@p_nim, @p_nama, @p_email, @p_password, @p_prodi, @p_tahun_masuk, @p_judul, 'mahasiswa');

        -- Log audit eksplisit untuk IP pendaftar
        INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
        VALUES (@p_email, 'REGISTER_SUCCESS', 'Mahasiswa', @p_nim, NULL, 
                (SELECT @p_nim AS nim, @p_nama AS nama, @p_email AS email, @p_prodi AS prodi, @p_tahun_masuk AS tahun_masuk FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
                @p_alamat_ip);

        COMMIT TRANSACTION;
        SET @p_result = 'SUCCESS';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @p_result = 'ERROR';
        THROW;
    END CATCH
END;
GO

/* ==========================================================
   7. STORED PROCEDURE: REGISTRASI DOSEN
   ========================================================== */
CREATE OR ALTER PROCEDURE sp_registrasi_dosen
    @p_nip         VARCHAR(30),
    @p_nama        NVARCHAR(100),
    @p_email       NVARCHAR(100),
    @p_password    NVARCHAR(255),
    @p_kepakaran   NVARCHAR(100) = NULL,
    @p_alamat_ip   NVARCHAR(45)  = '127.0.0.1',
    @p_result      NVARCHAR(30)  OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Periksa email
        IF EXISTS (SELECT 1 FROM Dosen WHERE email = @p_email)
           OR EXISTS (SELECT 1 FROM Mahasiswa WHERE email = @p_email)
           OR EXISTS (SELECT 1 FROM Admin_Dosen_TA WHERE email = @p_email)
        BEGIN
            SET @p_result = 'EMAIL_EXISTS';
            RETURN;
        END;

        -- Periksa NIP
        IF EXISTS (SELECT 1 FROM Dosen WHERE nip = @p_nip)
        BEGIN
            SET @p_result = 'NIP_EXISTS';
            RETURN;
        END;

        BEGIN TRANSACTION;

        INSERT INTO Dosen (nip, nama, email, password, jumlah_bimbingan, role)
        VALUES (@p_nip, @p_nama, @p_email, @p_password, 0, 'dosen');

        IF @p_kepakaran IS NOT NULL AND LEN(TRIM(@p_kepakaran)) > 0
        BEGIN
            INSERT INTO Dosen_Kepakaran (nip, kepakaran)
            VALUES (@p_nip, TRIM(@p_kepakaran));
        END;

        INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
        VALUES (@p_email, 'REGISTER_SUCCESS', 'Dosen', @p_nip, NULL, 
                (SELECT @p_nip AS nip, @p_nama AS nama, @p_email AS email, @p_kepakaran AS kepakaran FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
                @p_alamat_ip);

        COMMIT TRANSACTION;
        SET @p_result = 'SUCCESS';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @p_result = 'ERROR';
        THROW;
    END CATCH
END;
GO

/* ==========================================================
   8. STORED PROCEDURE: CATAT LOGIN AUDIT
   ========================================================== */
CREATE OR ALTER PROCEDURE sp_catat_login_audit
    @p_email      NVARCHAR(150),
    @p_jenis_aksi NVARCHAR(50), -- 'LOGIN_SUCCESS', 'LOGIN_FAILED'
    @p_alamat_ip  NVARCHAR(45),
    @p_info       NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Log_audit (user_email, jenis_aksi, tabel_target, id_target, old_values, new_values, alamat_ip)
    VALUES (@p_email, @p_jenis_aksi, 'Pengguna', @p_email, NULL, @p_info, @p_alamat_ip);
END;
GO
