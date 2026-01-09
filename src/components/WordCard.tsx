import { useState } from 'react'
import type { Word } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { pronounceWord } from '../lib/utils'
import { CATEGORIES, getCategory } from '../lib/constants'

interface WordCardProps {
  word: Word
  onUpdate: () => void
}

export function WordCard({ word, onUpdate }: WordCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoria, setCategoria] = useState(word.categoria || '')
  const [notas, setNotas] = useState(word.notas || '')
  const [loadingImage, setLoadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState(word.imagen_url || null)

  const colorKey = (word.color || 'indigo') as string
  const categoryData = getCategory(word.categoria)

  const handleSave = async () => {
    const categoryColor = CATEGORIES.find(c => c.value === categoria)?.color || null

    await supabase.from('palabras').update({
      categoria: categoria || null,
      color: categoryColor,
      notas: notas || null,
      imagen_url: imageUrl,
    }).eq('id', word.id)

    setIsModalOpen(false)
    onUpdate()
  }

  const handleCloseModal = () => {
    // Reset valores al cerrar sin guardar
    setCategoria(word.categoria || '')
    setNotas(word.notas || '')
    setImageUrl(word.imagen_url || null)
    setIsModalOpen(false)
  }

  // Cerrar modal con tecla ESC
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCloseModal()
    }
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta palabra?')) {
      await supabase.from('palabras').delete().eq('id', word.id)
      onUpdate()
    }
  }

  const handleChangeImage = async () => {
    setLoadingImage(true)
    try {
      const imageRes = await fetch('/.netlify/functions/get-image', {
        method: 'POST',
        body: JSON.stringify({ query: word.palabra_original }),
      })

      if (imageRes.ok) {
        const data = await imageRes.json()
        setImageUrl(data.imageUrl)
      }
    } catch (err) {
      console.error('Error fetching image:', err)
    } finally {
      setLoadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
  }

  return (
    <article className={`word-card ${colorKey}`}>
      <div className="word-color-bar"></div>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={word.palabra_original}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="relative h-full flex flex-col">
        {/* Top row: Category + Ver más button */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          {/* Category badge as title - Top Left */}
          {categoryData ? (
            <span className={`category-badge ${colorKey}`}>
              <span>{categoryData.emoji}</span>
              <span>{categoryData.label}</span>
            </span>
          ) : (
            <div></div>
          )}

          {/* Edit Button - Top Right */}
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              border: '1.5px solid var(--neutral-300)',
              background: 'white',
              color: 'var(--neutral-600)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '20px',
              fontWeight: 'bold',
              lineHeight: '1'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--indigo-50)'
              e.currentTarget.style.borderColor = 'var(--indigo-500)'
              e.currentTarget.style.color = 'var(--indigo-600)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = 'var(--neutral-300)'
              e.currentTarget.style.color = 'var(--neutral-600)'
            }}
            aria-label="Ver más"
            title="Ver más"
          >
            +
          </button>
        </div>

        {/* Word pair - Center */}
        <div className="flex-1 flex items-center px-3">
          <div className="flex flex-wrap items-baseline gap-4 w-full">
            <div className="flex items-baseline gap-1" style={{ position: 'relative' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 900,
                color: 'var(--neutral-900)',
                lineHeight: 1,
                letterSpacing: '-0.01em'
              }}>{word.palabra_original}</span>
              <button
                onClick={() => pronounceWord(word.palabra_original, 'en-US')}
                style={{
                  width: '18px',
                  height: '18px',
                  border: '1px solid var(--neutral-200)',
                  background: 'white',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  flexShrink: 0,
                  verticalAlign: 'super',
                  transform: 'translateY(-8px)',
                  marginLeft: '2px'
                }}
                aria-label="Pronunciar palabra en inglés"
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--neutral-50)'
                  e.currentTarget.style.borderColor = 'var(--indigo-500)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.borderColor = 'var(--neutral-200)'
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--indigo-600)',
                  color: 'white',
                  fontSize: '0.375rem',
                  fontWeight: 700,
                  padding: '1px 2px',
                  borderRadius: '2px',
                  letterSpacing: '0.02em'
                }}>EN</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '9px', height: '9px', color: 'var(--neutral-600)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>

            <span style={{
              color: 'var(--neutral-400)',
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: '0 0.25rem'
            }}>:</span>

            <div className="flex items-baseline gap-1" style={{ position: 'relative' }}>
              <span style={{
                fontSize: '1.125rem',
                fontWeight: 500,
                color: 'var(--neutral-700)'
              }}>{word.traduccion}</span>
              <button
                onClick={() => pronounceWord(word.traduccion, 'es-ES')}
                style={{
                  width: '18px',
                  height: '18px',
                  border: '1px solid var(--neutral-200)',
                  background: 'white',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  flexShrink: 0,
                  verticalAlign: 'super',
                  transform: 'translateY(-6px)',
                  marginLeft: '2px'
                }}
                aria-label="Pronunciar traducción en español"
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--neutral-50)'
                  e.currentTarget.style.borderColor = 'var(--emerald-500)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.borderColor = 'var(--neutral-200)'
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--emerald-600)',
                  color: 'white',
                  fontSize: '0.375rem',
                  fontWeight: 700,
                  padding: '1px 2px',
                  borderRadius: '2px',
                  letterSpacing: '0.02em'
                }}>ES</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '9px', height: '9px', color: 'var(--neutral-600)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: Delete button */}
        <div className="flex justify-end px-3 pb-2 pt-1">
          <button
            onClick={handleDelete}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              border: '1.5px solid var(--neutral-300)',
              background: 'white',
              color: 'var(--neutral-600)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '20px',
              fontWeight: 'bold',
              lineHeight: '1'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--red-50)'
              e.currentTarget.style.borderColor = 'var(--red-500)'
              e.currentTarget.style.color = 'var(--red-600)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = 'var(--neutral-300)'
              e.currentTarget.style.color = 'var(--neutral-600)'
            }}
            aria-label="Eliminar"
            title="Eliminar"
          >
            ×
          </button>
        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={handleCloseModal}
            onKeyDown={handleKeyDown}
          >
            {/* Modal Content */}
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--neutral-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: 'white',
                zIndex: 10,
                borderRadius: '16px 16px 0 0'
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--neutral-900)'
                }}>
                  Editar: "{word.palabra_original}"
                </h3>
                <button
                  onClick={handleCloseModal}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    border: '1px solid var(--neutral-300)',
                    background: 'white',
                    color: 'var(--neutral-600)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem' }}>
                {/* Image section */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--neutral-600)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Imagen
                  </label>
                  {imageUrl ? (
                    <div>
                      <img
                        src={imageUrl}
                        alt={word.palabra_original}
                        style={{
                          width: '100%',
                          height: '12rem',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          marginBottom: '0.75rem'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={handleChangeImage}
                          disabled={loadingImage}
                          style={{
                            flex: 1,
                            padding: '0.5rem 1rem',
                            background: 'white',
                            border: '2px solid var(--neutral-200)',
                            color: 'var(--neutral-700)',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {loadingImage ? 'Buscando...' : 'Cambiar imagen'}
                        </button>
                        <button
                          onClick={handleRemoveImage}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'white',
                            border: '2px solid var(--neutral-200)',
                            color: 'var(--neutral-700)',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: 'var(--neutral-50)',
                      border: '2px dashed var(--neutral-300)',
                      borderRadius: '12px',
                      padding: '2rem',
                      textAlign: 'center'
                    }}>
                      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto', color: 'var(--neutral-400)', marginBottom: '0.75rem' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p style={{ color: 'var(--neutral-600)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Sin imagen</p>
                      <button
                        onClick={handleChangeImage}
                        disabled={loadingImage}
                        style={{
                          padding: '0.5rem 1.5rem',
                          background: 'white',
                          border: '2px solid var(--neutral-200)',
                          color: 'var(--neutral-700)',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {loadingImage ? 'Buscando...' : 'Añadir imagen'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--neutral-600)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: '12px',
                      background: 'white'
                    }}
                  >
                    <option value="">Sin categoría</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--neutral-600)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Notas
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Añade contexto, ejemplos o recordatorios..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: '12px',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--neutral-200)',
                display: 'flex',
                gap: '0.5rem',
                position: 'sticky',
                bottom: 0,
                background: 'white',
                borderRadius: '0 0 16px 16px'
              }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: '0.625rem 1rem',
                    background: 'linear-gradient(to right, var(--indigo-600), var(--violet-600))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Guardar cambios
                </button>
                <button
                  onClick={handleCloseModal}
                  style={{
                    padding: '0.625rem 1rem',
                    background: 'white',
                    border: '2px solid var(--neutral-200)',
                    color: 'var(--neutral-700)',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </article>
  )
}
