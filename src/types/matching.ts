export type MatchingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

export interface MatchingRequest {
  id: string
  superviseeId: string
  supervisorId: string
  superviseeName: string
  supervisorName: string
  status: MatchingStatus
  message: string
  createdAt: string
  updatedAt: string
}

export interface CreateMatchingRequestDto {
  supervisorId: string
  message: string
}
