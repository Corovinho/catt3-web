import React, { useEffect } from 'react';
import { X, Check, Award, BookOpen } from 'lucide-react';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
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
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-lg w-full p-4 sm:p-5 shadow-2xl text-slate-900 space-y-4">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-black" />
            <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
              Sobre o EntroLab — Tabelas Termodinâmicas
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400 cursor-pointer">
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Content Body */}
        <div className="border border-slate-400 bg-white p-4 space-y-3 text-xs">
          <div className="flex items-start gap-3 border-b border-slate-200 pb-3">
            <div className="w-12 h-12 bg-black text-white flex flex-col items-center justify-center font-bold text-[10px] leading-tight tracking-tight border border-slate-900 shrink-0">
              <span>ENTRO</span>
              <span>LAB</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-950 uppercase">
                EntroLab — Tabelas Termodinâmicas Computacionais
              </h4>
              <p className="text-[11px] text-slate-600 font-bold">
                Professor Luiz Mariano Pereira — Padrão Didático e Científico para Engenharia
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Desenvolvido com fidelidade ao padrão clássico CATT3 (Computer-Aided Thermodynamic Tables 3, Sonntag &amp; Borgnakke).
              </p>
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-black uppercase text-[10px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Fundamentos e Formulações Termodinâmicas:</span>
            </div>

            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
              <li>
                <strong>Água e Vapor:</strong> Padrão oficial <em>IAPWS-IF97</em> (International Association for the Properties of Water and Steam), adotado pela ASME e centrais termelétricas modernas.
              </li>
              <li>
                <strong>Refrigerantes e Criogênicos:</strong> Catálogo completo com 20 refrigerantes e 11 criogênicos com curvas de saturação e propriedades de estado líquido/vapor.
              </li>
              <li>
                <strong>Tabela de Ar:</strong> Calores específicos variáveis dependentes da temperatura (Moran &amp; Shapiro / Çengel &amp; Boles A-17/A-22).
              </li>
              <li>
                <strong>Gases Ideais:</strong> 12 espécies moleculares calculadas via polinômios termodinâmicos <em>NIST Shomate</em>.
              </li>
              <li>
                <strong>Compressibilidade:</strong> Equações generalizadas de <em>Lee-Kesler / Pitzer</em> com fator acêntrico ω.
              </li>
              <li>
                <strong>Psicrometria:</strong> Equações psicrométricas do <em>ASHRAE Handbook of Fundamentals</em>.
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-300 p-2 text-[10px] text-slate-600 font-mono">
            <strong>Compatibilidade:</strong> 100% dos recursos do padrão CATT3 (modos de cálculo completos, conversor de 5 sistemas de unidades, traçador de 9 processos termodinâmicos, exportação CSV e gráficos interativos T-s e P-v).
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-1 border-t border-slate-300">
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
            <span>OK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
