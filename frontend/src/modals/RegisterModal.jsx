import { useState } from "react";
import { FaTimes, FaEnvelope, FaLock, FaUser, FaEye } from "react-icons/fa";
import api from "../api/Api";
import "./Modals.css";
import TextInput from "../components/TextInput";
//DODAJ VALIDACIJU ZA FORME (DA PASSWORD MORA IMATI 6 KARAKTERA, DA JE KORISNIK MOZDA POKUSAO DA SE REGISTRUJE SA MEJLOM KOJI VEC IMA NALOG I DA MU TADA IZADJE PORUKA: KORISNIK SA OVIM MEJLOM JE VEC REGISTROVAN, AKO NE MOZETE DA SE PRIJAVITE PROVERITE DA LI STE SE VERIFIKOVALI MEJL..., DA AKO NEKO HOCE DA SE PRIJAVI SA MEJLOM KOJI NIJE VERIFIKOVAN DA GA VERIFIKUJE PRVO)
const RegisterModal = ({ show, onClose, onSwitch }) => {

  const [ime,setIme]=useState("");
  const [prezime,setPrezime]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [password_confirmation,setPassword_confirmation]=useState("");

  const [loading,setLoading]=useState(false);
  const [info,setInfo]=useState("");
  const [error,setError]=useState("");

  const handleSubmit= async (e) => {
    e.preventDefault();
    setLoading(true);
    setInfo("");
    setError("");

    try {
      
      await api.post('/register',{ime,prezime,email,password,password_confirmation});
      
      setInfo("Uspešno ste se registrovali. Proverite email i verifikujte nalog.");

      setTimeout(()=>{
        onSwitch();
        setInfo("");
      },1200);

    } catch (error) {
      
      if(error.response){
        
        if(error.response.status===422){
          if(password.length<6){
            setError("Lozinka mora imati najmanje 6 karaktera.");
          }
          else if(password!==password_confirmation){
            setError("Niste ispravno potvrdili lozinku.");
          }
          else{
            setError("Molimo popunite ispravno sva polja.");
          }
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
      icon: <FaUser />,
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
      icon: <FaUser />,
      label:"Prezime"
    },
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
    {
      id:"password_confirmation",
      type:"password",
      placeholder:"•••••••",
      value: password_confirmation,
      onChange: (e)=>setPassword_confirmation(e.target.value),
      autoComplete: "password_confirmation",
      required: true,
      icon: <FaLock />,
      label:"Potvrdite lozinku"
    },
  ];

  const handleCloseButton=()=>{
    onClose();
    setError("");
    setInfo("");
    setLoading(false);
    setIme("");
    setPrezime("");
    setEmail("");
    setPassword("");
    setPassword_confirmation("");
  }

  const handleSwitchButton=()=>{
    onSwitch();
    setError("");
    setInfo("");
    setLoading(false);
    setIme("");
    setPrezime("");
    setEmail("");
    setPassword("");
    setPassword_confirmation("");
  }

  if (!show) 
    return null;

  return (
    <div className="modal-overlay">
      <div className="auth-modal">

        <div className="auth-header">
          <h3>Postanite naš član</h3>
          <p>Kreirajte nalog kako biste mogli da ostvarite članski popust</p>
          <button className="close-btn" onClick={handleCloseButton}>
            <FaTimes />
          </button>
        </div>

        <form className="auth-body grid-form" onSubmit={handleSubmit}>

            {textInputs.map((input)=>(
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
            ))}

            
            
            {/* <TextInput
            id="password"
            type="password"
            placeholder="•••••••"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            autoComplete="current-password"
            required
            icon={<FaLock />}
            label="Lozinka"
            /> */}
            {/* TextInput je reusable komponenta koju koristimo umesto zakomentarisanog koda */}
            {/* <div className="form-group">
                <label>Lozinka</label>
                <div className="input-group">
                <span><FaLock /></span>
                <input
                id="password"
                type="password" 
                placeholder="•••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)} //e je dogadjaj koji se desio nad datim poljem (klik , unos...), target je dato polje, dugme... i value je njegova vrednost
                autoComplete="current-password"
                required
                />
                <span><FaEye className="eye" /></span>
                </div>
            </div> */}

            {info ? <div className="obavestenje info">{info}</div> : null}
            {error ? <div className="obavestenje error">{error}</div> : null}

            <button
            className="auth-btn full"
            type="submit"
            disabled={loading}
            >
            {loading ? 'Registrovanje...' : 'Kreirajte nalog'}</button>

            <p className="switch full">
                Već imate nalog?  
                <span className='ms-2' onClick={handleSwitchButton}>Prijavite se</span>
            </p>

        </form>

      </div>
    </div>
  );
};

export default RegisterModal;

