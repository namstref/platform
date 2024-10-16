// frontend/src/components/ElementsList.js

import React from 'react';
import { Card, Image } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { typeLabels } from '../utils/typeLabels'; // Імпорт мапінгу

const ElementsList = ({ elements, handleOpenImageModal }) => {
  const renderElement = (element) => {
    switch (element.type) {
      case 'text':
        return <div dangerouslySetInnerHTML={{ __html: element.content }} />;
      case 'image':
        return (
          <div className="image-container">
            <Image 
              src={element.content} 
              alt="Зображення елемента" 
              fluid 
              rounded 
              className="fixed-image" 
              onClick={() => handleOpenImageModal(element.content)} 
              style={{ cursor: 'pointer' }}
            />
          </div>
        );
      case 'video':
        return (
          <div className="video-container">
            {isYouTubeURL(element.content) ? (
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${extractYouTubeID(element.content)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video 
                className="fixed-video" 
                controls 
                style={{ cursor: 'pointer', width: '100%', height: 'auto' }}
              >
                <source src={element.content} type="video/mp4" />
                Ваш браузер не підтримує тег video.
              </video>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {elements.map(element => (
        <Card key={element.id} className="mb-3">
          <Card.Body>
            {renderElement(element)}
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

// Допоміжна функція для визначення, чи є URL посиланням на YouTube
function isYouTubeURL(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
}

// Допоміжна функція для витягнення ID відео з посилання YouTube
function extractYouTubeID(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

export default ElementsList;
