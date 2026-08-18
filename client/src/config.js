const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
const API_BASE_URL = process.env.REACT_APP_API_URL || `${SERVER_BASE_URL}/api`;

export { SERVER_BASE_URL, API_BASE_URL };
export default API_BASE_URL;
