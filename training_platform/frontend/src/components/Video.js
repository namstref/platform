// frontend/src/components/Video.js

import React, { useEffect, useState } from 'react';
import API from '../services/api';
import './VideoPlayer.css';
import { Accordion, Card, Image, Modal } from 'react-bootstrap';
import ElementsList from './ElementsList';
import { toast } from 'react-toastify';
import { typeLabels } from '../utils/typeLabels'; // Імпорт мапінгу

const VideoSection = () => {
  const [sections, setSections] = useState([]);
  const [elements, setElements] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await API.get('/sections');
        const videoSections = response.data.filter(sec => sec.type === 'video');
        setSections(videoSections);
      } catch (error) {
        console.error('Помилка при отриманні секцій:', error);
        toast.error('Не вдалося отримати відео секції.');
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
        console.error('Помилка при отриманні елементів:', error);
        toast.error('Не вдалося отримати елементи.');
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
              {section.title} ({typeLabels[section.type]})
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

      {/* Модальне вікно для збільшеного зображення */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="fullscreen" // Полноекранне модальне вікно для зображень
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Перегляд Зображення</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          {currentImage && (
            <Image 
              src={currentImage} 
              alt="Перегляд зображення" 
              fluid 
              rounded 
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

// Допоміжна функція для визначення, чи є URL посиланням на YouTube
function isYouTubeURL(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
}

export default VideoSection;
