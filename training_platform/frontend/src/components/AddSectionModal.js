// frontend/src/components/AddSectionModal.js

import React, { useState } from 'react';
import API from '../services/api';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { typeLabels } from '../utils/typeLabels'; // Імпорт мапінгу

const AddSectionModal = ({ show, handleClose, refreshSections }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('directory'); // Значення за замовчуванням
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валідація
    if (!title.trim()) {
      setError('Назва секції обов\'язкова.');
      return;
    }

    try {
      const response = await API.post('/sections', { title, type });
      toast.success('Секцію успішно додано.');
      setTitle('');
      setType('directory');
      setError('');
      handleClose();
      refreshSections();
    } catch (err) {
      console.error('Помилка при додаванні секції:', err);
      setError(err.response?.data?.message || 'Не вдалося додати секцію.');
      toast.error(err.response?.data?.message || 'Не вдалося додати секцію.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Додати нову секцію</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formSectionTitle" className="mb-3">
            <Form.Label>Назва секції</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введіть назву секції"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formSectionType" className="mb-3">
            <Form.Label>Тип секції</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="directory">Довідники</option>
              <option value="video">Відео</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Відміна
            </Button>
            <Button variant="primary" type="submit">
              Додати
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddSectionModal;
