import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
//DODAJ VALIDACIJU ZA FORME (DA PASSWORD MORA IMATI 6 KARAKTERA, DA JE KORISNIK MOZDA POKUSAO DA SE REGISTRUJE SA MEJLOM KOJI VEC IMA NALOG I DA MU TADA IZADJE PORUKA: KORISNIK SA OVIM MEJLOM JE VEC REGISTROVAN, AKO NE MOZETE DA SE PRIJAVITE PROVERITE DA LI STE SE VERIFIKOVALI MEJL..., DA AKO NEKO HOCE DA SE PRIJAVI SA MEJLOM KOJI NIJE VERIFIKOVAN DA GA VERIFIKUJE PRVO)
const LoginRegisterTextInput = ({
    id,
    type="text",
    placeholder,
    value,
    onChange, 
    autoComplete,
    required=false,

    
    icon,
    label,
    hint,
    ...rest
}) => {

    const [showPassword,setShowPassword] = useState(false);  //logika za toggle dugme oko koje prikazuje password
    const isPassword= type==='password';
    const inputType= isPassword ? (showPassword ? 'text' : 'password'): type;

  return (
    <div className="form-group">
        {label && <label>{label}</label>}
        <div className="input-group">
            <span>{icon}</span>
            <input
            id={id}
            type={inputType} 
            placeholder={placeholder}
            value={value}
            onChange={onChange} //e je dogadjaj koji se desio nad datim poljem (klik , unos...), target je dato polje, dugme... i value je njegova vrednost
            autoComplete={autoComplete}
            required={required}
            {...rest}
            />
            {isPassword && <button 
                                    className='eye-btn'
                                    type='button'
                                    onClick={()=>{
                                        setShowPassword(!showPassword);
                                    }}
                                    >
                                    {showPassword===false ? <FaEye/> : <FaEyeSlash/>}
                                   </button>}
            {hint && <small className='hint'>{hint}</small>}
        </div>
    </div>
  )
}

export default LoginRegisterTextInput