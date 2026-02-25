import React, { useEffect, useState } from 'react';
import './Galerija.css';
import api from '../api/Api';
import PaintingCard from '../components/PaintingCard';
import { GiDiamonds } from 'react-icons/gi';
import { FiFilter, FiChevronDown, FiCheck } from 'react-icons/fi'; 

//namesti da slider-i (mozda i checkboxovi) budu reusable components
const Galerija = ({ onAddToCart, onRemoveFromCart, cartItems }) => {
  const [allPaintings, setAllPaintings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  const [sortOption, setSortOption] = useState("Najnovije");
  const sortOptions = ["Najnovije", "Najstarije", "Najjeftinije", "Najskuplje"];

  const [allTechniques,setAllTechniques]=useState([]);
  // FILTER STANJA
  const [availability, setAvailability] = useState(null); //na pocetku su sve slike tu, ako se stiklira dostupne bice true, ako se potom ostiklira bice false
  const [selectedTechniques, setSelectedTechniques] = useState([]);
  
  const maxPriceLimit = 150000;
  const [priceRange, setPriceRange] = useState([0, maxPriceLimit]); 

  // NOVA STANJA: Raspon za Širinu i Visinu (u cm)
  const maxWidthLimit = 200; 
  const [widthRange, setWidthRange] = useState([0, maxWidthLimit]);
  const maxHeightLimit = 200;
  const [heightRange, setHeightRange] = useState([0, maxHeightLimit]);


  const vratiSveSlike = async () => {
      try {
        setLoading(true);

        const params={
          page: currentPage,
          // dostupna:availability ? 1 : 0 //axios http parametre pretvara u string (laravel samo 0,1 prepoznaje a ne true/false)
        }

        if(availability!=null){
          params.dostupna=availability ? 1 : 0; //axios http parametre pretvara u string (laravel samo 0,1 prepoznaje a ne true/false)
        }                                       // ili ce biti null (prikazujemo i dostupne i nedostupne) ili ce biti true (prikazujemo samo dostupne)

        if(priceRange[0]>0){
          params.cena_min=priceRange[0];
        }
        if(priceRange[1]<maxPriceLimit){
          params.cena_max=priceRange[1];
        }

        if(heightRange[0]>0){
          params.visina_cm_min=heightRange[0];
        }
        if(heightRange[1]<maxHeightLimit){
          params.visina_cm_max=heightRange[1];
        }

        if(widthRange[0]>0){
          params.sirina_cm_min=widthRange[0];
        }
        if(widthRange[1]<maxWidthLimit){
          params.sirina_cm_max=widthRange[1];
        }

        if(["Najjeftinije", "Najskuplje"].includes(sortOption)){ //includes koristi === za poredjenje
          params.sort_cena=sortOption==='Najskuplje' ? 'desc' : 'asc';
        }
        if(["Najnovije", "Najstarije"].includes(sortOption)){
          params.sort_starost=sortOption==='Najnovije' ? 'desc' : 'asc';
        }

        if(selectedTechniques.length>0){
          params.tehnike=selectedTechniques.map((tehnika)=>tehnika.id);
        }
        

        const response = await api.get('/slike-pag', { params: params }); //moze i samo params jer je key=value
        const ukupnoStrana = response.data.ukupanBrojStrana;
        setTotalPages(ukupnoStrana);

        const slike = response.data.slike.map((slika) => ({
          id: slika.id,
          galerija_id: slika.galerija_id,
          fotografija: `http://localhost:8000/storage/${slika.putanja_fotografije}`,
          cena: `${slika.cena} RSD`,
          naziv: slika.naziv,
          dimenzije: `${slika.sirina_cm} x ${slika.visina_cm} cm`,
          dostupna: slika.dostupna ? "Da" : "Ne",
          tehnike: slika.tehnike.map((tehnika) => tehnika.naziv).join(', '),
        }));

        setAllPaintings(slike);

        
        

      } catch (error) {
        console.error("Greska pri ucitavanju svih slika", error);
        setError("Nije moguće učitati slike");
      } finally {
        setLoading(false);
        // clearFilters();
      }
    };

  useEffect(() => {
    
    vratiSveSlike();

    window.scrollTo({

          top: 0,
          behavior: "smooth"
        });

  }, [currentPage,sortOption]); 

  const [primeniResetFiltera,setPrimeniResetFiltera]=useState(false);

  const handleClearFilters=()=>{
    clearFilters();
    setPrimeniResetFiltera((prev)=>!prev);
  }

  useEffect(()=>{

    vratiSveSlike();

    window.scrollTo({

          top: 0,
          behavior: "smooth"
        });

  },[primeniResetFiltera]);

  useEffect(()=>{

    window.scrollTo({

      top: 0,
      behavior: "smooth"
    });
  },[currentPage]);

  useEffect(()=>{
    const vratiSveTehnike=async ()=>{
      try {
        setLoading(true);

        const response= await api.get('/tehnike');

        const tehnike=response.data.map((tehnika)=>({
          id:tehnika.id,
          naziv:tehnika.naziv
        }));

        setAllTechniques(tehnike);
      } catch (error) {

        console.error("Greska pri ucitavanju svih tehnika", error);
        setError("Nije moguće učitati tehnike");

      } finally{
        setLoading(false);
      }
    }
    vratiSveTehnike();
  },[]);

  // --- FUNKCIJE ZA SLAJDERE ---

  /*
    Korisnik pomeri slider
          ↓
    Browser okida onChange
          ↓
    e.target.value = "5000" (string, trenutna pozicija)
          ↓
    Number(e.target.value) = 5000
          ↓
    Math.min(5000, priceRange[1] - 1000) → sigurna vrednost
          ↓
    setPriceRange([sigurnaVrednost, priceRange[1]])
          ↓
    React re-render → slider se vizuelno pomera
  */

  const handleMinPriceChange = (e) => {
    const value = Math.min(Number(e.target.value), priceRange[1] - 1000);  //min price mora biti za 1000rsd manji od max price
    setPriceRange([value, priceRange[1]]);
  };
  const handleMaxPriceChange = (e) => {
    const value = Math.max(Number(e.target.value), priceRange[0] + 1000);  //max price mora biti za 1000rsd veci od min price
    setPriceRange([priceRange[0], value]);
  };

  const handleMinWidthChange = (e) => {
    const value = Math.min(Number(e.target.value), widthRange[1] - 5);
    setWidthRange([value, widthRange[1]]);
  };
  const handleMaxWidthChange = (e) => {
    const value = Math.max(Number(e.target.value), widthRange[0] + 5);
    setWidthRange([widthRange[0], value]);
  };

  const handleMinHeightChange = (e) => {
    const value = Math.min(Number(e.target.value), heightRange[1] - 5);
    setHeightRange([value, heightRange[1]]);
  };
  const handleMaxHeightChange = (e) => {
    const value = Math.max(Number(e.target.value), heightRange[0] + 5);
    setHeightRange([heightRange[0], value]);
  };

  const handleTechniqueChange = (tech) => {
    setSelectedTechniques(prev => 
      prev.some(t=>t.id===tech.id) ? prev.filter(t => t.id !== tech.id) : [...prev, tech]
    );
  };

  const clearFilters = () => {
    setAvailability(null);
    setSelectedTechniques([]); 
    setPriceRange([0, maxPriceLimit]);
    setWidthRange([0, maxWidthLimit]);
    setHeightRange([0, maxHeightLimit]);
  };

  return (
    <div className="latest-paintings-section py-5">
      <div className="container">
        <div className="text-center mb-5">
          <div className="d-flex align-items-center justify-content-center gap-1 confidence-subtitle mb-3">
            <GiDiamonds />
            Naša kolekcija
          </div>
          <h2 className="confidence-title font-serif mb-3">Galerija slika</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
            Istražite naša originalna dela. Svaka slika je jedinstvena i spremna da ulepša vaš dom.
          </p>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <button className="custom-filter-btn" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter className="me-2" /> Filter
          </button>

          <div className="custom-sort-container position-relative">
            <button 
              className="custom-sort-btn d-flex justify-content-between align-items-center"
              onClick={() => setShowSortOptions(!showSortOptions)}
              onBlur={() => setShowSortOptions(false)}
            >
              {sortOption} <FiChevronDown className="ms-2" />
            </button>
            {showSortOptions && (
              <div className="custom-sort-dropdown">
                {sortOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className={`custom-sort-item ${sortOption === option ? 'active' : ''}`}
                    onMouseDown={() => { setSortOption(option); setShowSortOptions(false); setCurrentPage(1);}}
                  >
                    {sortOption === option && <FiCheck className="me-2" />}
                    <span className={sortOption !== option ? 'ms-4' : ''}>{option}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="filters-expansion-panel mb-5 p-4">
            <div className="row">
              {/* DOSTUPNOST - Sada Checkbox za toggle */}
              <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
                <h5 className="filter-heading">Dostupnost</h5>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={availability}
                    onChange={(e) => setAvailability(e.target.checked ? true : null)} //e je event(stigliran checkbox), e.target je input polje nad kojim se desio event, a e.target.checked je atribut tog polja kom smo iznad dodelili vrednost
                    style={{cursor:'pointer'}}
                  />
                  <span>Samo dostupne</span>
                </label>
              </div>

              {/* TEHNIKE */}
              <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
                <h5 className="filter-heading">Tehnike</h5>

                {
                  loading ? (
                    <div className='text-center'>Ucitavanje...</div>
                  ) : error ? (
                    <div className="text-center text-danger">Server nije dostupan. Molimo proverite internet konekciju.</div>
                  ) : allTechniques.length===0 ? (
                    <div className="text-center">Nema dostupnih tehnika.</div>
                  ) : 
                  allTechniques.map((tech)=>(
                    <label className="filter-checkbox">
                      <input type="checkbox" checked={selectedTechniques.some(t=>t.id===tech.id)} onChange={() => handleTechniqueChange(tech)} style={{cursor:'pointer'}}/>
                      <span>{tech.naziv}</span>
                    </label>
                  ))
                  //checked nam je potrebno kako bi react lakse sinhronizovao izgled sa statusom input polja (da se vidi da je stiklirano kad treba)
                }
                

                
              </div>

              {/* DIMENZIJE (VERTIKALNI SLAJDERI) */}
              <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
                <h5 className="filter-heading">Dimenzije (cm)</h5>
                <div className="d-flex justify-content-start gap-2 mt-4" style={{ marginLeft:'-30px' }}>
                  
                  {/* ŠIRINA */}
                  <div className="d-flex flex-column align-items-center" style={{ width: '90px' }}>
                    <div className="v-slider-box">
                      <div className="price-slider-wrapper v-slider">
                        <div className="price-slider-track"></div>
                        <div 
                          className="price-slider-fill" 
                          style={{ left: `${(widthRange[0]/maxWidthLimit)*100}%`, right: `${100 - (widthRange[1]/maxWidthLimit)*100}%` }}
                        ></div>
                        <input type="range" min="0" max={maxWidthLimit} value={widthRange[0]} onChange={handleMinWidthChange} className="price-slider-input" /> {/* {handleMinWidthChange} === {(e)=>handleMinWidthChange(e)},    parametar e (event) se prosledjuje automatski, ne moramo da pisemo {(e)=>handleMinWidthChange(e)}*/}
                        <input type="range" min="0" max={maxWidthLimit} value={widthRange[1]} onChange={handleMaxWidthChange} className="price-slider-input" />
                        {/* za type="range"/'number'/'date mozemo da koristimo min i max kako bi ogranicili value*/}
                      </div>
                    </div>
                    <div className="text-muted mt-3 text-center" style={{fontSize: '0.9rem'}}>
                      <div>Širina</div>
                      <div className="fw-bold">{widthRange[0]} - {widthRange[1]}</div>
                    </div>
                  </div>

                  {/* VISINA */}
                  <div className="d-flex flex-column align-items-center" style={{ width: '90px' }}>
                    <div className="v-slider-box">
                      <div className="price-slider-wrapper v-slider">
                        <div className="price-slider-track"></div>
                        <div 
                          className="price-slider-fill" 
                          style={{ left: `${(heightRange[0]/maxHeightLimit)*100}%`, right: `${100 - (heightRange[1]/maxHeightLimit)*100}%` }}
                        ></div>
                        <input type="range" min="0" max={maxHeightLimit} value={heightRange[0]} onChange={handleMinHeightChange} className="price-slider-input" />
                        <input type="range" min="0" max={maxHeightLimit} value={heightRange[1]} onChange={handleMaxHeightChange} className="price-slider-input" />
                      </div>
                    </div>
                    <div className="text-muted mt-3 text-center" style={{fontSize: '0.9rem'}}>
                      <div>Visina</div>
                      <div className="fw-bold">{heightRange[0]} - {heightRange[1]}</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* RASPON CENA */}
              <div className="col-lg-3 col-md-6">
                <h5 className="filter-heading">Raspon cena</h5>
                <div className="price-slider-wrapper mt-4">
                  <div className="price-slider-track"></div>
                  <div 
                    className="price-slider-fill" 
                    style={{ left: `${(priceRange[0] / maxPriceLimit) * 100}%`, right: `${100 - (priceRange[1] / maxPriceLimit) * 100}%` }}
                  ></div>
                  <input type="range" min="0" max={maxPriceLimit} value={priceRange[0]} onChange={handleMinPriceChange} className="price-slider-input" />
                  <input type="range" min="0" max={maxPriceLimit} value={priceRange[1]} onChange={handleMaxPriceChange} className="price-slider-input" />
                </div>
                <div className="d-flex justify-content-between mt-3 text-muted">
                  <span className="fw-bold">{priceRange[0]} RSD</span>
                  <span className="fw-bold">{priceRange[1]} RSD</span>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 gap-3">
              <button className="btn-filter-clear" onClick={()=>{handleClearFilters(); setShowFilters(false); setCurrentPage(1);}}>Poništi sve</button>
              <button className="btn-filter-apply" onClick={() => {vratiSveSlike(); setShowFilters(false); setCurrentPage(1);}}>Primeni</button>
            </div>
          </div>
        )}

        <div className='galerija-stranica row g-4 justify-content-center'>
          {/*  KOD ZA PRIKAZ SLIKA */}
          {loading ? (
            <div className="text-center">Učitavanje...</div>
          ) : error ? (
            <div className="text-center text-danger">Server nije dostupan. Molimo proverite internet konekciju.</div>
          ) : allPaintings.length === 0 ? (
            <div className="text-center">Nema slika koje odgovaraju izabranim kriterijumima.</div>
          ) : (
            allPaintings.map((painting) => (
              <div key={painting.id} className="col-md-6 col-lg-4">
                <PaintingCard
                  id={painting.id}
                  galerija_id={painting.galerija_id}
                  fotografija={painting.fotografija}
                  cena={painting.cena}
                  naziv={painting.naziv}
                  dimenzije={painting.dimenzije}
                  dostupna={painting.dostupna}
                  tehnike={painting.tehnike}
                  onAddToCart={() => onAddToCart(painting)}
                  removeFromCart={() => onRemoveFromCart(painting.id)}
                  isInCart={cartItems && cartItems.some((item) => painting.id === item.id)}
                />
              </div>
            ))
          )}
        </div>

        {/* Dugmici za paginaciju */}
            {/* PAGINACIJA */}
          <div className="d-flex justify-content-center mt-5">
            <nav>
              <ul className="pagination custom-pagination">

                {/* Previous */}
                <li className={`page-item`}>
                  <button
                    

                    className="page-link"
                    onClick={() => {
                          setCurrentPage(prev => prev - 1);
                          
                        }}

                    disabled={currentPage === 1}
                  >
                    Prethodna
                  </button>
                </li>

                {/* Brojevi */}
                {/* Array fja pravi simulirani niz sa rupama koji je duzine jednake broju koji je prosledjen kao parametar(toliko imaa rupa tj praznih elemenata)*/}
                {/* Nad Array() ne moze da se pozove map direktno, rupe se moraju popuniti prvo, spread operator (...) to uspesno radi sa undefined i omogucava iteraciju sa map */}
                {/* {[...Array(currentPage+1)].map((_, index) => {
                  const pageNumber = index + 1
                  return ( */}
                  {currentPage-1 > 0 ?
                    (<li
                      key={currentPage-1}
                      className={`page-item`}
                    >
                      <button
                        className="page-link" 
                        onClick={() => {
                          setCurrentPage(currentPage-1); //moglo je i: setCurrentPage(prev => prev - 1);
                        }}
                      >
                        {currentPage-1}
                      </button>
                    </li>):(<></>)}

                    <li
                      key={currentPage}
                      className={`page-item active`}
                    >
                      <button
                        className="page-link" 
                        onClick={() => {
                          setCurrentPage(currentPage);
                        }}
                      >
                        {currentPage}
                      </button>
                    </li>

                    {totalPages>=currentPage+1 ?
                    (<li
                      key={currentPage+1}
                      className={`page-item`}
                    >
                      <button
                        className="page-link" 
                        onClick={() => {
                          setCurrentPage(currentPage+1); //setCurrentPage(prev => prev + 1);
                        }}
                      >
                        {currentPage+1}
                      </button>
                    </li>):(<></>)}
                    

                {/* Next */}
                <li className={`page-item`}>
                  <button
                    

                    className="page-link"
                    onClick={() => {
                          setCurrentPage(prev => prev + 1);
                          // vracanjeNaVrh();
                        }}

                    disabled={currentPage === totalPages}
                  >
                    Sledeća
                  </button>
                </li>

              </ul>
            </nav>
          </div>
      </div>
    </div>
  )
}

export default Galerija;