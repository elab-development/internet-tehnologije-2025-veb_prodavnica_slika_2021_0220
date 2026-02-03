import React, { useEffect } from 'react';
import './O_nama.css';
import { PiSparkleFill } from 'react-icons/pi';

const ONama = () => {
  // Ovaj deo resava problem sa belom pozadinom oko footera
  useEffect(() => {
    document.body.style.backgroundColor = "#fcf8f5";
    return () => {
      document.body.style.backgroundColor = "white"; // Vraca na belo kad odes sa stranice
    };
  }, []);

  return (
    <div className="o-nama-stranica"> 
      <div className="container py-5">
        
        <div className="text-center mb-5">
          <span className="subtitle font-serif">
            <PiSparkleFill className="single-star" /> NAŠA PRIČA
          </span>
          <h1 className="main-title font-serif">O nama</h1>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8 about-card"> 
            
            {/* 1. Pasus */}
            <p className="about-text font-serif">
              Dobrodošli u <strong>Artistry</strong>, mesto gde svaki potez četkicom priča priču, a svako platno nosi delić duše. 
              Posvećeni smo stvaranju originalnih umetničkih dela koja govore srcu, donoseći lepotu i smisao u domove širom sveta.
            </p>

            {/* 2. Pasus */}
            <p className="about-text font-serif">
              Naše putovanje počelo je jednostavnim verovanjem: umetnost ima moć da transformiše prostor i dotakne živote. 
              Ono što je počelo kao lična strast, preraslo je u misiju — da delimo dar originalnih slika sa svima koji cene autentičnu lepotu.
            </p>

            {/* 3. Pasus */}
            <p className="about-text font-serif">
              Svaka slika u našoj kolekciji stvorena je sa namerom i pažnjom. Verujemo da umetnost treba da budi emocije, podstiče razgovor i stvara vezu između posmatrača i umetnika. Bilo da je u pitanju zlatna toplina zalaska sunca ili vibrirajuća energija apstrakcije, svaki komad je dizajniran da unese sreću u vaš život.
            </p>

            {/* 4. Pasus */}
            <p className="about-text font-serif">
              Razumemo da je biranje umetnosti za vaš dom duboko lična odluka. Zato nudimo personalizovane usluge, uključujući vizuelizaciju enterijera, kako bismo vam pomogli da pronađete savršen komad koji upotpunjuje vaš prostor i odražava vašu ličnost.
            </p>

            {/* 5. Pasus */}
            <p className="about-text font-serif">
              U Artistry-ju, mi ne prodajemo samo slike — mi delimo deo našeg srca sa vama. Verujemo da okruživanje lepim i smislenim umetninama poboljšava svakodnevni život i stvara okruženje ispunjeno inspiracijom.
            </p>

            {/* 6. Pasus */}
            <p className="about-text font-serif">
              Hvala vam što ste deo našeg umetničkog putovanja. Pozivamo vas da istražite našu kolekciju i pronađete delo koje se obraća vašoj duši. Dozvolite nam da vam pomognemo da unesete transformativnu moć umetnosti u svoj dom.
            </p>

            <div className="signature-section mt-5 text-center">
               <h3 className="with-love font-serif">S ljubavlju prema umetnosti,</h3>
               <p className="artist-name">Umetnik</p>
               <PiSparkleFill className="footer-sparkle" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ONama;