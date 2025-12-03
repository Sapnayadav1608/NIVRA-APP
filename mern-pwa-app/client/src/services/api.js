import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust the base URL as needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example API call to get data
export const fetchData = async () => {
  try {
    const response = await api.get('/data'); // Adjust the endpoint as needed
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Example API call to post data
export const postData = async (data) => {
  try {
    const response = await api.post('/data', data); // Adjust the endpoint as needed
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};