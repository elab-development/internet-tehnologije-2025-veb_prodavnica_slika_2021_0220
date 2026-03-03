import React, { useEffect } from 'react';
import { GiDiamonds } from "react-icons/gi";

const PolitikaPrivatnosti = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-section py-5" style={{ minHeight: '80vh', paddingTop: '150px', backgroundColor: '#f4f1ec' }}>
      <div className="container">
        <div className="text-center mb-5">
          <div className="d-flex align-items-center justify-content-center gap-1 mb-3">
            <GiDiamonds style={{ color: '#c5a059' }} /> 
            <span style={{ color: '#c5a059', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Pravne informacije</span>
          </div>
          <h2 className="font-serif mb-3" style={{ color: '#3e2b26', fontSize: '2.5rem' }}>Politika privatnosti</h2>
          <div style={{ width: '60px', height: '2px', backgroundColor: '#c5a059', margin: '0 auto' }}></div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-9" style={{ color: '#4a3728', lineHeight: '1.8' }}>
            
            <section className="mb-5">
              <h4 style={{ color: '#3e2b26' }}>1. Prikupljanje podataka</h4>
              <p>
                Prilikom poručivanja umetničkih dela na sajtu DanyArt, prikupljamo samo neophodne podatke za realizaciju isporuke: 
                ime, prezime, adresu isporuke, broj telefona i email adresu. Ovi podaci se koriste isključivo u svrhu slanja Vaše porudžbine.
              </p>
            </section>

            <section className="mb-5">
              <h4 style={{ color: '#3e2b26' }}>2. Zaštita autorskih dela</h4>
              <p>
                Sva umetnička dela prikazana na ovom sajtu su intelektualna svojina autora. Zabranjeno je svako neovlašćeno preuzimanje, 
                reproduciranje ili korišćenje slika u komercijalne svrhe bez izričite pismene saglasnosti autora. Kupovinom originalne slike 
                stičete vlasništvo nad fizičkim predmetom, dok autorska prava na dizajn i koncept ostaju kod umetnika.
              </p>
            </section>

            <section className="mb-5">
              <h4 style={{ color: '#3e2b26' }}>3. Čuvanje podataka</h4>
              <p>
                Vaša privatnost je prioritet. Vaši kontakt podaci se ne prodaju, ne iznajmljuju niti dele sa trećim licima, 
                osim sa kurirskom službom koja vrši isporuku Vaše slike.
              </p>
            </section>

            <section className="mb-5">
              <h4 style={{ color: '#3e2b26' }}>4. Kolačići (Cookies)</h4>
              <p>
                Naš sajt koristi osnovne kolačiće kako bi Vam omogućio nesmetano korišćenje korpe i procesa poručivanja. 
                Ovi podaci nam pomažu da razumemo koje slike najviše privlače Vašu pažnju kako bismo unapredili našu ponudu.
              </p>
            </section>

            <section className="text-center mt-5 p-4" style={{ border: '1px dashed #c5a059', borderRadius: '10px' }}>
              <p className="mb-0 italic">
                Za sva dodatna pitanja u vezi sa Vašim podacima ili autorskim pravima, možete nas kontaktirati na: <br />
                <strong>pravi.izbor@danyArt.rs</strong>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PolitikaPrivatnosti;