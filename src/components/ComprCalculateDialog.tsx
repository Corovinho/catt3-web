import React, { useState } from 'react';
import { Check, X, HelpCircle } from 'lucide-react';

interface ComprCalculateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculate: (data: {
    Tr: number;
    Pr: number;
    omega: number;
  }) => void;
}

export const ComprCalculateDialog: React.FC<ComprCalculateDialogProps> = ({
  isOpen,
  onClose,
  onCalculate,
}) => {
  const [valTr, setValTr] = useState<string>('1.2');
  const [valPr, setValPr] = useState<string>('1.5');
  const [valOmega, setValOmega] = useState<string>('0.00');

  if (!isOpen) return null;

  const handleOK = () => {
    const tr = parseFloat(valTr);
    if (isNaN(tr) || tr <= 0) return alert('Insira uma Temperatura Reduzida válida (Tr > 0).');

    const pr = parseFloat(valPr);
    if (isNaN(pr) || pr <= 0) return alert('Insira uma Pressão Reduzida válida (Pr > 0).');

    const w = parseFloat(valOmega);
    if (isNaN(w)) return alert('Insira um Fator Acêntrico numérico válido (ω).');

    onCalculate({ Tr: tr, Pr: pr, omega: w });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs font-mono">
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-md w-full p-4 shadow-2xl text-slate-900 space-y-4">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2">
          <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
            Compressibilidade Generalizada (CATT3)
          </span>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400">
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Inputs matching CATT3 ComprDialog */}
        <div className="border border-slate-400 bg-white p-3 space-y-3 text-xs">
          <span className="block font-bold text-[11px] border-b border-slate-300 pb-1 uppercase text-slate-700">
            Parâmetros de Entrada Reduzidos
          </span>

          <div className="flex items-center justify-between gap-2">
            <span className="w-48 text-[11px] font-bold text-black">
              Temperatura Reduzida (Tr = T/Tc)
            </span>
            <input
              type="number"
              step="any"
              value={valTr}
              onChange={(e) => setValTr(e.target.value)}
              className="w-24 px-1.5 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="w-48 text-[11px] font-bold text-black">
              Pressão Reduzida (Pr = P/Pc)
            </span>
            <input
              type="number"
              step="any"
              value={valPr}
              onChange={(e) => setValPr(e.target.value)}
              className="w-24 px-1.5 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="w-48 text-[11px] font-bold text-black">
              Fator Acêntrico de Pitzer (ω / W)
            </span>
            <input
              type="number"
              step="any"
              value={valOmega}
              onChange={(e) => setValOmega(e.target.value)}
              className="w-24 px-1.5 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-300">
          <button
            onClick={handleOK}
            className="px-5 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] active:bg-[#c0c0c0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
            <span>OK</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <X className="w-4 h-4 text-rose-700 stroke-[3]" />
            <span>Cancelar</span>
          </button>

          <button
            onClick={() => alert('As tabelas de compressibilidade calculam o fator Z = Z(0) + ω*Z(1) a partir das coordenadas adimensionais de van der Waals / Lee-Kesler.')}
            className="px-4 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <HelpCircle className="w-4 h-4 text-sky-700 stroke-[3]" />
            <span>Ajuda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
