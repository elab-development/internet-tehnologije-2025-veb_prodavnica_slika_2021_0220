import { FaTimes, FaEnvelope, FaLock, FaEye } from "react-icons/fa";
import "./Modals.css";
import { useState } from "react";
import api from "../api/Api";
import TextInput from "../components/TextInput";
//DODAJ VALIDACIJU ZA FORME (DA PASSWORD MORA IMATI 6 KARAKTERA, DA JE KORISNIK MOZDA POKUSAO DA SE REGISTRUJE SA MEJLOM KOJI VEC IMA NALOG I DA MU TADA IZADJE PORUKA: KORISNIK SA OVIM MEJLOM JE VEC REGISTROVAN, AKO NE MOZETE DA SE PRIJAVITE PROVERITE DA LI STE SE VERIFIKOVALI MEJL..., DA AKO NEKO HOCE DA SE PRIJAVI SA MEJLOM KOJI NIJE VERIFIKOVAN DA GA VERIFIKUJE PRVO)
const LoginModal = ({ show, onClose, onSwitch }) => {
  
  // const navigate=useNavigate();
    

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [info,setInfo]=useState("");

  const handleSubmit= async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const result = await api.post('/login',{email,password});
      const {message,token,user}=result.data;

      localStorage.setItem('token',token);           //cuvamo podatke kako bismo mogli da pristupamo zasticenim rutama kasnije
      localStorage.setItem('user',JSON.stringify(user));   //mora preko JSON.stringify jer user nije string nego objekat koji se salje kao json

      setInfo("Uspešno ste se prijavili.");

      window.dispatchEvent(new Event("auth-change"));

      setTimeout(()=>{
        // navigate('/');
        onClose();
        setInfo("");

        setEmail("");
        setPassword("");
      },800);
      

    } catch (error) {
      
      if(error.response){
        
        if(error.response.status===401){
          setError("Neispravan email ili lozinka.");
        }
        else if(error.response.status===422){
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
        id:"email",
        type:"email",
        placeholder:"your@gmail.com",
        value: email,
        onChange: (e)=>setEmail(e.target.value),
        autoComplete: "email",
        required: true,
        icon: <FaEnvelope />,
        label:"Email"
      },
      {
        id:"password",
        type:"password",
        placeholder:"•••••••",
        value: password,
        onChange: (e)=>setPassword(e.target.value),
        autoComplete: "current-password",
        required: true,
        icon: <FaLock />,
        label:"Lozinka"
      },
  ];

  const handleCloseButton=()=>{
    onClose();
    setError("");
    setInfo("");
    setLoading(false);
    setEmail("");
    setPassword("");
  }

  const handleSwitchButton=()=>{
    onSwitch();
    setError("");
    setInfo("");
    setLoading(false);
    setEmail("");
    setPassword("");
  }

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="auth-modal">

        <div className="auth-header">
          <h3>Dobrodošli nazad</h3>
          <p>Prijavite se i ostvarite 10% popusta</p>
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
                icon={input.icon}
                label={input.label}
              />
            ))
          }
          

          {info ? <div className="obavestenje info">{info}</div> : null}
          {error ? <div className="obavestenje error">{error}</div> : null}

          {/* DODAJ LOGIKU ZA ZABORAVLJENU LOZINKU */}
          {/* <span className="forgot">Zaboravili ste lozinku?</span> */}

          <button
          type="submit" 
          className="auth-btn"
          disabled={loading}
          >
          {loading ? "Prijavljivanje..." : "Prijavite se"}
          </button>

          <p className="switch">
            Nemate nalog? 
            <span className='ms-2' onClick={handleSwitchButton}>Registrujte se</span>
          </p>
        </form>

      </div>
    </div>
  );
};

export default LoginModal;

