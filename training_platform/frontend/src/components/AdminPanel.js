// frontend/src/components/AdminPanel.js

import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ElementModal from './ElementModal';
import CustomModal from './CustomModal';
import UserModal from './UserModal';
import EditSectionModal from './EditSectionModal';
import AddSectionModal from './AddSectionModal';
import ConfirmModal from './ConfirmModal';
import { Button, Table, Stack, Accordion } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { typeLabels } from '../utils/typeLabels'; // Імпорт мапінгу

const AdminPanel = () => {
  const [sections, setSections] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: '', sectionType: '' });
  const [elementModal, setElementModal] = useState({ isOpen: false, element: null });
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editSectionModal, setEditSectionModal] = useState({ show: false, section: null });
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
  
  // Стан для ConfirmModal
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await API.get('/sections');
      setSections(response.data);
    } catch (error) {
      console.error('Помилка при отриманні секцій:', error);
      toast.error('Не вдалося отримати секції.');
    }
  };

  const openModal = (modalType) => {
    setModal({ isOpen: true, type: modalType, sectionType: '' });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', sectionType: '' });
  };

  const openElementModal = (element) => {
    setElementModal({ isOpen: true, element });
  };

  const closeElementModal = () => {
    setElementModal({ isOpen: false, element: null });
  };

  const handleAddSection = () => {
    setAddSectionModalOpen(true);
  };

  const handleDeleteSection = (id) => {
    // Відкриття ConfirmModal
    setConfirmModal({
      show: true,
      title: 'Видалення секції',
      message: 'Ви впевнені, що хочете видалити цю секцію? Це дію неможливо скасувати.',
      onConfirm: () => confirmDeleteSection(id),
      onCancel: () => setConfirmModal({ ...confirmModal, show: false }),
    });
  };

  const confirmDeleteSection = async (id) => {
    try {
      await API.delete(`/sections/${id}`);
      setSections(sections.filter(sec => sec.id !== id));
      toast.success('Секцію успішно видалено.');
    } catch (error) {
      console.error('Помилка при видаленні секції:', error);
      toast.error('Не вдалося видалити секцію.');
    } finally {
      setConfirmModal({ ...confirmModal, show: false });
    }
  };

  const handleDeleteElement = (id) => {
    // Відкриття ConfirmModal
    setConfirmModal({
      show: true,
      title: 'Видалення елемента',
      message: 'Ви впевнені, що хочете видалити цей елемент? Це дію неможливо скасувати.',
      onConfirm: () => confirmDeleteElement(id),
      onCancel: () => setConfirmModal({ ...confirmModal, show: false }),
    });
  };

  const confirmDeleteElement = async (id) => {
    try {
      await API.delete(`/elements/${id}`);
      fetchSections();
      toast.success('Елемент успішно видалено.');
    } catch (error) {
      console.error('Помилка при видаленні елемента:', error);
      toast.error('Не вдалося видалити елемент.');
    } finally {
      setConfirmModal({ ...confirmModal, show: false });
    }
  };

  const handleEditSection = (section) => {
    setEditSectionModal({ show: true, section });
  };

  const closeEditSectionModal = () => {
    setEditSectionModal({ show: false, section: null });
  };

  return (
    <div className="mb-5">
      <h2>Панель адміністратора</h2>
      <Stack direction="horizontal" gap={2} className="mb-3">
        <Button variant="primary" onClick={handleAddSection}>
          <FaPlus className="me-1" /> Додати секцію
        </Button>
        <Button variant="success" onClick={() => openModal('addElement')}>
          <FaPlus className="me-1" /> Додати елемент
        </Button>
        <Button variant="info" onClick={() => setUserModalOpen(true)}>
          <FaUserPlus className="me-1" /> Додати користувача
        </Button>
      </Stack>
      <Accordion defaultActiveKey="">
        {sections.map(section => (
          <Accordion.Item eventKey={section.id.toString()} key={section.id}>
            <Accordion.Header>
              {section.title} ({typeLabels[section.type]})
            </Accordion.Header>
            <Accordion.Body>
              <Stack direction="horizontal" gap={2} className="mb-3">
                <Button 
                  variant="success" 
                  size="sm" 
                  onClick={() => openModal('addElement')}
                >
                  <FaPlus className="me-1" /> Додати елемент
                </Button>
                <Button 
                  variant="warning" 
                  size="sm" 
                  onClick={() => handleEditSection(section)}
                >
                  <FaEdit className="me-1" /> Редагувати заголовок
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => handleDeleteSection(section.id)}
                >
                  <FaTrash className="me-1" /> Видалити секцію
                </Button>
              </Stack>
              <ElementsList 
                sectionId={section.id} 
                onDeleteElement={handleDeleteElement}
                onEditElement={openElementModal}
              />
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
      {modal.isOpen && <CustomModal type={modal.type} sections={sections} closeModal={closeModal} />}
      {elementModal.isOpen && 
        <ElementModal 
          element={elementModal.element} 
          closeModal={closeElementModal} 
          refreshSections={fetchSections}
        />
      }
      {userModalOpen && 
        <UserModal 
          show={userModalOpen} 
          handleClose={() => setUserModalOpen(false)} 
        />
      }
      {editSectionModal.show && 
        <EditSectionModal 
          show={editSectionModal.show} 
          handleClose={closeEditSectionModal} 
          section={editSectionModal.section} 
          refreshSections={fetchSections} 
        />
      }
      {addSectionModalOpen && (
        <AddSectionModal
          show={addSectionModalOpen}
          handleClose={() => setAddSectionModalOpen(false)}
          refreshSections={fetchSections}
        />
      )}
      
      {/* Додавання ConfirmModal */}
      <ConfirmModal 
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />
    </div>
  );
};

// Компонент для відображення списку елементів всередині секції
const ElementsList = ({ sectionId, onDeleteElement, onEditElement }) => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const fetchElements = async () => {
      try {
        const response = await API.get(`/elements/${sectionId}`);
        setElements(response.data);
      } catch (error) {
        console.error('Помилка при отриманні елементів:', error);
        toast.error('Не вдалося отримати елементи.');
      }
    };
    fetchElements();
  }, [sectionId]);

  return (
    <Table striped bordered hover responsive>
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Тип</th>
          <th>Контент</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        {elements.map(element => (
          <tr key={element.id}>
            <td>{element.id}</td>
            <td>{typeLabels[element.type]}</td>
            <td>
              {element.type === 'text' && element.content}
              {element.type === 'image' && <img src={element.content} alt="" width="100" />}
              {element.type === 'video' && <video src={element.content} width="100" />}
            </td>
            <td>
              <Stack direction="horizontal" gap={2}>
                <Button 
                  variant="warning" 
                  size="sm" 
                  onClick={() => onEditElement(element)}
                >
                  <FaEdit className="me-1" /> Редагувати
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => onDeleteElement(element.id)}
                >
                  <FaTrash className="me-1" /> Видалити
                </Button>
              </Stack>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AdminPanel;
