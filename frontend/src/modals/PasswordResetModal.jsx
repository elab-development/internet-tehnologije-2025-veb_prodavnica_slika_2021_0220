import React, { useState } from 'react'
import api from '../api/Api';

import TextInput from '../components/TextInput.jsx';
import { FaLock, FaTimes } from 'react-icons/fa';

const PasswordResetModal = ({show,onClose,token,email}) => {

    const [password,setPassword]=useState("");
    const [password_confirmation,setPassword_confirmation]=useState("");

    const [loading,setLoading]=useState(false);
    const [info,setInfo]=useState("");
    const [error,setError]=useState("");


    console.log("token: "+ token,                                  //
        "email: "+email,
        "password: "+password,
        "password_confirmation: "+password_confirmation
    );

    const handleSubmit= async (e)=>{

        e.preventDefault();
        setLoading(true);
        setInfo("");
        setError("");

        try {
            const data={
                token,
                email,
                password,
                password_confirmation
            }
            
            await api.post('/password/reset',data);

            setInfo("Uspešno ste se resetovali lozinku.");

            setTimeout(()=>{
                onClose();
                setInfo("");
                setPassword("");
                setPassword_confirmation("");
            },1200);


        } catch (error) {

            console.log(error);

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

        } finally {
            setLoading(false);
        }
    }

    const textInputs=[
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
        setPassword("");
        setPassword_confirmation("");
    }
    
    
    if(!show){
        return null;
    }

  return (
    <div className="modal-overlay">
      <div className="auth-modal">

        <div className="auth-header">
          <h3>Unesite novu lozinku</h3>
          {/* <p>Kreirajte nalog kako biste mogli da ostvarite članski popust</p> */}
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

            
            
            
            {info ? <div className="obavestenje info">{info}</div> : null}
            {error ? <div className="obavestenje error">{error}</div> : null}

            <button
            className="auth-btn full"
            type="submit"
            disabled={loading}
            >
            {loading ? 'Resetovanje...' : 'Resetujte lozinku'}</button>

        </form>

      </div>
    </div>
    
  )
}

export default PasswordResetModal