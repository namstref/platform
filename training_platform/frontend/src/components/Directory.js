// src/components/Directory.js

import React, { useEffect, useState } from 'react';
import API from '../services/api';
import './VideoPlayer.css';
import { Accordion, Card, Image, Modal } from 'react-bootstrap'; // Импорт Image
import ElementsList from './ElementsList';

const Directory = () => {
  const [sections, setSections] = useState([]);
  const [elements, setElements] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await API.get('/sections');
        const directorySections = response.data.filter(sec => sec.type === 'directory');
        setSections(directorySections);
      } catch (error) {
        console.error('Ошибка при получении секций:', error);
      }
    };
    fetchSections();
  }, []);

  const handleToggle = async (sectionId) => {
    if (!elements[sectionId]) {
      try {
        const response = await API.get(`/elements/${sectionId}`);
        setElements(prev => ({ ...prev, [sectionId]: response.data }));
      } catch (error) {
        console.error('Ошибка при получении элементов:', error);
      }
    }
  };

  const handleOpenImageModal = (imageUrl) => {
    setCurrentImage(imageUrl);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentImage('');
  };

  return (
    <>
      <Accordion defaultActiveKey="">
        {sections.map(section => (
          <Accordion.Item eventKey={section.id.toString()} key={section.id}>
            <Accordion.Header onClick={() => handleToggle(section.id)}>
              {section.title}
            </Accordion.Header>
            <Accordion.Body>
              <ElementsList 
                elements={elements[section.id] || []} 
                handleOpenImageModal={handleOpenImageModal} 
              />
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* Модальное окно для увеличенного изображения */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="fullscreen" // Полноэкранное модальное окно для изображений
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Просмотр Изображения</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          {currentImage && (
            <Image 
              src={currentImage} 
              alt="Просмотр изображения" 
              fluid 
              rounded 
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

// Вспомогательная функция для определения, является ли URL ссылкой на YouTube
function isYouTubeURL(url) {
  const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
}

export default Directory;
