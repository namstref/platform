// frontend/src/components/Home.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Directory from './Directory';
import Video from './Video';
import AdminPanel from './AdminPanel';
import Footer from './Footer';
import { jwtDecode } from 'jwt-decode'; // Правильний імпорт
import { Navbar, Nav, Container, Button, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './Home.css'; // Імпорт файлу стилів

const Home = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [key, setKey] = useState('directories'); // Стан для вибраної вкладки

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(Boolean(decoded.is_admin));
      } catch (error) {
        console.error('Помилка декодування токену:', error);
        toast.error('Помилка аутентифікації. Будь ласка, увійдіть знову.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Ви успішно вийшли з системи.');
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Навігаційна панель */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Платформа Навчання</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Button variant="outline-light" onClick={handleLogout}>
                Вихід
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Основний контент */}
      <Container className="flex-grow-1 mt-4">
        {isAdmin && <AdminPanel />}
        
        {/* Вкладки для перемикання між Довідниками та Відео */}
        <Tabs
          id="main-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3 custom-tabs" // Додано клас для кастомізації
          fill
        >
          <Tab eventKey="directories" title="Довідники">
            <Directory />
          </Tab>
          <Tab eventKey="videos" title="Відео">
            <Video />
          </Tab>
        </Tabs>
      </Container>

      {/* Підвал */}
      <Footer />
    </div>
  );
};

export default Home;
