// frontend/src/components/CustomModal.js

import React, { useState } from 'react';
import API from '../services/api';
import { Modal as BootstrapModal, Button, Form } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { typeLabels } from '../utils/typeLabels'; // Імпорт мапінгу

const CustomModal = ({ type, sections, closeModal }) => {
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [elementType, setElementType] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [videoOption, setVideoOption] = useState('file'); // Нове стан для вибору опції відео
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedSectionId ||
      !elementType ||
      ((elementType !== 'image' && elementType !== 'video' && elementType !== 'text') && !content) ||
      ((elementType === 'image' || elementType === 'video') && (elementType === 'image' ? !file : (!file && !content)))
    ) {
      setError('Заповніть всі обов\'язкові поля');
      toast.error('Заповніть всі обов\'язкові поля');
      return;
    }

    // Додаткова валідація на фронтенді
    if (file) {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/ogg'];
      const allowedTypes = elementType === 'image' ? allowedImageTypes : allowedVideoTypes;

      if (!allowedTypes.includes(file.type)) {
        setError(`Невірний тип файлу. Дозволені тільки ${elementType === 'image' ? 'зображення' : 'відео'}.`);
        toast.error(`Невірний тип файлу. Дозволені тільки ${elementType === 'image' ? 'зображення' : 'відео'}.`);
        return;
      }

      const maxSize = elementType === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024; // 5MB для зображень, 100MB для відео
      if (file.size > maxSize) {
        setError(`Розмір файлу перевищує допустимий ліміт (${elementType === 'image' ? '5MB' : '100MB'}).`);
        toast.error(`Розмір файлу перевищує допустимий ліміт (${elementType === 'image' ? '5MB' : '100MB'}).`);
        return;
      }
    }

    try {
      if (elementType === 'image' || (elementType === 'video' && videoOption === 'file')) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', elementType);

        await API.post(`/elements/${selectedSectionId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else if (elementType === 'video' && videoOption === 'link') {
        await API.post(`/elements/${selectedSectionId}`, { type: elementType, content });
      } else if (elementType === 'text') {
        await API.post(`/elements/${selectedSectionId}`, { type: elementType, content });
      } else {
        await API.post(`/elements/${selectedSectionId}`, { type: elementType, content });
      }

      toast.success('Елемент додано');
      closeModal();
      // Можна додати оновлення списку елементів або секцій тут
    } catch (err) {
      console.error('Помилка при додаванні елемента:', err);
      setError(err.response?.data?.message || 'Помилка додавання елемента');
      toast.error(err.response?.data?.message || 'Помилка додавання елемента');
    }
  };

  // Налаштування модулів та форматів для ReactQuill
  const modules = {
    toolbar: [
      ['bold', 'underline'], // Жирний та підкреслений
      [{ 'color': ['red', 'black'] }], // Колір тексту: тільки 'red' та 'black'
      ['clean'], // Видалити форматування
    ],
  };

  const formats = [
    'bold',
    'underline',
    'color',
  ];

  return (
    <BootstrapModal show onHide={closeModal} centered>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Додати елемент</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formSection" className="mb-3">
            <Form.Label>Секція</Form.Label>
            <Form.Select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              required
            >
              <option value="">Виберіть секцію</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.title} ({typeLabels[section.type]})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="formElementType" className="mb-3">
            <Form.Label>Тип елемента</Form.Label>
            <Form.Select
              value={elementType}
              onChange={(e) => setElementType(e.target.value)}
              required
            >
              <option value="">Виберіть тип</option>
              <option value="text">Текст</option>
              <option value="image">Картинка</option>
              <option value="video">Відео</option>
            </Form.Select>
          </Form.Group>

          {elementType === 'text' && (
            <Form.Group controlId="formTextContent" className="mb-3">
              <Form.Label>Контент</Form.Label>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Введіть текст"
              />
            </Form.Group>
          )}

          {(elementType === 'image' || elementType === 'video') && (
            <>
              {elementType === 'video' && (
                <Form.Group controlId="formVideoOption" className="mb-3">
                  <Form.Label>Виберіть опцію для відео</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      label="Завантажити файл"
                      name="videoOption"
                      type="radio"
                      id="video-file"
                      value="file"
                      checked={videoOption === 'file'}
                      onChange={(e) => setVideoOption(e.target.value)}
                    />
                    <Form.Check
                      inline
                      label="Посилання на YouTube"
                      name="videoOption"
                      type="radio"
                      id="video-link"
                      value="link"
                      checked={videoOption === 'link'}
                      onChange={(e) => setVideoOption(e.target.value)}
                    />
                  </div>
                </Form.Group>
              )}

              {(elementType === 'image' || (elementType === 'video' && videoOption === 'file')) && (
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>{elementType === 'image' ? 'Виберіть зображення' : 'Виберіть відео'}</Form.Label>
                  <Form.Control
                    type="file"
                    accept={elementType === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => setFile(e.target.files[0])}
                    required={elementType !== 'video' || videoOption === 'file'}
                  />
                  {file && <Form.Text>{file.name}</Form.Text>}
                </Form.Group>
              )}

              {elementType === 'video' && videoOption === 'link' && (
                <Form.Group controlId="formContent" className="mb-3">
                  <Form.Label>Посилання на YouTube</Form.Label>
                  <Form.Control
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Вставте посилання на YouTube відео"
                    required={videoOption === 'link'}
                  />
                </Form.Group>
              )}
            </>
          )}

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={closeModal} className="me-2">
              Відміна
            </Button>
            <Button variant="primary" type="submit">
              Додати
            </Button>
          </div>
        </Form>
      </BootstrapModal.Body>
    </BootstrapModal>
  );
};

export default CustomModal;
