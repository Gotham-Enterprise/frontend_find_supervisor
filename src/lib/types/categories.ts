/** Aligns with GET /api/categories/occupations (backend_job_finder). */
export interface Occupation {
  id: number
  name: string
  iconUrl?: string
  keyword?: string
  specialty?: { id: number; name: string }[]
  publishedJobCount?: number
}

export interface CategoriesApiResponse<T> {
  success: boolean
  data: T
}
