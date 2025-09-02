export interface ProjectLink {
  label: string
  url: string
  kind?: 'live' | 'repo' | 'docs' | 'other'
}

export interface ProjectTag {
  label: string
  color?: string // tailwind color utility suffix e.g. 'blue-500'
}

export interface Project {
  id: string // unique id (uuid or short id)
  slug: string // used in route
  name: string
  tagline?: string
  description: string
  highlights?: string[]
  responsibilities?: string[] // what YOU did
  stack: string[]
  tags?: ProjectTag[]
  links?: ProjectLink[]
  featured?: boolean
  /**
   * visibility: public = shown on main list, prototype = optional (hidden by default), hidden = not listed
   */
  visibility?: 'public' | 'prototype' | 'hidden'
  startDate?: string // ISO
  endDate?: string | 'present'
  heroImage?: string // path in /public or remote
  gallery?: string[]
  order?: number // manual ordering (lower first)
  /** Optional supporting documents (PDFs, diagrams) placed under /public/docs */
  documents?: { label: string; path: string }[]
  /** Whether a lightweight in-app demo preview is available */
  supportsDemo?: boolean
}

export type ProjectSummary = Pick<Project, 'id' | 'slug' | 'name' | 'tagline' | 'stack' | 'tags' | 'featured' | 'heroImage' | 'order'>
