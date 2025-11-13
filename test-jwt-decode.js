// Test JWT decoding - you can run this in browser console or via Node
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJCYW5jb0RlUXVlc3RvZXMiLCJzdWIiOiJwb25kYXZpZDEwMkBnbWFpbC5jb20iLCJyb2xlIjoiUFJPRkVTU09SIiwiZXhwIjoxNzYzMDI1MjMwLCJ1c2VySWQiOiI1ZmMyNGVkZi1lMzVkLTQ5NjEtOWM4Zi01YmY5ZjNmNmMwNzciLCJub21lIjoiUHJvZmVzc29yIEV4ZW1wbG8iLCJpbnN0aXR1Y2lhb0lkIjoiMzc3ZTY5NGMtMzQ3My00YjRkLTgyNDYtZGI1M2NkOWFjNjQ2In0.IwqaOQP1RZ4FOHx8ExbP3Y7eQVOKzjzZpmeCdUR3tDU';

function decodeJwt(jwtToken) {
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
    
    const payload = parts[1];
    const decodedStr = atob(payload);
    return JSON.parse(decodedStr);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

const decoded = decodeJwt(token);
console.log('Decoded JWT:', decoded);
console.log('Role:', decoded?.role);
console.log('UserId:', decoded?.userId);
console.log('Exp (expires):', new Date(decoded?.exp * 1000));

// Expected output:
// {
//   "iss": "BancoDe Questões",
//   "sub": "pondavid102@gmail.com",
//   "role": "PROFESSOR",
//   "exp": 1763025230,
//   "userId": "5fc24edf-e35d-4961-9c8f-5bf9f3f6c077",
//   "nome": "Professor Exemplo",
//   "instituicaoId": "377e694c-3473-4b4d-8246-db53cd9ac646"
// }
