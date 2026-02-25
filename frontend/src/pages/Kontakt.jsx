import React, { useEffect, useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiUploadCloud, FiX } from 'react-icons/fi';
import { FaLocationArrow } from 'react-icons/fa';
import { GiDiamonds } from 'react-icons/gi';
import { TbSend } from 'react-icons/tb';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import './Kontakt.css';

import api from '../api/Api.js';


const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '850px',
  borderRadius: '20px'
};

const Kontakt = () => {
  const [formData, setFormData] = useState({ ime: '', email: '', poruka: '' });
  const [images, setImages] = useState([]);

  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [info,setInfo]=useState("");

  const [lokacija, setLokacija] = useState({ naziv: '', adresa: '', longitude: 0,latitude: 0});

  const [ulica,setUlica]= useState("");
  const [grad,setGrad]=useState("");

  const [loadingMap,setLoadingMap] = useState(false);
  const [errorMap,setErrorMap]=useState("");


  useEffect(()=>{


      const vratiLokacijuGalerije=async ()=>{

        try {

        setLoadingMap(true);
          
        const response=await api.get('/galerija');



        const adresa=response.data.adresa.split(',');

        setUlica(adresa[0]);
        setGrad(adresa[1]);

        setLokacija({
          naziv: response.data.naziv,
          adresa: response.data.adresa,
          longitude: response.data.longitude,
          latitude: response.data.latitude
        });

        } catch (error) {
          console.error("Greska pri ucitavanju lokacije galerije", error);
          setErrorMap("Nije moguće učitati lokaciju galerije");
        } finally{
          setLoadingMap(false);
        }

      } 

      vratiLokacijuGalerije();

      window.scrollTo({

          top: 0,
          behavior: "smooth"
        });

  },[]);

  
  const handleInputChange = (e) => {

    setFormData(
        { 
        ...formData,
         [e.target.name]: e.target.value 
        }
      );   //kad se desi izmena input polja, za atribute od formData postavjamo stare vrednosti ALI azuriramo vrednost atributa objekta u state-u ciji key je name input polja (key=name od inputa : value=najnoviji value iz event-a koji ce se preko state promenljive formData postaviti u value inputa)
  };
  //[e.target.name] zagrade sluze da kazu js-u da je unutra key

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);   //posto koristimo input type=file onda mozemo sa e.target.files da pristupimo uploadovanim slikama(fajlovima)
    if (images.length + files.length > 5) {     //broj vec zakacenih slika i broj slika koji hocemo da dodamo mora biti manji od 6
      alert('Možete otpremiti maksimalno 5 slika.');
      return;
    }
    setImages((prevImages) => [...prevImages, ...files]);    //isto bi dobili i sa setImages([...images, ...files]); ,postavljamo slike (stare i nove tj spajamo 2 niza)
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const data=new FormData();

      data.append('ime',formData.ime);
      data.append('email',formData.email);
      data.append('poruka',formData.poruka);

      images.forEach((img)=>{
        data.append(`slike[]`,img);
      })

      await api.post('/poruka-korisnika',data);

      setInfo("Uspešno ste poslali poruku.");

      setTimeout(()=>{
        
        setInfo("");
        // Resetovanje polja forme
        setFormData({ ime: '', email: '', poruka: '' });
        setImages([]);
      },2000);
      
    } catch (error) {
      console.error("Greška pri slanju poruke: ", error.response.data);
      setError("Došlo je do greške. Proverite internet konekciju i pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className="kontakt-page py-5">
      <div className="container-fluid px-4 px-md-5" style={{ maxWidth: '1400px' }}>
        
        {/* Header Sekcija */}
        <div className="text-center mb-5 mt-4">
          <span className="d-flex align-items-center justify-content-center gap-1 confidence-subtitle mb-3">
            <GiDiamonds/> Pišite nam
          </span>
          <h1 className="confidence-title font-serif mb-3">Kontaktirajte nas</h1>
          <p className="text-muted mx-auto">
            Pitajte sve što Vas zanima. Rado ćemo uvažiti i odgovoriti na svako pitanje.
          </p>
        </div>

        <div className="row g-4 mb-5">
          {/* LEVA KOLONA: Kontakt Info i Forma */}
          <div className="col-lg-6 d-flex flex-column gap-4">
            
            <div className="row g-3">
              <div className="col-md-6">
                <div className="contact-card">
                  <div className="icon-circle-soft mb-3"><span><FiMail size={24} /></span></div>
                  <h5 className="font-serif fw-bold">Email</h5>
                  <p className="text-muted mb-0" style={{fontSize:'1rem'}}>pravi.izbor@danyArt.rs</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="contact-card">
                  <div className="icon-circle-soft mb-3"><span><FiPhone size={24} /></span></div>
                  <h5 className="font-serif fw-bold">Telefon</h5>
                  <p className="text-muted mb-0">+381 60 999 888</p>
                </div>
              </div>
            </div>

            <div className="contact-card d-flex gap-4 align-items-center">
              <div className="icon-circle-soft"><span><FiMapPin size={24} /></span></div>
              <div>
                <h5 className="font-serif fw-bold">Lokacija</h5>
                <p className="text-muted mb-0">{ulica}<br/>{grad}, Srbija</p>
              </div>
            </div>

            {/* Forma */}
            <div className="contact-card form-card mt-2">
              <h3 className="font-serif fw-bold mb-4">Pošaljite poruku</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-muted small">Ime</label>
                  <input type="text" name="ime" value={formData.ime} className="form-control form-control-custom" placeholder="Vaše ime" onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">Email</label>
                  <input type="email" name="email" value={formData.email} className="form-control form-control-custom" placeholder="your@gmail.com" onChange={handleInputChange} required />
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted small">Poruka</label>
                  <textarea name="poruka" value={formData.poruka} className="form-control form-control-custom" rows="4" placeholder="Recite kako možemo da Vam pomognemo..." onChange={handleInputChange} required></textarea>
                </div>
                {/* textarea tag omogucava korisniku da prosiruje input polje */}

                {/* Upload Deo */}
                <div className="mb-4">
                  <label className="form-label text-muted small d-flex justify-content-between">
                    Ako želite, dodajte slike Vašeg prostora i umetničkih dela koje razmatrate. Mi ćemo Vam u najkraćem mogućem roku poslati fotografije na kojima ćete moći da vidite kako se ta umetnička dela uklapaju u Vaš enterijer.
                  </label>

                  {/* povezujemo input i label preko id i htmlFor (file-upload) radi lakse stilizacije, input nam je nevidljiv zbog d-none a label nam radi ono sto input treba*/}
                  <div className="upload-container">
                    <input type="file" id="file-upload" multiple   accept="image/*" onChange={handleImageUpload} className="d-none" />
                    <label htmlFor="file-upload" className="upload-label d-flex flex-column align-items-center justify-content-center">
                      <FiUploadCloud size={30} className="mb-2 text-custom-gold" />
                      <span>Kliknite ovde da dodate fotografiju</span>
                      <small className="text-muted">({images.length}/5 dodatih)</small>
                    </label>
                  </div>
                  {/* multiple omogucava upload vise fajlova istovremeno, a accept=image/* sugerise browseru da uploadovani fajlovi koji se prikazuju budu slike (nije validacija) */}
                  

                  {/* moramo da css-u damo url za background image (kao u Pocetna.css), url kreiramo pomocu URL.createObjectUrl(file) pri cemu je file image*/}
                  {images.length > 0 && (
                    <div className="d-flex gap-2 mt-3 flex-wrap">
                      {images.map((img, index) => (
                        <div key={index} className="position-relative">
                          <div className="image-preview" style={{ backgroundImage: `url(${URL.createObjectURL(img)})` }}></div>
                          <button type="button" className="btn-remove-img" onClick={() => removeImage(index)}>
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {info ? <div className="obavestenje info mb-3">{info}</div> : null}
                {error ? <div className="obavestenje error mb-3">{error}</div> : null}

                <div className="d-flex justify-content-center">
                  <button 
                  type="submit" 
                  className="send-mes-btn py-3 px-4 rounded-3 d-flex justify-content-center align-items-center gap-2"
                  disabled={loading}
                  >
                    <TbSend /> Pošaljite poruku
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* DESNA KOLONA: Mapbox interaktivna mapa */}
          <div className="col-lg-6">
            <div className="map-wrapper d-block h-100 w-100 position-relative">
              
              {loadingMap ? (
                  <div className="text-center">Učitavanje...</div>
                ) : errorMap ? (
                  <div className="text-center text-danger">Server nije dostupan. Molimo proverite internet konekciju.</div>
                ) : lokacija.latitude===0 ? (
                  <div className="text-center">Učitavanje...</div>
                ) : (
                  <MapContainer
                    center={[lokacija.latitude, lokacija.longitude]}
                    zoom={16}
                    style={mapContainerStyle}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      // attribution='&copy; OpenStreetMap contributors'
                    />
                    <Marker position={[lokacija.latitude, lokacija.longitude]}>
                      <Popup>{lokacija.adresa}</Popup>
                    </Marker>
                  </MapContainer>

                  // ^ copy paste sa react leaflet sajta i prilagodi se position i doda style
                )
              }

              {/* Custom info-kartica preko mape */}
              <div className="fake-map-popup" style={{zIndex:'400'}}>
                <h6 className="fw-bold mb-1">{ulica}</h6>
                <p className="text-muted small mb-3">{grad}, Srbija</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${lokacija.latitude},${lokacija.longitude}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary small d-flex align-items-center gap-1 text-decoration-none"
                >
                  View larger map
                </a>
                <div className="directions-icon">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lokacija.latitude},${lokacija.longitude}`}
                    target="_blank"  //otvara gmaps u novom tab-u
                    rel="noopener noreferrer"    //krije podatke naseg sajta prilikom odlaska na gmaps, mora u target="_blank" da ide
                    className="text-decoration-none"
                  >
                    <FaLocationArrow color="#1a73e8" size={18} />
                    <span className="small text-primary d-block mt-1">Directions</span>
                  </a>

                  {/* imas ove linkove u google maps url params documentation ali je nepregledna */}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Kontakt;

