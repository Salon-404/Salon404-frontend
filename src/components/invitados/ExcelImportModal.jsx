import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useExcelImport } from '../../hooks/useExcelImport';

const ERROR_MESSAGES = {
  EXTENSION_INVALIDA:
    'Solo se aceptan archivos .xlsx. Descargá la plantilla oficial para asegurar compatibilidad.',
  TAMANIO_EXCEDIDO:
    'El archivo supera el límite de 5 MB. Reducí la cantidad de invitados.',
  HOJA_FALTANTE:
    "El archivo no contiene la hoja 'Plantilla Invitados'. Usá la plantilla oficial.",
  ARCHIVO_VACIO: 'El archivo no contiene filas. Descargá la plantilla oficial y completá los datos.',
  COLUMNAS_FALTANTES:
    'Faltan columnas requeridas (FullName, Phone, Email). Usá la plantilla oficial.',
  MAX_FILAS_EXCEDIDO:
    'El archivo contiene más de 150 filas. El máximo es 150 invitados por carga.',
  SIN_FILAS_VALIDAS:
    'No se encontraron invitados con nombre. Todas las filas tienen FullName vacío.',
  ERROR_LECTURA:
    'No se pudo leer el archivo. Verificá que sea un .xlsx válido.',
  SESION_EXPIRADA:
    'Tu sesión expiró. Redirigiendo al login...',
  EVENTO_NO_ENCONTRADO:
    'El evento no existe o fue eliminado.',
  ERROR_RED:
    'No se pudo conectar con el servidor. Revisá tu conexión.',
  ERROR_DESCARGA_PLANTILLA:
    'No se pudo descargar la plantilla. Intentá de nuevo.',
};

function getErrorMessage(code) {
  return ERROR_MESSAGES[code] || code;
}

function PasoStepper({ numero, actual, children }) {
  const isActive = actual >= numero;
  const isCurrent = actual === numero;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
          isActive
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-slate-200 text-slate-500'
        } ${isCurrent ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}`}
      >
        {numero}
      </div>
      <span
        className={`mt-1.5 text-xs font-medium ${
          isCurrent ? 'text-indigo-700' : isActive ? 'text-slate-700' : 'text-slate-400'
        }`}
      >
        {children}
      </span>
    </div>
  );
}

export default function ExcelImportModal({ eventId, onClose, onSuccess }) {
  const {
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
  } = useExcelImport(eventId);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);

  // Redirect a /login si la sesión expiró
  useEffect(() => {
    if (error === 'SESION_EXPIRADA') {
      navigate('/login');
    }
  }, [error, navigate]);

  // Show Swal.fire for import errors during sending step (AC-09, AC-11, AC-12)
  useEffect(() => {
    if (error && step === 3 && !loading) {
      if (error === 'SESION_EXPIRADA') return;

      const errorMessage = getErrorMessage(error);
      Swal.fire({
        icon: 'error',
        title: 'Error en la importación',
        text: errorMessage,
        confirmButtonColor: '#185FA5',
      });
    }
  }, [error, step, loading]);

  // Éxito: mostrar estado por 1 segundo, luego cerrar
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        onSuccess?.(result);
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
      e.target.value = '';
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect],
  );

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const previewRows = preview?.rows ?? [];
  const displayedRows = showAllRows ? previewRows : previewRows.slice(0, 5);
  const hasMoreRows = previewRows.length > 5;

  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleDropZoneClick();
        }}
        onClick={handleDropZoneClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
        }`}
      >
        <div className="text-4xl text-slate-400 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
        <p className="text-sm text-slate-600 font-medium mb-1">
          Arrastrá tu archivo .xlsx aquí o hacé clic para seleccionar
        </p>
        <p className="text-xs text-slate-400">Solo archivos .xlsx</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileInputChange}
          className="hidden"
          data-testid="file-input"
        />
      </div>

      {/* Descargar plantilla */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2 transition-colors"
        >
          Descargar plantilla oficial
        </button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-slate-600 space-y-1">
        <p className="font-medium text-slate-700 mb-1">Requisitos del archivo:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Formato <strong>.xlsx</strong></li>
          <li>Tamaño máximo: <strong>5 MB</strong></li>
          <li>Hoja: <strong>Plantilla Invitados</strong></li>
          <li>Columnas requeridas: <strong>FullName, Phone, Email</strong></li>
          <li>Máximo <strong>150 invitados</strong> por carga</li>
        </ul>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
          {getErrorMessage(error)}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!file}
          onClick={() => setStep(2)}
          className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="btn-siguiente"
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      {/* File name */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <span className="font-medium">{preview?.fileName}</span>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {preview?.validCount} filas válidas
        </span>
        {preview?.skippedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-200">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {preview?.skippedCount} filas omitidas (sin nombre)
          </span>
        )}
      </div>

      {/* Preview table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">FullName</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRows.map((row) => (
                <tr
                  key={row.rowNumber}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    !row.isValid ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 text-slate-400 text-xs">
                    {row.rowNumber}
                  </td>
                  <td
                    className={`px-4 py-2.5 font-medium ${
                      !row.isValid
                        ? 'text-slate-400 line-through'
                        : 'text-slate-800'
                    }`}
                  >
                    {row.fullName || '(sin nombre)'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{row.phone || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">{row.email || '—'}</td>
                  <td className="px-4 py-2.5">
                    {row.isValid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Válida
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full border border-slate-200">
                        Omitida
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMoreRows && (
          <button
            type="button"
            onClick={() => setShowAllRows(!showAllRows)}
            className="w-full text-center py-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-slate-50 transition-colors border-t border-slate-100"
          >
            {showAllRows
              ? 'Mostrar menos'
              : `Ver las ${previewRows.length - 5} filas restantes`}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
          {getErrorMessage(error)}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={() => { handleImport().catch(() => {}); }}
          disabled={loading}
          className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
          data-testid="btn-confirmar-enviar"
        >
          Confirmar y enviar
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5 py-4">
      {loading && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <svg
              className="animate-spin h-10 w-10 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <p className="text-slate-700 font-medium">
            Importando {preview?.validCount} invitados...
          </p>
          <p className="text-sm text-slate-400">
            Esto puede tardar unos segundos. No cierres esta ventana.
          </p>
        </div>
      )}

      {!loading && result && (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <svg
              className="h-14 w-14 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-slate-800 font-semibold text-lg">
            ¡Importación completada!
          </p>
          <p className="text-sm text-slate-500">
            Se importaron {result.totalImported} invitados correctamente.
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
            {getErrorMessage(error)}
          </div>
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
      data-testid="modal-overlay"
    >
      <div
        className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        data-testid="modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">
            Importar invitados desde Excel
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 transition-colors"
            aria-label="Cerrar"
            data-testid="btn-cerrar"
          >
            &times;
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-center gap-0">
            <PasoStepper numero={1} actual={step}>
              Subir archivo
            </PasoStepper>
            <div
              className={`w-16 h-0.5 mx-1 mb-5 transition-colors ${
                step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
            <PasoStepper numero={2} actual={step}>
              Previsualizar
            </PasoStepper>
            <div
              className={`w-16 h-0.5 mx-1 mb-5 transition-colors ${
                step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
            <PasoStepper numero={3} actual={step}>
              Enviar
            </PasoStepper>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>,
    document.body,
  );
}
