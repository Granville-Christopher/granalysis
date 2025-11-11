export interface FileInsights {
  caption?: string;
  charts?: any;
  preview?: any;
  insights?: {
    // Old fields
    total?: number;
    weekly_estimate?: number;
    average_score?: number;
    top_3?: any[];
    avg?: number;
    min?: number;
    max?: number;
    columns?: string[];
    rows?: number;
    summary?: any;

    // New fields for e-commerce insights
    total_sales?: number;
    total_orders?: number;
    top_product?: string;
    sales_growth?: number;
    text?: string;
    alerts?: string[];
    ai_recommendations?: string[];
    growth_rate?: number;
  };
}

export interface FileMetadata {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  status: string;
}