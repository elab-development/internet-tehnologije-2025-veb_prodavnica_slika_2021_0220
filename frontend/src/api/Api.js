import axios from 'axios';

const api= axios.create({
    baseURL:"http://localhost:8000/api",
});

api.interceptors.request.use((config) => { //api.interceptors.request.use je presretac http zahteva

  const token = localStorage.getItem("token"); //cita token iz localstorage-a koji je postavljen prilikom login-a (u LoginModal-u)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;  //config je request(zahtev) kome dodajemo u zaglavlju(header-u) token ako postoji i dozvoljavamo mu da ide do backend-a
});

export default api;