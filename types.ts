
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface PrescriptionEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

export interface DosageSchedule {
  time: string;
  medicine: string;
  instruction: string;
}

export interface AnalysisResult {
  id: string;
  userId: string;
  timestamp: number;
  title: string;
  summary: string;
  prescriptionData?: PrescriptionEntry[];
  dosageSchedule?: DosageSchedule[];
  labAnalysis?: {
    testName: string;
    value: string;
    referenceRange: string;
    status: 'Normal' | 'High' | 'Low';
    simplifiedExplanation: string;
  }[];
  medicationInfo?: {
    brandName: string;
    activeIngredient: string;
    uses: string[];
    warnings: string[];
    alternatives: string[];
  };
  symptomInsights?: {
    possibilities: string[];
    advice: string[];
    urgency: string;
  };
  details: {
    category: string;
    items: string[];
  }[];
  warnings: string[];
  recommendations: string[];
  disclaimer: string;
}

export type ScanType = 'prescription' | 'medicine' | 'symptoms' | 'interactions' | 'labs' | 'firstaid';
export type Language = 'ar' | 'en';

export interface Translations {
  heroTitle: string;
  heroSub: string;
  tabPrescription: string;
  tabMedicine: string;
  tabSymptoms: string;
  tabInteractions: string;
  uploadTitle: string;
  uploadSub: string;
  uploadBtn: string;
  symptomsPlaceholder: string;
  analyzeBtn: string;
  loading: string;
  featurePrivacy: string;
  featureSpeed: string;
  featureReports: string;
  footerAbout: string;
  footerLegal: string;
  footerRights: string;
  newAnalysis: string;
  print: string;
  warningHeader: string;
  recHeader: string;
  login: string;
  logout: string;
  signup: string;
  email: string;
  password: string;
  googleLogin: string;
  noAccount: string;
  hasAccount: string;
  authRequired: string;
  exportPdf: string;
  preview: string;
}
