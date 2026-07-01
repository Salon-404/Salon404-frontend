import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { invitadosService } from '../services/invitadosService';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_ROWS = 150;
const REQUIRED_SHEET = 'Plantilla Invitados';
const REQUIRED_HEADERS = ['FullName', 'Phone', 'Email'];

/**
 * Hook para el flujo de carga masiva de invitados desde Excel.
 * @param {string} eventId - ID del evento
 * @returns {object} estado y acciones del wizard de importación
 */
export function useExcelImport(eventId) {
  const [step, setStep] = useState(1); // 1=Subir, 2=Previsualizar, 3=Enviar
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // { rows, validCount, skippedCount, totalRows, fileName }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { message, totalImported }

  /** Valida el archivo antes de parsear (extensión, tamaño). */
  const validateFile = useCallback((file) => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return { valid: false, error: 'EXTENSION_INVALIDA' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'TAMANIO_EXCEDIDO' };
    }
    return { valid: true };
  }, []);

  /** Parsea el Excel y devuelve las filas con metadata. */
  const parseExcel = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          if (!workbook.SheetNames.includes(REQUIRED_SHEET)) {
            reject(new Error('HOJA_FALTANTE'));
            return;
          }

          const sheet = workbook.Sheets[REQUIRED_SHEET];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          if (rows.length === 0) {
            reject(new Error('ARCHIVO_VACIO'));
            return;
          }

          const headers = rows[0].map((h) => String(h || '').trim());
          const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
          if (missingHeaders.length > 0) {
            reject(new Error('COLUMNAS_FALTANTES'));
            return;
          }

          const idxFullName = headers.indexOf('FullName');
          const idxPhone = headers.indexOf('Phone');
          const idxEmail = headers.indexOf('Email');

          const dataRows = rows.slice(1).filter((row) =>
            row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== '')
          );

          if (dataRows.length > MAX_ROWS) {
            reject(new Error('MAX_FILAS_EXCEDIDO'));
            return;
          }

          const parsed = dataRows.map((row, index) => ({
            rowNumber: index + 2,
            fullName: String(row[idxFullName] || '').trim(),
            phone: String(row[idxPhone] || '').trim(),
            email: String(row[idxEmail] || '').trim(),
            isValid: String(row[idxFullName] || '').trim().length > 0,
          }));

          const validRows = parsed.filter((r) => r.isValid);
          if (validRows.length === 0) {
            reject(new Error('SIN_FILAS_VALIDAS'));
            return;
          }

          resolve({
            rows: parsed,
            validCount: validRows.length,
            skippedCount: parsed.length - validRows.length,
            totalRows: parsed.length,
            fileName: file.name,
          });
        } catch (err) {
          reject(new Error('ERROR_LECTURA'));
        }
      };
      reader.onerror = () => reject(new Error('ERROR_LECTURA'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  /** Maneja la selección de archivo: valida, parsea y avanza al paso 2. */
  const handleFileSelect = useCallback(async (selectedFile) => {
    setError(null);
    setResult(null);

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      setFile(null);
      return;
    }

    setFile(selectedFile);

    try {
      const parsed = await parseExcel(selectedFile);
      setPreview(parsed);
      setStep(2);
    } catch (err) {
      setError(err.message);
      setFile(null);
    }
  }, [validateFile, parseExcel]);

  /** Envía el archivo al backend. */
  const handleImport = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStep(3);

    try {
      const data = await invitadosService.importExcel(eventId, file);
      setResult({ message: data.Message, totalImported: data.TotalImported });
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const status = err.response?.status;
      const backendMsg = err.response?.data?.details || err.response?.data?.message || err.response?.data?.title;

      if (status === 401) {
        setError('SESION_EXPIRADA');
      } else if (status === 404) {
        setError('EVENTO_NO_ENCONTRADO');
      } else if (backendMsg) {
        setError(backendMsg);
      } else {
        setError('ERROR_RED');
      }
      throw err;
    }
  }, [file, eventId]);

  /** Descarga la plantilla Excel desde el backend. */
  const handleDownloadTemplate = useCallback(async () => {
    try {
      await invitadosService.downloadTemplate(eventId);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('SESION_EXPIRADA');
      } else {
        setError('ERROR_DESCARGA_PLANTILLA');
      }
    }
  }, [eventId]);

  /** Resetea todo el estado al inicio. */
  const reset = useCallback(() => {
    setStep(1);
    setFile(null);
    setPreview(null);
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    step,
    setStep,
    file,
    preview,
    loading,
    error,
    result,
    handleFileSelect,
    handleImport,
    handleDownloadTemplate,
    reset,
  };
}
