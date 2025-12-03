import React, { useState } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';

interface CustomCalculation {
  id: string;
  name: string;
  formula: string;
  result?: number;
}

interface CustomCalculationsProps {
  data: any[];
  onCalculate: (formula: string) => number;
}

export const CustomCalculations: React.FC<CustomCalculationsProps> = ({ data, onCalculate }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [calculations, setCalculations] = useState<CustomCalculation[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCalc, setNewCalc] = useState({ name: '', formula: '' });

  const handleAdd = () => {
    if (!newCalc.name || !newCalc.formula) return;

    const result = onCalculate(newCalc.formula);
    const calc: CustomCalculation = {
      id: Date.now().toString(),
      name: newCalc.name,
      formula: newCalc.formula,
      result,
    };

    setCalculations([...calculations, calc]);
    setNewCalc({ name: '', formula: '' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setCalculations(calculations.filter((c) => c.id !== id));
  };

  return (
    <div className={`${glassmorphismClass} rounded-xl p-6`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5" style={{ color: colors.accent }} />
          <h3 className={`text-lg font-semibold ${colors.text}`}>Custom Calculations</h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: colors.accent, color: 'white' }}
          aria-label="Add calculation"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 rounded-lg space-y-3" style={{ backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <input
            type="text"
            placeholder="Calculation name"
            value={newCalc.name}
            onChange={(e) => setNewCalc({ ...newCalc, name: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border outline-none text-sm ${
              colors.isDark
                ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <input
            type="text"
            placeholder="Formula (e.g., SUM(column1) / COUNT(column2))"
            value={newCalc.formula}
            onChange={(e) => setNewCalc({ ...newCalc, formula: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border outline-none text-sm ${
              colors.isDark
                ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: colors.accent }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setNewCalc({ name: '', formula: '' });
              }}
              className={`px-4 py-2 rounded-lg font-medium ${colors.textSecondary}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {calculations.length === 0 ? (
          <p className={`text-sm text-center py-4 ${colors.textSecondary}`}>No custom calculations</p>
        ) : (
          calculations.map((calc) => (
            <div
              key={calc.id}
              className={`p-3 rounded-lg flex items-center justify-between ${
                colors.isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <p className={`text-sm font-medium ${colors.text}`}>{calc.name}</p>
                <p className={`text-xs font-mono mt-1 ${colors.textSecondary}`}>{calc.formula}</p>
                {calc.result !== undefined && (
                  <p className={`text-lg font-bold mt-2 ${colors.text}`}>{calc.result.toLocaleString()}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(calc.id)}
                className="p-1.5 rounded hover:bg-white/10"
                aria-label="Delete calculation"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

