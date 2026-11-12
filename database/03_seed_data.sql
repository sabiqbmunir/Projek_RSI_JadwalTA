USE PenjadwalanTA;
GO

/* ==========================================================
   SEED DATA AWAL SISTEM PENJADWALAN TA
   Default Password untuk semua akun demo: Password123!
   Hash Bcrypt (Cost 12): $2a$12$QmpDCYI1s8fII6X1ec2iSO6OYhAeh9DStPxYL25fahnemhL1P/MuO
   ========================================================== */

-- 1. SEED DOSEN PEMBIMBING & PENGUJI
IF NOT EXISTS (SELECT 1 FROM Dosen WHERE nip = '198005152005011002')
BEGIN
    INSERT INTO Dosen (nip, nama, email, password, jumlah_bimbingan, role)
    VALUES (
        '198005152005011002',
        'Dr. Budi Santoso, M.Kom.',
        'budi.santoso@staff.uns.ac.id',
        '$2a$12$QmpDCYI1s8fII6X1ec2iSO6OYhAeh9DStPxYL25fahnemhL1P/MuO',
        2,
        'dosen'
    );

    INSERT INTO Dosen_Kepakaran (nip, kepakaran)
    VALUES 
        ('198005152005011002', 'Rekayasa Perangkat Lunak'),
        ('198005152005011002', 'Data Science');
END;
GO

IF NOT EXISTS (SELECT 1 FROM Dosen WHERE nip = '197501012000011001')
BEGIN
    INSERT INTO Dosen (nip, nama, email, password, jumlah_bimbingan, role)
    VALUES (
        '197501012000011001',
        'Bambang Widoyono, M.T.',
        'bambang.widoyono@staff.uns.ac.id',
        '$2a$12$QmpDCYI1s8fII6X1ec2iSO6OYhAeh9DStPxYL25fahnemhL1P/MuO',
        5,
        'dosen'
    );

    INSERT INTO Dosen_Kepakaran (nip, kepakaran)
    VALUES 
        ('197501012000011001', 'Cyber Security'),
        ('197501012000011001', 'Jaringan Komputer');
END;
GO

-- 2. SEED ADMIN DOSEN TA (SuperAdmin)
IF NOT EXISTS (SELECT 1 FROM Admin_Dosen_TA WHERE email = 'admin.ta@uns.ac.id')
BEGIN
    INSERT INTO Admin_Dosen_TA (nip, nama, email, password, role)
    VALUES (
        '197501012000011001',
        'Admin Divisi TA, M.Kom.',
        'admin.ta@uns.ac.id',
        '$2a$12$QmpDCYI1s8fII6X1ec2iSO6OYhAeh9DStPxYL25fahnemhL1P/MuO',
        'SuperAdmin'
    );
END;
GO

-- 3. SEED MAHASISWA (User)
IF NOT EXISTS (SELECT 1 FROM Mahasiswa WHERE nim = 'M0521088')
BEGIN
    INSERT INTO Mahasiswa (nim, nama, email, password, prodi, tahun_masuk, judul, role)
    VALUES (
        'M0521088',
        'Rafa Khrisna Daneshwara',
        'rafa@student.uns.ac.id',
        '$2a$12$QmpDCYI1s8fII6X1ec2iSO6OYhAeh9DStPxYL25fahnemhL1P/MuO',
        'S1 Informatika',
        2021,
        'Rancang Bangun Sistem Informasi Penjadwalan Tugas Akhir Berbasis Clean Architecture',
        'mahasiswa'
    );
END;
GO

-- 4. SEED MAHASISWA KEDUA (M. Sabiq Badrul Munir)
IF NOT EXISTS (SELECT 1 FROM Mahasiswa WHERE nim = 'L0225036')
BEGIN
    INSERT INTO Mahasiswa (nim, nama, email, password, prodi, tahun_masuk, judul, role)
    VALUES (
        'L0225036',
        'M. Sabiq Badrul Munir',
        'sabiq@student.uns.ac.id',
        '$2a$12$QmpDCYI1s8fII6X1ec2iSO6OYhAeh9DStPxYL25fahnemhL1P/MuO',
        'S1 Informatika',
        2025,
        'Otomasi Penjadwalan Sidang Tugas Akhir Menggunakan Algoritma Penjadwalan dan Trigger Database',
        'mahasiswa'
    );
END;
GO
