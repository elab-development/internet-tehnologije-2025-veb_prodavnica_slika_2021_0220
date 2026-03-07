import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'                                  //daje fje poput toBeInDocument
import AnalizaPoslovanja from './AnalizaPoslovanja'
import api from '../api/Api'

import userEvent from '@testing-library/user-event'      //omogucava fje koje simuliraju korisnicke aktivnosti (click,type,clear)

//screen.findByText je asinhrono (vraca promise) tkd. zahteva await
//screen.queryByText i screen.getByText su sinhroni (ne treba im await u expect() ) 

// Mock 
jest.mock('../api/Api', () => ({        //kad npr. testiramo api rutu (da li se ispravno salje http zahtev) koristimo mock (lazni) Api modul koji je zaduzen za eksport get/post zahteva
  get: jest.fn(),
  post: jest.fn()                       //jest.fn() je spy fja kojom mozemo da pratimo koliko puta je pozvana, sa kojim argumentima i da podesimo sta ce vratiti
}));

// Utišavanje console.error
beforeAll(() => {                                              //pre pocetka svih testova
  jest.spyOn(console, 'error').mockImplementation(() => {});   //preserce se console.error (iz catch-a) i menja mu se sadrzaj u {} (kako ne bi punio konzolu prilikom testiranja)
});

// Reset mockova između testova
beforeEach(() => {                                             //pre pocetka svakog testa ponaosob
  jest.clearAllMocks();              //pre svakog testa se brise istorija mock objekata, ovim se osiguravamo da testovi ne zavise od drugih testova (rezultat jednog ne utice na naredne)
});

test('renderuje Admin Dashboard naslov', async () => {

  render(<AnalizaPoslovanja />)                           //simulira prikaz react komponente kao da je prikazana u browser-u

  expect(await screen.findByText(/Admin Dashboard/i))     //screen.findByText(...), ceka da se async izvrsi i nalazi element koji sadrzi tekst iz zagrade
    .toBeInTheDocument()
})

test('poziva sve potrebne API rute', async () => {

  api.get.mockResolvedValue({ data: [] });            //kad se pozove api.get vraca se {data:[]} kao da je backend odgovorio

  render(<AnalizaPoslovanja />);

  await waitFor(() => {                              //waitFor se koristi kada se ceka nesto sto se izvrsava asinhrono (api poziv u useEffect)
    expect(api.get).toHaveBeenCalledWith('/tehnike');    //proverava se da li api pozvan sa ovom rutom '/tehnike'
    expect(api.get).toHaveBeenCalledWith('/galerija'); 
    expect(api.get).toHaveBeenCalledWith('/mesecniBrojPorudzbina');
  });
});

test('poziva api.post kada se forma pošalje', async () => {

  api.get.mockResolvedValue({ data: [] });
  api.post.mockResolvedValue({});

  render(<AnalizaPoslovanja />);

  const nazivInput = screen.getByPlaceholderText(/Naziv slike/i);         //screen koristimo da nadjemo element na stranici (ovde input polje sa placeholderom)
  await userEvent.type(nazivInput, "Test slika");                         //userEvent.type simulira korisnikovo kucanje "Test slika"

  const submitButton = screen.getByRole('button', { name: /Dodajte sliku/i });
  await userEvent.click(submitButton);

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith(
      '/slike',
      expect.any(FormData)                                               //ocekuje se parametar tipa FormData
    );
  });
});


test('prikazuje grešku za negativne vrednosti', async () => {

  api.get.mockResolvedValue({ data: [] });

  render(<AnalizaPoslovanja />);

  const cenaInput = screen.getByPlaceholderText(/0.00/i);
  await userEvent.clear(cenaInput);
  await userEvent.type(cenaInput, "-100");

  const submitButton = screen.getByRole('button', { name: /Dodajte sliku/i });
  await userEvent.click(submitButton);

  expect(await screen.findByText(/ne smeju biti negativne/i))
    .toBeInTheDocument();
});





test('prikazuje error kada API padne', async () => {

  api.get.mockRejectedValue(new Error('Server error'));    //simulitamo da je api.get doveo do Server errora (status 500+)

  render(<AnalizaPoslovanja />);

  await waitFor(() => {
    expect(console.error).toHaveBeenCalled();
  });
});

test('prikazuje podatke kada API uspe', async () => {

  api.get.mockResolvedValue({
    data: [{ Mesec: "Jan 2026", Porudzbine: 10 }]
  });

  render(<AnalizaPoslovanja />);

  // čekamo da loading nestane
  await waitFor(() => {
    expect(screen.queryByText(/Učitavanje grafikona/i))
      .not.toBeInTheDocument();
  });

  // proverimo da stat kartice postoje
  expect(screen.getByText(/Ukupno narudžbina/i))
    .toBeInTheDocument();
});


