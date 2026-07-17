export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  password?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn: string;
  stock: number;
  total_stock: number;
  category: string;
  cover_url: string;
  is_ebook: boolean;
  ebook_content: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Loan {
  id: string;
  user_id: string;
  book_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  fine_amount: number;
  status: "borrowed" | "returned" | "overdue";
  created_at: string;
  updated_at: string;
  
  // Enriched fields from API
  user_name?: string;
  user_email?: string;
  student_name?: string;
  book_title?: string;
  book_author?: string;
  book_isbn?: string;
  book_cover?: string;

  // Relations
  user?: User;
  book?: Book;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string;
}

export interface SystemSettings {
  fine_rate: number;
  max_loan_days: number;
}

export interface AnalyticsSummary {
  totalBooks: number;
  totalPhysicalStock: number;
  totalEbooks: number;
  totalMembers: number;
  totalBorrowedCount: number;
  overdueCount: number;
  totalFinesCollected: number;
  totalPendingFines: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
}

export interface PopularBook {
  title: string;
  author: string;
  count: number;
}

export interface CirculationTrend {
  date: string;
  borrowed: number;
  returned: number;
}

export interface AnalyticsReport {
  summary: AnalyticsSummary;
  categoryDistribution: CategoryDistribution[];
  popularBooks: PopularBook[];
  circulationTrend: CirculationTrend[];
}
