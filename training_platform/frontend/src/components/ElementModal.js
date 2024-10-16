// frontend/src/components/ElementModal.js

import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Modal, Button, Form } from 'react-bootstrap';
import ReactQuill from 'react-quill'; // Импорт ReactQuill
import 'react-quill/dist/quill.snow.css'; // Импорт стилей Quill
import { toast } from 'react-toastify'; // Импорт toast

const ElementModal = ({ element, closeModal, refreshSections }) => {
  const [type, setType] = useState(element.type);
  const [content, setContent] = useState(element.content);
  const [file, setFile] = useState(null);
  const [videoOption, setVideoOption] = useState(element.type === 'video' && isYouTubeURL(element.content) ? 'link' : 'file'); // Определение начальной опции
  const [error, setError] = useState('');

  function isYouTubeURL(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let formData;
      let headers = {};

      if (type === 'text') {
        if (!content.trim()) {
          setError('Контент текста не может быть пустым.');
          toast.error('Контент текста не может быть пустым.');
          return;
        }
        formData = { type, content };
      } else if (type === 'image' || (type === 'video' && videoOption === 'file')) {
        formData = new FormData();
        formData.append('type', type);
        if (file) {
          formData.append('file', file);
        } else {
          formData.append('content', content);
        }
        headers['Content-Type'] = 'multipart/form-data';
      } else if (type === 'video' && videoOption === 'link') {
        formData = { type, content };
      } else {
        formData = { type, content };
      }

      await API.put(`/elements/${element.id}`, formData, { headers });
      toast.success('Элемент успешно обновлён');
      closeModal();
      refreshSections();
    } catch (error) {
      console.error('Ошибка при обновлении элемента:', error);
      setError(error.response?.data?.message || 'Не удалось обновить элемент');
      toast.error(error.response?.data?.message || 'Не удалось обновить элемент');
    }
  };

  // Настройка модулей и форматов для ReactQuill
  const modules = {
    toolbar: [
      ['bold', 'underline'], // Жирный и подчеркнутый
      [{ 'color': ['red', 'black'] }], // Цвет текста: только 'red' и 'black'
      ['clean'], // Удалить форматирование
    ],
  };

  const formats = [
    'bold',
    'underline',
    'color',
  ];

  return (
    <Modal show onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Редактировать элемент</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formElementType" className="mb-3">
            <Form.Label>Тип элемента</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Выберите тип</option>
              <option value="text">Текст</option>
              <option value="image">Картинка</option>
              <option value="video">Видео</option>
            </Form.Select>
          </Form.Group>

          {type === 'text' && (
            <Form.Group controlId="formTextContent" className="mb-3">
              <Form.Label>Контент</Form.Label>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Введите текст"
              />
            </Form.Group>
          )}

          {(type === 'image' || type === 'video') && (
            <>
              {type === 'video' && (
                <Form.Group controlId="formVideoOption" className="mb-3">
                  <Form.Label>Выберите опцию для видео</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      label="Загрузить файл"
                      name="videoOption"
                      type="radio"
                      id="video-file-edit"
                      value="file"
                      checked={videoOption === 'file'}
                      onChange={(e) => setVideoOption(e.target.value)}
                    />
                    <Form.Check
                      inline
                      label="Ссылка на YouTube"
                      name="videoOption"
                      type="radio"
                      id="video-link-edit"
                      value="link"
                      checked={videoOption === 'link'}
                      onChange={(e) => setVideoOption(e.target.value)}
                    />
                  </div>
                </Form.Group>
              )}

              {(type === 'image' || (type === 'video' && videoOption === 'file')) && (
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>{type === 'image' ? 'Выберите изображение' : 'Выберите видео'} (оставьте пустым, чтобы не менять файл)</Form.Label>
                  <Form.Control
                    type="file"
                    accept={type === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  {file && <Form.Text>{file.name}</Form.Text>}
                </Form.Group>
              )}

              {type === 'video' && videoOption === 'link' && (
                <Form.Group controlId="formContentURL" className="mb-3">
                  <Form.Label>Ссылка на YouTube</Form.Label>
                  <Form.Control
                    type="text"
                    value={videoOption === 'link' ? content : ''}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Введите ссылку на YouTube видео"
                    required={videoOption === 'link'}
                  />
                </Form.Group>
              )}
            </>
          )}

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={closeModal} className="me-2">
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Сохранить изменения
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ElementModal;
