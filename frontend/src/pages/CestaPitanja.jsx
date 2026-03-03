import React, { useState, useEffect } from 'react';
import { GiDiamonds } from "react-icons/gi";
import FaqItem from '../components/FaqItem';
import '../components/FaqItem.css'; 

const CestaPitanja = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "Da li su slike originalne?",
      answer: "Da. Svako delo u našoj galeriji je jedinstveno, ručno rađeno originalno umetničko delo stvoreno sa strašću i ljubavi prema umetnosti."
    },
    {
      question: "Koji je rok isporuke?",
      answer: "Vaša porudžbina biće dostavljena na Vašu adresu u roku od 2 do 5 radnih dana."
    },
    {
      question: "Koja je cena dostave?",
      answer: "Dostava je u potpunosti besplatna. Troškove isporuke do Vaše adrese pokriva DanyArt."
    },
    {
      question: "Koji načini plaćanja su dostupni?",
      answer: "Plaćanje se obavlja prilikom preuzimanja pošiljke na adresi isporuke."
    },
    {
      question: "Kako da budem siguran da će mi se slika uklopiti u enterijer?",
      answer: "Pošaljite nam fotografiju vašeg prostora na pravi.izbor@danyArt.rs i pripremićemo vam prikaz."
    },
    {
      question: "Kako se vrši poručivanje?",
      answer: "Pronađite delo, kliknite na 'Dodaj u korpu', popunite podatke i kliknite na 'Plaćanje'."
    },
    {
      question: "Da li mogu da vratim sliku ako se predomislim?",
      answer: "Možete vratiti sliku u roku od 7 dana od prijema, a mi ćemo Vam vratiti novac."
    }
  ];

  return (
    <div className="faq-section py-5" style={{ minHeight: '80vh', paddingTop: '150px' }}>
      <div className="container">
        
        <div className="text-center mb-5">
          <div className="d-flex align-items-center justify-content-center gap-1 mb-3 confidence-subtitle">
            <GiDiamonds className='text-custom-gold-dark'/> 
            <span className="text-custom-gold-dark">Imate pitanja?</span>
          </div>
          <h2 className="font-serif confidence-title text-custom-brown mb-3">Najčešće postavljena pitanja</h2>
          <p className="text-muted mx-auto" style={{maxWidth: '700px'}}>
            Pronađite odgovore na pitanja o našim umetničkim delima, dostavi i politikama.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            {faqData.map((item, index) => (
              <FaqItem 
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={activeIndex === index}
                onClick={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CestaPitanja;