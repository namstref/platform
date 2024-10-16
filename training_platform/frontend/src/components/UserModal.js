// frontend/src/components/UserModal.js

import React, { useState } from 'react';
import API from '../services/api';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify'; // Импорт toast

const UserModal = ({ show, handleClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!username || !password) {
      setError('Пожалуйста, заполните все поля.');
      toast.error('Пожалуйста, заполните все поля.');
      return;
    }

    try {
      await API.post('/auth/register', { username, password });
      toast.success('Пользователь успешно создан!');
      setUsername('');
      setPassword('');
      setError('');
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании пользователя.');
      toast.error(err.response?.data?.message || 'Не удалось создать пользователя.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Создать нового пользователя</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formUsername" className="mb-3">
            <Form.Label>Имя пользователя</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Создать
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserModal;
