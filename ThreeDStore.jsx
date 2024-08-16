import React, { useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import './ThreeDStore.css';
import axios from 'axios';

const Shelf = ({ position, path, scale, onClick }) => {
  const { scene } = useGLTF(path);

  scene.traverse((child) => {
    if (child.isMesh) {
      child.userData = { onClick: () => onClick(child) };
    }
  });

  return <primitive object={scene} position={position} scale={scale} />;
};

const HoverEffect = ({ selectedObject, setPopup, view }) => {
  const [hoveredObject, setHoveredObject] = useState(null);

  useFrame(() => {
    if (hoveredObject && view === 'inside') {
      hoveredObject.position.y += Math.sin(Date.now() * 0.005) * 0.02;
      hoveredObject.position.z += Math.sin(Date.now() * 0.005) * 0.02;
    }
  });

  useEffect(() => {
    if (selectedObject && view === 'inside') {
      setPopup(`${selectedObject.name} selected`);

      if (hoveredObject && hoveredObject !== selectedObject) {
        hoveredObject.scale.set(1, 1, 1);
      }

      selectedObject.scale.set(1.2, 1.2, 1.2);
      setHoveredObject(selectedObject);

      return () => {
        if (hoveredObject) {
          hoveredObject.scale.set(1, 1, 1);
        }
      };
    }
  }, [selectedObject, setPopup, view]);

  return null;
};

const ClickableObjects = ({ setSelectedObject }) => {
  const { scene, gl, camera } = useThree();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handleProductClick = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setSelectedObject(product);
  };

  const handleClick = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      if (clickedObject.userData.onClick) {
        handleProductClick({
          id: clickedObject.uuid,
          name: clickedObject.name || 'Unnamed Product',
          price: clickedObject.userData.price || 10,
        });
      }
    }
  };

  useEffect(() => {
    gl.domElement.addEventListener('click', handleClick);
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [gl, camera, scene]);

  return null;
};

const CameraControls = ({ view }) => {
  const { camera } = useThree();
  const speed = 2;

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'w':
          camera.position.z -= speed;
          break;
        case 's':
          camera.position.z += speed;
          break;
        case 'a':
          camera.position.x -= speed;
          break;
        case 'd':
          camera.position.x += speed;
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [camera, speed]);

  useEffect(() => {
    if (view === 'outside') {
      camera.position.set(80, 30, 60);
    } else {
      // Adjust this to center the camera inside the mart
      camera.position.set(0, 2, 8);
      camera.lookAt(new THREE.Vector3(0, 0, 0)); // Ensure the camera looks at the center
    }
  }, [view, camera]);

  return <OrbitControls />;
};

const ThreeDStore = () => {
  const [view, setView] = useState('outside');
  const [selectedObject, setSelectedObject] = useState(null);
  const [popup, setPopup] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/products'); // Update with your backend URL
      console.log('Products:', response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleEnterOrExitMart = () => {
    if (view === 'outside') {
      fetchProducts(); // Fetch products when entering the market
    }
    setView((prevView) => (prevView === 'outside' ? 'inside' : 'outside'));
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div className="h-screen w-screen m-0 p-0 overflow-hidden relative">
      <Canvas className="h-full w-full"
        frameloop='always'
        shadows
        camera={{ position: [80, 30, 60], fov: 4 }}
      >
        <ambientLight intensity={2} />
        <pointLight position={[100, 50, 50]} />
        <CameraControls view={view} />
        {view === 'outside' ? (
          <Shelf key="outside" path='/src/assets/lowpoly_supermarket.glb' position={[0, 0, 0]} scale={[0.5, 0.5, 0.5]} onClick={setSelectedObject} />
        ) : (
          <Shelf key="inside" path='/src/assets/multi_supermarket.glb' position={[0, 0, 0]} scale={[0.2, 0.2, 0.2]} onClick={setSelectedObject} />
        )}
        <ClickableObjects setSelectedObject={setSelectedObject} />
        <HoverEffect selectedObject={selectedObject} setPopup={setPopup} view={view} />
      </Canvas>
      <button
        onClick={handleEnterOrExitMart}
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        {view === 'outside' ? 'Enter Market' : 'Exit Market'}
      </button>
      <button
        onClick={handleCartClick}
        className="absolute top-16 right-16 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
      >
        Cart
      </button>
      {popup && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded">
          {popup}
        </div>
      )}
    </div>
  );
};

export default ThreeDStore;
