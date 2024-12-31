
"use client";
import Link from "next/link";
import styles from "./navbar.module.css";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import Image from "next/image";

const NavigationBar = () => {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand className="d-flex align-items-center">      
          <Image src='/icons/logo.png' alt="Example" width={50} height={50} />
          Retail Description Generator
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <div className="me-3">
              <Link href="/">Description Generator</Link>
            </div>
            <Link href="/catalog">Product Catalog</Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};


export default NavigationBar;
 