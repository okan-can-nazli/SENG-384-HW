import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({ full_name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);
    setErrors({});

    try {
      const res = await fetch(`${API}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error === 'EMAIL_ALREADY_EXISTS' ? 'Email already exists.' : 'Something went wrong.' });
      } else {
        setMessage({ type: 'success', text: 'Person registered successfully!' });
        setForm({ full_name: '', email: '' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not connect to server.' });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Person Management System</h1>
        <h2 style={styles.subtitle}>Register New Person</h2>
        {message && (
          <div style={{ ...styles.alert, background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              style={{ ...styles.input, borderColor: errors.full_name ? 'red' : '#ccc' }}
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              placeholder="Okan Can NAZLI"
            />
            {errors.full_name && <span style={styles.error}>{errors.full_name}</span>}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={{ ...styles.input, borderColor: errors.email ? 'red' : '#ccc' }}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="okan@example.com"
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>
          <button style={styles.btn} type="submit">Register</button>
        </form>
        <button style={{ ...styles.btn, background: '#6c757d', marginTop: '10px' }} onClick={() => onNavigate('list')}>
          View All People →
        </button>
      </div>
    </div>
  );
}

function PeopleListPage({ onNavigate }) {
  const [people, setPeople] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '' });
  const [message, setMessage] = useState(null);

  const fetchPeople = async () => {
    const res = await fetch(`${API}/people`);
    const data = await res.json();
    setPeople(data);
  };

  useEffect(() => { fetchPeople(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this person?')) return;
    await fetch(`${API}/people/${id}`, { method: 'DELETE' });
    fetchPeople();
  };

  const startEdit = (person) => {
    setEditing(person.id);
    setEditForm({ full_name: person.full_name, email: person.email });
  };

  const handleUpdate = async (id) => {
    const res = await fetch(`${API}/people/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error === 'EMAIL_ALREADY_EXISTS' ? 'Email already exists.' : 'Update failed.' });
    } else {
      setEditing(null);
      setMessage({ type: 'success', text: 'Updated successfully!' });
      fetchPeople();
    }
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: '800px' }}>
        <h1 style={styles.title}>Person Management System</h1>
        <h2 style={styles.subtitle}>All People</h2>
        {message && (
          <div style={{ ...styles.alert, background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
            {message.text}
          </div>
        )}
        <button style={{ ...styles.btn, background: '#6c757d', marginBottom: '20px' }} onClick={() => onNavigate('register')}>
          ← Register New Person
        </button>
        {people.length === 0 ? (
          <p>No people registered yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {people.map(p => (
                <tr key={p.id}>
                  {editing === p.id ? (
                    <>
                      <td style={styles.td}>{p.id}</td>
                      <td style={styles.td}><input style={styles.input} value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} /></td>
                      <td style={styles.td}><input style={styles.input} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></td>
                      <td style={styles.td}>
                        <button style={{ ...styles.btn, background: '#28a745', marginRight: '5px' }} onClick={() => handleUpdate(p.id)}>Save</button>
                        <button style={{ ...styles.btn, background: '#6c757d' }} onClick={() => setEditing(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={styles.td}>{p.id}</td>
                      <td style={styles.td}>{p.full_name}</td>
                      <td style={styles.td}>{p.email}</td>
                      <td style={styles.td}>
                        <button style={{ ...styles.btn, background: '#ffc107', color: '#000', marginRight: '5px' }} onClick={() => startEdit(p)}>Edit</button>
                        <button style={{ ...styles.btn, background: '#dc3545' }} onClick={() => handleDelete(p.id)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', fontFamily: 'Arial' },
  card: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' },
  title: { margin: '0 0 4px 0', fontSize: '1.4rem', color: '#333' },
  subtitle: { margin: '0 0 1.5rem 0', fontSize: '1rem', color: '#666', fontWeight: 'normal' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.9rem' },
  input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  error: { color: 'red', fontSize: '0.8rem' },
  btn: { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', width: '100%' },
  alert: { padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#007bff', color: 'white', padding: '10px', textAlign: 'left' },
  td: { padding: '10px', borderBottom: '1px solid #ddd' },
};

export default function App() {
  const [page, setPage] = useState('register');
  return page === 'register' ? <RegisterPage onNavigate={setPage} /> : <PeopleListPage onNavigate={setPage} />;
}
