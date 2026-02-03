

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { FiShoppingBag, FiGift } from "react-icons/fi"; // Nova ikona za praznu korpu i poklon
import CartItem from '../components/CartItem';
import './Korpa.css';
import MemberBanner from '../components/MemberBanner';
import api from '../api/Api';

const Korpa = ({ cartItems, removeFromCart, isAuth, onRegister,onPlaceOrder }) => {

  const [sezonskiPopust, setSezonskiPopust] = useState(null);

  useEffect(() => {
    const fetchPopust = async () => {
      try {
        const response = await api.get('/popusti-aktivni'); 
        // Pretpostavljamo da backend vraća niz popusta
        // Filtriramo onaj koji je aktivan i koji je u važećem periodu
        
        const vazeci=(danOd,mesecOd,danDo,mesecDo)=>{
          
          const today=new Date();
          today.setHours(0,0,0,0);

          const currentYear=today.getFullYear();
          
          const datumOd=new Date(currentYear,mesecOd-1,danOd); //u js meseci idu 0-11
          const datumDo=new Date(currentYear,mesecDo-1,danDo);

          if(datumDo<datumOd){
            

            //SLUČAJ A: Danas je kraj godine (npr. 28. Decembar 2025)
            //// Opseg: 25.12.2025 -> 05.01.2026
            const datumDoA=new Date(datumDo);
            datumDoA.setFullYear(currentYear+1);
            if(datumOd<=today && today<=datumDoA){
              return true;
            }

            // SLUČAJ B: Danas je početak godine (npr. 2. Januar 2025)
            //// Opseg: 25.12.2024 -> 05.01.2025 
            const datumOdB=new Date(datumOd);
            datumOdB.setFullYear(currentYear-1);
            if(datumOdB<=today && today<=datumDo){
              return true;
            }

            return false;
          }
          console.log(datumOd);
          console.log(datumDo);
          console.log(today);

          return datumOd <= today && today <= datumDo;

          // if(datumOd<=today && today<=datumDo){

          //   return true;
          // }
          // else{
          //   return false;
          // }
          
        }
        const aktivan = response.data.find(p => {
          return vazeci(p.danOd,p.mesecOd,p.danDo,p.mesecDo);
        });

        console.log(aktivan);

        if (aktivan) {
          setSezonskiPopust(aktivan);
        }
      } catch (error) {
        console.error("Greška pri dohvatanju popusta:", error);
      }
    };

    fetchPopust();
  }, []);

  // Helper funkcija za konverziju cene
  const parsePrice = (priceStr) => {

    if(typeof priceStr==='number') return priceStr;
    
    const cleanStr = priceStr
                    .split('')
                    .filter((char)=> (char>='0' && char<='9') || char==='.')
                    .join('');

    return cleanStr !== '' ? parseFloat(cleanStr) : 0;
  };

  // Računanje ukupne cene
  const subtotal = cartItems.reduce((sum, item) => sum + parsePrice(item.cena), 0);

  let procenatPopusta=0;
  let tipPopusta="";

  console.log(sezonskiPopust);
  if(sezonskiPopust){
    procenatPopusta=sezonskiPopust.procenat;
    tipPopusta=sezonskiPopust.tip.split('_').join(' ');
    tipPopusta=
    tipPopusta.length > 0 
    ? tipPopusta.charAt(0).toUpperCase() + tipPopusta.substring(1).toLowerCase() 
    : tipPopusta;
  }
  else if(isAuth){
    procenatPopusta=10;
    tipPopusta='Članski popust';
  }

  const iznosPopusta= subtotal*(procenatPopusta/100);
  const totalPrice=subtotal-iznosPopusta;

  return (
    <div className='pozadina'>
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      
      {/* Header: Prikazuje se samo ako IMA artikala, da ne smeta praznom stanju */}
      {cartItems.length > 0 && (
          <div className="row mb-5 align-items-center position-relative g-0">
            <div className="col-3">
                <Link to="/galerija/" className="btn-back-gallery">
                    <FaArrowLeft /> 
                    <span className='ostatak-ponude'>Ostatak ponude</span>
                </Link>
            </div>
            <div className="col-6 text-center">
                <h2 className="display-5 font-serif mb-0 d-flex align-items-center justify-content-center gap-3">
                    Odabrane slike 
                    {/* <FaShoppingCart className="text-custom-gold" /> */}
                </h2>
            </div>
            <div className="col-3"></div>
          </div>
      )}

      {/* --- LOGIKA PRIKAZA --- */}
      {cartItems.length === 0 ? (
        
        // --- PRAZNA KORPA DIZAJN ---
        <div className="empty-cart-container text-center">
            <div className="empty-cart-icon-wrapper">
                <FiShoppingBag size={50} className="empty-cart-icon" />
            </div>
            
            <h2 className="empty-cart-title">Vaša korpa je prazna</h2>
            
            <p className="empty-cart-text">
                Pogledajte našu kolekciju originalnih slika i dodajte omiljene u korpu. Svako delo je jedinstveno i čeka da upotpuni vaš prostor.
            </p>
            
            <Link to="/galerija" className="btn-explore-gallery shadow-sm">
                Razgledajte galeriju
            </Link>
        </div>

      ) : (
        // --- PUNA KORPA DIZAJN ---
        <div className="row g-0">
          {/* Lista artikala  col-lg-8 */}
          <div className="mb-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.id} 
                item={item} 
                removeFromCart={removeFromCart} 
              />
            ))}
          </div>

          {/* Order Summary col-lg-4*/}
          <div className="">
            <div className="order-summary-card shadow-sm" style={{ top: '100px', maxWidth: '350px', margin: '0 auto' }}>
                <h4 className="mb-4 border-bottom pb-2 text-center" style={{fontWeight: 600, fontSize: '1.5rem'}}>Pregled porudžbine</h4>
                
                <div className="d-flex justify-content-between mb-3 text-muted">
                    <span>Iznos</span>
                    <span>{subtotal.toLocaleString()} RSD</span>
                </div>
                {/* PRIKAZ POPUSTA AKO POSTOJI */}
                {procenatPopusta > 0 && (
                  <div className="d-flex justify-content-between mb-3 text-success fw-bold">
                      <span>{tipPopusta} (-{procenatPopusta}%)</span>
                      <span>-{iznosPopusta.toLocaleString()} RSD</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-4 text-success">
                    <span>Dostava</span>
                    <span>Besplatna</span>
                </div>
                
                <div className="d-flex justify-content-between mb-4 fw-bold fs-4 border-top pt-3">
                    <span>Ukupno</span>
                    <span>{totalPrice.toLocaleString()} RSD</span>
                </div>

                <button 
                className="unesi-podatke w-100 py-3 rounded-3 text-uppercase fw-bold"
                onClick={onPlaceOrder}
                >
                    Unesi podatke
                </button>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER BANNER */}
      {/* Prikazuje se uvek na dnu stranice, bez obzira da li je korpa puna ili prazna */}
      <div className="member-banner-cart py-5 px-4 mt-5">
        {/* <div className="container-fluid"> */}
            
            <MemberBanner
            onRegister={onRegister}
            isAuth={isAuth}
            />
        {/* </div> */}
      </div>

    </div>
    </div>
  );
};

export default Korpa;