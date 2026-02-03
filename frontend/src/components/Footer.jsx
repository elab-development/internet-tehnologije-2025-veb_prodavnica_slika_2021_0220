import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok, FaMapMarkerAlt, FaPhoneAlt, FaBuilding, FaInfoCircle, FaChevronUp } from 'react-icons/fa';
import './Footer.css';

import { HashLink } from 'react-router-hash-link';

import { useEffect, useRef } from 'react';

const Footer = () => {

    const godina = new Date().getFullYear();

// fade-up animacija za prvi scroll
    const footerRef = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-up');
        observer.unobserve(entry.target); // animira se samo jednom
      }
    },
    { threshold: 0.4 }
    );

    if (footerRef.current) {
        observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
    }, []);
    //

  return (
    <footer ref={footerRef} className="footer-section">
      <div className="container py-5">
        <div className="row gy-5 justify-content-lg-between">  {/* row -> flex+grid, gy-vertikalni gap, justify-content-lg-between (razvlaci kolone na velikim ekranima)*/}
          
          {/* KOLONA 1: O NAMA / KONTAKT */}
          <div className="col-lg-4 col-md-6 footer-column">    {/* col-md-6 - 6/12 ekrana tableta zauzima ova kolona */}
            <h5 className="">
                <div className="footer-logo">
                  {/* Ovde možeš staviti svoj <img src={logo} /> */}
                  <span className="logo-dany">Dany</span><span className="logo-art">Art</span>
                </div>
            </h5>
            <div className="title-underline"></div>
            <ul className="list-unstyled contact-info">  {/* list-unstyled uklanja bullets */}
              <li>
                <FaMapMarkerAlt className="footer-icon" />
                <span>Kej srpskih sestara, Niš</span>
              </li>
              <li>
                <FaInfoCircle className="footer-icon" />
                <span>PIB 111122222</span>
              </li>
              <li>
                <FaPhoneAlt className="footer-icon" />
                <span>+381 60 999 888</span>
              </li>
            </ul>
            <div className="social-icons d-flex gap-3 mt-4 justify-content-center justify-content-lg-start">
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-square">        {/* target="_blank" je da se otvori novi tab, rel="noreferrer" je da sakrije podatke ovog sajta koji je usao na link */}
                    <FaFacebookF size={18} />
                </a>

                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-square">
                    <FaInstagram size={18} />
                </a>

                {/* TikTok */}
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="social-square">
                    <FaTiktok size={18} />
                </a>
            </div>
          </div>

          {/* KOLONA 2: NAVIGACIJA */}
          <div className="col-lg-4 col-md-6 footer-column text-center">
            <h5 className="footer-title">Mapa sajta</h5>
            <div className="title-underline mx-auto"></div>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">Početna</Link></li>
              <li><Link to="/galerija/">Galerija</Link></li>
              <li><Link to="/o-nama/">O nama</Link></li>
              <li><Link to="/kontakt/">Kontakt</Link></li>
            </ul>
          </div>

          {/* KOLONA 3: INFORMACIJE */}
          <div className="col-lg-2 col-md-12 footer-column text-center text-lg-start ms-lg-auto">
            <h5 className="footer-title">INFORMACIJE</h5>
            <div className="title-underline mx-auto mx-lg-0"></div>
            <ul className="list-unstyled footer-links">
              <li><Link to="/uslovi/">Uslovi korišćenja</Link></li>
              <li><Link to="/privatnost/">Politika privatnosti</Link></li>
              <li><Link to="/informacije/">Česta pitanja</Link></li>
            </ul>

            <HashLink smooth to="#top" className="scroll-to-top-simple">
                <FaChevronUp />
            </HashLink>
          </div>

        </div>
      </div>

      {/* DONJI DEO: COPYRIGHT */}
      <div className="footer-bottom border-top py-4">
        <div className="container">  {/* container mora biti spoljni div tj nikako zajednicki sa d-flex, jer je kutija za sadržaj, a row/flex/grid je mehanizam za raspored kolona unutar te kutije. */}
          <div className="d-flex justify-content-center align-items-center">
            <p className="copyright-text m-0">
              DanyArt © {godina}. Sva prava su zadržana.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
