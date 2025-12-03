/**
 * Format numbers for display in charts and UI
 * - >= 1,000,000: Shows as "M" (e.g., 1M, 2M, 19M, 39M)
 * - >= 500,000: Shows as "k" (e.g., 500k, 600k, 999k)
 * - < 500,000: Shows full number
 */
export function formatChartNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '0';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (isNaN(num)) return '0';
  
  // >= 1 billion: Show as "B" (e.g., 1B, 2B, 2.2B)
  if (Math.abs(num) >= 1000000000) {
    const billions = num / 1000000000;
    // If it's a whole number, show without decimals (e.g., "1B", "2B", "4B")
    if (billions % 1 === 0) {
      return `${billions}B`;
    }
    // Otherwise show 1 decimal place (e.g., "1.2B", "2.2B", "4.5B")
    return `${billions.toFixed(1)}B`;
  }
  
  // >= 1 million: Show as "M" (e.g., 1M, 2M, 19M)
  if (Math.abs(num) >= 1000000) {
    const millions = num / 1000000;
    // If it's a whole number, show without decimals (e.g., "1M", "2M", "19M")
    if (millions % 1 === 0) {
      return `${millions}M`;
    }
    // Otherwise show 1 decimal place (e.g., "1.2M", "19.5M")
    return `${millions.toFixed(1)}M`;
  }
  
  // >= 500,000: Show as "k" (e.g., 500k, 600k)
  if (Math.abs(num) >= 500000) {
    const thousands = num / 1000;
    // If it's a whole number, show without decimals (e.g., "500k", "600k")
    if (thousands % 1 === 0) {
      return `${thousands}k`;
    }
    // Otherwise show 1 decimal place (e.g., "500.5k", "999.9k")
    return `${thousands.toFixed(1)}k`;
  }
  
  // < 500,000: Show full number with commas
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Format numbers for currency display in charts
 * Same logic as formatChartNumber but with $ prefix
 */
export function formatChartCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '$0';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value;
  
  if (isNaN(num)) return '$0';
  
  // >= 1 billion: Show as "$XB" or "$X.XB" (e.g., $1B, $2B, $2.2B)
  if (Math.abs(num) >= 1000000000) {
    const billions = num / 1000000000;
    if (billions % 1 === 0) {
      return `$${billions}B`;
    }
    return `$${billions.toFixed(1)}B`;
  }
  
  // >= 1 million: Show as "$XM" or "$X.XM" (e.g., $1M, $2M, $19M)
  if (Math.abs(num) >= 1000000) {
    const millions = num / 1000000;
    if (millions % 1 === 0) {
      return `$${millions}M`;
    }
    return `$${millions.toFixed(1)}M`;
  }
  
  // >= 500,000: Show as "$Xk" or "$X.Xk" (e.g., $500k, $600k)
  if (Math.abs(num) >= 500000) {
    const thousands = num / 1000;
    if (thousands % 1 === 0) {
      return `$${thousands}k`;
    }
    return `$${thousands.toFixed(1)}k`;
  }
  
  // < 500,000: Show full number with $ and commas
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/**
 * Format Y-axis tick values for charts
 */
export function formatYAxisTick(value: number): string {
  return formatChartNumber(value);
}

/**
 * Format tooltip values for charts
 * Compatible with Recharts Tooltip formatter signature
 */
export function formatTooltipValue(value: number, name?: string | number): string {
  const nameStr = typeof name === 'string' ? name : (name !== undefined ? String(name) : '');
  if (nameStr.toLowerCase().includes('sales') || nameStr.toLowerCase().includes('revenue') || 
      nameStr.toLowerCase().includes('profit') || nameStr.toLowerCase().includes('total') ||
      nameStr.toLowerCase().includes('amount') || nameStr.toLowerCase().includes('cost')) {
    return formatChartCurrency(value);
  }
  return formatChartNumber(value);
}

