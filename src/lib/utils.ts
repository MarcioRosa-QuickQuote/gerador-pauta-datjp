import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import type { Portaria } from '@/types';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = process.env.TZ || 'America/Belem';

/**
 * Nome do arquivo da pauta baseado na data atual.
 * Ex: "Pauta de Portarias 09-05-2026"
 */
export function gerarNomePauta(data?: Date): string {
  const hoje = data || new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();
  return `Pauta de Portarias ${dia}-${mes}-${ano}`;
}

/**
 * Data atual no fuso local, formato YYYY-MM-DD
 */
export function dataHoje(): string {
  return dayjs().tz(TZ).format('YYYY-MM-DD');
}

/**
 * Verifica se uma data de criação é de hoje
 */
export function isHoje(data: Date | string): boolean {
  return dayjs(data).tz(TZ).format('YYYY-MM-DD') === dataHoje();
}

/**
 * Determina o MIME type baseado na extensão
 */
export function detectarMimeType(nomeArquivo: string): string {
  const ext = nomeArquivo.toLowerCase().split('.').pop();
  if (ext === 'doc') return 'application/msword';
  return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

/**
 * Deduplica lista de portarias e marca duplicadas
 */
export function deduplicarPortarias(portarias: Portaria[]): Portaria[] {
  const vistos = new Set<string>();
  return portarias.map((p) => {
    if (vistos.has(p.numeroOriginal)) {
      return { ...p, duplicada: true };
    }
    vistos.add(p.numeroOriginal);
    return { ...p, duplicada: false };
  });
}

/**
 * Ordena portarias por ano depois por número
 */
export function ordenarPortarias(portarias: Portaria[]): Portaria[] {
  return [...portarias].sort((a, b) => {
    if (a.numeroOriginal === 'Nº desconhecido') return 1;
    if (b.numeroOriginal === 'Nº desconhecido') return -1;

    const partesA = a.numeroOriginal.split('/');
    const partesB = b.numeroOriginal.split('/');

    const numA = parseInt(partesA[0], 10);
    const yearA = parseInt(partesA[1], 10);
    const numB = parseInt(partesB[0], 10);
    const yearB = parseInt(partesB[1], 10);

    if (yearA !== yearB) return yearA - yearB;
    return numA - numB;
  });
}
