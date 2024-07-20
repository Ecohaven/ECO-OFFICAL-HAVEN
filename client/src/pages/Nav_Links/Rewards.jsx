import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../../style/rewards/rewards.css';
import { Grid } from '@mui/material';
import AccountContext from '../../contexts/AccountContext';

function Rewards() {
  const [latestProducts, setLatestProducts] = useState([]);
  const { account } = useContext(AccountContext); // Get account info from context

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/eco/product-detail');
        if (Array.isArray(response.data)) {
          // Sort products by creation date (assuming there is a createdAt field)
          const sortedProducts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLatestProducts(sortedProducts.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching latest items:', error);
      }
    };

    fetchLatestProducts();
  }, []);

  return (
    <div>
      {/* Navbar */}
      {/* <Navbar /> */}

      {/* banner */}
      <div className="headbanner">
        <img src="../../src/assets/images/rewardbanner.png" alt="Banner" />
        <h1>Rewards</h1>
      </div>

      {/* greenreward */}
      <div className='greenreward'>
        <h1>Green rewards</h1>
        <p>Earn leaves and exchange them for rewards! It takes less than 2 minutes to create an account. Sign up with us now!</p>
        <button className='signupbutton'><a href='/redemptionshop'>Sign up now!</a></button> {/* change link afterwards */}
      </div>

      {/* divider */}
      <hr className="divider" />

      {/* steps */}
      <div className='stepsheader'>
        <h1>How does it work?</h1>
        <Grid container spacing={4} justifyContent="center">
          {[
            { img: '../../src/assets/images/signup.png', title: 'Sign up for free', description: 'Simply click here to create an account' },
            { img: '../../src/assets/images/leaves.png', title: 'Earn points', description: 'Get 1 leaf per event that you have signed up for & attended' },
            { img: '../../src/assets/images/prize.png', title: 'Get rewarded', description: 'Use your leaves to redeem rewards' }
          ].map((step, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <img src={step.img} alt={step.title} style={{ width: '200px', height: 'auto', display: 'block', margin: '0 auto', marginBottom: '30px' }} />
              <div className='desc'>
                <p><b>{step.title}</b></p>
                <p>{step.description}</p>
              </div>
            </Grid>
          ))}
        </Grid>
      </div>

      {/* rewards */}
      <div className='rewards'>
        <h1>Discover your eco-friendly haven with us.</h1>
        <h1>Use Leaves to get attractive rewards and nurture the environment.</h1>

        <div className='products'>
          {latestProducts.map((product) => (
            <div key={product.id} className='product-item'>
              <h2>{product.itemName}</h2>
              <img src={`http://localhost:3001/eco/product-images/${product.itemimg}`} alt={product.itemName} />
              <p><b>{product.leaves}</b> Leaves</p>
            </div>
          ))}
        </div>

        {account ? (
          <button className='redeempagebutton'><a href='/redemptionshop'>Redemption Shop</a></button>
        ) : (
          <button className='redeempagebutton' disabled>Redemption Shop</button>
        )}
        <p>*Find more rewards at our redemption shop</p>
      </div>

      {/* greenreward2 */}
      <div className='greenreward2'>
        <h1>Green rewards</h1>
        <p>Earn leaves and exchange them for rewards! It takes less than 2 minutes to create an account. Sign up with us now!</p>
        <button className='signupbutton'><a href='/redemptionshop'>Sign up now!</a></button> {/* change link afterwards */}
        <p className='qn'>Any questions? Check out our <a href='/faq'>FAQ</a> here</p>
      </div>

      {/* Footer */}
      {/* <Footer /> */}

      {/* backend test nav */}
      {/* <ul>
        <div>
          <li><a href="/rewardproduct">Reward Item</a></li>
        </div>
      </ul> */}
    </div>
  );
}

export default Rewards;
