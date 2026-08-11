export const environment = {
  production: false,
  apiUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : 'https://godavari-banking-management-system.onrender.com/api'
};
