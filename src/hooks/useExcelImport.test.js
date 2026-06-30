import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import { useExcelImport } from './useExcelImport';
import { invitadosService } from '../services/invitadosService';

vi.mock('../services/invitadosService', () => ({
  invitadosService: {
    downloadTemplate: vi.fn(),
    importExcel: vi.fn(),
  },
}));

/**
 * Crea un archivo .xlsx en memoria para usar en tests.
 * @param {Array<Array<string>>} rows - Filas de datos (sin encabezados)
 * @param {string} sheetName - Nombre de la hoja
 * @param {string[]} headers - Encabezados de columna
 */
function createTestWorkbook(
  rows,
  sheetName = 'Plantilla Invitados',
  headers = ['FullName', 'Phone', 'Email'],
) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const data = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new File([data], 'test.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

describe('useExcelImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Test 1: Estado inicial ---
  it('initial state', () => {
    const { result } = renderHook(() => useExcelImport('evt-001'));

    expect(result.current.step).toBe(1);
    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.result).toBeNull();
  });

  // --- Test 2: Extensión inválida (.csv) ---
  it('handleFileSelect with invalid extension (.csv)', async () => {
    const csvFile = new File(['a,b,c'], 'test.csv', { type: 'text/csv' });
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(csvFile);

    await waitFor(() => {
      expect(result.current.error).toBe('EXTENSION_INVALIDA');
    });
    expect(result.current.file).toBeNull();
    expect(result.current.step).toBe(1);
  });

  // --- Test 3: Archivo > 5 MB ---
  it('handleFileSelect with file > 5 MB', async () => {
    const largeFile = new File(
      [new ArrayBuffer(6 * 1024 * 1024)],
      'test.xlsx',
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    );
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(largeFile);

    await waitFor(() => {
      expect(result.current.error).toBe('TAMANIO_EXCEDIDO');
    });
    expect(result.current.file).toBeNull();
    expect(result.current.step).toBe(1);
  });

  // --- Test 4: Archivo .xlsx válido ---
  it('handleFileSelect with valid .xlsx advances to step 2', async () => {
    const validFile = createTestWorkbook([
      ['Juan Pérez', '555-0101', 'juan@example.com'],
      ['María García', '555-0102', 'maria@example.com'],
    ]);
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(validFile);

    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    expect(result.current.preview).not.toBeNull();
    expect(result.current.preview.validCount).toBe(2);
    expect(result.current.preview.skippedCount).toBe(0);
    expect(result.current.preview.totalRows).toBe(2);
    expect(result.current.preview.fileName).toBe('test.xlsx');
    expect(result.current.error).toBeNull();
  });

  // --- Test 5: Hoja faltante ---
  it('handleFileSelect with Excel missing required sheet', async () => {
    const wrongSheetFile = createTestWorkbook(
      [['Juan Pérez', '555-0101', 'juan@example.com']],
      'WrongSheet', // nombre de hoja incorrecto
    );
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(wrongSheetFile);

    await waitFor(() => {
      expect(result.current.error).toBe('HOJA_FALTANTE');
    });
    expect(result.current.file).toBeNull();
    expect(result.current.step).toBe(1);
  });

  // --- Test 6: Columnas faltantes ---
  it('handleFileSelect with Excel missing required columns', async () => {
    const missingColsFile = createTestWorkbook(
      [['Juan Pérez', '555-0101', 'juan@example.com']],
      'Plantilla Invitados',
      ['Name', 'Phone', 'Email'], // 'FullName' en vez de 'Name'
    );
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(missingColsFile);

    await waitFor(() => {
      expect(result.current.error).toBe('COLUMNAS_FALTANTES');
    });
    expect(result.current.file).toBeNull();
  });

  // --- Test 7: Más de 150 filas ---
  it('handleFileSelect with Excel > 150 rows', async () => {
    const manyRows = Array.from({ length: 151 }, (_, i) => [
      `Guest ${i + 1}`,
      `555-${String(i).padStart(4, '0')}`,
      `guest${i + 1}@test.com`,
    ]);
    const oversizedFile = createTestWorkbook(manyRows);

    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(oversizedFile);

    await waitFor(() => {
      expect(result.current.error).toBe('MAX_FILAS_EXCEDIDO');
    });
    expect(result.current.file).toBeNull();
  });

  // --- Test 8: Todas las filas con FullName vacío ---
  it('handleFileSelect with all rows having empty FullName', async () => {
    const emptyNameFile = createTestWorkbook([
      ['', '555-0101', 'juan@example.com'],
      ['', '555-0102', 'maria@example.com'],
    ]);
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(emptyNameFile);

    await waitFor(() => {
      expect(result.current.error).toBe('SIN_FILAS_VALIDAS');
    });
    expect(result.current.file).toBeNull();
  });

  // --- Test 9: Import exitoso ---
  it('handleImport success', async () => {
    invitadosService.importExcel.mockResolvedValue({
      Message: 'Importación exitosa',
      TotalImported: 5,
    });

    const validFile = createTestWorkbook([
      ['Juan Pérez', '555-0101', 'juan@example.com'],
      ['María García', '555-0102', 'maria@example.com'],
    ]);
    const { result } = renderHook(() => useExcelImport('evt-001'));

    // Primero seleccionar archivo para tener file en estado
    await result.current.handleFileSelect(validFile);
    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    // Ejecutar import
    await result.current.handleImport();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(invitadosService.importExcel).toHaveBeenCalledWith(
      'evt-001',
      validFile,
    );
    expect(result.current.step).toBe(3);
    expect(result.current.result).toEqual({
      message: 'Importación exitosa',
      totalImported: 5,
    });
    expect(result.current.error).toBeNull();
  });

  // --- Test 10: Import error 400 con mensaje del backend ---
  it('handleImport error 400 with backend message', async () => {
    const backendError = new Error('Bad request');
    backendError.response = {
      status: 400,
      data: { details: 'El archivo contiene datos inválidos' },
    };
    invitadosService.importExcel.mockRejectedValue(backendError);

    const validFile = createTestWorkbook([
      ['Juan Pérez', '555-0101', 'juan@example.com'],
    ]);
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(validFile);
    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    // handleImport rechaza el error, debemos atraparlo
    await expect(result.current.handleImport()).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('El archivo contiene datos inválidos');
  });

  // --- Test 11: Import error 401 ---
  it('handleImport error 401 sets SESION_EXPIRADA', async () => {
    const authError = new Error('Unauthorized');
    authError.response = { status: 401 };
    invitadosService.importExcel.mockRejectedValue(authError);

    const validFile = createTestWorkbook([
      ['Juan Pérez', '555-0101', 'juan@example.com'],
    ]);
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(validFile);
    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    await expect(result.current.handleImport()).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('SESION_EXPIRADA');
  });

  // --- Test 12: Import error 404 ---
  it('handleImport error 404 sets EVENTO_NO_ENCONTRADO', async () => {
    const notFoundError = new Error('Not found');
    notFoundError.response = { status: 404 };
    invitadosService.importExcel.mockRejectedValue(notFoundError);

    const validFile = createTestWorkbook([
      ['Juan Pérez', '555-0101', 'juan@example.com'],
    ]);
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(validFile);
    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    await expect(result.current.handleImport()).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('EVENTO_NO_ENCONTRADO');
  });

  // --- Test 13: Import network error ---
  it('handleImport network error sets ERROR_RED', async () => {
    const networkError = new Error('Network error');
    // Sin response (error de red genuino)
    invitadosService.importExcel.mockRejectedValue(networkError);

    const validFile = createTestWorkbook([
      ['Juan Pérez', '555-0101', 'juan@example.com'],
    ]);
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleFileSelect(validFile);
    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    await expect(result.current.handleImport()).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('ERROR_RED');
  });

  // --- Test 14: Reset ---
  it('reset returns all state to initial values', async () => {
    const validFile = createTestWorkbook([
      ['Juan Pérez', '555-0101', 'juan@example.com'],
    ]);
    const { result } = renderHook(() => useExcelImport('evt-001'));

    // Avanzar un paso
    await result.current.handleFileSelect(validFile);
    await waitFor(() => {
      expect(result.current.step).toBe(2);
    });

    // Resetear
    result.current.reset();

    await waitFor(() => {
      expect(result.current.step).toBe(1);
    });
    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.result).toBeNull();
  });

  // --- Test 15: Download template ---
  it('handleDownloadTemplate calls invitadosService.downloadTemplate with eventId', async () => {
    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleDownloadTemplate();

    expect(invitadosService.downloadTemplate).toHaveBeenCalledWith('evt-001');
  });

  // --- Test 16: Download template error 401 ---
  it('handleDownloadTemplate error 401 sets SESION_EXPIRADA', async () => {
    const authError = new Error('Unauthorized');
    authError.response = { status: 401 };
    invitadosService.downloadTemplate.mockRejectedValue(authError);

    const { result } = renderHook(() => useExcelImport('evt-001'));

    await result.current.handleDownloadTemplate();

    await waitFor(() => {
      expect(result.current.error).toBe('SESION_EXPIRADA');
    });
  });
});
