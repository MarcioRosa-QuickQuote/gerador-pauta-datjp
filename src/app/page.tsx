'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import UploadArea from '@/components/UploadArea';
import BotaoVerificarSGP from '@/components/BotaoVerificarSGP';
import BotaoGerarPauta from '@/components/BotaoGerarPauta';
import PautaNotification from '@/components/PautaNotification';
import DeleteSection from '@/components/DeleteSection';
import NaoGeradosList from '@/components/NaoGeradosList';
import Notification, { showNotification } from '@/components/Notification';
import ProgressBar from '@/components/ProgressBar';
import Tutorial from '@/components/Tutorial';
import Sobre from '@/components/Sobre';
import type { NaoGerado, ArquivoInfo, Portaria, ResultadoIniciar, ResultadoLote } from '@/types';

export default function Home() {
  // State
  const [uploadProgress, setUploadProgress] = useState('');
  const [pautaSGPPronta, setPautaSGPPronta] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [gerando, setGerando] = useState(false);
  const [naoGerados, setNaoGerados] = useState<NaoGerado[]>([]);
  const [naoGeradosVisible, setNaoGeradosVisible] = useState(false);

  // Check SGP pauta on mount and every 5 seconds
  const checkPautaSGP = useCallback(async () => {
    try {
      const res = await fetch('/api/pauta-sgp/pronta');
      const data = await res.json();
      setPautaSGPPronta(data.pronta);
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    checkPautaSGP();
    const interval = setInterval(checkPautaSGP, 5000);
    return () => clearInterval(interval);
  }, [checkPautaSGP]);

  // Upload handler
  async function handleUpload(files: FileList) {
    let uploadedCount = 0;
    const naoEnviados: NaoGerado[] = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: file.name, content: base64 }),
        });

        const data = await res.json();

        if (data.status === 'duplicate') {
          naoEnviados.push({ nome: file.name, motivo: 'Arquivo com este nome já existe na pasta.' });
        } else {
          uploadedCount++;
        }

        const processed = uploadedCount + naoEnviados.length;
        const pct = Math.round((processed / total) * 100);
        setUploadProgress(`Progresso de upload: ${pct}% (${processed}/${total})`);

        if (processed === total) {
          setNaoGerados(naoEnviados);
          if (naoEnviados.length === 0) {
            showNotification('Égua, já foi! Upload concluído com sucesso!');
          }
        }
      } catch (err: any) {
        showNotification(`Erro no upload: ${err.message}`, 5000);
      }
    }
  }

  // Gerar Pauta
  async function gerarPauta() {
    if (gerando) return;
    setGerando(true);
    setProgressVisible(true);
    setProgressValue(0);
    setProgressText('<span style=\'color: #777;\'>Iniciando...</span>');

    try {
      // 1. Iniciar
      const initRes = await fetch('/api/gerar-pauta/iniciar', { method: 'POST' });
      if (!initRes.ok) throw new Error('Erro ao iniciar geração');
      const inicio: ResultadoIniciar = await initRes.json();

      const todasPortarias: Portaria[] = [];
      const todosNaoGerados: NaoGerado[] = [];

      const fileInfos = inicio.fileInfos;
      const total = fileInfos.length + (inicio.sgpFileId ? 1 : 0);
      let processados = 0;

      // 2. Processar lotes (5 por vez)
      const LOTE_SIZE = 5;
      for (let i = 0; i < fileInfos.length; i += LOTE_SIZE) {
        const lote = fileInfos.slice(i, i + LOTE_SIZE);
        const batchStart = processados + 1;
        const batchEnd = Math.min(processados + lote.length, total);

        const pct = total > 0 ? Math.round((processados / total) * 90) : 0;
        setProgressValue(pct);
        setProgressText(
          `<span style='color: #777;'>Processando ${batchStart} \u2013 ${batchEnd} de ${total}...</span>`
        );

        const loteRes = await fetch('/api/gerar-pauta/processar-lote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arquivos: lote }),
        });

        if (!loteRes.ok) throw new Error('Erro ao processar lote');
        const loteData: ResultadoLote = await loteRes.json();

        todasPortarias.push(...loteData.portarias);
        todosNaoGerados.push(...loteData.naoGerados);
        processados += lote.length;
      }

      // 3. Processar SGP
      if (inicio.sgpFileId) {
        setProgressText("<span style='color: #777;'>Processando pauta SGP...</span>");
        const sgpRes = await fetch('/api/gerar-pauta/processar-sgp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sgpFileId: inicio.sgpFileId }),
        });

        if (!sgpRes.ok) throw new Error('Erro ao processar SGP');
        const sgpData: ResultadoLote = await sgpRes.json();

        todasPortarias.push(...sgpData.portarias);
        todosNaoGerados.push(...sgpData.naoGerados);
      }

      // 4. Finalizar
      setProgressValue(95);
      setProgressText("<span style='color: #777;'>Escrevendo pauta...</span>");

      const finRes = await fetch('/api/gerar-pauta/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId: inicio.docId,
          portarias: todasPortarias,
          naoGerados: todosNaoGerados,
        }),
      });

      if (!finRes.ok) throw new Error('Erro ao finalizar pauta');
      const finData = await finRes.json();

      setProgressValue(100);
      setTimeout(() => setProgressVisible(false), 1000);

      if (finData.url) {
        window.open(finData.url, '_blank');
        showNotification('Pauta gerada com sucesso!');
      } else {
        showNotification('Erro ao escrever a pauta!', 30000);
      }

      setNaoGerados(finData.naoGerados || []);
    } catch (err: any) {
      setProgressVisible(false);
      showNotification(`Erro ao gerar pauta: ${err.message}`, 30000);
    } finally {
      setGerando(false);
    }
  }

  // Delete operations
  async function apagarPortarias() {
    try {
      const listRes = await fetch('/api/arquivos/listar');
      const fileList: { id: string }[] = await listRes.json();

      if (!fileList || fileList.length === 0) {
        showNotification('Nenhum arquivo para apagar.');
        return;
      }

      let deleted = 0;
      for (const f of fileList) {
        await fetch(`/api/arquivos/apagar?id=${f.id}`, { method: 'DELETE' });
        deleted++;
        const pct = Math.round((deleted / fileList.length) * 100);
        setProgressVisible(true);
        setProgressValue(pct);
        setProgressText(`${pct}%`);
      }

      setTimeout(() => setProgressVisible(false), 1000);
      showNotification('Portarias inseridas apagadas com sucesso!');
    } catch (err: any) {
      showNotification(`Erro: ${err.message}`, 5000);
    }
  }

  async function apagarPautas() {
    try {
      const listRes = await fetch('/api/pautas-submetidas/listar');
      const fileList: { id: string }[] = await listRes.json();

      if (!fileList || fileList.length === 0) {
        showNotification('Nenhuma pauta do dia para apagar.');
        return;
      }

      let deleted = 0;
      for (const f of fileList) {
        await fetch(`/api/pautas-submetidas/apagar?id=${f.id}`, { method: 'DELETE' });
        deleted++;
        const pct = Math.round((deleted / fileList.length) * 100);
        setProgressVisible(true);
        setProgressValue(pct);
        setProgressText(`${pct}%`);
      }

      setTimeout(() => setProgressVisible(false), 1000);
      showNotification('Pautas do dia apagadas com sucesso!');
    } catch (err: any) {
      showNotification(`Erro: ${err.message}`, 5000);
    }
  }

  async function apagarTudo() {
    try {
      await fetch('/api/apagar-tudo', { method: 'DELETE' });
      showNotification('Todos os arquivos foram apagados com sucesso!');
    } catch (err: any) {
      showNotification(`Erro: ${err.message}`, 5000);
    }
  }

  return (
    <>
      <Tutorial />
      <Header />

      <UploadArea onUpload={handleUpload} uploadProgress={uploadProgress} />

      <ProgressBar visible={progressVisible} value={progressValue} text={progressText} />

      <BotaoVerificarSGP onCheck={checkPautaSGP} />

      <BotaoGerarPauta onGerar={gerarPauta} disabled={gerando} />

      <PautaNotification visible={pautaSGPPronta} />

      <DeleteSection
        onApagarPortarias={apagarPortarias}
        onApagarPautas={apagarPautas}
        onApagarTudo={apagarTudo}
      />

      <NaoGeradosList
        naoGerados={naoGerados}
        visible={naoGeradosVisible}
        onToggle={() => setNaoGeradosVisible(!naoGeradosVisible)}
      />

      <Notification />

      <Sobre />
    </>
  );
}
