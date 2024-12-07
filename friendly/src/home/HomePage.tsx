import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import Image from 'react-bootstrap/Image';

const API_URL = 'http://localhost:5062';

const HomePage: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="display-4">Welcome to friendly</h1>
      <Carousel>
        <Carousel.Item>
          <Image src={`${API_URL}/images/fall.jpg`} className="d-block w-100" alt="Fall" />
        </Carousel.Item>
        <Carousel.Item>
          <Image src={`${API_URL}/images/mountains.jpg`} className="d-block w-100" alt="Mountains" />
        </Carousel.Item>
        <Carousel.Item>
          <Image src={`${API_URL}/images/beach.jpg`} className="d-block w-100" alt="Beach" />
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default HomePage;