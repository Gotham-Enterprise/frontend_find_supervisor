import type { SelectOption } from '@/lib/api/options'

/** The 24 ABMS member boards. Boards outside the list go through "Other". */
export const ABMS_CERTIFYING_BOARDS = [
  'American Board of Allergy and Immunology',
  'American Board of Anesthesiology',
  'American Board of Colon and Rectal Surgery',
  'American Board of Dermatology',
  'American Board of Emergency Medicine',
  'American Board of Family Medicine',
  'American Board of Internal Medicine',
  'American Board of Medical Genetics and Genomics',
  'American Board of Neurological Surgery',
  'American Board of Nuclear Medicine',
  'American Board of Obstetrics and Gynecology',
  'American Board of Ophthalmology',
  'American Board of Orthopaedic Surgery',
  'American Board of Otolaryngology – Head and Neck Surgery',
  'American Board of Pathology',
  'American Board of Pediatrics',
  'American Board of Physical Medicine and Rehabilitation',
  'American Board of Plastic Surgery',
  'American Board of Preventive Medicine',
  'American Board of Psychiatry and Neurology',
  'American Board of Radiology',
  'American Board of Surgery',
  'American Board of Thoracic Surgery',
  'American Board of Urology',
] as const

/** Selecting Other reveals a free-text input (e.g. AOA/osteopathic boards). */
export const OTHER_CERTIFYING_BOARD_VALUE = 'Other'

export const certifyingBoardSelectOptions: SelectOption[] = [
  ...ABMS_CERTIFYING_BOARDS.map((board) => ({ label: board, value: board })),
  { label: 'Other', value: OTHER_CERTIFYING_BOARD_VALUE },
]
