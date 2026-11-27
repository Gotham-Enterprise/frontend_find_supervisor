import { describe, expect, it } from 'vitest'

import {
  DEFAULT_ATTACHMENT_LIMITS,
  formatFileSize,
  pickAttachmentFiles,
} from '@/lib/utils/activity-attachments'

const file = (name: string, type = 'image/png', size = 2048) =>
  new File([new Uint8Array(size)], name, { type })

describe('pickAttachmentFiles', () => {
  it('adds valid files up to the room left', () => {
    const { files, problem } = pickAttachmentFiles(
      [],
      [file('a.png'), file('b.pdf', 'application/pdf')],
      5,
    )
    expect(files.map((f) => f.name)).toEqual(['a.png', 'b.pdf'])
    expect(problem).toBeNull()
  })

  it('keeps what was already picked and appends', () => {
    const { files } = pickAttachmentFiles([file('a.png')], [file('b.png')], 5)
    expect(files.map((f) => f.name)).toEqual(['a.png', 'b.png'])
  })

  it('stops at the entry limit and says so', () => {
    const { files, problem } = pickAttachmentFiles(
      [],
      Array.from({ length: 6 }, (_, i) => file(`f${i}.png`)),
      5,
    )
    expect(files).toHaveLength(5)
    expect(problem).toBe('You can attach up to 5 files to an entry.')
  })

  it('counts files the entry already keeps (room smaller than the limit)', () => {
    const { files, problem } = pickAttachmentFiles([], [file('a.png'), file('b.png')], 1)
    expect(files.map((f) => f.name)).toEqual(['a.png'])
    expect(problem).toBe('This entry has room for 1 more file.')
  })

  it('adds nothing when there is no room', () => {
    const { files, problem } = pickAttachmentFiles([], [file('a.png')], 0)
    expect(files).toHaveLength(0)
    expect(problem).toBe('This entry has room for 0 more files.')
  })

  it('skips the wrong type but keeps going', () => {
    const { files, problem } = pickAttachmentFiles(
      [],
      [file('notes.docx', 'application/msword'), file('ok.png')],
      5,
    )
    expect(files.map((f) => f.name)).toEqual(['ok.png'])
    expect(problem).toBe("notes.docx isn't a JPG, PNG or PDF.")
  })

  it('skips files over the size limit', () => {
    const big = file(
      'big.pdf',
      'application/pdf',
      DEFAULT_ATTACHMENT_LIMITS.maxMb * 1024 * 1024 + 1,
    )
    const { files, problem } = pickAttachmentFiles([], [big], 5)
    expect(files).toHaveLength(0)
    expect(problem).toBe('big.pdf is over 10 MB.')
  })

  it('accepts a file of exactly the size limit', () => {
    const exact = file(
      'exact.pdf',
      'application/pdf',
      DEFAULT_ATTACHMENT_LIMITS.maxMb * 1024 * 1024,
    )
    expect(pickAttachmentFiles([], [exact], 5).files).toHaveLength(1)
  })

  it('ignores the same file picked twice', () => {
    const { files, problem } = pickAttachmentFiles([file('a.png')], [file('a.png')], 5)
    expect(files).toHaveLength(1)
    expect(problem).toBeNull()
  })

  it('uses the limits it is given', () => {
    const { files, problem } = pickAttachmentFiles([], [file('a.png'), file('b.png')], 1, {
      perEntry: 1,
      maxMb: 1,
      types: ['image/png'],
    })
    expect(files).toHaveLength(1)
    expect(problem).toBe('You can attach up to 1 file to an entry.')
  })
})

describe('formatFileSize', () => {
  it('shows KB under a megabyte, never 0 KB', () => {
    expect(formatFileSize(10)).toBe('1 KB')
    expect(formatFileSize(480 * 1024)).toBe('480 KB')
  })

  it('shows MB with one decimal from a megabyte up', () => {
    expect(formatFileSize(1.25 * 1024 * 1024)).toBe('1.3 MB')
  })
})
