import React, { useEffect, useState } from 'react';
import './Pocetna.css';
import { Link } from 'react-router-dom';
import { GiDiamonds } from "react-icons/gi";// Ikona dijamanta/zvezdice

import { FiGift } from "react-icons/fi";
import FeatureCard from '../components/FeatureCard';

import { TbTruckDelivery } from "react-icons/tb";
import { BsCreditCard } from "react-icons/bs";
import { BiTimeFive } from "react-icons/bi";
import { TbRotateClockwise2 } from "react-icons/tb";
import { LuShieldCheck } from "react-icons/lu";
import { FiHeart } from "react-icons/fi";

import FaqItem from '../components/FaqItem';
import '../components/FaqItem.css';

import PaintingCard from '../components/PaintingCard';
import '../components/PaintingCard.css';



import MemberBanner from '../components/MemberBanner';
import api from '../api/Api';




const Pocetna = ({onRegister,isAuth,addToCart,removeFromCart, cartItems}) => {

  const features = [
    {
      id: 1,
      icon: <TbTruckDelivery size={30} />,
      title: "Besplatna dostava",
      desc: "Besplatna dostava za sve porudžbine"
    },
    {
      id: 2,
      icon: <BsCreditCard size={28} />,
      title: "Plaćanje pouzećem",
      desc: "Plaćate kada preuzmete vašu porudžbinu"
    },
    {
      id: 3,
      icon: <BiTimeFive size={30} />,
      title: "Dostava za 2-5 radnih dana",
      desc: "Brza i pažljiva isporuka na vašu adresu"
    },
    {
      id: 4,
      icon: <TbRotateClockwise2 size={30} />,
      title: "Povraćaj u roku od 7 dana",
      desc: "Garancija povraćaja novca"
    },
    {
      id: 5,
      icon: <LuShieldCheck size={28} />,
      title: "Zagarantovana privatnost",
      desc: "Vaši podaci su uvek zaštićeni"
    },
    {
      id: 6,
      icon: <FiHeart size={28} />,
      title: "Originalna dela",
      desc: "100% autentična umetnička dela"
    }
  ];

  // State za otvaranje/zatvaranje
  const [activeIndex, setActiveIndex] = useState(null);   //koristimo ga kao true/false samo sa null,0,1,2,... da bismo isti useState koristili za sva pitanja

  const toggleFAQ = (index) => {    //ako je indeks pitanja postavljen za aktivan (pitanje kliknuto) onda se ponovnim klikom za aktivni index postavlja null (ni jedan odgovor nije otkriven)
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "Da li su slike originalne?",
      answer: "Da. Svako delo u našoj galeriji je jedinstveno, ručno rađeno originalno umetničko delo stvoreno sa strašću i ljubavi prema umetnosti."
    },
    {
      question: "Koji je rok isporuke?",
      answer: `Vaša porudžbina biće dostavljena na Vašu adresu u roku od 2 do 5 radnih dana. U slučaju eventualnih izmena ili produženja roka, bićete pravovremeno obavešteni.`
    },
    {
      question: "Koja je cena dostave?",
      answer: "Dostava je u potpunosti besplatna. Troškove isporuke do Vaše adrese pokriva DanyArt."
    },
    {
      question: "Koji načini plaćanja su dostupni?",
      answer: "Plaćanje se obavlja prilikom preuzimanja pošiljke na adresi isporuke. Na ovaj način garantujemo sigurno plaćanje."
    },
    {
      question: "Kako da budem siguran da će mi se slika uklopiti u enterijer?",
      answer: `Ako želite da vidite kako bi neka slika izgledala u vašem prostoru, rado ćemo vam pomoći! Pošaljite nam fotografiju vašeg prostora i nazive slika koje razmatrate na pravi.izbor@danyArt.rs
               , a mi ćemo vam pripremiti realističan prikaz. Usluga je potpuno besplatna i uključuje najviše 5 odabranih slika. Tu smo da Vam pomognemo da donesete pravu odluku. Vaše zadovoljstvo je naš prioritet!`
    },
    {
      question: "Kako se vrši poručivanje?",
      answer: `Pronađite željeno delo u našoj galeriji i kliknite na "Dodaj u korpu".
               Pristupite korpi, popunite podatke za dostavu i kliknite na "Plaćanje".
               Nakon što primite potvrdu porudžbine putem mejla ili sms-a, mi ćemo se pobrinuti da slika bezbedno stigne na vašu adresu.
               Porudžbinu možete obaviti i pozivom na broj 060 999 888, gde smo dostupni i za sva dodatna pitanja.`
    },
    {
      question: "Da li mogu da vratim sliku ako se predomislim?",
      answer: "Ukoliko niste u potpunosti zadovoljni, možete vratiti sliku u roku od 7 dana od prijema, a mi ćemo Vam vratiti novac. Želimo da se osećate sigurno prilikom kupovine."
    },
  ];

  
  const [latestPaintings,setLatestPaintings] = useState([]);

  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  // const [info,setInfo]=useState("");

  useEffect(()=>{
    const vratiNoveSlike= async ()=>{
      try {
        setLoading(true);
        const response = await api.get('/slike-najnovije');
        
        // Transformiši podatke iz baze u format koji komponenta očekuje
        const paintings = response.data.map(slika => ({
          id: slika.id,
          galerija_id: slika.galerija_id,
          naziv: slika.naziv,
          dimenzije: `${slika.sirina_cm} x ${slika.visina_cm} cm`,
          tehnike: slika.tehnike.map((t) => t.naziv).join(', '), // Tehnika kao string
          cena: `${slika.cena} RSD`,
          dostupna: slika.dostupna,
          fotografija: `http://localhost:8000/storage/${slika.putanja_fotografije}` // Laravel storage URL
        }));
        
        setLatestPaintings(paintings);

      } catch (err) {
        console.error('Greška pri učitavanju slika:', err);
        setError('Nije moguće učitati slike');
      } finally {
        setLoading(false);
      }
    };

    vratiNoveSlike();

    //mozes dodati event listener-e tkd. svaki put kad slikar/admin doda sliku da se azurira pocetna strana 

    // window.addEventListener('azuriraj_slike',vratiNoveSlike);

    // return ()=>window.removeEventListener('azuriraj_slike',vratiNoveSlike);

    //na mesto poziva: window.dispatchEvent(new Event('azuriraj_slike'));
  },[]);

  return (

    <>
    {/* hero-section */}
    <div className='pocetna pocetna-bg d-flex align-items-center'>
      <div className="container-fluid">
        <div className="row">
          {/* Tekst zauzima pola ekrana na desktopu (col-lg-6), a ceo na mobilnom */}
          <div className="col-lg-7 col-md-8 ps-4">
            
            {/* Subtitle sa ikonom */}
            <div className="original d-flex align-items-center gap-1">
              <GiDiamonds/>
              <span className="small-text">Galerija Originalnih Umetničkih Dela</span>
            </div>

            {/* Glavni Naslov */}
            <h1 className="display-3 mb-4 text-dark font-serif">
              <span className='text-custom-black d-block'>Mesto gde</span>
              <span className="text-custom-red d-block">Emocije oživljavaju</span>
            </h1>

            {/* Paragraf teksta */}
            <p className="text-muted mb-5">
              Otkrijte unikatna, ručno izrađena koja dela govore jezikom vaše duše. 
              Svako delo je prozor u svet lepote, emocija i vrhunske umetnosti. 
              Oplemenite svoj prostor umetnošću koja traje.
            </p>

            {/* Dugmad */}
            <div className="d-flex gap-3">
              {/* Levo dugme - vodi na Galerija */}
              <Link to="/galerija/" className=" btn-custom-red btn-lg rounded-3 px-4 py-2">
                Istražite galeriju
              </Link>

              {/* Desno dugme - vodi na O nama */}
              <Link to="/o-nama/" className=" btn-outline-custom-gold btn-lg rounded-3 px-4 py-2">
                Naša priča
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>


    {/* LATEST PAINTINGS) SEKCIJA */}
    <div className="latest-paintings-section py-5">
      <div className="container">
        {/* Header Sekcije */}
        <div className="text-center mb-5">
            <div className="d-flex align-items-center justify-content-center gap-1 confidence-subtitle mb-3">
              <GiDiamonds/> 
              Novo u ponudi
            </div>
            <h2 className="confidence-title font-serif mb-3">Najnovije slike</h2>
            <p className="text-muted mx-auto" style={{maxWidth: '700px'}}>
                Pogledajte najnovija dela u našoj kolekciji. Svaka slika je originalno umetničko delo, naslikano sa strašću i pažnjom prema svakom detalju.
            </p>
        </div>
        {/* DODAJ OPCIJU DA SE OBRISE IZ KORPE SA POCETNE */}
        {/* Grid Kartica */}
        <div className="row g-4 justify-content-center">
            {loading ? (
              <div className="text-center">Učitavanje...</div>
            ) : error ? (
              <div className="text-center text-danger">Server nije dostupan. Molimo proverite internet konekciju.</div>
            ) : latestPaintings.length === 0 ? (
              <div className="text-center">Nema dostupnih slika</div>
            ) : (
            latestPaintings.map((painting) => (
                <div key={painting.id} className="col-md-6 col-lg-4">
                    <PaintingCard
                        id={painting.id}
                        galerija_id={painting.galerija_id}
                        naziv={painting.naziv}
                        dimenzije= {painting.dimenzije}
                        tehnike={painting.tehnike}
                        cena={painting.cena}
                        dostupna={painting.dostupna}
                        fotografija={painting.fotografija}
                        
                        onAddToCart={(painting)=>addToCart(painting)} //moglo je i bez parametara tj. samo ()=>addToCart(painting) i onda bi poziv bio onAddToCart()
                        removeFromCart={()=>removeFromCart(painting.id)}
                        isInCart={cartItems && cartItems.some((item) => item.id === painting.id)}   //some vraca true/false, dok find vraca element ili null?
                        //^proverimo da li je već u korpi da bi dugme bilo sivo odmah pri učitavanju
                    />
                    
                </div>
            ))
            )
            }
        </div>

        {/* Dugme ispod grida */}
        <div className="text-center mt-5">
            <Link to="/galerija/" className="btn-gold-filled shadow-sm">
                Pogledajte sve slike
            </Link>
        </div>

      </div>
    </div>
    {/* --- KRAJ NOVE SEKCIJE --- */}

    {/* member-banner */}
    <div className="member-banner py-5">
        <div className="container-fluid">
          <MemberBanner
          isAuth={isAuth}
          onRegister={onRegister}/>
        </div>
    </div>

    {/* SHOP WITH CONFIDENCE */}
    <div className="confidence-section py-5">
      <div className="container-fluid">
        {/* Naslov */}
        <div className="text-center mb-5">
          <div className="d-flex align-items-center justify-content-center gap-1 confidence-subtitle mb-2">
            <GiDiamonds/> 
            Zašto izabrati nas
          </div>
          
          <h2 className="confidence-title font-serif">Kupujte sa poverenjem</h2>
        </div>

        {/* Grid kartica */}
        <div className="row g-4 justify-content-center">
          {features.map((feature) => (
            // Bootstrap grid: 2 na mobilnom (col-6), 3 na tabletu (col-md-4), 6 na velikom (col-xl-2)
            <div key={feature.id} className="col-6 col-md-4 col-xl-2">
              <FeatureCard 
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
              />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* FAQ SECTION */}
      <div className="faq-section py-5">
        <div className="container">
          
          {/* Header FAQ Sekcije */}
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

          {/* Lista Pitanja (FAQ) */}
          <div className="row justify-content-center">
            <div className="col-lg-10">
              
              
              {faqData.map((item, index) => (  //drugi parametar je indeks elementa niza
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
    </>
  )
}

export default Pocetna;
