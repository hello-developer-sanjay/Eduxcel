import { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { RingLoader } from 'react-spinners'; 

import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/CourseList.css';
import courseImage1 from '../assets/frontend1.png';
import courseImage2 from '../assets/backend1.png';
const LoadingOverlay = styled.div`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0; /* Ensure it's above other elements */
`;
function CareerList() {
  const [careers, setCareers] = useState([]);
  const { vision } = useParams();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    async function fetchCareers() {
      try {
        let response;
        if (!vision || vision === 'all') {
          response = await axios.get('https://eduxcel-api-13march.onrender.com/api/careers/vision/all');
        } else {
          response = await axios.get(`https://eduxcel-api-13march.onrender.com/api/careers/vision/${vision}`);
        }
        if (!response) {
          response = await axios.get('https://eduxcel-api-13march.onrender.com/api/careers/vision');
        }
        setCareers(response.data);
                setLoading(false); // Set loading to false when data is fetched

      } catch (error) {
        console.error('Error fetching careers:', error);
      }
    }

    fetchCareers();
  }, [vision]);

  const uniqueCategories = Array.from(new Set(careers.map(career => career.vision)));
  return (
    <div className="course-list">
     {loading && ( // Display loading animation if loading is true
        <LoadingOverlay>
          <RingLoader color="#fff" loading={loading} size={150} />
        </LoadingOverlay>
      )}
      <div className="course-cards">
        {uniqueCategories.map((vision, index) => {
          const career = careers.find(career => career.vision === vision);
          const image = getImageForVision(vision);
          return (
            <div
              className="course-card"
              key={index} // Use index as key since vision itself is not unique
            
            >
              <Link to={`/careers/${vision}`}>
                <div
                  className="course-image"
                  style={{
                    backgroundImage: `url(${image})`,
                  }}
                ></div>
                <div className="course-info">
                  <h3>{vision}</h3>
                  <p>{career.description}</p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
  
    </div>
  );
}

// Function to get the image URL for each category
function getImageForVision(vision) {
  switch (vision) {
    case 'frontend_development_careers':
      return courseImage1;
    case 'backend_development_careers':
      return courseImage2;
 
    default:
      return ''; 
  }
}

export default CareerList;
