import api from './axiosConfig';

const BASE = '/api/interests';

// Get all submitted interests (to show status on cards)
export const getInterests = async () => {
  try {
    const res = await api.get(BASE);
    return res.data;
  } catch (err) {
    console.error("Error fetching interests", err);
    return [];
  }
};

// Submit new interest
export const createInterest = async (data) => {
  // Maps frontend form data to backend Entity fields
  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    interestName: data.interest, // Mapping 'interest' from form to 'interestName' in DB
    message: data.message
  };
  
  const res = await api.post(BASE, payload);
  return res.data;
};