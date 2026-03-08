import React, { useState, useEffect, useRef } from 'react'
import { FiPackage, FiTrendingUp, FiBarChart2, FiImage, FiX, FiChevronDown, FiCheck } from 'react-icons/fi'
import './AnalizaPoslovanja.css'
import api from '../api/Api.js'

// const podaci1 = [
//   ['Mesec', 'Narudžbine'],
//   ['mar 2025.', 16],
//   ['apr 2025.', 16],
//   ['maj 2025.', 17],
//   ['jun 2025.', 11],
//   ['jul 2025.', 8],
//   ['avg 2025.', 27],
//   ['sep 2025.', 19],
//   ['okt 2025.', 23],
//   ['nov 2025.', 31],
//   ['dec 2025.', 14],
//   ['jan 2026.', 15],
//   ['feb 2026.', 16],
// ]

const AnalizaPoslovanja = () => {


  const [podaci,setPodaci]=useState([
                                    ]);


  const fileInputRef=useRef(null);    //kuka kojom se stavlja jaka referenca na neki element (npr. input sa type="file" jer se prilikom rerendera tu ne azurira "nesto.jpg" u "no file chosen" kad se slika obrise )
                                      //^fora je da se input polju doda atribut ref={fileInputRef} gde je fileInputRef naziv kuke
                                      // onda cemo moci da rucno menjamo vrednost bez rerendera pomocu fileInputRef.current.value=""
  const [formData,setFormData]=useState({

                                  galerija_id: 0,

                                  cena: 0.0,
                                  naziv: "",
                                  visina_cm: 0,
                                  sirina_cm: 0,
                                  dostupna: false,
                                  tehnike: []
                                });

  const [slika,setSlika]=useState(null);  //file

  const [sveTehnike,setSveTehnike]=useState([]);
  const [galerija,setGalerija]=useState({id:0,naziv:""});     //"Nije dostupna u galeriji"

  const [dropdownOtvoren, setDropdownOtvoren] = useState(false);

  const opcije = [
    { value: 0, label: "Nije dostupna u galeriji" },
    { value: galerija.id, label: galerija.naziv }
  ];

  const izabranaOpcija = opcije.find(o => o.value === Number(formData.galerija_id));



  const [loadingSlike,setLoadingSlike]=useState(false);
  const [infoSlike,setInfoSlike]=useState("");
  const [errorSlike,setErrorSlike]=useState("");

  const [loadingTehnike,setLoadingTehnike]=useState(false);
  const [infoTehnike,setInfoTehnike]=useState("");
  const [errorTehnike,setErrorTehnike]=useState("");
  
  const [loadingGalerije,setLoadingGalerije]=useState(false);
  const [infoGalerije,setInfoGalerije]=useState("");
  const [errorGalerije,setErrorGalerije]=useState("");

  const [loadingPodataka,setLoadingPodataka]=useState(false);
  const [infoPodataka,setInfoPodataka]=useState("");
  const [errorPodataka,setErrorPodataka]=useState("");
  
  const [ukupno,setUkupno] = useState(0);
  const [prosecno,setProsecno] = useState(0);
  const [najboljMesec,setNajboljiMesec]=useState("");                  

  const chartRef = useRef(null);
  const [chartLoaded, setChartLoaded] = useState(false);



  useEffect(()=>{

    const vratiSveTehnike= async ()=>{

      try {
        setLoadingTehnike(true);

        const response=await api.get('/tehnike');

        const tehnike=response.data; //hocemo da const tehnike sadrzi iste podatke iz TehnikaResource (ne moramo preko map jer ne menjamo podatke)

        setSveTehnike(tehnike);
        
      } catch (error) {

        console.error("Greska pri ucitavanju svih tehnika", error);
        setErrorTehnike("Nije moguće učitati tehnike");

      } finally {

        setLoadingTehnike(false);
      }
    }

    vratiSveTehnike();

    window.scrollTo({
      top:0,
      behavior:"smooth"
    });
  },[]);

  useEffect(()=>{

    const vratiGaleriju= async()=>{

      try {

        setLoadingGalerije(true);

        const response= await api.get('/galerija');

        const galerija = {
          id: response.data.id,
          naziv: response.data.naziv
        }

        setGalerija(galerija);
        
      } catch (error) {

        console.error("Greska pri ucitavanju lokacije galerije", error);
        setErrorGalerije("Nije moguće učitati lokaciju galerije");
        
      } finally {

        setLoadingGalerije(false);
      }
    }

    vratiGaleriju();

  },[]);

  // GOOGLE CHARTS - NA SAJTU POSTOJI HTML KOD ZA NAS GRAFIKON KOJI TREBA PRILGODITI JSX-U

    {/* <html>
     <head>
      <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
      <script type="text/javascript">
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
          var data = google.visualization.arrayToDataTable([
            ['Year', 'Sales', 'Expenses'],
            ['2004',  1000,      400],
            ['2005',  1170,      460],
            ['2006',  660,       1120],
            ['2007',  1030,      540]
          ]);

          var options = {
            title: 'Company Performance',
            curveType: 'function',
            legend: { position: 'bottom' }
          };

          var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

          chart.draw(data, options);
        }
      </script>
    </head>
    <body>
      <div id="curve_chart" style="width: 900px; height: 500px"></div>
    </body>
  </html> */}


// 1. useEffect je za ucitavanje eksterne biblioteke
  useEffect(() => {                                         
    if (window.google && window.google.charts) {    //u slucaju da smo se vratili vise puta na admin stranicu => nece se vise puta dodavati script tag u head-u i rizikovati konflikte
      setChartLoaded(true);
      return;
    }
    const script = document.createElement('script');   //vanila js kod za kreiranje taga
    script.src = 'https://www.gstatic.com/charts/loader.js' ;  //^ovo se kopira sa sajta
    script.onload = () => {                                 //onLoad je vanila js fja kojom se postavlja callback na DOM element (script tag)
                                                            //script.onLoad=()=>{...} ceka da se ucita DOM element (script) pa se izvrsava ono unutra
      window.google.charts.load('current', { packages: ['corechart'] })  //^ovo se kopira sa sajta samo se dodaje window jer radimo u reactu (a ne u vanila js)
      window.google.charts.setOnLoadCallback(() => setChartLoaded(true)) //^isto samo sto u zagradi stavljamo () => setChartLoaded(true) kako bi izazvali rerender i prikazali ucitani grafik
    }                                                                    //u corechart spadaju (line,bar i pie chartovi)
    document.head.appendChild(script);  //ova linija dodaje script u head index.html fajla (<script src="https://www.gstatic.com/charts/loader.js"></script>)
  }, []);

// 2. useEffect je za crtanje grafikona
  useEffect(() => {
    if (!chartLoaded || !chartRef.current || podaci.length < 2) return;  //ne crta se ako biblioteka nije učitana, DOM element ne postoji ili nema podataka (pri cemu useEffect ima ove dependency-je tkd se grafikon nacrta cim se steknu uslovi)

    //sve iz fje drawChart je iz ^dokumentacije na sajtu (data,options,chart i chart.draw...)
    const drawChart = () => {
      const data = window.google.visualization.arrayToDataTable(podaci);

      const isMobile = window.innerWidth < 650;  //window.innerWidth daje sirinu ekrana u px

      const isMicroMobile=window.innerWidth<450;

      const maxVrednost=Math.max(...podaci.slice(1).map(p=>p[1]));//slice(1) je kao offset 1 tj. preskoci 1. element
                                                                  //sa p[1] pristupamo kljucevima (brojevima porudzbina)
                                                                  //spread operator (...) koristimo kako bi raspakovali niz koji map pravi:
                                                                  // Math.max([0, 1, 3])  // NaN - ne radi!
                                                                  // Math.max(0, 1, 3)    // 3 - radi!

      const options = {         //ovu hardcore stilizaciju gpt radi iskljucivo
        legend: { position: 'none' },
        backgroundColor: 'transparent',
        chartArea: { left: isMobile ? 35 : 50, right: 20, top: 20, bottom: isMobile ? 70 : 50, width: '100%', height: '80%' },
        hAxis: {
          textStyle: { color: '#9ca3af', fontSize: isMobile ? 9 : 11, fontName: 'Georgia' },
          gridlines: { color: 'transparent' },
          baselineColor: 'transparent',
          slantedText: isMobile ? true : false,      // na mobilnom tekst meseci ide dijagonalno da ne bi bio zgusnut
          slantedTextAngle: isMicroMobile ? 90 : 45,
        },
        vAxis: {
          textStyle: { color: '#9ca3af', fontSize: isMobile ? 9 : 11, fontName: 'Georgia' },
          gridlines: { color: '#f0f0f0', count: 5 },
          baselineColor: '#f0f0f0',
          minValue: 0,
          viewWindow: { min: maxVrednost<=10 ? -0.9 : -5 },
        },
        lineWidth: isMobile ? 2 : 2.5,
        colors: ['#7a1528'],
        pointSize: isMobile ? 3 : 5,
        pointShape: 'circle',
        tooltip: {
          textStyle: { fontName: 'Georgia', fontSize: 13, color: '#1a1a1a' },
          showColorCode: true,
        },
        curveType: 'function',
      };

      const chart = new window.google.visualization.LineChart(chartRef.current); //useRef kuka je react nacin za vanila js-ov -> document.getElementById('curve_chart')
      chart.draw(data, options);
    };

    drawChart();

    window.addEventListener('resize', drawChart); //"resize" je predefinisani listener koji se okine kad se sirina ekrana promeni (u App.js imamo custom listener "auth-change" koji da bi se okinuo moramo napisati window.dispatch(new Event('auth-change')))
    return () => window.removeEventListener('resize', drawChart);   // cleanup da se ne bi listeneri gomilali (radi tako sto prilikom narednog izvrsavanja ovog koda (pozivanja useEffecta kad se menja stranica ili promeni dependency) brise stari listener pa tek onda izmedju ostalog i doda novi listener)

  }, [chartLoaded, podaci]);


  useEffect(()=>{
    
    const vratiPodatke= async ()=>{
        
      try {
        setLoadingPodataka(true);

        const response= await api.get('/mesecniBrojPorudzbina');

        const mesecniBrPorudzbina=[
                                  ['Mesec', 'Narudžbine']
                                  ];

        let maxPorudzbina=0;
        let maxMesec="";
        let suma=0;
        
        response.data.forEach((item)=>{
          mesecniBrPorudzbina.push([item.Mesec+".",item.Porudzbine]); //push stavlja element na kraj poput (...)
          
          if (maxPorudzbina<item.Porudzbine){

            maxPorudzbina=item.Porudzbine;
            maxMesec=item.Mesec;
          }
          suma+=item.Porudzbine;
        });

        setNajboljiMesec(maxMesec);
        setUkupno(suma);
        setProsecno(suma/12);

        setPodaci(mesecniBrPorudzbina);

        // console.log(response.data);
        
      } catch (error) {

        console.error("Greska pri ucitavanju broja narudžbina", error);
        setErrorPodataka("Nije moguće učitati broja narudžbina");

      } finally {

        setLoadingPodataka(false);
      }
    }

    vratiPodatke();
  },[])


  const toggleTehnika = (t_id) => {
    setFormData(prev => ({
      ...prev,
      tehnike: prev.tehnike.includes(t_id)
        ? prev.tehnike.filter(tehnika_id => tehnika_id !== t_id)
        : [...prev.tehnike, t_id]
    }))
  }

  const handleSubmit= async (e)=>{  //OBAVEZNO DODAJ VALIDACIJU ZA NEGATIVNE VREDNOSTI

    e.preventDefault();
    setLoadingSlike(true);
    setInfoSlike("");
    setErrorSlike("");

    try {

      const cenaNum=Number(formData.cena);
      const visinaNum=Number(formData.visina_cm);
      const sirinaNum=Number(formData.sirina_cm);
      


      if (cenaNum < 0 || visinaNum < 0 || sirinaNum < 0) {
        setErrorSlike("Vrednosti ne smeju biti negativne.");
        return;
      }

      const data=new FormData();

      // posto je galerija_id na backendu nullable tj slika ne mora biti u galeriji mi je ne saljemo ako je value 0 (tako smo postavili ako korisnik u comboboxu odabere da slika nije ni u jednoj galeriji)
      if (formData.galerija_id!==0){
        data.append("galerija_id", Number(formData.galerija_id));
      }
      data.append("putanja_fotografije",slika);
      data.append("cena",cenaNum);
      data.append("naziv",formData.naziv);
      data.append("visina_cm",visinaNum);
      data.append("sirina_cm",sirinaNum);
      data.append("dostupna",formData.dostupna ? 1 : 0);

      //posto su tehnike niz id-eva, moramo ih dodati tkd. da se ne sacuvaju kao string "[1,2,3]"
      formData.tehnike.forEach(tehnika_id=>{

        data.append("tehnike[]",tehnika_id);
      });
      

      // console.log(data);

      
      await api.post('/slike',data);

      setInfoSlike("Slika je uspešno dodata.");

      setTimeout(()=>{

        setFormData({

                                  galerija_id: 0,

                                  cena: 0.0,
                                  naziv: "",
                                  visina_cm: 0,
                                  sirina_cm: 0,
                                  dostupna: false,
                                  tehnike: []
                                });

        setSlika(null);  //file

        setInfoSlike("");

        fileInputRef.current.value="";

      },1500);

    } catch (error) {

      
      setErrorSlike("Došlo je do greške. Proverite internet konekciju i pokušajte ponovo.");
      
      console.error("Greška pri dodavanju slike: ", error.response.data);
      
    } finally {
      setLoadingSlike(false);
    }

  }
  
  const handleInputChange=(e)=>{

    // const name=e.target.name;
    // const value=e.target.value;
    // const type=e.target.type;
    // const checked=e.target.checked;

    const {name,value,checked,type}=e.target;   //ova linija radi slicno kao u pajtonu (menja ove 4 iznad)

    setFormData(prev => ({
       ...prev, 
       [name]: type==='checkbox' ? checked : value   //npr. za kljuc cena se postavlja vrednost 1000 (jer type nije checkbox nego number), za kljuc dostupna se postavlja vrednost true (jer je type checkbox)
      }));
  }

  const handleImageUpload=(e)=>{

    setSlika(e.target.files[0]); //moze [0] jer je e.target.files file list koji se ugl ponasa kao js array (ali ne moze da koristi (...) sto nama ovde ne treba jer nije input multiple tj. ne uploaduje korisnik vise fajlova/slika)

  }

  const handleRemoveImage = ()=>{
    setSlika(null); 
    fileInputRef.current.value="";
  }

  return (
    <div className="analiza-page">
      <div className="container" style={{ maxWidth: 960 }}>

        {/* Header */}
        <div className="mb-4">
          <h1 className="fw-bold mb-1" style={{ fontSize: 32, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
            Admin Dashboard
          </h1>
          <p className="text-secondary mb-0">Upravljajte galerijom i pratite statistiku</p>
        </div>

        {/* Stat Cards */}
        <div className="row g-3 mb-0">
          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef2f2' }}>
                <FiPackage size={22} color="#8b1a2e" />
              </div>
              <div>
                <div className="stat-label">Ukupno narudžbina</div>
                <div className="stat-value">{podaci.length<2 ? "Učitavanje..." : ukupno}</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fffbeb' }}>
                <FiTrendingUp size={22} color="#d97706" />
              </div>
              <div>
                <div className="stat-label">Prosečno mesečno</div>
                <div className="stat-value">{podaci.length<2 ? "Učitavanje..." : Math.floor(prosecno)}</div>  {/* Math.floor zaokruzuje na najmanju integer vrednost, Math.ceil na najvecu int vr, Math.round normalno,  */}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef2f2' }}>
                <FiBarChart2 size={22} color="#8b1a2e" />
              </div>
              <div>
                <div className="stat-label">Najbolji mesec</div>
                <div className="stat-value">{podaci.length<2 ? "Učitavanje..." : najboljMesec + "."}</div>
              </div>
            </div>
          </div>
        </div> 

        {/* Chart */}
        <div className="chart-card mt-4 p-4">
          <div className="d-flex align-items-center gap-2 mb-4">
            <FiBarChart2 size={18} color="#8b1a2e" />
            <h2 className="card-title">Narudžbine po mesecima</h2>
          </div>
          {podaci.length<2 && <div className="chart-loading">Učitavanje grafikona...</div>}
          <div ref={chartRef} style={{ width: '100%', height: 280, display: chartLoaded ? 'block' : 'none' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
        <div className="form-card mt-4 p-4 mb-4">
          <div className="d-flex align-items-center gap-2 mb-4">
            <FiImage size={18} color="#8b1a2e" />
            <h2 className="card-title">Dodaj novu sliku</h2>
          </div>

          {/* Galerija */}
          {/* <div className="mb-3">
            <label className="form-label">
              Galerija <span className="required">*</span>
            </label>
            <select className="form-input" name='galerija_id' value={formData.galerija_id}
              onChange={handleInputChange}>
              <option key="Nije dostupna u galeriji" value={0}>Nije dostupna u galeriji</option>
              <option key={galerija.id} value={galerija.id}>{galerija.naziv}</option>
            </select>
          </div> */}
          <div className="custom-sort-container position-relative mb-3">
            <label className="form-label">
              Galerija <span className="required">*</span>
            </label>
            <button
              type="button"
              className="custom-sort-btn d-flex justify-content-between align-items-center py-2 w-100"
              onClick={() => setDropdownOtvoren(!dropdownOtvoren)}
              onBlur={() => setDropdownOtvoren(false)}
            >
              {izabranaOpcija?.label} <FiChevronDown className="ms-2" />
            </button>
            {dropdownOtvoren && (
              <div className="custom-sort-dropdown">
                {opcije.map(o => (
                  <div
                    key={o.value}
                    className={`custom-sort-item ${Number(formData.galerija_id) === o.value ? 'active' : ''}`}
                    onMouseDown={() => {
                      setFormData(prev => ({ ...prev, galerija_id: o.value }));
                      setDropdownOtvoren(false);
                    }}
                  >
                    {Number(formData.galerija_id) === o.value && <FiCheck className="me-2" />}
                    <span className={Number(formData.galerija_id) !== o.value ? 'ms-4' : ''}>{o.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Naziv */}
          <div className="mb-3">
            <label className="form-label">
              Naziv <span className="required">*</span>{' '}
              <span className="hint">({formData.naziv.length}/50)</span>
            </label>
            <input className="form-input" name='naziv' placeholder="Naziv slike" maxLength={50}
              value={formData.naziv} onChange={handleInputChange} />
          </div>

          {/* Cena / Visina / Sirina */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Cena (RSD) <span className="required">*</span></label>
              <input className="form-input" name='cena' type="number" min={0} placeholder="0.00"
                value={formData.cena} onChange={handleInputChange} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Visina (cm) <span className="required">*</span></label>
              <input className="form-input" name='visina_cm' type="number" min={0} placeholder="0"
                value={formData.visina_cm} onChange={handleInputChange} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Širina (cm) <span className="required">*</span></label>
              <input className="form-input" name='sirina_cm' type="number" min={0} placeholder="0"
                value={formData.sirina_cm} onChange={handleInputChange} />
            </div>
          </div>

          {/* Fotografija */}
          <div className="mb-3">
            <label className="form-label">
              Fotografija <span className="hint">(JPG, PNG, max 2MB)</span>
            </label>
            <input className="form-input" ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png"
              onChange={handleImageUpload} />
            {slika && (
              <div className="position-relative d-inline-block mt-2">
                <div className="image-preview" style={{ backgroundImage: `url(${URL.createObjectURL(slika)})` }} />
                <button type="button" className="btn-remove-img" onClick={handleRemoveImage}>
                  <FiX size={14} />
                </button>
              </div>
            )}
          </div>
          

          {/* Toggle */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <label className="toggle-switch">
              <input type="checkbox" name='dostupna' checked={formData.dostupna}
                onChange={(e)=>
                setFormData((prev)=>({...prev,dostupna: e.target.checked ? true : false}) /*moze i samo e.target.checked (bez true/false)*/
                )} 
              /> 
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: 14, color: '#374151' }}>Dostupna za prodaju</span>
          </div>

          {/* Tehnike */}
          <div className="mb-4">
            <label className="form-label">Tehnike <span className="required">*</span></label>
            <div className="d-flex flex-wrap gap-2">
              {sveTehnike.map(t => (
                <button key={t.id} type="button"
                  className={`tehnika-pill ${formData.tehnike.includes(t.id) ? 'active' : ''}`}
                  onClick={() => toggleTehnika(t.id)}>
                  {t.naziv}
                </button>
              ))}
            </div>
          </div>

          {infoSlike ? <div className="obavestenje info mb-3">{infoSlike}</div> : null}
          {errorSlike ? <div className="obavestenje error mb-3">{errorSlike}</div> : null}

          <button className="submit-btn"
           disabled={loadingSlike}
            type="submit"
            >
            {loadingSlike ? "Učitavanje..." : "Dodajte sliku"}
            </button>  {/* type="submit" i form da ima onsubmit={handler} */}
        </div>
        </form>

      </div>
    </div>
  )
}

export default AnalizaPoslovanja
