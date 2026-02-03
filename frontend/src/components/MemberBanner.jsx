import React from 'react'
import { FiGift } from 'react-icons/fi'

const MemberBanner = ({onRegister,isAuth}) => {
  return (
    // <div className='container-fluid'>
      <div className="row align-items-center justify-content-between g-0">         
                {/* Leva strana: Tekst */}
                <div className="col-lg-8 col-md-7 mb-4 mb-md-0 text-white ps-md-4">
                  {/* Subtitle sa ikonom */}
                  <div className="d-flex flex-column flex-md-row align-items-center gap-2 mb-3 text-custom-gold">
                    <div className="icon-circle">
                       <FiGift size={20} />
                    </div>
                    <span className="fw-semibold text-center text-md-start">Ekskluzivna pogodnost za članove</span>
                  </div>
                  
                  <h2 className="pridruzite-se font-serif display-5 mb-3">Pridružite se našoj umetničkoj zajednici</h2>
                  <p className="postanite-clan opacity-75 ">
                    Postanite član i uživajte u popustu od 10% na sve kupovine, uz praktičnu mogućnost praćenja istorije vaših prethodnih porudžbina. Vaše putovanje u svet umetnosti počinje ovde.
                  </p>
                </div>
    
                {/* Desna strana: Krug i Dugme */}
                <div className="col-lg-4 col-md-5 d-flex justify-content-center justify-content-md-end"> {/* DO PRELAMANJA EKRANA OD MANJEG KA SREDNJEM CE VAZITI justify-content-center PA ONDA NA VECIM OD TOGA justify-content-md-end. [justify-content-center ce se primenjivati za male ekrane (sm), justify-content-md-end ce se primenjivati za srednje (md) i vece (lg) ekrane] */}
                  <div className='d-flex flex-column align-items-center gap-4 me-md-3'>
                    {/* Žuti krug */}
                    <div className="discount-circle d-flex flex-column align-items-center justify-content-center">
                      <span className="procenat">%</span>
                      <span className="procenat-popusta">10</span>
                      <span className="off">off</span>
                    </div>
    
                    {isAuth ? (
                      <div className=''>
                        <p className="text-white fw-semibold text-center" style={{maxWidth: '15rem'}}>
                          Hvala Vam što ste član naše umetničke zajednice!
                        </p>
                      </div>
                    ) : (
                      <button
                        className="btn-outline-white px-4 py-3 rounded-3"
                        onClick={onRegister}
                      >
                        Registrujte se
                      </button>
                    )}
                  </div>
                  
                </div>
    
              
      </div>
    // </div>
  )
}

export default MemberBanner