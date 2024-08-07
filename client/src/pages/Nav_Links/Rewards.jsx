import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../../style/rewards/rewards.css';
import { Grid } from '@mui/material';
import AccountContext from '../../contexts/AccountContext';

function Rewards() {
  const [latestProducts, setLatestProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 500);
  const { account } = useContext(AccountContext);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/eco/product-detail');
        if (Array.isArray(response.data)) {
          const sortedProducts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLatestProducts(sortedProducts.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching latest items:', error);
      }
    };

    fetchLatestProducts();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 500);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>

      {/* banner */}
      <div className="rewardbanner">
        <img src="../../src/assets/images/rewardsbanner.png" alt="Banner" />
      </div>

      {/* greenreward */}
      <div className='greenreward'>
        <h1>Green rewards</h1>
        <p>Earn leaves and exchange them for rewards! It takes less than 2 minutes to create an account. Sign up with us now!</p>
        {account ? (
          <button className='signupbutton' disabled style={{ cursor: 'not-allowed' }}>Sign up now</button>
        ) : (
          <button className='signupbutton'><a href='/get_started' style={{color: 'white', textDecoration: 'none'}}>Sign up now</a></button>
        )}
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

        <Grid container spacing={4} className='products'>
  {isMobile ? (
    latestProducts.slice(0, 1).map((product) => (
      <Grid item key={product.id} xs={12} className='product-item'>
        <h2>{product.itemName}</h2>
        <img src={`http://localhost:3001/eco/product-images/${product.itemimg}`} alt={product.itemName} />
        <p className='leaves'><b>{product.leaves}</b> 🍃</p>
      </Grid>
    ))
  ) : (
    latestProducts.map((product) => (
      <Grid item key={product.id} xs={12} sm={6} md={4} className='product-item'>
        <h2>{product.itemName}</h2>
        <img src={`http://localhost:3001/eco/product-images/${product.itemimg}`} alt={product.itemName} style={{ width: '200px', height: '200px' }} />
        <p className='leaves'><b>{product.leaves}</b> 🍃</p>
      </Grid>
    ))
  )}
</Grid>


        {account ? (
          <button className='redeempagebutton'><a href='/redemptionshop'>Redemption Shop</a></button>
        ) : (
          <button className='redeempagebutton' disabled style={{ cursor: 'not-allowed' }}>Redemption Shop</button>
        )}
        <p>*Find more rewards at our redemption shop</p>
      </div>

      {/* greenreward2 */}
      <div className='greenreward2'>
        <h1>Green rewards</h1>
        <p>Earn leaves and exchange them for rewards! It takes less than 2 minutes to create an account. Sign up with us now!</p>
        {account ? (
          <button className='signupbutton' disabled style={{ cursor: 'not-allowed' }}>Sign up now</button>
        ) : (
          <button className='signupbutton'> <a href='/get_started'>Sign up now</a></button>
        )}
        <p className='qn'>Any questions? Check out our <a href='/faq'>FAQ</a> here</p>
      </div>
    </div>
  );
}

export default Rewards;
