'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

interface NoteTakingProps {
  bookId: string
  bookTitle: string
}

export default function NoteTaking({ bookId, bookTitle }: NoteTakingProps) {
  const { data: session } = useSession()
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session && bookId) {
      fetchNotes()
    }
  }, [session, bookId])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notes?bookId=${bookId}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      } else {
        setNotes([])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  const saveNote = async () => {
    if (!newNote.trim() || !session) return

    try {
      setSaving(true)
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newNote.trim(),
          bookId,
          bookTitle,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(prev => [data.note, ...prev])
        setNewNote('')
      } else {
        throw new Error('Failed to save note')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotes(prev => (prev || []).filter(note => note.id !== noteId))
      } else {
        throw new Error('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!session) {
    return null
  }

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label={isExpanded ? 'Close notes' : 'Open notes'}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
          />
        </svg>
      </button>

      {/* Notes Panel */}
      {isExpanded && (
        <div className="absolute right-16 top-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
            <p className="text-sm text-gray-600 truncate">{bookTitle}</p>
          </div>

          {/* New Note Input */}
          <div className="p-4 border-b border-gray-200">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  saveNote()
                }
              }}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                Cmd/Ctrl + Enter to save
              </span>
              <button
                onClick={saveNote}
                disabled={!newNote.trim() || saving}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : notes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No notes yet</p>
                <p className="text-xs mt-1">Start taking notes while you read!</p>
              </div>
            ) : (
              <div className="p-2">
                {(notes || []).filter(note => note && note.id).map((note) => (
                  <div
                    key={note.id}
                    className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200 group"
                  >
                    <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">
                      {note.content || 'No content'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {formatDate(note.createdAt)}
                      </span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity focus:opacity-100 focus:outline-none"
                        aria-label="Delete note"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}