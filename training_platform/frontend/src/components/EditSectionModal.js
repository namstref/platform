// frontend/src/components/EditSectionModal.js

import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

const EditSectionModal = ({ show, handleClose, section, refreshSections }) => {
  const [title, setTitle] = useState(section.title);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(section.title);
  }, [section]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Назва секції не може бути порожньою.');
      toast.error('Назва секції не може бути порожньою.');
      return;
    }

    try {
      await API.put(`/sections/${section.id}`, { title });
      toast.success('Назву секції успішно оновлено.');
      handleClose();
      refreshSections();
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка при оновленні секції.');
      toast.error(err.response?.data?.message || 'Не вдалося оновити секцію.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Редагувати назву секції</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formSectionTitle" className="mb-3">
            <Form.Label>Назва секції</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введіть нову назву секції"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Відміна
            </Button>
            <Button variant="primary" type="submit">
              Зберегти
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditSectionModal;
