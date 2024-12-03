export const login = (token) => {
  localStorage.setItem('authToken', token);
};

export const logout = () => {
  localStorage.removeItem('authToken');
};

export const getToken = () => localStorage.getItem('authToken');

export const isAuthenticated = () => !!getToken();
