'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Note {
  id: string
  content: string
  bookId: string
  bookTitle: string
  createdAt: string
  updatedAt: string
}

export default function NotesManager() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBook, setSelectedBook] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (session) {
      fetchNotes()
    }
  }, [session])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notes')
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

  const updateNote = async (noteId: string, content: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(prev => (prev || []).map(note => 
          note.id === noteId ? data.note : note
        ))
        setEditingNote(null)
        setEditContent('')
      } else {
        throw new Error('Failed to update note')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      alert('Failed to update note. Please try again.')
    }
  }

  const startEditing = (note: Note) => {
    if (!note || !note.id || !note.content) return
    setEditingNote(note.id)
    setEditContent(note.content)
  }

  const cancelEditing = () => {
    setEditingNote(null)
    setEditContent('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredNotes = (notes || []).filter(note => {
    if (!note) return false
    const matchesSearch = searchTerm === '' || 
      (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (note.bookTitle && note.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesBook = selectedBook === '' || (note.bookTitle && note.bookTitle === selectedBook)
    
    return matchesSearch && matchesBook
  })

  const uniqueBooks = Array.from(new Set((notes || []).map(note => note && note.bookTitle).filter(Boolean))).sort()

  if (!session) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Notes</h2>
        <div className="text-sm text-gray-500">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search notes by content or book title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-4">
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All books</option>
            {uniqueBooks.map((bookTitle) => (
              <option key={bookTitle} value={bookTitle}>
                {bookTitle}
              </option>
            ))}
          </select>
          
          {(searchTerm || selectedBook) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedBook('')
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedBook ? 'No matching notes' : 'No notes yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedBook 
              ? 'Try adjusting your search or filter criteria'
              : 'Start taking notes while reading book summaries!'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <button
                  onClick={() => router.push(`/book/${note.bookId}`)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm focus:outline-none focus:underline"
                >
                  {note.bookTitle || 'Unknown Book'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditing(note)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Edit note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600 focus:outline-none"
                    aria-label="Delete note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {editingNote === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateNote(note.id, editContent)}
                      disabled={!editContent.trim()}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-800 whitespace-pre-wrap mb-3">
                    {note.content || 'No content'}
                  </p>
                  <div className="text-xs text-gray-500">
                    {note.createdAt !== note.updatedAt ? 'Updated' : 'Created'} {formatDate(note.updatedAt)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}