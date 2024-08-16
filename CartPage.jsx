import React, { useState, useEffect } from 'react';
import './CartPage.css'; 

const CartPage = () => {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart')) || []);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart'));
    if (storedCart) {
      setCart(storedCart);
    }
  }, []);

  const updateQuantity = (index, change) => {
    const newCart = [...cart];
    if (newCart[index]) {
      newCart[index].quantity += change;

      if (newCart[index].quantity <= 0) {
        newCart.splice(index, 1);
      }

      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const updateCartTotal = () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
  };


  
  const storedData = localStorage.getItem('cartData');
  console.log('recieveddata');
  if (storedData) {
    console.log(storedData);
}



  return (
    <div className="container cart-page">
      <h3>Your Cart</h3>
      <div id="cartItems">
        {cart.length > 0 ? (
          cart.map((item, index) => (
            <div key={index} className="cart-item">
              <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} />
              <div className="item-details">
                <span>{item.name}</span>
                <div className="quantity-buttons">
                  <button className="btn btn-secondary btn-sm" onClick={() => updateQuantity(index, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => updateQuantity(index, 1)}>+</button>
                </div>
                <span>${(item.price * item.quantity || 0).toFixed(2)}</span>
              </div>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
      <div className="cart-total">
        <h5>Total: $<span id="cartTotal">0.00</span></h5>
        <button className="btn btn-primary">Pay</button>
      </div>
    </div>
  );
};

export default CartPage;
