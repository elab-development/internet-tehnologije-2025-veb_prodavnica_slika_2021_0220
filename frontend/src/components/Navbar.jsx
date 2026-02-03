// import React from 'react'


//DODAJ DA SE NAVBAR TOGGLE ZATVORI (PODIGNE NAVIGACIONI MENI) SAM KAD SE KLIKNE NA NEKI NAVIGACIONI LINK
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css';
import { FiShoppingBag } from "react-icons/fi";



import { FaBars, FaTimes } from "react-icons/fa";
import React, { useEffect, useState } from 'react';            //useState cuva stanje komponente

import { PiTruckLight } from "react-icons/pi";
import { HashLink } from 'react-router-hash-link';

import LogoutModal from '../modals/LogoutModal';
//Svaki put kad se state promeni → komponenta se ponovo renderuje
const Navbar = ({ onLogin,onRegister,isAuth,onLogout,cartCount }) => {                           //treba jos dodati kad se doda slika u korpu da se pojavi kruzic na korpi sa brojem artikala i hover da kad se predje kursorom da iskoci prozor sa ariklima 
                                                //i treba dodati efekat spustanja kad se klikne burger meni
  //const cartCount = 1;   //dodaj useState(0) za broj slika u korpi i povezi sa dugmicima dodaj u korpu
  const [isOpen, setIsOpen] = useState(false); //hook, kada zelimo da element isOpen nesto pamti (false/true stanje), preko fje setIsOpen menjamo vrednost is useState-a (false->true ili true->false)
 
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  

  const navLinkHandler=()=>{
    setIsOpen(false);
  }

  return (

    <>
    <div className="py-3 header">
      <div className="container-fluid">
        {/* flex-nowrap sprečava, po svaku cenu, da se elementi iz flexboxa prelamaju tj. da neki od njih predje u donji red cak iako se ekran dosta suzi */}
        <div className="d-flex align-items-center justify-content-between flex-nowrap">
          
          {/* LEVA STRANA: Zauzima sav preostali prostor i dopušta prelamanje teksta */}
          <div className="d-flex align-items-center me-3">
            <PiTruckLight size={20} className="ms-2 flex-shrink-0 align-items-center" /> {/* flex-shrink-0 znaci bez obzira sto se ekran smanji ti ne smanjuj i ne menjaj ikonicu */}
            <span className="ms-2 text-wrap">
              Besplatna dostava na teritoriji Srbije
            </span>
          </div>

          {/* DESNA STRANA: flex-shrink-0 sprečava skupljanje, linkovi ostaju u liniji */}
          <div className="d-flex gap-2 me-1 flex-shrink-0">
            {isAuth ? (
              <button
                className="nav-link header-link reg"
                onClick={() => setShowLogoutModal(true)}
              >
                Odjavite se
              </button>
            ) : (
              <>
                <button
                  className="nav-link header-link"
                  onClick={onLogin}
                >
                  Prijavite se
                </button>
                <button
                  className="nav-link header-link reg"
                  onClick={onRegister}
                >
                  Registrujte se
                </button>
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>

    <nav className="navbar navbar-expand-lg sticky-top custom-navbar">  {/* navbar-expand-lg sluzi da se na desktop ekranima ignorisu elementi sa collapse */}
      <div className="container-fluid">
        <div className="row w-100 align-items-center m-0">     {/* row je nabudzeni d-flex sa dodacima za grid */}

        {/* LEVA KOLONA (Zauzima 2/12 prostora - BALANS) */}
          <div className="col-2 d-flex align-items-center">
            <button
              className="navbar-toggler border-0"     // className="navbar-toggler" ide u paketu sa data-bs-toggle="collapse" 
              type="button"                          // da zna da nije submit tj. da ne osvezava stranicu
              //data-bs-toggle="collapse"             //collapse znaci ovde da se odnosi na element koji je skriven do/od odredjenog trenutka
              //data-bs-target="#mainNavbar"          // data-bs-target="#mainNavbar" sluzi za povezivanje sa elementom preko njegovog id-ia jer je #->id a .->class 
              //aria-controls="mainNavbar"            // vise za seo...
              aria-expanded={isOpen}                //dugme burger meni pomocu aria-expanded pamti trenutno stanje (od poslednjeg renderovanja)
              aria-label="Toggle navigation"        //stoji sablonski jer dugme - burger meni, nema tekst
              onClick={() => setIsOpen(!isOpen)}    //koristimo closure, arrow fju da bismo pomerili poziv fje setIsOpen za trenutak kada se klikne na burger meni
            >
              {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>

            <HashLink className="navbar-brand d-none d-lg-block" smooth to='#top'> {/* d-none (generalno nevidljiv) d-lg-block (vidljiv samo na desktop racunarima na toj poziciji (skroz levo)) */}
            <span className="dany">Dany</span>
            <span className="art">Art</span>
            </HashLink>
          </div>

          {/* SREDNJA KOLONA (Zauzima 8/12 prostora - SAVRŠEN CENTAR) */}
          <div className="col-8 d-flex justify-content-center">
            {/* Logo za mobilni: Pojavljuje se u centru samo kad je ekran mali */}
            <HashLink className="navbar-brand d-lg-none m-0" smooth to='#top' onClick={navLinkHandler}> {/*  (generalno je vidljiv) d-lg-none (nije vidljiv samo na desktop racunarima na toj poziciji (centrirano)) */}
            <span className="dany">Dany</span>
            <span className="art">Art</span>
            </HashLink>

            {/* Desktop Navigacija: Prikazuje se samo na velikim ekranima */}
            <div className="collapse navbar-collapse d-none d-lg-block desk-nav"> {/* moze se obrisati ovde collapse navbar-collapse */} 
              <ul className="navbar-nav d-flex gap-5 mx-auto">
                <li className="nav-item"><NavLink className="nav-link" to="/">Početna</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/galerija/">Galerija</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/o-nama/">O nama</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/kontakt/">Kontakt</NavLink></li>
              </ul>
            </div>
          </div>

          {/* DESNA KOLONA (Zauzima 2/12 prostora - BALANS) */}
          
          <div className="col-2 korpa-kontejner">

            <Link to="/korpa/" className="cart-fixed" onClick={navLinkHandler}>
              <FiShoppingBag size={24} />
              {cartCount > 0 ? (
                <span className="cart-badge">{cartCount}</span>
              ) : <></>}
            </Link>
            {/* Prazno - služi kao teg da bi srednja kolona ostala u centru */}
          </div>

          {/* MOBILNI COLLAPSE (Ispod svega kad se klikne burger) */}
          <div className={`mobile-menu d-lg-none ${isOpen ? 'show' : ''}`} >  {/*collapse d-lg-none id="mainNavbar"*/}
            <ul className="navbar-nav text-center py-1">
              <li className="nav-item"><NavLink className="nav-link" to="/" onClick={navLinkHandler}>Početna</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/galerija/" onClick={navLinkHandler}>Galerija</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/o-nama/" onClick={navLinkHandler}>O nama</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/kontakt/" onClick={navLinkHandler}>Kontakt</NavLink></li>    
            </ul>
          </div>

        </div>
      </div>
    </nav>
    {/*  */}
    {
      <LogoutModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={ ()=>{
          onLogout();
          setShowLogoutModal(false);
        }}
      />
    }
    {/*  */}
    </>
  );
}

export default Navbar