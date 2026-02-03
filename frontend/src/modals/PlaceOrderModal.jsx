import { FaTimes, FaEnvelope, FaLock, FaEye } from "react-icons/fa";
import "./Modals.css";
import { useState } from "react";
import api from "../api/Api";
import TextInput from "../components/TextInput";
//DODAJ VALIDACIJU ZA FORME (DA PASSWORD MORA IMATI 6 KARAKTERA, DA JE KORISNIK MOZDA POKUSAO DA SE REGISTRUJE SA MEJLOM KOJI VEC IMA NALOG I DA MU TADA IZADJE PORUKA: KORISNIK SA OVIM MEJLOM JE VEC REGISTROVAN, AKO NE MOZETE DA SE PRIJAVITE PROVERITE DA LI STE SE VERIFIKOVALI MEJL..., DA AKO NEKO HOCE DA SE PRIJAVI SA MEJLOM KOJI NIJE VERIFIKOVAN DA GA VERIFIKUJE PRVO)
const PlaceOrderModal = ({ show, onClose, isAuth, cartItems, setCartItems }) => {
  
  // const navigate=useNavigate();
    

  const [ime,setIme]=useState("");
  const [prezime,setPrezime]=useState("");
  const [grad,setGrad]=useState("");
  const [adresa,setAdresa]=useState("");
  const [postanskiBroj,setPostanskiBroj]=useState("");
  const [telefon,setTelefon]=useState("");
  

  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [info,setInfo]=useState("");

  const handleSubmit= async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    
    const stavkePorudzbine=cartItems.map(item=>({
      slika_id: item.id,
      kolicina: 1
    }));

    const orderData={     //objekat u js-u slican kao dict u pajtonu
      ime,   // kad ne pisemo : podrazumeva se da su key i val isti
      prezime, // prezime: prezime
      grad,
      adresa,
      postanski_broj: postanskiBroj,
      telefon,
      stavke: stavkePorudzbine
    };

    const endPoint= isAuth ? '/porudzbine-clan' : '/porudzbine';

    try {
                          
      await api.post(endPoint,orderData); //mi prosledjujemo js objakat (slicno kao dict u pajtonu) i axios ga pretvara u json objekat (dodaje navodnike za kljuceve i stringove)
      
      setInfo("Uspešno ste izvršili poručivanje.");

      setCartItems([]);

      setTimeout(()=>{
        
        onClose();
        setInfo("");
        // Resetovanje polja forme
        setIme(""); setPrezime(""); setGrad(""); setAdresa(""); setPostanskiBroj(""); setTelefon("");
      },2000);
      

    } catch (error) {
      
      if(error.response){
        
        if(error.response.status===422){
          setError("Molimo popunite ispravno sva polja.");
        }
        else{
          setError("Došlo je do greške. Pokušajte ponovo.");
        }
      }
      else{
        setError("Server nije dostupan. Molimo proverite internet konekciju.");
      }
      
    }

    setLoading(false);
  }

  const textInputs=[
      
      {
        id:"ime",
        type:"text",
        placeholder:"Ime",
        value: ime,
        onChange: (e)=>setIme(e.target.value),
        autoComplete: "ime",
        required: true,
        label:"Ime"
      },
      {
        id:"prezime",
        type:"text",
        placeholder:"Prezime",
        value: prezime,
        onChange: (e)=>setPrezime(e.target.value),
        autoComplete: "prezime",
        required: true,
        label:"Prezime"
      },
      {
        id: "grad",
        type: "text",
        placeholder: "Grad",
        value:grad,
        onChange: (e)=> setGrad(e.target.value),
        autoComplete: "grad",
        required: true,
        label: "Grad"
      },
      {
        id:"adresa",
        type:"text",
        placeholder:"Adresa",
        value: adresa,
        onChange: (e)=>setAdresa(e.target.value),
        autoComplete: "adresa",
        required: true,
        label:"Adresa"
      },
      {
        id:"postanski_broj",
        type:"text",
        placeholder:"Poštanski broj",
        value: postanskiBroj,
        onChange: (e)=>setPostanskiBroj(e.target.value),
        autoComplete: "postanski broj",
        required: true,
        label:"Poštanski broj"
      },
      {
        id:"telefon",
        type:"text",
        placeholder:"Telefon",
        value: telefon,
        onChange: (e)=>setTelefon(e.target.value),
        autoComplete: "telefon",
        required: true,
        label:"Telefon"
      },
  ];

  const handleCloseButton=()=>{
    onClose();
    setError("");
    setInfo("");
    setLoading(false);
    setIme("");
    setPrezime("");
    setGrad("");
    setAdresa("");
    setPostanskiBroj("");
    setTelefon("");
  }

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="auth-modal">

        <div className="auth-header">
          <h3>Hvala Vam na ukazanom poverenju</h3>
          <p>Popunite sva polja i pritisnite dugme ispod</p>
          <button className="close-btn" onClick={handleCloseButton}>
            <FaTimes />
          </button>
        </div>

        <form className="auth-body" onSubmit={handleSubmit}>
          
          {
            textInputs.map((input)=>(
              <TextInput
                id={input.id}
                type={input.type}
                placeholder={input.placeholder}
                value={input.value}
                onChange={input.onChange}
                autoComplete={input.autoComplete}
                required={input.required}
                // label={input.label}
              />
            ))
          }
          

          {info ? <div className="obavestenje info">{info}</div> : null}
          {error ? <div className="obavestenje error">{error}</div> : null}

          {/* <span className="forgot">Zaboravili ste lozinku?</span> */}

          <button
          type="submit" 
          className="auth-btn"
          disabled={loading}
          >
          {loading ? "Naručivanje..." : "Naručite"}
          </button>

          {/* <p className="switch">
            Nemate nalog? 
            <span className='ms-2' onClick={onSwitch}>Registrujte se</span>
          </p> */}
        </form>

      </div>
    </div>
  )
}

export default PlaceOrderModal