import React, { useState, useEffect } from 'react';
import { X, Check, HelpCircle, Compass, Layers, Keyboard, WifiOff } from 'lucide-react';

interface QuickHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type HelpTab = 'steps' | 'modes' | 'shortcuts';

export const QuickHelpDialog: React.FC<QuickHelpDialogProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<HelpTab>('steps');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs font-mono select-none">
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-2xl w-full p-4 sm:p-5 shadow-2xl text-slate-900 space-y-3 max-h-[92vh] flex flex-col">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-700 stroke-[2.5]" />
            <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
              Guia Rápido de Uso — CATT-Web
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-300 border border-slate-400 cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Tabs Switcher */}
        <div className="grid grid-cols-3 bg-slate-200 border border-slate-400 p-0.5 text-[11px] font-mono shrink-0">
          <button
            onClick={() => setActiveTab('steps')}
            className={`py-1.5 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'steps'
                ? 'bg-black text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-slate-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>1. Passo a Passo</span>
          </button>

          <button
            onClick={() => setActiveTab('modes')}
            className={`py-1.5 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'modes'
                ? 'bg-black text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>2. Qual Modo Usar?</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`py-1.5 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'shortcuts'
                ? 'bg-black text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-slate-300'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 shrink-0" />
            <span>3. Atalhos &amp; Offline</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="border border-slate-400 bg-white p-3.5 sm:p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
          {activeTab === 'steps' && (
            <div className="space-y-2.5">
              <div className="flex gap-3 p-2.5 bg-slate-50 border border-slate-300">
                <div className="w-6 h-6 bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 uppercase text-[11px]">
                    Escolha a Substância e o Sistema de Unidades
                  </h4>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Na barra inferior (ou no botão <strong>Tabelas / Substâncias</strong>), selecione entre{' '}
                    <em>Água, 20 Refrigerantes, 11 Criogênicos, Ar (Tabela A-17), 12 Gases Ideais, Compressibilidade (Z)</em> ou{' '}
                    <em>Psicrometria</em>. No topo direito, defina as unidades (<strong>SI MPa</strong>, <strong>SI kPa</strong>,{' '}
                    <strong>SI Molar</strong> ou <strong>Britânico</strong>).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-2.5 bg-slate-50 border border-slate-300">
                <div className="w-6 h-6 bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 uppercase text-[11px]">
                    Calcule o Estado Termodinâmico (Botão &ldquo;Calcular&rdquo; ou Tecla F2)
                  </h4>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Clique em <strong>Calcular</strong> (ou pressione <strong>F2</strong>), escolha o par de propriedades conhecidas à esquerda (ex.:{' '}
                    <strong>T e P</strong>, <strong>P e h</strong>, <strong>P e s</strong> ou <strong>T e x</strong>), digite os valores à direita e pressione{' '}
                    <strong>OK (Enter)</strong>. O ponto aparece numerado no gráfico e na planilha.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-2.5 bg-slate-50 border border-slate-300">
                <div className="w-6 h-6 bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 uppercase text-[11px]">
                    Trace Processos 1 &rarr; 2 e Obtenha Trabalho (w) e Calor (q) (Tecla F4)
                  </h4>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Após calcular o Estado 1, clique em <strong>Processo</strong> (ou <strong>F4</strong>), escolha um dos{' '}
                    <strong>9 processos clássicos</strong> (<em>Isotérmico, Isobárico, Isocórico, Isentrópico, Politrópico, Estrangulamento h=cte...</em>) e informe a propriedade final (<strong>P₂, T₂, v₂, h₂ ou s₂</strong>). O aplicativo calcula o Estado 2, desenha a curva{' '}
                    <strong>1 &rarr; 2</strong> e exibe <strong>w</strong> e <strong>q</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-2.5 bg-slate-50 border border-slate-300">
                <div className="w-6 h-6 bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 uppercase text-[11px]">
                    Explore os Diagramas (T-s / P-v) e Exporte para Excel (CSV)
                  </h4>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Alterne entre os diagramas <strong>T-s</strong> e <strong>P-v</strong> para visualizar os estados dentro ou fora do domo de saturação. Na tabela inferior (ou aba <strong>Estados</strong>), você pode <strong>Copiar</strong> os dados ou clicar em{' '}
                    <strong>Exportar CSV</strong> para abrir no Excel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modes' && (
            <div className="space-y-2.5">
              <div className="p-2.5 bg-slate-50 border border-slate-300">
                <div className="font-bold text-slate-950 uppercase text-[11px] flex items-center justify-between">
                  <span>Modo &ldquo;Propriedades Gerais&rdquo; (Geral)</span>
                  <span className="text-[10px] bg-black text-white px-1.5 py-0.2">Mais Usado</span>
                </div>
                <p className="text-[11px] text-slate-700 mt-1">
                  Use quando o enunciado fornece <strong>2 propriedades quaisquer</strong> (ex.: <strong>P e T</strong>, <strong>P e h</strong>, <strong>P e s</strong>, <strong>T e v</strong>, <strong>P e x</strong>). O CATT-Web descobre automaticamente se o fluido está como{' '}
                  <em>Líquido Comprimido</em>, <em>Mistura Saturada</em> (calculando o título <strong>x</strong>) ou <em>Vapor Superaquecido</em>.
                </p>
                <p className="text-[10px] text-slate-600 mt-1 border-t border-slate-200 pt-1">
                  <strong>Exemplo de Aula (Turbina/Compressor Isentrópico):</strong> Calcule o Estado 1, anote a entropia <strong>s₁</strong>, abra{' '}
                  <em>Propriedades Gerais</em>, selecione <strong>P &amp; S</strong> e digite <strong>P₂</strong> e <strong>s₂ = s₁</strong> (ou use direto o botão <strong>Processo &rarr; Isentrópico</strong>).
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-300">
                <div className="font-bold text-slate-950 uppercase text-[11px]">
                  Modo &ldquo;Saturação&rdquo; (Domo L+V)
                </div>
                <p className="text-[11px] text-slate-700 mt-1">
                  Use quando você sabe que o fluido está <strong>saturado</strong> (no domo de vapor) e quer consultar diretamente a pressão/temperatura de saturação e as propriedades de <strong>líquido saturado (vf, uf, hf, sf)</strong> e{' '}
                  <strong>vapor saturado (vg, ug, hg, sg)</strong> para um título <strong>0 &le; x &le; 1</strong>.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-300">
                <div className="font-bold text-slate-950 uppercase text-[11px]">
                  Tabela de Ar (A-17) e Gases Ideais
                </div>
                <p className="text-[11px] text-slate-700 mt-1">
                  Na aba <strong>Ar (Tabela A-17)</strong>, você pode calcular o estado a partir de <strong>T</strong>, <strong>u</strong>, <strong>h</strong>,{' '}
                  <strong>s°</strong> ou pelas grandezas relativas isentrópicas <strong>Pr</strong> e <strong>vr</strong>. Na aba{' '}
                  <strong>Gases Ideais</strong>, escolha qualquer uma das 12 substâncias e um dos 7 pares de propriedades para obter{' '}
                  <strong>h, u, s, s°, cp, cv e k</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-slate-950 uppercase text-[11px] mb-1.5">
                  Atalhos de Teclado (Computador)
                </h4>
                <div className="border border-slate-300 divide-y divide-slate-200 text-[11px]">
                  <div className="flex justify-between px-3 py-1.5 bg-slate-50">
                    <span className="font-bold">F2</span>
                    <span className="text-slate-700">Abrir janela &ldquo;Calcular&rdquo; da substância ativa</span>
                  </div>
                  <div className="flex justify-between px-3 py-1.5 bg-white">
                    <span className="font-bold">F4</span>
                    <span className="text-slate-700">Abrir assistente de &ldquo;Processo Termodinâmico&rdquo;</span>
                  </div>
                  <div className="flex justify-between px-3 py-1.5 bg-slate-50">
                    <span className="font-bold">F6</span>
                    <span className="text-slate-700">Alternar Sistema de Unidades (SI, kPa, Molar, Britânico)</span>
                  </div>
                  <div className="flex justify-between px-3 py-1.5 bg-white">
                    <span className="font-bold">F1</span>
                    <span className="text-slate-700">Abrir este Guia Rápido de Uso</span>
                  </div>
                  <div className="flex justify-between px-3 py-1.5 bg-slate-50">
                    <span className="font-bold">Enter / Esc</span>
                    <span className="text-slate-700">Confirmar cálculo (OK) / Fechar janela aberta</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-950 uppercase text-[11px]">
                  <WifiOff className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Funciona Sem Internet (Modo Offline / Sala de Aula)</span>
                </div>
                <p className="text-[11px] text-slate-700">
                  Depois de abrir o <strong>CATT-Web</strong> pela primeira vez, todos os cálculos termodinâmicos rodam diretamente no seu aparelho. No celular (Android ou iPhone) ou no computador (Chrome/Edge), use a opção{' '}
                  <strong>&ldquo;Adicionar à tela inicial&rdquo; / &ldquo;Instalar aplicativo&rdquo;</strong> do navegador para instalar o ícone e usar mesmo sem Wi-Fi ou em modo avião.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="flex justify-center pt-1 border-t border-slate-300 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
            <span>Entendi (OK)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
