import { useEffect, useState } from 'react';
import { BookFormModal } from '../components/BookFormModal';
import { BookDetailsModal } from '../components/BookDetailsModal';
import { useAuth } from '../auth/AuthContext';

export function AdminDashboard() {
  const { user, API_BASE_URL, authFetch } = useAuth();

  const [books, setBooks] = useState([]);
  const [detailsBook, setDetailsBook] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const loadBooks = async () => {
    const res = await fetch(`${API_BASE_URL}/api/books`);
    const data = await res.json();
    setBooks(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadBooks().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  const removeBook = async (id) => {
    const res = await authFetch(`${API_BASE_URL}/api/books/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete book');
    setBooks((prev) => prev.filter((b) => b._id !== id));
  };

  const saveBook = async (bookData, bookId) => {
    const isEdit = !!bookId;
    const url = isEdit ? `${API_BASE_URL}/api/books/${bookId}` : `${API_BASE_URL}/api/books`;

    const response = await authFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });

    const text = await response.text();
    const data = text ? (() => {
      try {
        return JSON.parse(text);
      } catch {
        return {};
      }
    })() : {};

    if (!response.ok) {
      const msg =
        data.error ||
        (response.status === 413 ? 'Cover image is too large. Try a smaller image.' : isEdit ? 'Failed to update book' : 'Failed to add book');
      throw new Error(msg);
    }

    if (isEdit) {
      setBooks((prev) => prev.map((b) => (b._id === bookId ? data : b)));
      setEditingBook(null);
      setDetailsBook(null);
    } else {
      setBooks((prev) => [data, ...prev]);
      setAddModalOpen(false);
    }
  };

  const openEdit = (book) => {
    setDetailsBook(null);
    setEditingBook(book);
    setAddModalOpen(false);
  };

  const isAdmin = user?.role === 'admin';
  if (!isAdmin) {
    return (
      <section className="catalog-section">
        <div className="catalog-section-intro">
          <h2 className="catalog-heading">Access denied</h2>
          <p className="catalog-intro">Admins only.</p>
        </div>
      </section>
    );
  }

  return (
    <div className="home-page">
      <section className="catalog-section" aria-label="Admin dashboard">
        <div className="catalog-section-intro">
          <h2 className="catalog-heading">Admin Dashboard</h2>
          <p className="catalog-intro">Manage your catalog: add, edit, and delete books.</p>
        </div>

        <div className="catalog-section-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <p className="catalog-intro" style={{ margin: 0 }}>
            Total books: <span style={{ fontWeight: 700 }}>{books.length}</span>
          </p>
          <button type="button" className="btn btn-primary" onClick={() => { setEditingBook(null); setAddModalOpen(true); }}>
            Add book
          </button>
        </div>

        <section aria-label="Book management" style={{ marginTop: '1rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Cover</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Author</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Published</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Pages</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '1.25rem 0.5rem', color: 'var(--color-text-muted)' }}>
                      No books in the catalog yet.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book._id}>
                      <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>
                        {book.cover ? (
                          <img
                            src={book.cover}
                            alt={`Cover: ${book.title}`}
                            style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--glass-border-subtle)' }}
                          />
                        ) : (
                          <div style={{ width: 44, height: 60, borderRadius: 6, border: '1px solid var(--glass-border-subtle)', background: 'var(--cover-placeholder)' }} />
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>
                        <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }} onClick={() => setDetailsBook(book)}>
                          {book.title || 'Untitled'}
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>
                        {book.author || 'Unknown author'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>
                        {book.date ? new Date(book.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>
                        {book.pageCount != null ? book.pageCount : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--glass-border-subtle)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }} onClick={() => openEdit(book)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.75rem' }}
                            onClick={async () => {
                              try {
                                await removeBook(book._id);
                              } catch (e) {
                                alert(e.message || 'Failed to delete');
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <BookDetailsModal
        book={detailsBook}
        open={!!detailsBook}
        onClose={() => setDetailsBook(null)}
        onEdit={openEdit}
      />

      <BookFormModal
        open={addModalOpen || !!editingBook}
        onClose={() => {
          setAddModalOpen(false);
          setEditingBook(null);
        }}
        onSave={saveBook}
        book={editingBook}
      />
    </div>
  );
}

