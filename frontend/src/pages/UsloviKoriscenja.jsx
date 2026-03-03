import React, { useEffect } from 'react';
import { GiDiamonds } from "react-icons/gi";
import { FiShoppingCart, FiTruck, FiShield, FiEdit3 } from "react-icons/fi"; // Nove ikonice

const UsloviKoriscenja = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Podaci za kartice
  const termCards = [
    {
      icon: <FiShoppingCart size={30} style={{ color: '#c5a059' }} />,
      title: "1. Opšte odredbe & Poručivanje",
      desc: "Korišćenjem veb-sajta DanyArt i poručivanjem umetničkih dela, prihvatate ove uslove. Poručivanje se vrši putem korpe. Nakon potvrde porudžbine, dobićete email sa detaljima."
    },
    {
      icon: <FiShield size={30} style={{ color: '#c5a059' }} />,
      title: "2. Plaćanje & Sigurnost",
      desc: "Plaćanje se vrši isključivo gotovinom prilikom preuzimanja pošiljke (pouzećem). Sva dela su ručni radovi i unikatna, te su male varijacije u bojama u odnosu na ekran moguće."
    },
    {
      icon: <FiTruck size={30} style={{ color: '#c5a059' }} />,
      title: "3. Isporuka & Reklamacije",
      desc: "Dostava je besplatna za Srbiju. Rok je 2-5 radnih dana. Ukoliko stigne oštećena, kontaktirajte nas odmah. Korisnik ima pravo na povraćaj neoštećenog dela u roku od 7 dana."
    },
    {
      icon: <FiEdit3 size={30} style={{ color: '#c5a059' }} />,
      title: "4. Intelektualna svojina",
      desc: "Sadržaj ovog sajta (tekstovi, logotipi, fotografije dela) ne sme se koristiti bez dozvole. Vlasnik sajta zadržava pravo promene cena i asortimana bez prethodne najave."
    }
  ];

  return (
    <div className="terms-section py-5" style={{ minHeight: '80vh', paddingTop: '150px', backgroundColor: '#f4f1ec' }}>
      <div className="container">
        
        {/* Header Sekcije */}
        <div className="text-center mb-5">
          <div className="d-flex align-items-center justify-content-center gap-1 mb-3">
            <GiDiamonds style={{ color: '#c5a059' }} /> 
            <span style={{ color: '#c5a059', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Pravila i uslovi</span>
          </div>
          <h2 className="font-serif mb-3" style={{ color: '#3e2b26', fontSize: '2.5rem' }}>Uslovi korišćenja</h2>
          <div style={{ width: '60px', height: '2px', backgroundColor: '#c5a059', margin: '0 auto' }}></div>
          <p className="text-muted mx-auto mt-4" style={{maxWidth: '650px'}}>
            Molimo Vas da pažljivo pročitate uslove korišćenja našeg sajta pre nego što se odlučite na kupovinu naših autorskih umetničkih dela.
          </p>
        </div>

        {/* Grid Kartica - Ovo je novi deo */}
        <div className="row g-4 justify-content-center">
          {termCards.map((card, index) => (
            <div key={index} className="col-lg-6 col-md-10">
              <div 
                className="terms-card p-4 shadow-sm"
                style={{
                  backgroundColor: '#ffffff', // Bela kartica na bež pozadini
                  borderRadius: '15px',
                  borderLeft: '4px solid #c5a059', // Zlatna linija sa leve strane
                  height: '100%', // Da sve budu iste visine
                  transition: 'transform 0.3s ease', // Blagi hover efekat
                }}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  {card.icon}
                  <h4 className="mb-0" style={{ color: '#3e2b26', fontSize: '1.3rem', fontWeight: '600' }}>
                    {card.title}
                  </h4>
                </div>
                <p className="text-muted" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Poslednja izmena blok */}
        <div className="text-center mt-5 p-4" style={{ borderTop: '1px dashed #c5a059' }}>
          <p className="mb-0 text-muted" style={{ fontStyle: 'italic' }}>
            Poslednja izmena uslova korišćenja: <strong>Februar 2026.</strong> <br />
            Vaš <strong>DanyArt</strong>
          </p>
        </div>

      </div>
    </div>
  );
};

export default UsloviKoriscenja;