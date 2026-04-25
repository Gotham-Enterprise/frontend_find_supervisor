'use client'

import { UserAvatar, type UserAvatarSize } from '@/components/ui/UserAvatar'

export interface ProfileAvatarProps {
  fullName: string | null | undefined
  photoUrl: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
}

/** Maps legacy sizes to UserAvatar scale (old md=48px → lg, old lg=64px → xl). */
const LEGACY_TO_USER: Record<NonNullable<ProfileAvatarProps['size']>, UserAvatarSize> = {
  sm: 'sm',
  md: 'lg',
  lg: 'xl',
}

/** Profile photo with initials fallback when URL is missing or fails to load. */
export function ProfileAvatar({ fullName, photoUrl, size = 'md' }: ProfileAvatarProps) {
  return <UserAvatar src={photoUrl} name={fullName} size={LEGACY_TO_USER[size]} />
}
