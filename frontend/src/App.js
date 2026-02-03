import logo from './logo.svg';
import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Pocetna from './pages/Pocetna.jsx';
import Footer from './components/Footer.jsx';

import LoginModal from "./modals/LoginModal.jsx";

import { useEffect, useState } from 'react';
import RegisterModal from './modals/RegisterModal.jsx';
import Galerija from './pages/Galerija.jsx';
import O_nama from './pages/O_nama.jsx';
import api from './api/Api.js';
import Korpa from './pages/Korpa.jsx';
import PlaceOrderModal from './modals/PlaceOrderModal.jsx';
import Kontakt from './pages/Kontakt.jsx';


function App() {

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen,setRegisterOpen]=useState(false);

  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {        //efekat se izvrsava jednom, prilikom prvog rendera
    const checkAuth = () => {
      const token =                  //token trazimo prvo u local pa ako nije tu u session starage-u, ako ga nadje dobija tu vrednost a ako ne ostaje null
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");
      setIsAuth(!!token);  // !! pretvara vrednost u true ili false, ako ima vrednost const token ce postati true a ako je bio null postace false
    };

    checkAuth();  //odmah na pocetku pozivamo fju da se postavi status korisnika
    window.addEventListener("auth-change", checkAuth); // odmah se dodaje listener I SAMIM TIM REGISTRUJE FJA checkAuth kao listener TKD. SE MOZE KORISTITI VISE PUTA, kad se negde u kodu desi -  window.dispatchEvent(new Event("auth-change")) (LoginModal) onda se poziva fja checkAuth koja podesava status korisnika (ulogovan/izlogovan)

    return () => {
      window.removeEventListener("auth-change", checkAuth); //dobra praksa da postoji ali se ovde ne okida jer je niz zavisnosti prazan a uslov da se desi return je da se neka od zavisnosti promeni
    };
  }, []); // [] predstavlja niz zavisnosti (neki hook npr.)


  const handleLogout = async () => {  //salje http zahtev, ovakvi submitHandler-i su u LoginModal i RegisterModal
      try {
        await api.post("/logout");
      } catch (err) {
        console.error("Greška pri logout-u:", err);
      } finally {
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");
        // sessionStorage.removeItem("token");
  
        localStorage.clear();
        sessionStorage.clear();

        setIsAuth(false);
      }
    };


  const [cartItems, setCartItems] = useState([]);

  // Funkcija za dodavanje (prosledjujemo je u Pocetna)
  const addToCart = (product) => {
    // Provera da li slika već postoji u korpi (pošto su unikat)
    const exists = cartItems.find((item) => item.id === product.id);
    if (exists) {
      alert("Ova slika je već u vašoj korpi!");
    } else {
      setCartItems([...cartItems, product]);

      //... sluze da raspakuju niz, da njih nema kreirao bi se niz kome je 1. element stari niz a 2. element proizvod
      //const cartItems = ['a', 'b'];
      //const product = 'c';
      //const newCart = [...cartItems, product];
      // newCart === ['a', 'b', 'c']


      // alert("Slika je dodata u korpu!");
    }
  };

  // Funkcija za brisanje (prosledjujemo je u Korpa)
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const [orderOpen,setOrderOpen]=useState(false);

  return (
    
    <BrowserRouter>

      <Navbar 
      isAuth={isAuth}
      onLogin={() => setLoginOpen(true)} //parametri komponente kojima dodeljujemo vrednost npr. fju koja se okine kad se ovaj parametar pozove [onLogin();]
      onRegister={() => setRegisterOpen(true)} //u Navbar.jsx klikne se button sa onClick={onRegister} => otvara se RegisterModal koji je nize opisan
      onLogout={handleLogout} //umesto da kao kod login-a i register-a (submit)hander-i budu u modalu handleLogout je u App.js, a "poziv" komponente <LogoutModal> nije u App.js kao sto su <LoginModal> i <RegisterModal> vec je na dnu Navbar.jsx
      //^App.js komunicira sa Navbar.jsx u oba slucajeva samo su elementi za komunikaciju (Modali i handleri) na razlicitim pozicijama 
      cartCount={cartItems.length}
      />
      

      <div className={(loginOpen || registerOpen) ? "page-blur" : ""}>   {/* .page-blur{...} je prebacen iz LoginRegisterModals.css u App.css ali radi u oba slucaja */}
        <Routes>
          <Route path='/' element={<Pocetna 
                                    onRegister={()=>setRegisterOpen(true)}
                                    isAuth={isAuth} 
                                    addToCart={addToCart}
                                    removeFromCart={removeFromCart}
                                    cartItems={cartItems}
                                  />}
          />
          
          <Route path="/korpa/" element={<Korpa
                                         cartItems={cartItems} 
                                         removeFromCart={removeFromCart}
                                         onPlaceOrder={()=>setOrderOpen(true)}
                                         onRegister={()=>setRegisterOpen(true)}
                                         isAuth={isAuth}
                                        />} 
          />

          <Route path='/galerija/' element={<Galerija/>} />
          <Route path='/o-nama/' element={<O_nama/>} />
          <Route path='/kontakt/' element={<Kontakt/>} />
        </Routes>
        <Footer />
      </div>

      <LoginModal        
        show={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitch={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterModal       //kada je RegisterModal otvoren postoje opcije da se klikne na X gde ce se okinuti onClose, da se klikne na Vec Imate nalog gde ce se okinuti onSwitch i prebaciti nas na LoginModal, i opcija da se klikne na Registrujte se gde se pomocu <button type=submit> i <form onSubmit={handleSubmit} i handleSubmit narocito salje http zahtev: api.post('/register',{ime,prezime,email,password,password_confirmation});>
        show={registerOpen}  //da nema ovog show koje prosledjujemo kao parametar i provere u modalima: if (!show) return null; ove forme bi bile odmah prikazane (ne bismo imali efekat sakrivanja do trenutka kad se klikne na dugme)
        onClose={() => setRegisterOpen(false)}
        onSwitch={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />

      <PlaceOrderModal
        show={orderOpen}
        onClose={()=>setOrderOpen(false)}
        isAuth={isAuth}
        cartItems={cartItems}
        setCartItems={setCartItems}
      />



    </BrowserRouter>
  );
}

export default App;
