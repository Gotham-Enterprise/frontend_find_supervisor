import axios from 'axios'

interface BackendErrorBody {
  success?: boolean
  error?: string | { message?: string; code?: string }
  message?: string
  field?: string
}

function humanize(raw: string): string {
  const lower = raw.toLowerCase()

  if (lower.includes('email already exists')) {
    return 'That email address is already registered. Please use a different email or log in.'
  }
  if (lower.includes('invalid contact number')) {
    return 'The phone number you entered is not valid. Please enter a valid phone number.'
  }
  if (lower.includes('license file is required')) {
    return 'A license document is required. Please upload your license or verification doc.'
  }
  if (lower.includes('profile photo is required')) {
    return 'A profile photo is required. Please upload a photo.'
  }
  if (lower.includes('license file size exceeds')) {
    return 'Your license file is too large. Please upload a file under 5 MB.'
  }
  if (lower.includes('profile photo file size exceeds')) {
    return 'Your profile photo is too large. Please upload a file under 5 MB.'
  }
  if (lower.includes('invalid license file type')) {
    return 'Invalid license file type. Please upload a PDF, JPG, PNG, DOC, or DOCX file.'
  }
  if (lower.includes('invalid profile photo file type')) {
    return 'Invalid profile photo type. Please upload a JPG or PNG file.'
  }
  if (lower.includes('address') || lower.includes('location')) {
    return 'The city and state could not be verified. Please check your location details.'
  }

  // Return backend message as-is — most are already readable
  return raw
}

export function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Unable to reach the server. Please check your connection and try again.'
    }

    const data = error.response.data as BackendErrorBody | undefined

    if (data) {
      if (typeof data.error === 'string') {
        return humanize(data.error)
      }
      if (typeof data.error === 'object' && typeof data.error?.message === 'string') {
        return humanize(data.error.message)
      }
      if (typeof data.message === 'string') {
        return humanize(data.message)
      }
    }
  }

  return "We couldn't complete your request. Please try again."
}
