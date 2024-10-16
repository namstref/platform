// src/components/Footer.js

import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 mt-auto">
      <Container className="text-center">
        © {new Date().getFullYear()} Платформа Навчання. Усі права захищені.
      </Container>
    </footer>
  );
};

export default Footer;
