import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormState } from "./useFormState.js";
import { registerRules } from "../lib/validators.js";
import { authApi } from "../api/auth.js";

/**
 * Logika bersama untuk halaman registrasi mahasiswa & dosen yang terhubung ke Backend API.
 */
export function useRegisterForm({ role, initialValues }) {
  const navigate = useNavigate();
  const { values, field, validateAll } = useFormState({ initialValues, rules: registerRules });

  const [agree, setAgreeValue] = useState(false);
  const [agreeError, setAgreeError] = useState("");
  const [status, setStatus] = useState({ loading: false, type: "", text: "" });

  const redirectTimer = useRef();
  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const setAgree = (checked) => {
    setAgreeValue(checked);
    if (checked) setAgreeError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: false, type: "", text: "" });

    let firstInvalid = validateAll();
    if (!agree) {
      setAgreeError("Anda harus menyetujui pernyataan integritas akademik untuk melanjutkan.");
      firstInvalid ??= "agree";
    }
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setStatus({ loading: true, type: "", text: "" });

    try {
      if (role === "mahasiswa") {
        await authApi.registerMahasiswa(values);
      } else if (role === "dosen") {
        await authApi.registerDosen(values);
      }

      setStatus({ 
        loading: false, 
        type: "success", 
        text: "Pendaftaran berhasil! Akun Anda telah tersimpan di basis data. Mengalihkan ke halaman login..." 
      });

      redirectTimer.current = setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      const errMsg = error.message || "Pendaftaran gagal. Periksa kembali kelengkapan data Anda.";
      setStatus({ loading: false, type: "error", text: errMsg });
    }
  };

  return { field, agree, setAgree, agreeError, status, handleSubmit };
}
